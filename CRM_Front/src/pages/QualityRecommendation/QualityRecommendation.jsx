import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { qualityRecommendationService } from '../../lib/qualityRecommendationService';
import ModalSearch from '../../components/ModalSearch';
import ThemeToggle from '../../components/ThemeToggle';
import LanguageToggle from '../../components/LanguageToggle';
import Header from '../../partials/Header';
import Sidebar from '../../partials/Sidebar';
import LoadingSpinner from '../../components/LoadingSpinner';
import { PencilIcon, TrashIcon, DocumentArrowUpIcon } from '@heroicons/react/24/outline';
import * as XLSX from 'xlsx';

const QualityRecommendation = () => {
  const { authData, loading: authLoading } = useAuth();
  const { language, t } = useLanguage();
  const [recommendations, setRecommendations] = useState([]);
  const [editingRecommendation, setEditingRecommendation] = useState(null);
  const [newRecommendation, setNewRecommendation] = useState({
    name_en: '',
    name_ar: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [hasPrivilege, setHasPrivilege] = useState(false);
  const [isBulkUpload, setIsBulkUpload] = useState(false);
  const [file, setFile] = useState(null);

  // Check authentication and privileges
  useEffect(() => {
    if (authLoading) return;

    console.log('authData:', authData);

    if (!authData?.access_token) {
      setError(t('recommendations.no_permission'));
      setLoading(false);
      return;
    }

    const privilegeCheck = authData.privilege_ids?.includes(1) || false;
    console.log('hasPrivilege:', privilegeCheck);
    setHasPrivilege(privilegeCheck);

    if (!privilegeCheck) {
      setError(t('recommendations.no_permission'));
      setLoading(false);
    }
  }, [authData, authLoading, t]);

  // Fetch quality recommendations
  const fetchQualityRecommendations = async () => {
    if (!authData?.org_id || !hasPrivilege) {
      console.log('Skipping fetchQualityRecommendations: missing org_id or privilege');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    try {
      console.log('Fetching quality recommendations with org_id:', authData.org_id);
      const data = await qualityRecommendationService.getQualityRecommendations(authData.org_id);
      console.log('Fetched quality recommendations:', data);
      const filteredData = data.filter(rec => String(rec.org_id) === String(authData.org_id));
      console.log('Filtered quality recommendations:', filteredData);
      setRecommendations(Array.isArray(filteredData) ? filteredData : []);
    } catch (err) {
      console.error('Error fetching quality recommendations:', err.message);
      setError(err.message || t('recommendations.fetch_error'));
    } finally {
      setLoading(false);
    }
  };

  // Fetch recommendations on mount
  useEffect(() => {
    if (!authLoading && authData?.org_id && hasPrivilege) {
      fetchQualityRecommendations();
    } else {
      setLoading(false);
    }
  }, [authData?.org_id, hasPrivilege, authLoading, t]);

  // Handle edit
  const handleEdit = async (recommendation) => {
    if (!hasPrivilege) {
      setError(t('recommendations.no_permission'));
      return;
    }

    try {
      console.log('Fetching quality recommendation for edit:', recommendation.id);
      const data = await qualityRecommendationService.getQualityRecommendationById(recommendation.id, authData.org_id);
      setEditingRecommendation(recommendation);
      setNewRecommendation({
        name_en: data.name_en,
        name_ar: data.name_ar,
      });
    } catch (err) {
      console.error('Error fetching quality recommendation for edit:', err.message);
      setError(err.message || t('recommendations.fetch_edit_error'));
    }
  };

  // Initiate create
  const initiateCreate = () => {
    if (!hasPrivilege) {
      setError(t('recommendations.no_permission'));
      return;
    }

    console.log('Initiating create quality recommendation');
    setIsCreating(true);
    setIsBulkUpload(false);
    setFile(null);
    setNewRecommendation({
      name_en: '',
      name_ar: '',
    });
  };

  // Handle update
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!hasPrivilege) {
      setError(t('recommendations.no_permission'));
      return;
    }

    if (!newRecommendation.name_en || !newRecommendation.name_ar) {
      setError(t('recommendations.missing_fields_error'));
      return;
    }

    try {
      console.log('Updating quality recommendation:', editingRecommendation.id, newRecommendation);
      await qualityRecommendationService.updateQualityRecommendation(
        editingRecommendation.id,
        newRecommendation,
        authData.org_id
      );
      setEditingRecommendation(null);
      setNewRecommendation({ name_en: '', name_ar: '' });
      fetchQualityRecommendations();
      setSuccess(t('recommendations.update_success'));
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error updating quality recommendation:', err.message);
      setError(err.message || t('recommendations.update_error'));
    }
  };

  // Handle save new
  const handleSaveNew = async (e) => {
    e.preventDefault();
    if (!hasPrivilege) {
      setError(t('recommendations.no_permission'));
      return;
    }

    if (isBulkUpload) {
      if (!file) {
        setError(t('recommendations.file_required'));
        return;
      }

      try {
        const reader = new FileReader();
        reader.onload = async (event) => {
          if (!event.target || !event.target.result) {
            setError('Failed to read the file.');
            return;
          }

          try {
            const data = new Uint8Array(event.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(sheet);

            if (jsonData.length === 0) {
              setError(t('recommendations.empty_file'));
              return;
            }

            const requiredColumns = ['name_en', 'name_ar'];
            const missingColumns = requiredColumns.filter(col => !Object.keys(jsonData[0]).includes(col));
            if (missingColumns.length > 0) {
              setError(t('recommendations.missing_columns', { columns: missingColumns.join(', ') }));
              return;
            }

            const bulkData = jsonData.map(row => ({
              name_en: row.name_en,
              name_ar: row.name_ar,
            }));

            await qualityRecommendationService.bulkCreateQualityRecommendations(bulkData, authData.org_id);
            setIsCreating(false);
            setFile(null);
            setNewRecommendation({ name_en: '', name_ar: '' });
            fetchQualityRecommendations();
            setSuccess(t('recommendations.bulk_create_success'));
            setTimeout(() => setSuccess(''), 3000);
          } catch (err) {
            console.error('Error parsing file:', err.message);
            setError(err.message || t('recommendations.file_parse_error'));
          }
        };
        reader.onerror = () => {
          setError('Error reading the file.');
        };
        reader.readAsArrayBuffer(file);
      } catch (err) {
        console.error('Error processing file:', err.message);
        setError('An unexpected error occurred during file processing.');
      }
    } else {
      if (!newRecommendation.name_en || !newRecommendation.name_ar) {
        setError(t('recommendations.missing_fields_error'));
        return;
      }

      try {
        console.log('Creating new quality recommendation:', newRecommendation);
        await qualityRecommendationService.createQualityRecommendation(newRecommendation, authData.org_id);
        setIsCreating(false);
        setNewRecommendation({ name_en: '', name_ar: '' });
        fetchQualityRecommendations();
        setSuccess(t('recommendations.create_success'));
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        console.error('Error creating quality recommendation:', err.message);
        setError(err.message || t('recommendations.create_error'));
      }
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!hasPrivilege) {
      setError(t('recommendations.no_permission'));
      return;
    }

    if (window.confirm(t('recommendations.delete_confirm'))) {
      try {
        console.log('Deleting quality recommendation:', id);
        await qualityRecommendationService.deleteQualityRecommendation(id, authData.org_id);
        fetchQualityRecommendations();
        setSuccess(t('recommendations.delete_success'));
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        console.error('Error deleting quality recommendation:', err.message);
        setError(err.message || t('recommendations.delete_error'));
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
                  {t('recommendations.title')}
                </h1>
              </div>
              <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
                <LanguageToggle />
                {hasPrivilege && (
                  <button
                    onClick={initiateCreate}
                    className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded transition duration-200"
                  >
                    {t('recommendations.add_recommendation')}
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
            ) : recommendations.length === 0 ? (
              <div className="text-gray-600 dark:text-gray-300">{t('recommendations.no_recommendations')}</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendations.map((recommendation) => (
                  <div
                    key={recommendation.id}
                    className="bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow duration-200"
                    role="region"
                    aria-label={`${t('recommendations.recommendation_name')}: ${language === 'en' ? recommendation.name_en : recommendation.name_ar}`}
                  >
                    <div className="space-y-4">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">{t('recommendations.recommendation_name')}</span>
                        <p className="text-gray-800 dark:text-gray-100 font-semibold">
                          {language === 'en' ? recommendation.name_en : recommendation.name_ar || t('recommendations.unknown')}
                        </p>
                      </div>
                    </div>
                    {hasPrivilege && (
                      <div className="flex justify-end gap-3 mt-4">
                        <button
                          onClick={() => handleEdit(recommendation)}
                          className="flex items-center text-indigo-500 hover:text-indigo-600 text-sm font-medium transition-colors duration-200"
                          aria-label={t('recommendations.edit')}
                        >
                          <PencilIcon className="w-4 h-4 mr-1" />
                          {t('recommendations.edit')}
                        </button>
                        <button
                          onClick={() => handleDelete(recommendation.id)}
                          className="flex items-center text-red-500 hover:text-red-600 text-sm font-medium transition-colors duration-200"
                          aria-label={t('recommendations.delete')}
                        >
                          <TrashIcon className="w-4 h-4 mr-1" />
                          {t('recommendations.delete')}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {(editingRecommendation || isCreating) && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-gray-900 rounded-lg p-8 w-full max-w-md shadow-2xl">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                    {isCreating ? t('recommendations.add_title') : t('recommendations.edit_title')}
                  </h2>
                  <form onSubmit={isCreating ? handleSaveNew : handleUpdate} className="space-y-6">
                    {isCreating && (
                      <div>
                        <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="upload_mode">
                          {t('recommendations.upload_mode')}
                        </label>
                        <div className="flex gap-4">
                          <label className="flex items-center space-x-2">
                            <input
                              type="radio"
                              name="uploadMode"
                              checked={!isBulkUpload}
                              onChange={() => setIsBulkUpload(false)}
                              className="form-radio h-4 w-4 text-indigo-500 transition duration-200"
                            />
                            <span className="text-gray-700 dark:text-gray-300">{t('recommendations.manual_entry')}</span>
                          </label>
                          <label className="flex items-center space-x-2">
                            <input
                              type="radio"
                              name="uploadMode"
                              checked={isBulkUpload}
                              onChange={() => {
                                setIsBulkUpload(true);
                                setNewRecommendation({ name_en: '', name_ar: '' });
                              }}
                              className="form-radio h-4 w-4 text-indigo-500 transition duration-200"
                            />
                            <span className="text-gray-700 dark:text-gray-300">{t('recommendations.bulk_upload')}</span>
                          </label>
                        </div>
                      </div>
                    )}
                    {isCreating && isBulkUpload ? (
                      <div>
                        <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="file_upload">
                          {t('recommendations.upload_file')}
                        </label>
                        <div className="flex items-center">
                          <input
                            type="file"
                            id="file_upload"
                            accept=".xlsx"
                            onChange={(e) => setFile(e.target.files[0])}
                            className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                          />
                          <DocumentArrowUpIcon className="w-6 h-6 ml-2 text-gray-500 dark:text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {t('recommendations.upload_instruction')}
                        </p>
                      </div>
                    ) : (
                      <>
                        <div>
                          <label
                            className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
                            htmlFor="name_en"
                          >
                            {t('recommendations.recommendation_name_en')}
                          </label>
                          <input
                            type="text"
                            id="name_en"
                            value={newRecommendation.name_en}
                            onChange={(e) =>
                              setNewRecommendation({
                                ...newRecommendation,
                                name_en: e.target.value,
                              })
                            }
                            className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                            required
                          />
                        </div>
                        <div>
                          <label
                            className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
                            htmlFor="name_ar"
                          >
                            {t('recommendations.recommendation_name_ar')}
                          </label>
                          <input
                            type="text"
                            id="name_ar"
                            value={newRecommendation.name_ar}
                            onChange={(e) =>
                              setNewRecommendation({
                                ...newRecommendation,
                                name_ar: e.target.value,
                              })
                            }
                            className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                            required
                          />
                        </div>
                      </>
                    )}
                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingRecommendation(null);
                          setIsCreating(false);
                          setError('');
                          setFile(null);
                        }}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded transition duration-200"
                      >
                        {t('recommendations.cancel')}
                      </button>
                      <button
                        type="submit"
                        className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded transition duration-200"
                        disabled={isBulkUpload && !file}
                      >
                        {isCreating ? t('recommendations.create') : t('recommendations.save')}
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

export default QualityRecommendation;