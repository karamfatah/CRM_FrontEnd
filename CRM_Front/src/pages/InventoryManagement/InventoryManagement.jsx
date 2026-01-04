import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import Header from '../../partials/Header';
import Sidebar from '../../partials/Sidebar';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  Package, Plus, Edit, Trash2, X, Save, RefreshCcw,
  AlertCircle, CheckCircle, MapPin, ShoppingCart
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5030';

const InventoryManagement = () => {
  const { authData, loading: authLoading } = useAuth();
  const { t, language } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [inventory, setInventory] = useState([]);
  const [locations, setLocations] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const [filters, setFilters] = useState({
    location_id: '',
    item_id: '',
    in_stock: ''
  });

  const [form, setForm] = useState({
    location_id: '',
    item_id: '',
    qty: 0,
    allow_zero_qty: false,
  });

  const getToken = () => authData?.access_token || localStorage.getItem('access_token');
  const getOrgId = () => authData?.org_id || 1;

  // Fetch locations
  const fetchLocations = useCallback(async () => {
    if (!authData?.org_id) return;
    try {
      const response = await fetch(
        `${API_URL}/locations_qa?org_id=${authData.org_id}`,
        { headers: { 'x-access-tokens': getToken() } }
      );
      if (response.ok) {
        const data = await response.json();
        setLocations(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to fetch locations:', err);
    }
  }, [authData?.org_id]);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    if (!authData?.access_token) return;
    try {
      const response = await fetch(
        `${API_URL}/api/products?org_id=${getOrgId()}&is_active=true&per_page=1000`,
        { headers: { 'x-access-tokens': getToken() } }
      );
      if (response.ok) {
        const data = await response.json();
        setProducts(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
    }
  }, [authData?.access_token]);

  // Fetch inventory
  const fetchInventory = useCallback(async () => {
    if (!authData?.access_token) return;

    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams({ org_id: getOrgId() });
      if (filters.location_id) params.append('location_id', filters.location_id);
      if (filters.item_id) params.append('item_id', filters.item_id);
      if (filters.in_stock !== '') params.append('in_stock', filters.in_stock);

      const response = await fetch(
        `${API_URL}/api/inventory?${params}`,
        { headers: { 'x-access-tokens': getToken() } }
      );

      if (!response.ok) throw new Error('Failed to fetch inventory');

      const data = await response.json();
      setInventory(data.data || []);
    } catch (err) {
      console.error('Error fetching inventory:', err);
      setError(t('inventory_management.fetch_error') || 'Failed to fetch inventory');
    } finally {
      setLoading(false);
    }
  }, [authData?.access_token, filters, t]);

  useEffect(() => {
    if (!authLoading && authData?.access_token) {
      fetchLocations();
      fetchProducts();
      fetchInventory();
    }
  }, [authLoading, authData?.access_token, fetchLocations, fetchProducts, fetchInventory]);

  const resetForm = () => {
    setForm({
      location_id: '',
      item_id: '',
      qty: 0,
      allow_zero_qty: false,
    });
  };

  const handleOpenCreate = () => {
    setEditingItem(null);
    resetForm();
    setShowModal(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setForm({
      location_id: item.location_id?.toString() || '',
      item_id: item.item_id?.toString() || '',
      qty: item.qty || 0,
      allow_zero_qty: item.allow_zero_qty === 1 || item.allow_zero_qty === true,
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingItem(null);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.location_id || !form.item_id || form.qty === undefined) {
      setError(t('inventory_management.fill_required_fields') || 'Please fill all required fields');
      return;
    }

    setModalLoading(true);
    setError('');

    try {
      const url = editingItem
        ? `${API_URL}/api/inventory/${editingItem.id}`
        : `${API_URL}/api/inventory`;
      
      const method = editingItem ? 'PUT' : 'POST';
      const body = editingItem
        ? { org_id: getOrgId(), ...form }
        : { org_id: getOrgId(), ...form };

      const response = await fetch(url, {
        method,
        headers: {
          'x-access-tokens': getToken(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save inventory');
      }

      setSuccess(
        editingItem
          ? t('inventory_management.update_success') || 'Inventory updated successfully!'
          : t('inventory_management.create_success') || 'Inventory created successfully!'
      );
      setTimeout(() => setSuccess(''), 3000);
      
      handleCloseModal();
      fetchInventory();
    } catch (err) {
      console.error('Error saving inventory:', err);
      setError(err.message || t('inventory_management.save_error') || 'Failed to save inventory');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('inventory_management.delete_confirm') || 'Are you sure you want to delete this inventory entry?')) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/inventory/${id}?org_id=${getOrgId()}`,
        {
          method: 'DELETE',
          headers: { 'x-access-tokens': getToken() },
        }
      );

      if (!response.ok) throw new Error('Failed to delete inventory');

      setSuccess(t('inventory_management.delete_success') || 'Inventory deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
      fetchInventory();
    } catch (err) {
      console.error('Error deleting inventory:', err);
      setError(err.message || t('inventory_management.delete_error') || 'Failed to delete inventory');
    }
  };

  const getProductName = (item) => {
    if (language === 'ar' && item.product_name_ar) return item.product_name_ar;
    return item.product_name_en || 'Unknown Product';
  };

  const getLocationName = (item) => {
    if (language === 'ar' && item.location_name_ar) return item.location_name_ar;
    return item.location_name_en || 'Unknown Location';
  };

  if (authLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-[#0a0a0f]">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="relative flex flex-col flex-1 overflow-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        
        <main className="flex-1 overflow-y-auto">
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {t('inventory_management.title') || 'Inventory Management'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {t('inventory_management.subtitle') || 'Manage inventory levels across locations'}
              </p>
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="mb-4 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <p className="text-red-600 dark:text-red-400">{error}</p>
                <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600">
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {success && (
              <div className="mb-4 p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-500" />
                <p className="text-emerald-600 dark:text-emerald-400">{success}</p>
                <button onClick={() => setSuccess('')} className="ml-auto text-emerald-400 hover:text-emerald-600">
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Filters */}
            <div className="mb-6 p-4 rounded-lg bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('inventory_management.location') || 'Location'}
                  </label>
                  <select
                    value={filters.location_id}
                    onChange={(e) => setFilters({ ...filters, location_id: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">{t('inventory_management.all_locations') || 'All Locations'}</option>
                    {locations.map(loc => (
                      <option key={loc.locations_qa_id || loc.id} value={(loc.locations_qa_id || loc.id)?.toString()}>
                        {language === 'ar' ? (loc.name_ar || loc.location_ar || loc.name_en || loc.location_en) : (loc.name_en || loc.location_en || loc.name_ar || loc.location_ar)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('inventory_management.product') || 'Product'}
                  </label>
                  <select
                    value={filters.item_id}
                    onChange={(e) => setFilters({ ...filters, item_id: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">{t('inventory_management.all_products') || 'All Products'}</option>
                    {products.map(prod => (
                      <option key={prod.id} value={prod.id.toString()}>
                        {language === 'ar' && prod.name_ar ? prod.name_ar : prod.name_en} {prod.sku ? `(${prod.sku})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('inventory_management.stock_status') || 'Stock Status'}
                  </label>
                  <select
                    value={filters.in_stock}
                    onChange={(e) => setFilters({ ...filters, in_stock: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">{t('inventory_management.all_statuses') || 'All Statuses'}</option>
                    <option value="true">{t('inventory_management.in_stock') || 'In Stock'}</option>
                    <option value="false">{t('inventory_management.out_of_stock') || 'Out of Stock'}</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={() => setFilters({ location_id: '', item_id: '', in_stock: '' })}
                    className="w-full px-4 py-2 bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-white/20 transition-colors"
                  >
                    {t('inventory_management.reset_filters') || 'Reset'}
                  </button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mb-6 flex justify-between items-center">
              <button
                onClick={handleOpenCreate}
                className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
              >
                <Plus className="h-5 w-5" />
                {t('inventory_management.add_inventory') || 'Add Inventory'}
              </button>
              <button
                onClick={fetchInventory}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-white/20 transition-colors disabled:opacity-50"
              >
                <RefreshCcw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                {t('common.refresh') || 'Refresh'}
              </button>
            </div>

            {/* Inventory Table */}
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <RefreshCcw className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : inventory.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-white/5 rounded-lg border border-gray-200 dark:border-white/10">
                <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  {t('inventory_management.no_inventory') || 'No inventory entries found'}
                </p>
              </div>
            ) : (
              <div className="bg-white dark:bg-white/5 rounded-lg border border-gray-200 dark:border-white/10 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-white/5">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          {t('inventory_management.location') || 'Location'}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          {t('inventory_management.product') || 'Product'}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          {t('inventory_management.sku') || 'SKU'}
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          {t('inventory_management.quantity') || 'Quantity'}
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          {t('inventory_management.stock_status') || 'Stock Status'}
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          {t('common.actions') || 'Actions'}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-white/5">
                      {inventory.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-white/5">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-900 dark:text-white">
                                {getLocationName(item)}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <ShoppingCart className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-900 dark:text-white">
                                {getProductName(item)}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {item.product_sku || '—'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900 dark:text-white">
                            {parseFloat(item.qty).toFixed(3)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            {item.in_stock === 1 || item.in_stock === true ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                <CheckCircle className="h-3 w-3" />
                                {t('inventory_management.in_stock') || 'In Stock'}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                <AlertCircle className="h-3 w-3" />
                                {t('inventory_management.out_of_stock') || 'Out of Stock'}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleOpenEdit(item)}
                                className="p-2 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors"
                                title={t('common.edit') || 'Edit'}
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                title={t('common.delete') || 'Delete'}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Create/Edit Modal */}
        <AnimatePresence>
          {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-[#12121a] rounded-xl shadow-xl max-w-md w-full p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {editingItem
                      ? t('inventory_management.edit_inventory') || 'Edit Inventory'
                      : t('inventory_management.add_inventory') || 'Add Inventory'}
                  </h2>
                  <button
                    onClick={handleCloseModal}
                    className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('inventory_management.location') || 'Location'} *
                    </label>
                    <select
                      value={form.location_id}
                      onChange={(e) => setForm({ ...form, location_id: e.target.value })}
                      required
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="">{t('inventory_management.select_location') || 'Select Location'}</option>
                      {locations.map(loc => (
                        <option key={loc.locations_qa_id || loc.id} value={(loc.locations_qa_id || loc.id)?.toString()}>
                          {language === 'ar' ? (loc.name_ar || loc.location_ar || loc.name_en || loc.location_en) : (loc.name_en || loc.location_en || loc.name_ar || loc.location_ar)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('inventory_management.product') || 'Product'} *
                    </label>
                    <select
                      value={form.item_id}
                      onChange={(e) => setForm({ ...form, item_id: e.target.value })}
                      required
                      disabled={!!editingItem}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">{t('inventory_management.select_product') || 'Select Product'}</option>
                      {products.map(prod => (
                        <option key={prod.id} value={prod.id.toString()}>
                          {language === 'ar' && prod.name_ar ? prod.name_ar : prod.name_en} {prod.sku ? `(${prod.sku})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('inventory_management.quantity') || 'Quantity'} *
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      min="0"
                      value={form.qty}
                      onChange={(e) => setForm({ ...form, qty: parseFloat(e.target.value) || 0 })}
                      required
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {t('inventory_management.qty_hint') || 'When quantity reaches 0, stock status will automatically be set to "Out of Stock"'}
                    </p>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      <input
                        type="checkbox"
                        checked={form.allow_zero_qty}
                        onChange={(e) => setForm({ ...form, allow_zero_qty: e.target.checked })}
                        className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                      />
                      <span>{t('inventory_management.allow_zero_qty') || 'Allow Zero Quantity'}</span>
                    </label>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {t('inventory_management.allow_zero_qty_hint') || 'Independent flag for inventory management. Can be set regardless of quantity value.'}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={modalLoading}
                      className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                    >
                      {modalLoading ? (
                        <>
                          <RefreshCcw className="h-4 w-4 animate-spin" />
                          {t('common.saving') || 'Saving...'}
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          {t('common.save') || 'Save'}
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="px-4 py-2 bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-white/20 transition-colors"
                    >
                      {t('common.cancel') || 'Cancel'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default InventoryManagement;

