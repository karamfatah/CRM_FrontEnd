import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { orgService } from '../../lib/orgService';
import ModalSearch from '../../components/ModalSearch';
import ThemeToggle from '../../components/ThemeToggle';
import LanguageToggle from '../../components/LanguageToggle';
import Header from '../../partials/Header';
import Sidebar from '../../partials/Sidebar';
import LoadingSpinner from '../../components/LoadingSpinner';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

const Org = () => {
  const { authData, loading: authLoading } = useAuth();
  const { language, t } = useLanguage();
  const [orgs, setOrgs] = useState([]);
  const [countries, setCountries] = useState([]);
  const [editingOrg, setEditingOrg] = useState(null);
  const [newOrg, setNewOrg] = useState({
    org_id: '',
    org_name_en: '',
    org_name_ar: '',
    org_phone: '',
    org_address: '',
    org_website: '',
    chat_webhook_url: '',
    country_id: '',
    org_logo: null,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [hasPrivilege, setHasPrivilege] = useState(false);
  const [logoUrls, setLogoUrls] = useState({});

  useEffect(() => {
    if (authLoading) return;

    if (!authData?.access_token) {
      setError(t('orgs.no_permission'));
      setLoading(false);
      return;
    }

    if (authData.privilege_ids.includes(5000)) {
      setHasPrivilege(true);
    } else {
      setError(t('orgs.no_permission'));
      setHasPrivilege(false);
      setLoading(false);
    }
  }, [authData, authLoading, t]);

  const fetchOrgs = async () => {
    if (!hasPrivilege) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await orgService.getAllOrgs();
      setOrgs(Array.isArray(data) ? data : []);
      setError('');
    } catch (err) {
      console.error('Error fetching orgs:', err.message);
      setError(t('orgs.fetch_error'));
    } finally {
      setLoading(false);
    }
  };

  const fetchCountries = async () => {
    try {
      const data = await orgService.getCountries();
      setCountries(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching countries:', err.message);
      setError(t('orgs.fetch_countries_error'));
    }
  };

  const fetchLogo = async (orgId) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('No access token found');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/orgs/${orgId}/logo`, {
        headers: { 'x-access-tokens': token },
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch logo');
      }
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (err) {
      console.error(`Failed to fetch logo for org ${orgId}:`, err);
      return null;
    }
  };

  useEffect(() => {
    if (!authLoading && hasPrivilege) {
      fetchOrgs();
      fetchCountries();
    }
  }, [hasPrivilege, authLoading, t]);

  useEffect(() => {
    const fetchLogos = async () => {
      const urls = {};
      for (const org of orgs) {
        if (org.org_logo) {
          const url = await fetchLogo(org.org_id);
          if (url) urls[org.org_id] = url;
        }
      }
      setLogoUrls(urls);
    };
    fetchLogos();
  }, [orgs]);

  const handleEdit = async (org) => {
    if (!hasPrivilege) {
      setError(t('orgs.no_permission'));
      return;
    }
    try {
      const data = await orgService.getOrg(org.org_id);
      setEditingOrg(org);
      setNewOrg({
        org_id: data.org_id.toString(),
        org_name_en: data.org_name_en,
        org_name_ar: data.org_name_ar,
        org_phone: data.org_phone || '',
        org_address: data.org_address || '',
        org_website: data.org_website || '',
        chat_webhook_url: data.chat_webhook_url || '',
        country_id: data.country_id ? data.country_id.toString() : '',
        org_logo: null,
      });
    } catch (err) {
      console.error('Error fetching org for edit:', err.message);
      setError(t('orgs.fetch_edit_error'));
    }
  };

  const initiateCreate = async () => {
    if (!hasPrivilege) {
      setError(t('orgs.no_permission'));
      return;
    }
    try {
      const nextId = await orgService.getNextOrgId();
      setIsCreating(true);
      setNewOrg({
        org_id: nextId.toString(),
        org_name_en: '',
        org_name_ar: '',
        org_phone: '',
        org_address: '',
        org_website: '',
        chat_webhook_url: '',
        country_id: '',
        org_logo: null,
      });
    } catch (err) {
      console.error('Error fetching next org_id:', err.message);
      setError(t('orgs.fetch_next_id_error'));
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!hasPrivilege) {
      setError(t('orgs.no_permission'));
      return;
    }
    try {
      const formData = new FormData();
      formData.append('org_name_en', newOrg.org_name_en);
      formData.append('org_name_ar', newOrg.org_name_ar);
      formData.append('org_phone', newOrg.org_phone);
      formData.append('org_address', newOrg.org_address);
      formData.append('org_website', newOrg.org_website);
      formData.append('chat_webhook_url', newOrg.chat_webhook_url);
      formData.append('country_id', newOrg.country_id);
      if (newOrg.org_logo) {
        formData.append('logo', newOrg.org_logo);
      } else {
        formData.append('org_logo', '');
      }

      await orgService.updateOrg(editingOrg.org_id, formData);
      setEditingOrg(null);
      setNewOrg({
        org_id: '',
        org_name_en: '',
        org_name_ar: '',
        org_phone: '',
        org_address: '',
        org_website: '',
        chat_webhook_url: '',
        country_id: '',
        org_logo: null,
      });
      fetchOrgs();
    } catch (err) {
      console.error('Error updating org:', err.message);
      setError(t('orgs.update_error'));
    }
  };

  const handleSaveNew = async (e) => {
    e.preventDefault();
    if (!hasPrivilege) {
      setError(t('orgs.no_permission'));
      return;
    }
    try {
      const formData = new FormData();
      formData.append('org_id', newOrg.org_id);
      formData.append('org_name_en', newOrg.org_name_en);
      formData.append('org_name_ar', newOrg.org_name_ar);
      formData.append('org_phone', newOrg.org_phone);
      formData.append('org_address', newOrg.org_address);
      formData.append('org_website', newOrg.org_website);
      formData.append('chat_webhook_url', newOrg.chat_webhook_url);
      formData.append('country_id', newOrg.country_id);
      if (newOrg.org_logo) {
        formData.append('logo', newOrg.org_logo);
      }

      await orgService.createOrg(formData);
      setIsCreating(false);
      setNewOrg({
        org_id: '',
        org_name_en: '',
        org_name_ar: '',
        org_phone: '',
        org_address: '',
        org_website: '',
        chat_webhook_url: '',
        country_id: '',
        org_logo: null,
      });
      fetchOrgs();
    } catch (err) {
      console.error('Error creating org:', err.message);
      setError(t('orgs.create_error'));
    }
  };

  const handleDelete = async (id) => {
    if (!hasPrivilege) {
      setError(t('orgs.no_permission'));
      return;
    }
    if (window.confirm(t('orgs.delete_confirm'))) {
      try {
        await orgService.deleteOrg(id);
        fetchOrgs();
      } catch (err) {
        console.error('Error deleting org:', err.message);
        setError(t('orgs.delete_error'));
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError(t('orgs.logo_too_large'));
        return;
      }
      if (!['image/jpeg', 'image/jpg', 'image/png', 'image/gif'].includes(file.type)) {
        setError(t('orgs.invalid_logo_type'));
        return;
      }
    }
    setNewOrg({ ...newOrg, org_logo: file });
  };

  if (authLoading || !authData) {
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
                  {t('orgs.title')}
                </h1>
              </div>
              <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
                <LanguageToggle />
                {hasPrivilege && (
                  <button
                    onClick={initiateCreate}
                    className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded transition duration-200"
                  >
                    {t('orgs.add_org')}
                  </button>
                )}
                <ModalSearch />
                <ThemeToggle />
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

            {loading ? (
              <LoadingSpinner />
            ) : orgs.length === 0 ? (
              <div className="text-gray-600 dark:text-gray-300">{t('orgs.no_orgs')}</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {orgs.map((org) => (
                  <div
                    key={org.org_id}
                    className="bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow duration-200"
                    role="region"
                    aria-label={`${t('orgs.org_name')}: ${language === 'en' ? org.org_name_en : org.org_name_ar}`}
                  >
                    <div className="space-y-4">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">{t('orgs.org_name')}</span>
                        <p className="text-gray-800 dark:text-gray-100 font-semibold">
                          {language === 'en' ? org.org_name_en : org.org_name_ar}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">{t('orgs.org_phone')}</span>
                        <p className="text-gray-800 dark:text-gray-100">{org.org_phone || '-'}</p>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">{t('orgs.org_address')}</span>
                        <p className="text-gray-800 dark:text-gray-100">{org.org_address || '-'}</p>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">{t('orgs.org_website')}</span>
                        <p className="text-gray-800 dark:text-gray-100">{org.org_website || '-'}</p>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">{t('orgs.chat_webhook_url') || 'Chat Webhook URL'}</span>
                        <p className="text-gray-800 dark:text-gray-100 text-xs break-all">{org.chat_webhook_url || '-'}</p>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">{t('orgs.country')}</span>
                        <p className="text-gray-800 dark:text-gray-100">
                          {countries.find((c) => c.country_id === org.country_id)?.[
                            language === 'en' ? 'country_name_en' : 'country_name_ar'
                          ] || '-'}
                        </p>
                      </div>
                      {org.org_logo && logoUrls[org.org_id] && (
                        <div>
                          <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">{t('orgs.org_logo')}</span>
                          <img
                            src={logoUrls[org.org_id]}
                            alt={`${org.org_name_en} logo`}
                            className="mt-2 h-16 w-16 object-contain"
                            onError={() => {
                              setLogoUrls((prev) => ({ ...prev, [org.org_id]: null }));
                            }}
                          />
                        </div>
                      )}
                    </div>
                    {hasPrivilege && (
                      <div className="flex justify-end gap-3 mt-4">
                        <button
                          onClick={() => handleEdit(org)}
                          className="flex items-center text-indigo-500 hover:text-indigo-600 text-sm font-medium transition-colors duration-200"
                          aria-label={t('orgs.edit')}
                        >
                          <PencilIcon className="w-4 h-4 mr-1" />
                          {t('orgs.edit')}
                        </button>
                        <button
                          onClick={() => handleDelete(org.org_id)}
                          className="flex items-center text-red-500 hover:text-red-600 text-sm font-medium transition-colors duration-200"
                          aria-label={t('orgs.delete')}
                        >
                          <TrashIcon className="w-4 h-4 mr-1" />
                          {t('orgs.delete')}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {(editingOrg || isCreating) && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-gray-900 rounded-lg p-8 w-full max-w-md shadow-2xl">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                    {isCreating ? t('orgs.add_title') : t('orgs.edit_title')}
                  </h2>
                  <form onSubmit={isCreating ? handleSaveNew : handleUpdate} className="space-y-6">
                    {isCreating && (
                      <div>
                        <label
                          className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
                          htmlFor="org_id"
                        >
                          {t('orgs.org_id')}
                        </label>
                        <input
                          type="text"
                          id="org_id"
                          value={newOrg.org_id}
                          disabled
                          className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight bg-gray-100"
                        />
                      </div>
                    )}
                    <div>
                      <label
                        className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
                        htmlFor="org_name_en"
                      >
                        {t('orgs.org_name_en')}
                      </label>
                      <input
                        type="text"
                        id="org_name_en"
                        value={newOrg.org_name_en}
                        onChange={(e) => setNewOrg({ ...newOrg, org_name_en: e.target.value })}
                        className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                        required
                      />
                    </div>
                    <div>
                      <label
                        className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
                        htmlFor="org_name_ar"
                      >
                        {t('orgs.org_name_ar')}
                      </label>
                      <input
                        type="text"
                        id="org_name_ar"
                        value={newOrg.org_name_ar}
                        onChange={(e) => setNewOrg({ ...newOrg, org_name_ar: e.target.value })}
                        className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                        required
                      />
                    </div>
                    <div>
                      <label
                        className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
                        htmlFor="org_phone"
                      >
                        {t('orgs.org_phone')}
                      </label>
                      <input
                        type="text"
                        id="org_phone"
                        value={newOrg.org_phone}
                        onChange={(e) => setNewOrg({ ...newOrg, org_phone: e.target.value })}
                        className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                      />
                    </div>
                    <div>
                      <label
                        className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
                        htmlFor="org_address"
                      >
                        {t('orgs.org_address')}
                      </label>
                      <input
                        type="text"
                        id="org_address"
                        value={newOrg.org_address}
                        onChange={(e) => setNewOrg({ ...newOrg, org_address: e.target.value })}
                        className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                      />
                    </div>
                    <div>
                      <label
                        className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
                        htmlFor="org_website"
                      >
                        {t('orgs.org_website')}
                      </label>
                      <input
                        type="url"
                        id="org_website"
                        value={newOrg.org_website}
                        onChange={(e) => setNewOrg({ ...newOrg, org_website: e.target.value })}
                        className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                      />
                    </div>
                    <div>
                      <label
                        className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
                        htmlFor="chat_webhook_url"
                      >
                        {t('orgs.chat_webhook_url') || 'Chat Webhook URL'}
                      </label>
                      <input
                        type="url"
                        id="chat_webhook_url"
                        value={newOrg.chat_webhook_url}
                        onChange={(e) => setNewOrg({ ...newOrg, chat_webhook_url: e.target.value })}
                        placeholder="https://n8n.quantum-g.io/webhook/..."
                        className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {t('orgs.chat_webhook_note') || 'n8n webhook URL for AI customer chat'}
                      </p>
                    </div>
                    <div>
                      <label
                        className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
                        htmlFor="country_id"
                      >
                        {t('orgs.country')}
                      </label>
                      <select
                        id="country_id"
                        value={newOrg.country_id}
                        onChange={(e) => setNewOrg({ ...newOrg, country_id: e.target.value })}
                        className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                        required
                      >
                        <option value="">{t('orgs.select_country')}</option>
                        {countries.map((country) => (
                          <option key={country.country_id} value={country.country_id}>
                            {language === 'en' ? country.country_name_en : country.country_name_ar}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label
                        className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
                        htmlFor="org_logo"
                      >
                        {t('orgs.org_logo')}
                      </label>
                      <input
                        type="file"
                        id="org_logo"
                        accept="image/jpeg,image/jpg,image/png,image/gif"
                        onChange={handleFileChange}
                        className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                      />
                    </div>
                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingOrg(null);
                          setIsCreating(false);
                          setError('');
                        }}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded transition duration-200"
                      >
                        {t('orgs.cancel')}
                      </button>
                      <button
                        type="submit"
                        className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded transition duration-200"
                      >
                        {isCreating ? t('orgs.create') : t('orgs.save')}
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

export default Org;