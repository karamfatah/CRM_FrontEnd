import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import Header from '../../partials/Header';
import Sidebar from '../../partials/Sidebar';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  Package, Plus, Search, Edit, Trash2, X, Save, Image, Upload, 
  Tag, DollarSign, Hash, BarChart3, AlertCircle, Check, RefreshCcw,
  Eye, EyeOff, ChevronLeft, ChevronRight
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5030';
const MAX_IMAGE_SIZE = 50 * 1024; // 50KB target size

// =============================================
// IMAGE COMPRESSION UTILITY
// =============================================
const compressImage = (file, maxSizeKB = 50) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        // Calculate initial scale based on image dimensions
        const maxDimension = 800;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = (height / width) * maxDimension;
            width = maxDimension;
          } else {
            width = (width / height) * maxDimension;
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Iterate to achieve target size
        let quality = 0.9;
        let result = canvas.toDataURL('image/jpeg', quality);
        const targetSize = maxSizeKB * 1024;

        while (result.length > targetSize && quality > 0.1) {
          quality -= 0.1;
          result = canvas.toDataURL('image/jpeg', quality);
        }

        // If still too large, reduce dimensions further
        let scale = 0.8;
        while (result.length > targetSize && scale > 0.2) {
          canvas.width = width * scale;
          canvas.height = height * scale;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          result = canvas.toDataURL('image/jpeg', 0.7);
          scale -= 0.1;
        }

        resolve(result);
      };
      img.onerror = reject;
      img.src = event.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// =============================================
