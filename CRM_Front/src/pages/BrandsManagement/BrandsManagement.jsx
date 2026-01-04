import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import Header from '../../partials/Header';
import Sidebar from '../../partials/Sidebar';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  Award, Plus, Edit, Trash2, X, Save, Check, RefreshCcw,
  Eye, EyeOff, AlertCircle, Upload, Image
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5030';

// Image compression utility
const compressImage = (file, maxSizeKB = 50) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        const maxDimension = 200;
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
        let quality = 0.9;
        let result = canvas.toDataURL('image/jpeg', quality);
        const targetSize = maxSizeKB * 1024;
        while (result.length > targetSize && quality > 0.1) {
          quality -= 0.1;
          result = canvas.toDataURL('image/jpeg', quality);
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

const BrandsManagement = () => {
  const { authData, loading: authLoading } = useAuth();
  const { t, language } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const [form, setForm] = useState({
    name_en: '',
    name_ar: '',
    description: '',
    logo_data: '',
    is_active: true,
  });

  const fileInputRef = useRef(null);

  const getToken = () => authData?.access_token || localStorage.getItem('access_token');
  const getOrgId = () => authData?.org_id || 1;

  const fetchBrands = useCallback(async () => {
    if (!authData?.access_token) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `${API_URL}/api/brands?org_id=${getOrgId()}`,
        { headers: { 'x-access-tokens': getToken() } }
      );

      if (!response.ok) throw new Error('Failed to fetch brands');

      const data = await response.json();
      setBrands(data.data || []);
    } catch (err) {
      console.error('Error fetching brands:', err);
      setError(t('brands_management.fetch_error'));
    } finally {
      setLoading(false);
    }
  }, [authData?.access_token, t]);

  useEffect(() => {
    if (!authLoading && authData?.access_token) {
      fetchBrands();
    }
  }, [authLoading, authData?.access_token, fetchBrands]);

  const resetForm = () => {
    setForm({
      name_en: '',
      name_ar: '',
      description: '',
      logo_data: '',
      is_active: true,
    });
  };

  const handleOpenCreate = () => {
    setEditingItem(null);
    resetForm();
    setShowModal(true);
  };

  const handleOpenEdit = async (item) => {
    setEditingItem(item);
    setModalLoading(true);
    setShowModal(true);

    try {
      const response = await fetch(`${API_URL}/api/brands/${item.id}`, {
        headers: { 'x-access-tokens': getToken() },
      });
      if (!response.ok) throw new Error('Failed to fetch brand');
      const data = await response.json();
      const b = data.data;
      setForm({
        name_en: b.name_en || '',
        name_ar: b.name_ar || '',
        description: b.description || '',
        logo_data: b.logo_data || '',
        is_active: b.is_active === 1,
      });
    } catch (err) {
      console.error('Error fetching brand:', err);
      setError(t('brands_management.fetch_error'));
      setShowModal(false);
    } finally {
      setModalLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingItem(null);
    resetForm();
  };

  const handleFormChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file, 30);
      setForm(prev => ({ ...prev, logo_data: compressed }));
    } catch (err) {
      console.error('Error compressing image:', err);
      setError(t('brands_management.logo_upload_error'));
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSave = async () => {
    if (!form.name_en.trim()) {
      setError(t('brands_management.name_required'));
      return;
    }

    setModalLoading(true);
    setError('');

    try {
      const payload = {
        ...form,
        org_id: getOrgId(),
      };

      const url = editingItem
        ? `${API_URL}/api/brands/${editingItem.id}`
        : `${API_URL}/api/brands`;

      const response = await fetch(url, {
        method: editingItem ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-access-tokens': getToken(),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to save');
      }

      setSuccess(editingItem ? t('brands_management.update_success') : t('brands_management.create_success'));
      handleCloseModal();
      fetchBrands();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error saving brand:', err);
      setError(err.message || t('brands_management.save_error'));
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (item) => {
    if (!confirm(t('brands_management.confirm_delete'))) return;

    try {
      const response = await fetch(`${API_URL}/api/brands/${item.id}`, {
        method: 'DELETE',
        headers: { 'x-access-tokens': getToken() },
      });

      if (!response.ok) throw new Error('Failed to delete');

      setSuccess(t('brands_management.delete_success'));
      fetchBrands();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error deleting brand:', err);
      setError(t('brands_management.delete_error'));
    }
  };

  const handleToggleActive = async (item) => {
    try {
      const response = await fetch(`${API_URL}/api/brands/${item.id}/toggle-active`, {
        method: 'PATCH',
        headers: { 'x-access-tokens': getToken() },
      });

      if (!response.ok) throw new Error('Failed to toggle');

      fetchBrands();
    } catch (err) {
      console.error('Error toggling status:', err);
      setError(t('brands_management.toggle_error'));
    }
  };

  if (authLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="grow" dir={language === 'ar' ? 'rtl' : 'ltr'}>
          <div className="px-4 sm:px-6 lg:px-8 py-6 w-full max-w-4xl mx-auto">

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Award className="h-7 w-7 text-blue-500" />
                  {t('brands_management.title')}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {t('brands_management.subtitle')}
                </p>
              </div>

              <button
                onClick={handleOpenCreate}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all"
              >
                <Plus className="h-5 w-5" />
                {t('brands_management.add_brand')}
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
                  <button onClick={() => setError('')} className="ml-auto"><X className="h-4 w-4" /></button>
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

            {/* Brands Grid */}
            <div className="bg-white dark:bg-white/5 rounded-xl shadow-sm p-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCcw className="h-8 w-8 text-blue-500 animate-spin" />
                </div>
              ) : brands.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
                  <Award className="h-16 w-16 mb-4 opacity-30" />
                  <p>{t('brands_management.no_brands')}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {brands.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-gray-50 dark:bg-white/5 rounded-xl p-4 border border-gray-100 dark:border-white/10 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-14 h-14 rounded-lg bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 flex items-center justify-center overflow-hidden">
                          {item.logo_data ? (
                            <img src={item.logo_data} alt={item.name_en} className="w-full h-full object-contain" />
                          ) : (
                            <Award className="h-6 w-6 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                            {language === 'ar' && item.name_ar ? item.name_ar : item.name_en}
                          </h3>
                          {item.description && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200 dark:border-white/10">
                        <button
                          onClick={() => handleToggleActive(item)}
                          className={`px-2 py-1 text-xs rounded-full font-medium flex items-center gap-1 ${
                            item.is_active
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                          }`}
                        >
                          {item.is_active ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                          {item.is_active ? t('brands_management.active') : t('brands_management.inactive')}
                        </button>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
                            className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Modal */}
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
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-white/10">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Award className="h-6 w-6 text-blue-500" />
                  {editingItem ? t('brands_management.edit_brand') : t('brands_management.add_brand')}
                </h2>
                <button onClick={handleCloseModal} className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-white/10">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 space-y-4" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                {modalLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCcw className="h-8 w-8 text-blue-500 animate-spin" />
                  </div>
                ) : (
                  <>
                    {/* Logo Upload */}
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 rounded-lg bg-gray-100 dark:bg-white/10 border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center overflow-hidden">
                        {form.logo_data ? (
                          <img src={form.logo_data} alt="Logo" className="w-full h-full object-contain" />
                        ) : (
                          <Image className="h-8 w-8 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <label className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors">
                          <Upload className="h-4 w-4" />
                          {t('brands_management.upload_logo')}
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="hidden"
                          />
                        </label>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {t('brands_management.logo_hint')}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t('brands_management.name_en')} *
                        </label>
                        <input
                          type="text"
                          value={form.name_en}
                          onChange={(e) => handleFormChange('name_en', e.target.value)}
                          className="w-full px-3 py-2 bg-gray-50 dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t('brands_management.name_ar')}
                        </label>
                        <input
                          type="text"
                          value={form.name_ar}
                          onChange={(e) => handleFormChange('name_ar', e.target.value)}
                          className="w-full px-3 py-2 bg-gray-50 dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          dir="rtl"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('brands_management.description')}
                      </label>
                      <textarea
                        value={form.description}
                        onChange={(e) => handleFormChange('description', e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      />
                    </div>

                    <div className="flex items-center">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.is_active}
                          onChange={(e) => handleFormChange('is_active', e.target.checked)}
                          className="w-5 h-5 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {t('brands_management.is_active')}
                        </span>
                      </label>
                    </div>
                  </>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-slate-800/50">
                <button onClick={handleCloseModal} className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-white/10 border border-gray-300 dark:border-white/10 rounded-lg hover:bg-gray-50 dark:hover:bg-white/20">
                  {t('common.cancel')}
                </button>
                <button
                  onClick={handleSave}
                  disabled={modalLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-medium shadow-md hover:shadow-lg disabled:opacity-50"
                >
                  {modalLoading ? <RefreshCcw className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                  {editingItem ? t('brands_management.save_changes') : t('brands_management.create')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BrandsManagement;

