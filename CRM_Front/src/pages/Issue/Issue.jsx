import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { issueService } from '../../lib/issueService';
import { classificationService } from '../../lib/classificationService';
import ModalSearch from '../../components/ModalSearch';
import ThemeToggle from '../../components/ThemeToggle';
import LanguageToggle from '../../components/LanguageToggle';
import Header from '../../partials/Header';
import Sidebar from '../../partials/Sidebar';
import LoadingSpinner from '../../components/LoadingSpinner';
import { PencilIcon, TrashIcon, DocumentArrowUpIcon } from '@heroicons/react/24/outline';
import * as XLSX from 'xlsx';

const Issue = () => {
  const { authData, loading: authLoading } = useAuth();
  const { language, t } = useLanguage();
  const [issues, setIssues] = useState([]);
  const [classifications, setClassifications] = useState([]);
  const [editingIssue, setEditingIssue] = useState(null);
  const [newIssue, setNewIssue] = useState({
    issue_text_en: '',
    issue_text_ar: '',
    classification_id: '',
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
      setError(t('issues.no_permission'));
      setLoading(false);
      return;
    }

    const privilegeCheck = authData.privilege_ids?.includes(1) || false;
    console.log('hasPrivilege:', privilegeCheck);
    setHasPrivilege(privilegeCheck);

    if (!privilegeCheck) {
      setError(t('issues.no_permission'));
      setLoading(false);
    }
  }, [authData, authLoading, t]);

  // Fetch classifications and issues
  const fetchData = async () => {
    if (!authData?.org_id || !hasPrivilege) {
      console.log('Skipping fetchData: missing org_id or privilege');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    try {
      console.log('Fetching classifications with org_id:', authData.org_id);
      const classificationData = await classificationService.getClassifications(authData.org_id);
      const filteredClassifications = classificationData.filter(cls => String(cls.org_id) === String(authData.org_id));
      console.log('Filtered classifications:', filteredClassifications);
      setClassifications(Array.isArray(filteredClassifications) ? filteredClassifications : []);
      if (!filteredClassifications || filteredClassifications.length === 0) {
        setError(t('issues.no_classifications'));
      }

      console.log('Fetching issues with org_id:', authData.org_id);
      const issueData = await issueService.getIssues(authData.org_id);
      const filteredIssues = issueData.filter(issue => String(issue.org_id) === String(authData.org_id));
      console.log('Filtered issues:', filteredIssues);
      setIssues(Array.isArray(filteredIssues) ? filteredIssues : []);
    } catch (err) {
      console.error('Error fetching data:', err.message);
      setError(err.message || t('issues.fetch_error'));
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on mount
  useEffect(() => {
    if (!authLoading && authData?.org_id && hasPrivilege) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [authData?.org_id, hasPrivilege, authLoading, t]);

  // Handle edit
  const handleEdit = async (issue) => {
    if (!hasPrivilege) {
      setError(t('issues.no_permission'));
      return;
    }

    try {
      console.log('Fetching issue for edit:', issue.id);
      const data = await issueService.getIssue(issue.id, authData.org_id);
      setEditingIssue(issue);
      setNewIssue({
        issue_text_en: data.issue_text_en,
        issue_text_ar: data.issue_text_ar,
        classification_id: data.classification_id.toString(),
      });
    } catch (err) {
      console.error('Error fetching issue for edit:', err.message);
      setError(err.message || t('issues.fetch_edit_error'));
    }
  };

  // Initiate create
  const initiateCreate = () => {
    if (!hasPrivilege) {
      setError(t('issues.no_permission'));
      return;
    }

    if (classifications.length === 0) {
      setError(t('issues.no_classifications'));
      return;
    }

    console.log('Initiating create issue');
    setIsCreating(true);
    setIsBulkUpload(false);
    setFile(null);
    setNewIssue({
      issue_text_en: '',
      issue_text_ar: '',
      classification_id: classifications.length > 0 ? classifications[0].id.toString() : '',
    });
  };

  // Handle update
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!hasPrivilege) {
      setError(t('issues.no_permission'));
      return;
    }

    if (!newIssue.classification_id || !newIssue.issue_text_en || !newIssue.issue_text_ar) {
      setError(t('issues.missing_fields_error'));
      return;
    }

    try {
      console.log('Updating issue:', editingIssue.id, newIssue);
      await issueService.updateIssue(
        editingIssue.id,
        {
          issue_text_en: newIssue.issue_text_en,
          issue_text_ar: newIssue.issue_text_ar,
          classification_id: parseInt(newIssue.classification_id),
        },
        authData.org_id
      );
      setEditingIssue(null);
      setNewIssue({ issue_text_en: '', issue_text_ar: '', classification_id: '' });
      fetchData();
      setSuccess(t('issues.update_success'));
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error updating issue:', err.message);
      setError(err.message || t('issues.update_error'));
    }
  };

  // Handle save new
  const handleSaveNew = async (e) => {
    e.preventDefault();
    if (!hasPrivilege) {
      setError(t('issues.no_permission'));
      return;
    }

    if (!newIssue.classification_id) {
      setError(t('issues.select_classification'));
      return;
    }

    if (isBulkUpload) {
      if (!file) {
        setError(t('issues.file_required'));
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
              setError(t('issues.empty_file'));
              return;
            }

            const requiredColumns = ['issue_text_en', 'issue_text_ar'];
            const missingColumns = requiredColumns.filter(col => !Object.keys(jsonData[0]).includes(col));
            if (missingColumns.length > 0) {
              setError(t('issues.missing_columns', { columns: missingColumns.join(', ') }));
              return;
            }

            const bulkData = jsonData.map(row => ({
              issue_text_en: row.issue_text_en,
              issue_text_ar: row.issue_text_ar,
            }));

            await issueService.bulkCreateIssues(bulkData, authData.org_id, parseInt(newIssue.classification_id));
            setIsCreating(false);
            setFile(null);
            setNewIssue({ issue_text_en: '', issue_text_ar: '', classification_id: newIssue.classification_id });
            fetchData();
            setSuccess(t('issues.bulk_create_success'));
            setTimeout(() => setSuccess(''), 3000);
          } catch (err) {
            console.error('Error parsing file:', err.message);
            setError(err.message || t('issues.file_parse_error'));
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
      if (!newIssue.issue_text_en || !newIssue.issue_text_ar) {
        setError(t('issues.missing_fields_error'));
        return;
      }

      try {
        console.log('Creating new issue:', newIssue);
        await issueService.createIssue(
          {
            issue_text_en: newIssue.issue_text_en,
            issue_text_ar: newIssue.issue_text_ar,
            classification_id: parseInt(newIssue.classification_id),
          },
          authData.org_id
        );
        setIsCreating(false);
        setNewIssue({ issue_text_en: '', issue_text_ar: '', classification_id: '' });
        fetchData();
        setSuccess(t('issues.create_success'));
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        console.error('Error creating issue:', err.message);
        setError(err.message || t('issues.create_error'));
      }
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!hasPrivilege) {
      setError(t('issues.no_permission'));
      return;
    }

    if (window.confirm(t('issues.delete_confirm'))) {
      try {
        console.log('Deleting issue:', id);
        await issueService.deleteIssue(id, authData.org_id);
        fetchData();
        setSuccess(t('issues.delete_success'));
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        console.error('Error deleting issue:', err.message);
        setError(err.message || t('issues.delete_error'));
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
                  {t('issues.title')}
                </h1>
              </div>
              <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
                <LanguageToggle />
                {hasPrivilege && (
                  <button
                    onClick={initiateCreate}
                    className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded transition duration-200"
                    disabled={classifications.length === 0}
                  >
                    {t('issues.add_issue')}
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
            ) : issues.length === 0 ? (
              <div className="text-gray-600 dark:text-gray-300">{t('issues.no_issues')}</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {issues.map((issue) => {
                  const classification = classifications.find(
                    (c) => c.id === issue.classification_id
                  );
                  return (
                    <div
                      key={issue.id}
                      className="bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow duration-200"
                      role="region"
                      aria-label={`${t('issues.issue_text')}: ${language === 'en' ? issue.issue_text_en : issue.issue_text_ar}`}
                    >
                      <div className="space-y-4">
                        <div>
                          <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">{t('issues.issue_text')}</span>
                          <p className="text-gray-800 dark:text-gray-100 font-semibold">{language === 'en' ? issue.issue_text_en : issue.issue_text_ar}</p>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">{t('issues.classification')}</span>
                          <p className="text-gray-800 dark:text-gray-100 font-semibold">
                            {classification ? (language === 'en' ? classification.classification_en : classification.classification_ar) : t('issues.unknown_classification')}
                          </p>
                        </div>
                      </div>
                      {hasPrivilege && (
                        <div className="flex justify-end gap-3 mt-4">
                          <button
                            onClick={() => handleEdit(issue)}
                            className="flex items-center text-indigo-500 hover:text-indigo-600 text-sm font-medium transition-colors duration-200"
                            aria-label={t('issues.edit')}
                          >
                            <PencilIcon className="w-4 h-4 mr-1" />
                            {t('issues.edit')}
                          </button>
                          <button
                            onClick={() => handleDelete(issue.id)}
                            className="flex items-center text-red-500 hover:text-red-600 text-sm font-medium transition-colors duration-200"
                            aria-label={t('issues.delete')}
                          >
                            <TrashIcon className="w-4 h-4 mr-1" />
                            {t('issues.delete')}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {(editingIssue || isCreating) && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-gray-900 rounded-lg p-8 w-full max-w-md shadow-2xl">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                    {isCreating ? t('issues.add_title') : t('issues.edit_title')}
                  </h2>
                  <form onSubmit={isCreating ? handleSaveNew : handleUpdate} className="space-y-6">
                    {isCreating && (
                      <div>
                        <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="upload_mode">
                          {t('issues.upload_mode')}
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
                            <span className="text-gray-700 dark:text-gray-300">{t('issues.manual_entry')}</span>
                          </label>
                          <label className="flex items-center space-x-2">
                            <input
                              type="radio"
                              name="uploadMode"
                              checked={isBulkUpload}
                              onChange={() => {
                                setIsBulkUpload(true);
                                setNewIssue({ ...newIssue, issue_text_en: '', issue_text_ar: '' });
                              }}
                              className="form-radio h-4 w-4 text-indigo-500 transition duration-200"
                            />
                            <span className="text-gray-700 dark:text-gray-300">{t('issues.bulk_upload')}</span>
                          </label>
                        </div>
                      </div>
                    )}
                    <div>
                      <label
                        className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
                        htmlFor="classification_id"
                      >
                        {t('issues.classification')}
                      </label>
                      <select
                        id="classification_id"
                        value={newIssue.classification_id}
                        onChange={(e) =>
                          setNewIssue({
                            ...newIssue,
                            classification_id: e.target.value,
                          })
                        }
                        className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                        required
                        disabled={!isCreating}
                        aria-label={t('issues.classification')}
                      >
                        <option value="" disabled>
                          {t('issues.select_classification')}
                        </option>
                        {classifications.map((classification) => (
                          <option key={classification.id} value={classification.id}>
                            {language === 'en' ? classification.classification_en : classification.classification_ar}
                          </option>
                        ))}
                      </select>
                    </div>
                    {isCreating && isBulkUpload ? (
                      <div>
                        <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="file_upload">
                          {t('issues.upload_file')}
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
                          {t('issues.upload_instruction')}
                        </p>
                      </div>
                    ) : (
                      <>
                        <div>
                          <label
                            className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
                            htmlFor="issue_text_en"
                          >
                            {t('issues.issue_text_en')}
                          </label>
                          <textarea
                            id="issue_text_en"
                            value={newIssue.issue_text_en}
                            onChange={(e) =>
                              setNewIssue({
                                ...newIssue,
                                issue_text_en: e.target.value,
                              })
                            }
                            className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                            required
                            rows="4"
                          />
                        </div>
                        <div>
                          <label
                            className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
                            htmlFor="issue_text_ar"
                          >
                            {t('issues.issue_text_ar')}
                          </label>
                          <textarea
                            id="issue_text_ar"
                            value={newIssue.issue_text_ar}
                            onChange={(e) =>
                              setNewIssue({
                                ...newIssue,
                                issue_text_ar: e.target.value,
                              })
                            }
                            className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                            required
                            rows="4"
                          />
                        </div>
                      </>
                    )}
                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingIssue(null);
                          setIsCreating(false);
                          setError('');
                          setFile(null);
                        }}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded transition duration-200"
                      >
                        {t('issues.cancel')}
                      </button>
                      <button
                        type="submit"
                        className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded transition duration-200"
                        disabled={!newIssue.classification_id || (isBulkUpload && !file)}
                      >
                        {isCreating ? t('issues.create') : t('issues.save')}
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

export default Issue;