// MAIN COMPONENT
// =============================================
const ProductsManagement = () => {
  const { authData, loading: authLoading } = useAuth();
  const { t, language } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // State
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [filterActive, setFilterActive] = useState('');
  const [page, setPage] = useState(1);
  const [perPage] = useState(20);
  const [pagination, setPagination] = useState({ total: 0, total_pages: 1 });
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  
  // Form state
  const [form, setForm] = useState({
    ax_code: '',
    sku: '',
    barcode: '',
    name_en: '',
    name_ar: '',
    description_en: '',
    description_ar: '',
    category_id: '',
    unit_price: '',
    cost_price: '',
    tax_rate: '0',
    unit: 'piece',
    is_active: true,
    stock_qty: '',
    min_stock_qty: '',
    weight: '',
    brand_id: '',
    selected_tags: [],
  });
  
  // Dropdown data
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  
  // Image state
  const [images, setImages] = useState([]);
  const [deletedImageIds, setDeletedImageIds] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const fileInputRef = useRef(null);

  const getToken = () => authData?.access_token || localStorage.getItem('access_token');
  const getOrgId = () => authData?.org_id || 1;

  // =============================================
  // FETCH PRODUCTS
  // =============================================
  const fetchProducts = useCallback(async () => {
    if (!authData?.access_token) return;
    
    setLoading(true);
    setError('');
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: perPage.toString(),
        org_id: getOrgId().toString(),
      });
      
      if (search) params.append('search', search);
      if (filterActive !== '') params.append('is_active', filterActive);
      
      const response = await fetch(`${API_URL}/api/products?${params}`, {
        headers: { 'x-access-tokens': getToken() },
      });
      
      if (!response.ok) throw new Error('Failed to fetch products');
      
      const data = await response.json();
      setProducts(data.data || []);
      setPagination(data.pagination || { total: 0, total_pages: 1 });
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(t('products_management.fetch_error'));
    } finally {
      setLoading(false);
    }
  }, [authData?.access_token, page, perPage, search, filterActive, t]);

  // Fetch dropdown data (categories, brands, tags)
  const fetchDropdownData = useCallback(async () => {
    if (!authData?.access_token) return;
    
    const headers = { 'x-access-tokens': getToken() };
    const orgId = getOrgId();
    
    try {
      const [catRes, brandRes, tagRes] = await Promise.all([
        fetch(`${API_URL}/api/categories?org_id=${orgId}&is_active=true`, { headers }),
        fetch(`${API_URL}/api/brands?org_id=${orgId}&is_active=true`, { headers }),
        fetch(`${API_URL}/api/tags?org_id=${orgId}&is_active=true`, { headers }),
      ]);
      
      if (catRes.ok) {
        const data = await catRes.json();
        // Flatten tree for dropdown
        const flatten = (items, level = 0) => {
          let result = [];
          for (const item of items) {
            result.push({ ...item, level });
            if (item.children?.length) result = result.concat(flatten(item.children, level + 1));
          }
          return result;
        };
        setCategories(flatten(data.data || []));
      }
      if (brandRes.ok) {
        const data = await brandRes.json();
        setBrands(data.data || []);
      }
      if (tagRes.ok) {
        const data = await tagRes.json();
        setAvailableTags(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching dropdown data:', err);
    }
  }, [authData?.access_token]);

  useEffect(() => {
    if (!authLoading && authData?.access_token) {
      fetchProducts();
      fetchDropdownData();
    }
  }, [authLoading, authData?.access_token, fetchProducts, fetchDropdownData]);

  // =============================================
  // FORM HANDLERS
  // =============================================
  const resetForm = () => {
    setForm({
      ax_code: '',
      sku: '',
      barcode: '',
      name_en: '',
      name_ar: '',
      description_en: '',
      description_ar: '',
      category_id: '',
      unit_price: '',
      cost_price: '',
      tax_rate: '0',
      unit: 'piece',
      is_active: true,
      stock_qty: '',
      min_stock_qty: '',
      weight: '',
      brand_id: '',
      selected_tags: [],
    });
    setImages([]);
    setDeletedImageIds([]);
  };

  const handleOpenCreate = () => {
    setEditingProduct(null);
    resetForm();
    setShowModal(true);
  };

  const handleOpenEdit = async (product) => {
    setEditingProduct(product);
    setModalLoading(true);
    setShowModal(true);
    setImages([]);
    setDeletedImageIds([]);

    try {
      const response = await fetch(`${API_URL}/api/products/${product.id}`, {
        headers: { 'x-access-tokens': getToken() },
      });
      
      if (!response.ok) throw new Error('Failed to fetch product details');
      
      const data = await response.json();
      const p = data.data;
      
      setForm({
        ax_code: p.ax_code || '',
        sku: p.sku || '',
        barcode: p.barcode || '',
        name_en: p.name_en || '',
        name_ar: p.name_ar || '',
        description_en: p.description_en || '',
        description_ar: p.description_ar || '',
        category_id: p.category_id?.toString() || '',
        unit_price: p.unit_price?.toString() || '',
        cost_price: p.cost_price?.toString() || '',
        tax_rate: p.tax_rate?.toString() || '0',
        unit: p.unit || 'piece',
        is_active: p.is_active === 1,
        stock_qty: p.stock_qty?.toString() || '',
        min_stock_qty: p.min_stock_qty?.toString() || '',
        weight: p.weight?.toString() || '',
        brand_id: p.brand_id?.toString() || '',
        selected_tags: p.tags ? p.tags.map(t => t.id) : [],
      });
      
      if (p.images) {
        setImages(p.images.map(img => ({
          id: img.id,
          data: img.image_data,
          is_primary: img.is_primary === 1,
        })));
      }
    } catch (err) {
      console.error('Error fetching product:', err);
      setError(t('products_management.fetch_error'));
      setShowModal(false);
    } finally {
      setModalLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    resetForm();
  };

  const handleFormChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  // =============================================
  // IMAGE HANDLERS
  // =============================================
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    setUploadingImages(true);
    
    try {
      const compressedImages = await Promise.all(
        files.map(async (file) => {
          const compressed = await compressImage(file, 50);
          return { data: compressed, is_primary: images.length === 0 };
        })
      );
      
      setImages(prev => [...prev, ...compressedImages]);
    } catch (err) {
      console.error('Error compressing images:', err);
      setError(t('products_management.image_upload_error'));
    } finally {
      setUploadingImages(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = (index) => {
    const img = images[index];
    if (img.id) {
      setDeletedImageIds(prev => [...prev, img.id]);
    }
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSetPrimaryImage = (index) => {
    setImages(prev => prev.map((img, i) => ({
      ...img,
      is_primary: i === index,
    })));
  };

  // =============================================
  // SAVE PRODUCT
  // =============================================
  const handleSave = async () => {
    if (!form.name_en.trim()) {
      setError(t('products_management.name_required'));
      return;
    }
    
    setModalLoading(true);
    setError('');
    
    try {
      const payload = {
        ...form,
        org_id: getOrgId(),
        category_id: form.category_id ? parseInt(form.category_id, 10) : null,
        brand_id: form.brand_id ? parseInt(form.brand_id, 10) : null,
        tag_ids: form.selected_tags || [],
        unit_price: parseFloat(form.unit_price) || 0,
        cost_price: form.cost_price ? parseFloat(form.cost_price) : null,
        tax_rate: parseFloat(form.tax_rate) || 0,
        stock_qty: form.stock_qty ? parseFloat(form.stock_qty) : null,
        min_stock_qty: form.min_stock_qty ? parseFloat(form.min_stock_qty) : null,
        weight: form.weight ? parseFloat(form.weight) : null,
        is_active: form.is_active,
      };
      delete payload.selected_tags; // Clean up the temp field

      if (editingProduct) {
        // Update existing product
        payload.deleted_image_ids = deletedImageIds;
        payload.images = images.filter(img => !img.id); // Only new images
        
        const response = await fetch(`${API_URL}/api/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-access-tokens': getToken(),
          },
          body: JSON.stringify(payload),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update product');
        }
        
        setSuccess(t('products_management.update_success'));
      } else {
        // Create new product
        payload.images = images.map(img => ({ data: img.data }));
        
        const response = await fetch(`${API_URL}/api/products`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-access-tokens': getToken(),
          },
          body: JSON.stringify(payload),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create product');
        }
        
        setSuccess(t('products_management.create_success'));
      }
      
      handleCloseModal();
      fetchProducts();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error saving product:', err);
      setError(err.message || t('products_management.save_error'));
    } finally {
      setModalLoading(false);
    }
  };

  // =============================================
  // DELETE PRODUCT
  // =============================================
  const handleDelete = async (product) => {
    if (!confirm(t('products_management.confirm_delete'))) return;
    
    try {
      const response = await fetch(`${API_URL}/api/products/${product.id}`, {
        method: 'DELETE',
        headers: { 'x-access-tokens': getToken() },
      });
      
      if (!response.ok) throw new Error('Failed to delete product');
      
      setSuccess(t('products_management.delete_success'));
      fetchProducts();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error deleting product:', err);
      setError(t('products_management.delete_error'));
    }
  };

  // =============================================
  // TOGGLE ACTIVE
  // =============================================
  const handleToggleActive = async (product) => {
    try {
      const response = await fetch(`${API_URL}/api/products/${product.id}/toggle-active`, {
        method: 'PATCH',
        headers: { 'x-access-tokens': getToken() },
      });
      
      if (!response.ok) throw new Error('Failed to toggle status');
      
      fetchProducts();
    } catch (err) {
      console.error('Error toggling status:', err);
      setError(t('products_management.toggle_error'));
    }
  };

  // =============================================
  // RENDER
  // =============================================
  if (authLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        
        <main className="grow" dir={language === 'ar' ? 'rtl' : 'ltr'}>
          <div className="px-4 sm:px-6 lg:px-8 py-6 w-full max-w-7xl mx-auto">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Package className="h-7 w-7 text-violet-600" />
                  {t('products_management.title')}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {t('products_management.subtitle')}
                </p>
              </div>
              
              <button
                onClick={handleOpenCreate}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all"
              >
                <Plus className="h-5 w-5" />
                {t('products_management.add_product')}
              </button>
            </div>

            {/* Alerts */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg flex items-center gap-2"
                >
                  <AlertCircle className="h-5 w-5" />
                  {error}
                  <button onClick={() => setError('')} className="ml-auto">
                    <X className="h-4 w-4" />
                  </button>
                </motion.div>
              )}
              
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg flex items-center gap-2"
                >
                  <Check className="h-5 w-5" />
                  {success}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Filters */}
            <div className="bg-white dark:bg-white/5 rounded-xl shadow-sm p-4 mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    placeholder={t('products_management.search_placeholder')}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                
                <select
                  value={filterActive}
                  onChange={(e) => { setFilterActive(e.target.value); setPage(1); }}
                  className="px-4 py-2.5 bg-gray-50 dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <option value="">{t('products_management.filter_all')}</option>
                  <option value="true">{t('products_management.filter_active')}</option>
                  <option value="false">{t('products_management.filter_inactive')}</option>
                </select>
                
                <button
                  onClick={fetchProducts}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
                >
                  <RefreshCcw className="h-5 w-5" />
                  {t('common.refresh')}
                </button>
              </div>
            </div>

            {/* Products Table */}
            <div className="bg-white dark:bg-white/5 rounded-xl shadow-sm overflow-hidden">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <RefreshCcw className="h-8 w-8 text-violet-600 animate-spin" />
                </div>
              ) : products.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-500 dark:text-gray-400">
                  <Package className="h-16 w-16 mb-4 opacity-30" />
                  <p>{t('products_management.no_products')}</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-300">
                      <tr>
                        <th className="px-4 py-3 text-left">{t('products_management.image')}</th>
                        <th className="px-4 py-3 text-left">{t('products_management.name')}</th>
                        <th className="px-4 py-3 text-left">{t('products_management.sku')}</th>
                        <th className="px-4 py-3 text-left">{t('products_management.ax_code')}</th>
                        <th className="px-4 py-3 text-right">{t('products_management.price')}</th>
                        <th className="px-4 py-3 text-center">{t('products_management.status')}</th>
                        <th className="px-4 py-3 text-center">{t('products_management.actions')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                      {products.map((product) => (
                        <motion.tr
                          key={product.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                        >
                          <td className="px-4 py-3">
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-white/10 flex items-center justify-center">
                              {product.primary_image ? (
                                <img
                                  src={product.primary_image}
                                  alt={product.name_en}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Image className="h-6 w-6 text-gray-400" />
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {language === 'ar' && product.name_ar ? product.name_ar : product.name_en}
                              </p>
                              {product.category_name && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {product.category_name}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-300 font-mono text-xs">
                            {product.sku || '-'}
                          </td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-300 font-mono text-xs">
                            {product.ax_code || '-'}
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-white">
                            {parseFloat(product.unit_price || 0).toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => handleToggleActive(product)}
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                                product.is_active
                                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                              }`}
                            >
                              {product.is_active ? (
                                <><Eye className="h-3 w-3" /> {t('products_management.active')}</>
                              ) : (
                                <><EyeOff className="h-3 w-3" /> {t('products_management.inactive')}</>
                              )}
                            </button>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleOpenEdit(product)}
                                className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(product)}
                                className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {pagination.total_pages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-white/5">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t('products_management.showing')} {products.length} {t('products_management.of')} {pagination.total}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="p-2 rounded-lg bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <span className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300">
                      {page} / {pagination.total_pages}
                    </span>
                    <button
                      onClick={() => setPage(p => Math.min(pagination.total_pages, p + 1))}
                      disabled={page === pagination.total_pages}
                      className="p-2 rounded-lg bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Product Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-white/10">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Package className="h-6 w-6 text-violet-600" />
                  {editingProduct ? t('products_management.edit_product') : t('products_management.add_product')}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                {modalLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <RefreshCcw className="h-8 w-8 text-violet-600 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Images Section */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <Image className="h-4 w-4 inline mr-1" />
                        {t('products_management.images')}
                      </label>
                      
                      <div className="flex flex-wrap gap-3 mb-3">
                        {images.map((img, index) => (
                          <div key={index} className="relative group">
                            <div className={`w-24 h-24 rounded-lg overflow-hidden border-2 ${
                              img.is_primary ? 'border-violet-500' : 'border-gray-200 dark:border-gray-600'
                            }`}>
                              <img src={img.data} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-1">
                              <button
                                onClick={() => handleSetPrimaryImage(index)}
                                className={`p-1.5 rounded-full ${
                                  img.is_primary ? 'bg-violet-500 text-white' : 'bg-white text-gray-700'
                                }`}
                                title={t('products_management.set_primary')}
                              >
                                <Check className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() => handleRemoveImage(index)}
                                className="p-1.5 bg-red-500 text-white rounded-full"
                                title={t('products_management.remove_image')}
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                            {img.is_primary && (
                              <span className="absolute -top-1 -right-1 bg-violet-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                                {t('products_management.primary')}
                              </span>
                            )}
                          </div>
                        ))}
                        
                        <label className="w-24 h-24 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-violet-500 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors">
                          {uploadingImages ? (
                            <RefreshCcw className="h-6 w-6 text-gray-400 animate-spin" />
                          ) : (
                            <>
                              <Upload className="h-6 w-6 text-gray-400" />
                              <span className="text-xs text-gray-400 mt-1">{t('products_management.upload')}</span>
                            </>
                          )}
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageUpload}
                            className="hidden"
                            disabled={uploadingImages}
                          />
                        </label>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {t('products_management.image_hint')}
                      </p>
                    </div>

                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t('products_management.name_en')} *
                        </label>
                        <input
                          type="text"
                          value={form.name_en}
                          onChange={(e) => handleFormChange('name_en', e.target.value)}
                          placeholder={t('products_management.name_en_placeholder')}
                          className="w-full px-3 py-2 bg-gray-50 dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t('products_management.name_ar')}
                        </label>
                        <input
                          type="text"
                          value={form.name_ar}
                          onChange={(e) => handleFormChange('name_ar', e.target.value)}
                          placeholder={t('products_management.name_ar_placeholder')}
                          className="w-full px-3 py-2 bg-gray-50 dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                          dir="rtl"
                        />
                      </div>
                    </div>

                    {/* Identifiers */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          <Hash className="h-4 w-4 inline mr-1" />
                          {t('products_management.sku')}
                        </label>
                        <input
                          type="text"
                          value={form.sku}
                          onChange={(e) => handleFormChange('sku', e.target.value)}
                          placeholder={t('products_management.sku_placeholder')}
                          className="w-full px-3 py-2 bg-gray-50 dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          <BarChart3 className="h-4 w-4 inline mr-1" />
                          {t('products_management.barcode')}
                        </label>
                        <input
                          type="text"
                          value={form.barcode}
                          onChange={(e) => handleFormChange('barcode', e.target.value)}
                          placeholder={t('products_management.barcode_placeholder')}
                          className="w-full px-3 py-2 bg-gray-50 dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          <Tag className="h-4 w-4 inline mr-1" />
                          {t('products_management.ax_code')}
                        </label>
                        <input
                          type="text"
                          value={form.ax_code}
                          onChange={(e) => handleFormChange('ax_code', e.target.value.slice(0, 50))}
                          placeholder={t('products_management.ax_code_placeholder')}
                          maxLength={50}
                          className="w-full px-3 py-2 bg-gray-50 dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 font-mono"
                        />
                      </div>
                    </div>

                    {/* Descriptions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t('products_management.description_en')}
                        </label>
                        <textarea
                          value={form.description_en}
                          onChange={(e) => handleFormChange('description_en', e.target.value)}
                          placeholder={t('products_management.description_placeholder')}
                          rows={3}
                          className="w-full px-3 py-2 bg-gray-50 dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t('products_management.description_ar')}
                        </label>
                        <textarea
                          value={form.description_ar}
                          onChange={(e) => handleFormChange('description_ar', e.target.value)}
                          placeholder={t('products_management.description_placeholder')}
                          rows={3}
                          className="w-full px-3 py-2 bg-gray-50 dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                          dir="rtl"
                        />
                      </div>
                    </div>

                    {/* Pricing */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          <DollarSign className="h-4 w-4 inline mr-1" />
                          {t('products_management.unit_price')} *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={form.unit_price}
                          onChange={(e) => handleFormChange('unit_price', e.target.value)}
                          placeholder="0.00"
                          className="w-full px-3 py-2 bg-gray-50 dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t('products_management.cost_price')}
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={form.cost_price}
                          onChange={(e) => handleFormChange('cost_price', e.target.value)}
                          placeholder="0.00"
                          className="w-full px-3 py-2 bg-gray-50 dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t('products_management.tax_rate')} (%)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={form.tax_rate}
                          onChange={(e) => handleFormChange('tax_rate', e.target.value)}
                          placeholder="0"
                          className="w-full px-3 py-2 bg-gray-50 dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t('products_management.unit')}
                        </label>
                        <select
                          value={form.unit}
                          onChange={(e) => handleFormChange('unit', e.target.value)}
                          className="w-full px-3 py-2 bg-gray-50 dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                        >
                          <option value="piece">{t('products_management.unit_piece')}</option>
                          <option value="kg">{t('products_management.unit_kg')}</option>
                          <option value="gram">{t('products_management.unit_gram')}</option>
                          <option value="liter">{t('products_management.unit_liter')}</option>
                          <option value="box">{t('products_management.unit_box')}</option>
                          <option value="pack">{t('products_management.unit_pack')}</option>
                        </select>
                      </div>
                    </div>

                    {/* Inventory */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t('products_management.stock_qty')}
                        </label>
                        <input
                          type="number"
                          step="0.001"
                          value={form.stock_qty}
                          onChange={(e) => handleFormChange('stock_qty', e.target.value)}
                          placeholder="0"
                          className="w-full px-3 py-2 bg-gray-50 dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t('products_management.min_stock_qty')}
                        </label>
                        <input
                          type="number"
                          step="0.001"
                          value={form.min_stock_qty}
                          onChange={(e) => handleFormChange('min_stock_qty', e.target.value)}
                          placeholder="0"
                          className="w-full px-3 py-2 bg-gray-50 dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t('products_management.weight')}
                        </label>
                        <input
                          type="number"
                          step="0.001"
                          value={form.weight}
                          onChange={(e) => handleFormChange('weight', e.target.value)}
                          placeholder="0"
                          className="w-full px-3 py-2 bg-gray-50 dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                        />
                      </div>
                    </div>

                    {/* Category & Brand Dropdowns */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t('products_management.category')}
                        </label>
                        <select
                          value={form.category_id}
                          onChange={(e) => handleFormChange('category_id', e.target.value)}
                          className="w-full px-3 py-2 bg-gray-50 dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                        >
                          <option value="">{t('products_management.select_category')}</option>
                          {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>
                              {'—'.repeat(cat.level || 0)} {language === 'ar' && cat.name_ar ? cat.name_ar : cat.name_en}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t('products_management.brand')}
                        </label>
                        <select
                          value={form.brand_id}
                          onChange={(e) => handleFormChange('brand_id', e.target.value)}
                          className="w-full px-3 py-2 bg-gray-50 dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                        >
                          <option value="">{t('products_management.select_brand')}</option>
                          {brands.map(brand => (
                            <option key={brand.id} value={brand.id}>
                              {language === 'ar' && brand.name_ar ? brand.name_ar : brand.name_en}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-end">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={form.is_active}
                            onChange={(e) => handleFormChange('is_active', e.target.checked)}
                            className="w-5 h-5 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                          />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {t('products_management.is_active')}
                          </span>
                        </label>
                      </div>
                    </div>

                    {/* Tags Multi-Select */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('products_management.tags')}
                      </label>
                      <div className="flex flex-wrap gap-2 p-3 bg-gray-50 dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-lg min-h-[60px]">
                        {availableTags.length === 0 ? (
                          <span className="text-sm text-gray-400">{t('products_management.no_tags_available')}</span>
                        ) : (
                          availableTags.map(tag => {
                            const isSelected = form.selected_tags?.includes(tag.id);
                            return (
                              <button
                                key={tag.id}
                                type="button"
                                onClick={() => {
                                  if (isSelected) {
                                    handleFormChange('selected_tags', form.selected_tags.filter(id => id !== tag.id));
                                  } else {
                                    handleFormChange('selected_tags', [...(form.selected_tags || []), tag.id]);
                                  }
                                }}
                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium transition-all ${
                                  isSelected
                                    ? 'text-white shadow-sm'
                                    : 'bg-white dark:bg-white/10 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-white/20 hover:border-gray-400'
                                }`}
                                style={isSelected ? { backgroundColor: tag.color || '#6366f1' } : {}}
                              >
                                <span
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: tag.color || '#6366f1' }}
                                />
                                {language === 'ar' && tag.name_ar ? tag.name_ar : tag.name_en}
                                {isSelected && (
                                  <X className="h-3 w-3 ml-0.5" />
                                )}
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-slate-800/50">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-white/10 border border-gray-300 dark:border-white/10 rounded-lg hover:bg-gray-50 dark:hover:bg-white/20 transition-colors"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={handleSave}
                  disabled={modalLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {modalLoading ? (
                    <RefreshCcw className="h-5 w-5 animate-spin" />
                  ) : (
                    <Save className="h-5 w-5" />
                  )}
                  {editingProduct ? t('products_management.save_changes') : t('products_management.create_product')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductsManagement;

