import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { apkUploadService } from '../../lib/apkUploadService';
import ModalSearch from '../../components/ModalSearch';
import ThemeToggle from '../../components/ThemeToggle';
import LanguageToggle from '../../components/LanguageToggle';
import Header from '../../partials/Header';
import Sidebar from '../../partials/Sidebar';
import LoadingSpinner from '../../components/LoadingSpinner';
import { ArrowUpTrayIcon, TrashIcon, ArrowDownTrayIcon, PencilIcon } from '@heroicons/react/24/outline';

const ApkUpload = () => {
  const { authData, loading: authLoading } = useAuth();
  const { language, t } = useLanguage();
  const [apks, setApks] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hasPrivilege, setHasPrivilege] = useState(false);
  const [version, setVersion] = useState(null);
  const [versionNumber, setVersionNumber] = useState('');
  const [isEditingVersion, setIsEditingVersion] = useState(false);
  const [versionLoading, setVersionLoading] = useState(false);

  // Check authentication and privileges
  useEffect(() => {
    if (authLoading) return;
    if (!authData?.access_token) {
      setError(t('apks.no_permission'));
      setLoading(false);
      return;
    }
    if (!authData?.org_id || isNaN(authData.org_id)) {
      setError(t('apks.no_org_id'));
      setLoading(false);
      return;
    }
    // Check for privilege 5000 (same as employee mode)
    if (authData.privilege_ids?.includes(5000)) {
      setHasPrivilege(true);
    } else {
      setError(t('apks.no_permission'));
      setLoading(false);
    }
  }, [authData, authLoading, t]);

  // Fetch APKs
  const fetchApks = async () => {
    if (!authData?.org_id || !hasPrivilege) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await apkUploadService.getApks(authData.org_id);
      if (process.env.NODE_ENV !== 'production') {
        console.debug('Fetched APKs:', data);
      }
      setApks(data);
      setError('');
    } catch (err) {
      console.error('Error fetching APKs:', err.message);
      setError(err.message || t('apks.fetch_error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasPrivilege && authData?.org_id) {
      fetchApks();
      fetchVersion();
    }
  }, [authData, hasPrivilege]);

  // Fetch version
  const fetchVersion = async () => {
    if (!authData?.org_id || !hasPrivilege) {
      return;
    }
    setVersionLoading(true);
    try {
      const data = await apkUploadService.getVersion(authData.org_id);
      if (process.env.NODE_ENV !== 'production') {
        console.debug('Fetched version:', data);
      }
      setVersion(data);
      setVersionNumber(data.version_number || '');
      setError('');
    } catch (err) {
      console.error('Error fetching version:', err.message);
      // Don't show error if version doesn't exist yet (404)
      if (err.message.includes('404') || err.message.includes('not found')) {
        setVersion(null);
        setVersionNumber('');
      } else {
        setError(err.message || t('apks.version_fetch_error'));
      }
    } finally {
      setVersionLoading(false);
    }
  };

  const handleVersionUpdate = async (e) => {
    e.preventDefault();
    if (!hasPrivilege) {
      setError(t('apks.no_permission'));
      return;
    }
    if (!versionNumber.trim()) {
      setError(t('apks.version_number_required'));
      return;
    }
    setVersionLoading(true);
    try {
      const data = await apkUploadService.updateVersion(authData.org_id, versionNumber.trim());
      if (process.env.NODE_ENV !== 'production') {
        console.debug('Updated version:', data);
      }
      setVersion(data);
      setIsEditingVersion(false);
      setError('');
    } catch (err) {
      console.error('Error updating version:', err.message);
      setError(err.message || t('apks.version_update_error'));
    } finally {
      setVersionLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!hasPrivilege) {
      setError(t('apks.no_permission'));
      return;
    }
    if (!selectedFile) {
      setError(t('apks.no_file_selected'));
      return;
    }
    const existingApk = apks.find((apk) => apk.filename === selectedFile.name);
    if (existingApk && !window.confirm(t('apks.overwrite_confirm'))) {
      return;
    }
    try {
      const formData = new FormData();
      formData.append('apk', selectedFile);
      if (process.env.NODE_ENV !== 'production') {
        console.debug('Uploading APK:', selectedFile.name);
      }
      await apkUploadService.uploadApk(formData, authData.org_id);
      setSelectedFile(null);
      // Reset file input
      const fileInput = document.getElementById('apk_file');
      if (fileInput) fileInput.value = '';
      fetchApks();
    } catch (err) {
      console.error('Error uploading APK:', err.message);
      setError(err.message || t('apks.upload_error'));
    }
  };

  const handleDelete = async (filename) => {
    if (!hasPrivilege) {
      setError(t('apks.no_permission'));
      return;
    }
    if (window.confirm(t('apks.delete_confirm'))) {
      try {
        if (process.env.NODE_ENV !== 'production') {
          console.debug('Deleting APK:', filename);
        }
        await apkUploadService.deleteApk(filename, authData.org_id);
        fetchApks();
      } catch (err) {
        console.error('Error deleting APK:', err.message);
        setError(err.message || t('apks.delete_error'));
      }
    }
  };

  const handleDownload = async (filename) => {
    try {
      if (process.env.NODE_ENV !== 'production') {
        console.debug('Downloading APK:', filename);
      }
      const blob = await apkUploadService.downloadApk(filename, authData.org_id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading APK:', err.message);
      setError(err.message || t('apks.download_error'));
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
                  {t('apks.title')}
                </h1>
              </div>
              <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
                <LanguageToggle />
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
            {hasPrivilege && (
              <>
                {/* Version Control Section */}
                <div className="mb-8 bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
                    {t('apks.version_control')}
                  </h2>
                  {versionLoading && !version ? (
                    <LoadingSpinner />
                  ) : (
                    <div className="space-y-4">
                      {!isEditingVersion ? (
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                              {t('apks.current_version')}
                            </span>
                            <p className="text-gray-800 dark:text-gray-100 font-semibold text-lg mt-1">
                              {version?.version_number || t('apks.no_version')}
                            </p>
                          </div>
                          <button
                            onClick={() => setIsEditingVersion(true)}
                            className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded transition duration-200"
                            aria-label={t('apks.edit_version')}
                          >
                            <PencilIcon className="w-5 h-5" />
                            {t('apks.edit_version')}
                          </button>
                        </div>
                      ) : (
                        <form onSubmit={handleVersionUpdate} className="space-y-4">
                          <div>
                            <label
                              className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
                              htmlFor="version_number"
                            >
                              {t('apks.version_number')}
                            </label>
                            <input
                              type="text"
                              id="version_number"
                              value={versionNumber}
                              onChange={(e) => setVersionNumber(e.target.value)}
                              className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                              placeholder={t('apks.version_number_placeholder')}
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="submit"
                              disabled={!versionNumber.trim() || versionLoading}
                              className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                              {t('apks.update_version')}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setIsEditingVersion(false);
                                setVersionNumber(version?.version_number || '');
                              }}
                              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition duration-200"
                            >
                              {t('apks.cancel')}
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  )}
                </div>

                {/* APK Upload Section */}
                <div className="mb-8">
                  <form onSubmit={handleUpload} className="space-y-4">
                  <div>
                    <label
                      className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
                      htmlFor="apk_file"
                    >
                      {t('apks.upload_label')}
                    </label>
                    <input
                      type="file"
                      id="apk_file"
                      accept=".apk,application/vnd.android.package-archive"
                      onChange={handleFileChange}
                      className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!selectedFile}
                    className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <ArrowUpTrayIcon className="w-5 h-5" />
                    {t('apks.upload_button')}
                  </button>
                </form>
              </div>
              </>
            )}
            {loading ? (
              <LoadingSpinner />
            ) : apks.length === 0 ? (
              <div className="text-gray-600 dark:text-gray-300">{t('apks.no_apks')}</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {apks.map((apk) => {
                  const filename = apk.url.split('/').pop();
                  return (
                    <div
                      key={apk.filename}
                      className="bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow duration-200"
                      role="region"
                      aria-label={`${t('apks.filename')}: ${apk.filename}`}
                    >
                      <div className="space-y-4">
                        <div>
                          <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">{t('apks.filename')}</span>
                          <p className="text-gray-800 dark:text-gray-100 font-semibold break-all">{apk.filename}</p>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">{t('apks.url')}</span>
                          <button
                            onClick={() => handleDownload(filename)}
                            className="flex items-center text-indigo-500 hover:text-indigo-600 text-sm font-medium transition-colors duration-200 mt-1"
                            aria-label={t('apks.download')}
                          >
                            <ArrowDownTrayIcon className="w-4 h-4 mr-1" />
                            {t('apks.download')}
                          </button>
                        </div>
                      </div>
                      {hasPrivilege && (
                        <div className="flex justify-end gap-3 mt-4">
                          <button
                            onClick={() => handleDelete(filename)}
                            className="flex items-center text-red-500 hover:text-red-600 text-sm font-medium transition-colors duration-200"
                            aria-label={t('apks.delete')}
                          >
                            <TrashIcon className="w-4 h-4 mr-1" />
                            {t('apks.delete')}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ApkUpload;






