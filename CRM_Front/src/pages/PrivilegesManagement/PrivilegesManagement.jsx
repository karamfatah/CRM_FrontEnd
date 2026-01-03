import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { privilegeService } from '../../lib/privilegeService';
import ModalSearch from '../../components/ModalSearch';
import Header from '../../partials/Header';
import Sidebar from '../../partials/Sidebar';
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/LoadingSpinner';

const PrivilegesManagement = () => {
  const { authData, loading: authLoading } = useAuth();
  const { language, t } = useLanguage();
  const [privileges, setPrivileges] = useState([]);
  const [editingPrivilege, setEditingPrivilege] = useState(null);
  const [newPrivilege, setNewPrivilege] = useState({
    privilege_id: '',
    privilege_name: '',
    org_id: authData?.org_id || '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [hasPrivilege, setHasPrivilege] = useState(false);

  // Check authentication and privileges
  useEffect(() => {
    if (authLoading) {
      console.log('PrivilegesManagement: Auth still loading, waiting...');
      return;
    }

    if (!authData?.access_token) {
      console.warn('PrivilegesManagement: No access token, setting error');
      setError(t('privileges.no_permission'));
      setLoading(false);
      return;
    }

    console.log('PrivilegesManagement: authData:', {
      access_token: authData.access_token?.slice(0, 15) + '...',
      _id: authData._id,
      org_id: authData.org_id,
      privilege_ids: authData.privilege_ids,
    });

    if (authData.privilege_ids.includes(1)) {
      console.log('PrivilegesManagement: User has required privilege');
      setHasPrivilege(true);
    } else {
      console.warn('PrivilegesManagement: User lacks privilege');
      setError(t('privileges.no_permission'));
      setLoading(false);
    }
  }, [authData, authLoading, t]);

  // Fetch privileges
  const fetchPrivileges = async () => {
    if (!authData?.org_id || !hasPrivilege) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      console.log('PrivilegesManagement: Fetching privileges for org_id:', authData.org_id);
      const data = await privilegeService.getPrivileges(authData.org_id);
      console.debug('Fetched privileges:', data);
      setPrivileges(data);
      setError('');
    } catch (err) {
      console.error('Error fetching privileges:', err.message);
      setError(err.message || t('privileges.fetch_error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasPrivilege && authData?.org_id) {
      fetchPrivileges();
    }
  }, [authData, hasPrivilege]);

  // Handle create
  const initiateCreate = () => {
    if (!hasPrivilege) {
      setError(t('privileges.no_permission'));
      return;
    }

    if (!authData.org_id) {
      setError(t('privileges.no_org_id'));
      return;
    }

    setIsCreating(true);
    setNewPrivilege({
      privilege_id: '',
      privilege_name: '',
      org_id: authData.org_id,
    });
  };

  // Handle edit
  const handleEdit = async (privilege) => {
    if (!hasPrivilege) {
      setError(t('privileges.no_permission'));
      return;
    }

    try {
      console.log('PrivilegesManagement: Editing privilege:', privilege._id);
      const data = await privilegeService.getPrivilege(privilege._id, authData.org_id);
      console.debug('Fetched privilege for edit:', data);
      setEditingPrivilege(privilege);
      setNewPrivilege({
        privilege_id: data.privilege_id,
        privilege_name: data.privilege_name,
        org_id: data.org_id,
      });
    } catch (err) {
      console.error('Error fetching privilege for edit:', err.message);
      setError(err.message || t('privileges.fetch_edit_error'));
    }
  };

  // Handle save new
  const handleSaveNew = async (e) => {
    e.preventDefault();
    if (!hasPrivilege) return;

    if (!/^\d+$/.test(newPrivilege.privilege_id)) {
      setError(t('privileges.invalid_id'));
      return;
    }

    if (!newPrivilege.privilege_name) {
      setError(t('privileges.invalid_name'));
      return;
    }

    try {
      console.log('PrivilegesManagement: Creating new privilege:', newPrivilege);
      await privilegeService.createPrivilege({
        ...newPrivilege,
        privilege_id: Number(newPrivilege.privilege_id),
        org_id: Number(newPrivilege.org_id),
        created_by: authData._id,
      }, authData.org_id);
      setIsCreating(false);
      setNewPrivilege({ privilege_id: '', privilege_name: '', org_id: authData.org_id });
      fetchPrivileges();
      setSuccess(t('privileges.create_success'));
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error creating privilege:', err.message);
      const errorMessage = err.message.includes('Privilege ID already exists')
        ? t('privileges.privilege_id_exists')
        : err.message.includes('Invalid created_by')
        ? t('privileges.invalid_created_by')
        : err.message || t('privileges.create_error');
      setError(errorMessage);
    }
  };

  // Handle update
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!hasPrivilege) return;

    if (!/^\d+$/.test(newPrivilege.privilege_id)) {
      setError(t('privileges.invalid_id'));
      return;
    }

    if (!newPrivilege.privilege_name) {
      setError(t('privileges.invalid_name'));
      return;
    }

    try {
      console.log('PrivilegesManagement: Updating privilege:', editingPrivilege._id);
      await privilegeService.updatePrivilege(editingPrivilege._id, {
        ...newPrivilege,
        privilege_id: Number(newPrivilege.privilege_id),
        org_id: Number(newPrivilege.org_id),
        created_by: authData._id,
      }, authData.org_id);
      setEditingPrivilege(null);
      setNewPrivilege({ privilege_id: '', privilege_name: '', org_id: authData.org_id });
      fetchPrivileges();
      setSuccess(t('privileges.update_success'));
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error updating privilege:', err.message);
      const errorMessage = err.message.includes('Privilege ID already exists')
        ? t('privileges.privilege_id_exists')
        : err.message.includes('Invalid created_by')
        ? t('privileges.invalid_created_by')
        : err.message || t('privileges.update_error');
      setError(errorMessage);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!hasPrivilege) return;

    if (window.confirm(t('privileges.delete_confirm'))) {
      try {
        console.log('PrivilegesManagement: Deleting privilege:', id);
        await privilegeService.deletePrivilege(id, authData.org_id);
        fetchPrivileges();
        setSuccess(t('privileges.delete_success'));
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        console.error('Error deleting privilege:', err.message);
        setError(err.message || t('privileges.delete_error'));
      }
    }
  };

  if (authLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main>
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
            <div className="sm:flex sm:justify-between sm:items-center mb-8">
              <div className="mb-4 sm:mb-0">
                <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
                  {t('privileges.title')}
                </h1>
              </div>
              <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
                {hasPrivilege && (
                  <button
                    onClick={initiateCreate}
                    className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded transition duration-200"
                  >
                    {t('privileges.add_privilege')}
                  </button>
                )}
                <ModalSearch />
              </div>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                <span>{error}</span>
                <button
                  onClick={() => setError('')}
                  className="absolute top-0 right-0 px-4 py-3"
                  aria-label={t('common.dismiss_error')}
                >
                  <svg className="fill-current h-6 w-6 text-red-500" viewBox="0 0 20 20">
                    <path d="M10 8.586L2.929 1.515 1.515 2.929 8.586 10l-7.071 7.071 1.414 1.414L10 11.414l7.071 7.071 1.414-1.414L11.414 10l7.071-7.071-1.414-1.414L10 8.586z" />
                  </svg>
                </button>
              </div>
            )}

            {success && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
                <span>{success}</span>
                <button
                  onClick={() => setSuccess('')}
                  className="absolute top-0 right-0 px-4 py-3"
                  aria-label={t('common.dismiss_success')}
                >
                  <svg className="fill-current h-6 w-6 text-green-500" viewBox="0 0 20 20">
                    <path d="M10 8.586L2.929 1.515 1.515 2.929 8.586 10l-7.071 7.071 1.414 1.414L10 11.414l7.071 7.071 1.414-1.414L11.414 10l7.071-7.071-1.414-1.414L10 8.586z" />
                  </svg>
                </button>
              </div>
            )}

            {loading ? (
              <LoadingSpinner />
            ) : privileges.length === 0 ? (
              <div className="text-gray-600 dark:text-gray-300">{t('privileges.no_privileges')}</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {privileges.map((privilege) => (
                  <div
                    key={privilege._id}
                    className="bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow duration-200"
                    role="region"
                    aria-label={`${t('privileges.privilege_name')}: ${privilege.privilege_name}`}
                  >
                    <div className="space-y-4">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                          {t('privileges.privilege_id')}
                        </span>
                        <p className="text-gray-800 dark:text-gray-100 font-semibold">
                          {privilege.privilege_id}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                          {t('privileges.privilege_name')}
                        </span>
                        <p className="text-gray-800 dark:text-gray-100 font-semibold">
                          {privilege.privilege_name}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                          {t('privileges.org_id')}
                        </span>
                        <p className="text-gray-800 dark:text-gray-100 font-semibold">
                          {privilege.org_id || t('privileges.unknown')}
                        </p>
                      </div>
                    </div>
                    {hasPrivilege && (
                      <div className="flex justify-end gap-3 mt-4">
                        <button
                          onClick={() => handleEdit(privilege)}
                          className="flex items-center text-indigo-500 hover:text-indigo-600 text-sm font-medium transition-colors duration-200"
                          aria-label={t('privileges.edit')}
                        >
                          <PencilIcon className="w-4 h-4 mr-1" />
                          {t('privileges.edit')}
                        </button>
                        <button
                          onClick={() => handleDelete(privilege._id)}
                          className="flex items-center text-red-500 hover:text-red-600 text-sm font-medium transition-colors duration-200"
                          aria-label={t('privileges.delete')}
                        >
                          <TrashIcon className="w-4 h-4 mr-1" />
                          {t('privileges.delete')}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {(editingPrivilege || isCreating) && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-gray-900 rounded-lg p-8 w-full max-w-md shadow-2xl">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                    {isCreating ? t('privileges.add_title') : t('privileges.edit_title')}
                  </h2>
                  <form onSubmit={isCreating ? handleSaveNew : handleUpdate} className="space-y-6">
                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="privilege_id">
                        {t('privileges.privilege_id')}
                      </label>
                      <input
                        type="text"
                        id="privilege_id"
                        value={newPrivilege.privilege_id}
                        onChange={(e) => setNewPrivilege({ ...newPrivilege, privilege_id: e.target.value })}
                        className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="privilege_name">
                        {t('privileges.privilege_name')}
                      </label>
                      <input
                        type="text"
                        id="privilege_name"
                        value={newPrivilege.privilege_name}
                        onChange={(e) => setNewPrivilege({ ...newPrivilege, privilege_name: e.target.value })}
                        className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="org_id">
                        {t('privileges.org_id')}
                      </label>
                      <input
                        type="text"
                        id="org_id"
                        value={newPrivilege.org_id}
                        onChange={(e) => setNewPrivilege({ ...newPrivilege, org_id: e.target.value })}
                        className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                        required
                        disabled={!isCreating}
                      />
                    </div>
                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingPrivilege(null);
                          setIsCreating(false);
                        }}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded transition duration-200"
                      >
                        {t('privileges.cancel')}
                      </button>
                      <button
                        type="submit"
                        className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded transition duration-200"
                      >
                        {isCreating ? t('privileges.create') : t('privileges.save')}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default PrivilegesManagement;