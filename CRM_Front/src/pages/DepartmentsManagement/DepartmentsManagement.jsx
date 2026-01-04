import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import Header from '../../partials/Header';
import Sidebar from '../../partials/Sidebar';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  Building2, Plus, Edit, Trash2, X, Save, RefreshCcw,
  Eye, EyeOff, AlertCircle
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5030';

const DepartmentsManagement = () => {
  const { authData, loading: authLoading } = useAuth();
  const { t, language } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [departments, setDepartments] = useState([]);
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
    sort_order: 0,
    is_active: true,
  });

  const getToken = () => authData?.access_token || localStorage.getItem('access_token');
  const getOrgId = () => authData?.org_id || 1;

  const fetchDepartments = useCallback(async () => {
    if (!authData?.access_token) return;

    setLoading(true);
    setError('');

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
      setError(t('departments_management.fetch_error') || 'Failed to fetch departments');
    } finally {
      setLoading(false);
    }
  }, [authData?.access_token, t]);

  useEffect(() => {
    if (!authLoading && authData?.access_token) {
      fetchDepartments();
    }
  }, [authLoading, authData?.access_token, fetchDepartments]);

  const resetForm = () => {
    setForm({
      name_en: '',
      name_ar: '',
      description: '',
      sort_order: 0,
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
      description: item.description || '',
      sort_order: item.sort_order || 0,
      is_active: item.is_active !== undefined ? Boolean(item.is_active) : true,
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingItem(null);
    resetForm();
    setError('');
  };

  const handleFormChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setError('');

    try {
      const payload = {
        org_id: getOrgId(),
        name_en: form.name_en.trim(),
        name_ar: form.name_ar.trim(),
        description: form.description.trim() || null,
        sort_order: parseInt(form.sort_order) || 0,
        is_active: form.is_active,
      };

      const url = editingItem
        ? `${API_URL}/api/departments/${editingItem.id}?org_id=${getOrgId()}`
        : `${API_URL}/api/departments`;

      const method = editingItem ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-access-tokens': getToken(),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to save department');
      }

      setSuccess(editingItem
        ? t('departments_management.update_success') || 'Department updated successfully'
        : t('departments_management.create_success') || 'Department created successfully'
      );
      setTimeout(() => setSuccess(''), 3000);

      handleCloseModal();
      fetchDepartments();
    } catch (err) {
      console.error('Error saving department:', err);
      setError(err.message || t('departments_management.save_error') || 'Failed to save department');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('departments_management.delete_confirm') || 'Are you sure you want to delete this department?')) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/departments/${id}?org_id=${getOrgId()}`,
        {
          method: 'DELETE',
          headers: { 'x-access-tokens': getToken() },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to delete department');
      }

      setSuccess(t('departments_management.delete_success') || 'Department deleted successfully');
      setTimeout(() => setSuccess(''), 3000);
      fetchDepartments();
    } catch (err) {
      console.error('Error deleting department:', err);
      setError(err.message || t('departments_management.delete_error') || 'Failed to delete department');
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      const response = await fetch(
        `${API_URL}/api/departments/${id}?org_id=${getOrgId()}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-access-tokens': getToken(),
          },
          body: JSON.stringify({
            org_id: getOrgId(),
            is_active: !currentStatus,
          }),
        }
      );

      if (!response.ok) throw new Error('Failed to update status');

      fetchDepartments();
    } catch (err) {
      console.error('Error toggling status:', err);
      setError(err.message || 'Failed to update status');
    }
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
          <div className="px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                    {t('departments_management.title') || 'Departments Management'}
                  </h1>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {t('departments_management.subtitle') || 'Manage departments (parents of categories)'}
                  </p>
                </div>
                <button
                  onClick={handleOpenCreate}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Plus className="h-5 w-5" />
                  {t('departments_management.add_department') || 'Add Department'}
                </button>
              </div>
            </div>

            {/* Messages */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                <span className="text-red-700 dark:text-red-300">{error}</span>
                <button
                  onClick={() => setError('')}
                  className="ml-auto text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}

            {success && (
              <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-2">
                <Save className="h-5 w-5 text-green-600 dark:text-green-400" />
                <span className="text-green-700 dark:text-green-300">{success}</span>
              </div>
            )}

            {/* Departments List */}
            {loading ? (
              <LoadingSpinner />
            ) : departments.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  {t('departments_management.no_departments') || 'No departments found'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence>
                  {departments.map((dept) => (
                    <motion.div
                      key={dept.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                            {language === 'ar' && dept.name_ar ? dept.name_ar : dept.name_en}
                          </h3>
                          {dept.name_ar && language === 'en' && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">{dept.name_ar}</p>
                          )}
                          {dept.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{dept.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleActive(dept.id, dept.is_active)}
                            className={`p-2 rounded-lg transition-colors ${
                              dept.is_active
                                ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                                : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                            title={dept.is_active ? t('common.deactivate') || 'Deactivate' : t('common.activate') || 'Activate'}
                          >
                            {dept.is_active ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                          </button>
                          <button
                            onClick={() => handleOpenEdit(dept)}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                            title={t('common.edit') || 'Edit'}
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(dept.id)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title={t('common.delete') || 'Delete'}
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>Sort: {dept.sort_order}</span>
                        <span className={`px-2 py-1 rounded ${
                          dept.is_active
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                        }`}>
                          {dept.is_active ? t('common.active') || 'Active' : t('common.inactive') || 'Inactive'}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </main>

        {/* Create/Edit Modal */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={handleCloseModal}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      {editingItem
                        ? t('departments_management.edit_department') || 'Edit Department'
                        : t('departments_management.create_department') || 'Create Department'}
                    </h2>
                    <button
                      onClick={handleCloseModal}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t('departments_management.name_en') || 'Name (English)'} *
                        </label>
                        <input
                          type="text"
                          value={form.name_en}
                          onChange={(e) => handleFormChange('name_en', e.target.value)}
                          required
                          className="w-full px-3 py-2 bg-gray-50 dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t('departments_management.name_ar') || 'Name (Arabic)'}
                        </label>
                        <input
                          type="text"
                          value={form.name_ar}
                          onChange={(e) => handleFormChange('name_ar', e.target.value)}
                          className="w-full px-3 py-2 bg-gray-50 dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('departments_management.description') || 'Description'}
                      </label>
                      <textarea
                        value={form.description}
                        onChange={(e) => handleFormChange('description', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t('departments_management.sort_order') || 'Sort Order'}
                        </label>
                        <input
                          type="number"
                          value={form.sort_order}
                          onChange={(e) => handleFormChange('sort_order', e.target.value)}
                          min="0"
                          className="w-full px-3 py-2 bg-gray-50 dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      <div className="flex items-center gap-4 pt-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={form.is_active}
                            onChange={(e) => handleFormChange('is_active', e.target.checked)}
                            className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                          />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {t('departments_management.is_active') || 'Active'}
                          </span>
                        </label>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-slate-700">
                      <button
                        type="button"
                        onClick={handleCloseModal}
                        className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                      >
                        {t('common.cancel') || 'Cancel'}
                      </button>
                      <button
                        type="submit"
                        disabled={modalLoading}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
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
                    </div>
                  </form>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DepartmentsManagement;

