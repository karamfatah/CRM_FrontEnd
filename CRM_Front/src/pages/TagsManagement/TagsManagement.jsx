import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import Header from '../../partials/Header';
import Sidebar from '../../partials/Sidebar';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  Tags, Plus, Edit, Trash2, X, Save, Check, RefreshCcw,
  Eye, EyeOff, AlertCircle, Palette
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5030';

const PRESET_COLORS = [
  '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
  '#f43f5e', '#ef4444', '#f97316', '#f59e0b', '#eab308',
  '#84cc16', '#22c55e', '#10b981', '#14b8a6', '#06b6d4',
  '#0ea5e9', '#3b82f6', '#6b7280',
];

const TagsManagement = () => {
  const { authData, loading: authLoading } = useAuth();
  const { t, language } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const [form, setForm] = useState({
    name_en: '',
    name_ar: '',
    color: '#6366f1',
    is_active: true,
  });

  const getToken = () => authData?.access_token || localStorage.getItem('access_token');
  const getOrgId = () => authData?.org_id || 1;

  const fetchTags = useCallback(async () => {
    if (!authData?.access_token) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `${API_URL}/api/tags?org_id=${getOrgId()}`,
        { headers: { 'x-access-tokens': getToken() } }
      );

      if (!response.ok) throw new Error('Failed to fetch tags');

      const data = await response.json();
      setTags(data.data || []);
    } catch (err) {
      console.error('Error fetching tags:', err);
      setError(t('tags_management.fetch_error'));
    } finally {
      setLoading(false);
    }
  }, [authData?.access_token, t]);

  useEffect(() => {
    if (!authLoading && authData?.access_token) {
      fetchTags();
    }
  }, [authLoading, authData?.access_token, fetchTags]);

  const resetForm = () => {
    setForm({
      name_en: '',
      name_ar: '',
      color: '#6366f1',
      is_active: true,
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
      name_en: item.name_en || '',
      name_ar: item.name_ar || '',
      color: item.color || '#6366f1',
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
      setError(t('tags_management.name_required'));
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
        ? `${API_URL}/api/tags/${editingItem.id}`
        : `${API_URL}/api/tags`;

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

      setSuccess(editingItem ? t('tags_management.update_success') : t('tags_management.create_success'));
      handleCloseModal();
      fetchTags();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error saving tag:', err);
      setError(err.message || t('tags_management.save_error'));
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (item) => {
    if (!confirm(t('tags_management.confirm_delete'))) return;

    try {
      const response = await fetch(`${API_URL}/api/tags/${item.id}`, {
        method: 'DELETE',
        headers: { 'x-access-tokens': getToken() },
      });

      if (!response.ok) throw new Error('Failed to delete');

      setSuccess(t('tags_management.delete_success'));
      fetchTags();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error deleting tag:', err);
      setError(t('tags_management.delete_error'));
    }
  };

  const handleToggleActive = async (item) => {
    try {
      const response = await fetch(`${API_URL}/api/tags/${item.id}/toggle-active`, {
        method: 'PATCH',
        headers: { 'x-access-tokens': getToken() },
      });

      if (!response.ok) throw new Error('Failed to toggle');

      fetchTags();
    } catch (err) {
      console.error('Error toggling status:', err);
      setError(t('tags_management.toggle_error'));
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
                  <Tags className="h-7 w-7 text-pink-500" />
                  {t('tags_management.title')}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {t('tags_management.subtitle')}
                </p>
              </div>

              <button
                onClick={handleOpenCreate}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all"
              >
                <Plus className="h-5 w-5" />
                {t('tags_management.add_tag')}
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

            {/* Tags */}
            <div className="bg-white dark:bg-white/5 rounded-xl shadow-sm p-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCcw className="h-8 w-8 text-pink-500 animate-spin" />
                </div>
              ) : tags.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
                  <Tags className="h-16 w-16 mb-4 opacity-30" />
                  <p>{t('tags_management.no_tags')}</p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {tags.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`group relative inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all ${
                        item.is_active
                          ? 'bg-white dark:bg-white/5'
                          : 'bg-gray-100 dark:bg-gray-800 opacity-60'
                      }`}
                      style={{ borderColor: item.color || '#6366f1' }}
                    >
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color || '#6366f1' }}
                      />
                      <span className="font-medium text-gray-900 dark:text-white">
                        {language === 'ar' && item.name_ar ? item.name_ar : item.name_en}
                      </span>

                      {/* Hover actions */}
                      <div className="hidden group-hover:flex items-center gap-1 ml-2">
                        <button
                          onClick={() => handleToggleActive(item)}
                          className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
                        >
                          {item.is_active ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1 text-blue-600 dark:text-blue-400"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className="p-1 text-red-600 dark:text-red-400"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
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
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-white/10">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Tags className="h-6 w-6 text-pink-500" />
                  {editingItem ? t('tags_management.edit_tag') : t('tags_management.add_tag')}
                </h2>
                <button onClick={handleCloseModal} className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-white/10">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 space-y-4" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('tags_management.name_en')} *
                    </label>
                    <input
                      type="text"
                      value={form.name_en}
                      onChange={(e) => handleFormChange('name_en', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('tags_management.name_ar')}
                    </label>
                    <input
                      type="text"
                      value={form.name_ar}
                      onChange={(e) => handleFormChange('name_ar', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                      dir="rtl"
                    />
                  </div>
                </div>

                {/* Color Picker */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
                    <Palette className="h-4 w-4" />
                    {t('tags_management.color')}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => handleFormChange('color', color)}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${
                          form.color === color
                            ? 'border-gray-900 dark:border-white scale-110'
                            : 'border-transparent hover:scale-105'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                    <label className="w-8 h-8 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center cursor-pointer hover:border-gray-400">
                      <input
                        type="color"
                        value={form.color}
                        onChange={(e) => handleFormChange('color', e.target.value)}
                        className="sr-only"
                      />
                      <Plus className="h-4 w-4 text-gray-400" />
                    </label>
                  </div>
                </div>

                {/* Preview */}
                <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {t('tags_management.preview')}:
                  </span>
                  <span
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-white text-sm font-medium"
                    style={{ backgroundColor: form.color }}
                  >
                    {form.name_en || t('tags_management.sample_tag')}
                  </span>
                </div>

                <div className="flex items-center">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.is_active}
                      onChange={(e) => handleFormChange('is_active', e.target.checked)}
                      className="w-5 h-5 rounded border-gray-300 text-pink-500 focus:ring-pink-500"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('tags_management.is_active')}
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-slate-800/50">
                <button onClick={handleCloseModal} className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-white/10 border border-gray-300 dark:border-white/10 rounded-lg hover:bg-gray-50 dark:hover:bg-white/20">
                  {t('common.cancel')}
                </button>
                <button
                  onClick={handleSave}
                  disabled={modalLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg font-medium shadow-md hover:shadow-lg disabled:opacity-50"
                >
                  {modalLoading ? <RefreshCcw className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                  {editingItem ? t('tags_management.save_changes') : t('tags_management.create')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TagsManagement;

