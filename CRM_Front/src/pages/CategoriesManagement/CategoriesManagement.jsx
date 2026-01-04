import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import Header from '../../partials/Header';
import Sidebar from '../../partials/Sidebar';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  FolderTree, Plus, Edit, Trash2, X, Save, Check, RefreshCcw,
  Eye, EyeOff, AlertCircle, ChevronRight, ChevronDown
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5030';

const CategoriesManagement = () => {
  const { authData, loading: authLoading } = useAuth();
  const { t, language } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const [expandedCategories, setExpandedCategories] = useState(new Set());

  const [form, setForm] = useState({
    name_en: '',
    name_ar: '',
    description: '',
    depart_id: '',
    parent_id: '',
    sort_order: 0,
    is_active: true,
  });

  const getToken = () => authData?.access_token || localStorage.getItem('access_token');
  const getOrgId = () => authData?.org_id || 1;

  const fetchCategories = useCallback(async () => {
    if (!authData?.access_token) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `${API_URL}/api/categories?org_id=${getOrgId()}&include_children=true`,
        { headers: { 'x-access-tokens': getToken() } }
      );

      if (!response.ok) throw new Error('Failed to fetch categories');

      const data = await response.json();
      setCategories(data.data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError(t('categories_management.fetch_error'));
    } finally {
      setLoading(false);
    }
  }, [authData?.access_token, t]);

  const fetchDepartments = useCallback(async () => {
    if (!authData?.access_token) return;

    try {
      const response = await fetch(
        `${API_URL}/api/departments?org_id=${getOrgId()}`,
        { headers: { 'x-access-tokens': getToken() } }
      );

      if (!response.ok) throw new Error('Failed to fetch departments');

      const data = await response.json();
      setDepartments(data.data || []);
    } catch (err) {
      console.error('Error fetching departments:', err);
    }
  }, [authData?.access_token]);

  useEffect(() => {
    if (!authLoading && authData?.access_token) {
      fetchCategories();
      fetchDepartments();
    }
  }, [authLoading, authData?.access_token, fetchCategories, fetchDepartments]);

  const resetForm = () => {
    setForm({
      name_en: '',
      name_ar: '',
      description: '',
      depart_id: '',
      parent_id: '',
      sort_order: 0,
      is_active: true,
    });
  };

  const handleOpenCreate = (parentId = null) => {
    setEditingItem(null);
    resetForm();
    if (parentId) {
      setForm(prev => ({ ...prev, parent_id: parentId.toString() }));
    }
    setShowModal(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setForm({
      name_en: item.name_en || '',
      name_ar: item.name_ar || '',
      description: item.description || '',
      depart_id: item.depart_id?.toString() || '',
      parent_id: item.parent_id?.toString() || '',
      sort_order: item.sort_order || 0,
      is_active: item.is_active === 1,
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingItem(null);
    resetForm();
  };

  const handleFormChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!form.name_en.trim()) {
      setError(t('categories_management.name_required'));
      return;
    }

    setModalLoading(true);
    setError('');

    try {
      const payload = {
        ...form,
        org_id: getOrgId(),
        depart_id: form.depart_id ? parseInt(form.depart_id, 10) : null,
        parent_id: form.parent_id ? parseInt(form.parent_id, 10) : null,
        sort_order: parseInt(form.sort_order, 10) || 0,
      };

      const url = editingItem
        ? `${API_URL}/api/categories/${editingItem.id}`
        : `${API_URL}/api/categories`;

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

      setSuccess(editingItem ? t('categories_management.update_success') : t('categories_management.create_success'));
      handleCloseModal();
      fetchCategories();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error saving category:', err);
      setError(err.message || t('categories_management.save_error'));
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (item) => {
    if (!confirm(t('categories_management.confirm_delete'))) return;

    try {
      const response = await fetch(`${API_URL}/api/categories/${item.id}`, {
        method: 'DELETE',
        headers: { 'x-access-tokens': getToken() },
      });

      if (!response.ok) throw new Error('Failed to delete');

      setSuccess(t('categories_management.delete_success'));
      fetchCategories();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error deleting category:', err);
      setError(t('categories_management.delete_error'));
    }
  };

  const handleToggleActive = async (item) => {
    try {
      const response = await fetch(`${API_URL}/api/categories/${item.id}/toggle-active`, {
        method: 'PATCH',
        headers: { 'x-access-tokens': getToken() },
      });

      if (!response.ok) throw new Error('Failed to toggle');

      fetchCategories();
    } catch (err) {
      console.error('Error toggling status:', err);
      setError(t('categories_management.toggle_error'));
    }
  };

  const toggleExpand = (id) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Flatten categories for parent dropdown (excluding current item and its children, filtered by department)
  const getFlatCategories = (items, level = 0, excludeId = null, departId = null) => {
    let result = [];
    for (const item of items) {
      if (item.id === excludeId) continue;
      // Filter by department if specified
      if (departId !== null && departId !== '' && item.depart_id !== parseInt(departId, 10)) {
        // Skip this item, but still check its children
        if (item.children?.length > 0) {
          result = result.concat(getFlatCategories(item.children, level + 1, excludeId, departId));
        }
        continue;
      }
      result.push({ ...item, level });
      if (item.children?.length > 0) {
        result = result.concat(getFlatCategories(item.children, level + 1, excludeId, departId));
      }
    }
    return result;
  };

  const renderCategoryTree = (items, level = 0) => {
    return items.map((item) => {
      const hasChildren = item.children && item.children.length > 0;
      const isExpanded = expandedCategories.has(item.id);

      return (
        <div key={item.id}>
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className={`flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors ${
              level > 0 ? 'ml-6 border-l-2 border-gray-200 dark:border-gray-700' : ''
            }`}
          >
            {hasChildren ? (
              <button
                onClick={() => toggleExpand(item.id)}
                className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
              >
                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
            ) : (
              <span className="w-6" />
            )}

            <FolderTree className="h-5 w-5 text-amber-500" />

            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 dark:text-white truncate">
                {language === 'ar' && item.name_ar ? item.name_ar : item.name_en}
              </p>
              {item.description && (
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {item.description}
                </p>
              )}
            </div>

            <button
              onClick={() => handleToggleActive(item)}
              className={`px-2 py-1 text-xs rounded-full font-medium ${
                item.is_active
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
            >
              {item.is_active ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
            </button>

            <button
              onClick={() => handleOpenCreate(item.id)}
              className="p-2 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg"
              title={t('categories_management.add_subcategory')}
            >
              <Plus className="h-4 w-4" />
            </button>

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
          </motion.div>

          {hasChildren && isExpanded && (
            <div className="ml-4">
              {renderCategoryTree(item.children, level + 1)}
            </div>
          )}
        </div>
      );
    });
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
                  <FolderTree className="h-7 w-7 text-amber-500" />
                  {t('categories_management.title')}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {t('categories_management.subtitle')}
                </p>
              </div>

              <button
                onClick={() => handleOpenCreate()}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all"
              >
                <Plus className="h-5 w-5" />
                {t('categories_management.add_category')}
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

            {/* Categories List */}
            <div className="bg-white dark:bg-white/5 rounded-xl shadow-sm p-4">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCcw className="h-8 w-8 text-amber-500 animate-spin" />
                </div>
              ) : categories.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
                  <FolderTree className="h-16 w-16 mb-4 opacity-30" />
                  <p>{t('categories_management.no_categories')}</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {renderCategoryTree(categories)}
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
                  <FolderTree className="h-6 w-6 text-amber-500" />
                  {editingItem ? t('categories_management.edit_category') : t('categories_management.add_category')}
                </h2>
                <button onClick={handleCloseModal} className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-white/10">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 space-y-4" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('categories_management.name_en')} *
                    </label>
                    <input
                      type="text"
                      value={form.name_en}
                      onChange={(e) => handleFormChange('name_en', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('categories_management.name_ar')}
                    </label>
                    <input
                      type="text"
                      value={form.name_ar}
                      onChange={(e) => handleFormChange('name_ar', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                      dir="rtl"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('categories_management.department') || 'Department'} *
                  </label>
                  <select
                    value={form.depart_id}
                    onChange={(e) => {
                      handleFormChange('depart_id', e.target.value);
                      // Clear parent_id when department changes
                      handleFormChange('parent_id', '');
                    }}
                    required
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">{t('categories_management.select_department') || 'Select Department'}</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>
                        {language === 'ar' && dept.name_ar ? dept.name_ar : dept.name_en}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('categories_management.parent_category')}
                  </label>
                  <select
                    value={form.parent_id}
                    onChange={(e) => handleFormChange('parent_id', e.target.value)}
                    disabled={!form.depart_id}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">{t('categories_management.no_parent')}</option>
                    {form.depart_id && getFlatCategories(categories, 0, editingItem?.id, form.depart_id).map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {'—'.repeat(cat.level)} {language === 'ar' && cat.name_ar ? cat.name_ar : cat.name_en}
                      </option>
                    ))}
                  </select>
                  {!form.depart_id && (
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {t('categories_management.select_department_first') || 'Please select a department first'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('categories_management.description')}
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) => handleFormChange('description', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('categories_management.sort_order')}
                    </label>
                    <input
                      type="number"
                      value={form.sort_order}
                      onChange={(e) => handleFormChange('sort_order', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.is_active}
                        onChange={(e) => handleFormChange('is_active', e.target.checked)}
                        className="w-5 h-5 rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t('categories_management.is_active')}
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-slate-800/50">
                <button onClick={handleCloseModal} className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-white/10 border border-gray-300 dark:border-white/10 rounded-lg hover:bg-gray-50 dark:hover:bg-white/20">
                  {t('common.cancel')}
                </button>
                <button
                  onClick={handleSave}
                  disabled={modalLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-medium shadow-md hover:shadow-lg disabled:opacity-50"
                >
                  {modalLoading ? <RefreshCcw className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                  {editingItem ? t('categories_management.save_changes') : t('categories_management.create')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CategoriesManagement;

