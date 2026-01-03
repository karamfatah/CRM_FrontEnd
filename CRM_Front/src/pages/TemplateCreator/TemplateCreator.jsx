import React, { useState, useEffect } from 'react';
import { TemplateProvider, useTemplate } from './TemplateContext';
import ManualTemplateCreator from './ManualTemplateCreator';
import AITemplateCreator from './AITemplateCreator';
import Header from '../../partials/Header';
import Sidebar from '../../partials/Sidebar';
import LoadingSpinner from '../../components/LoadingSpinner';
import ModalSearch from '../../components/ModalSearch';
import ThemeToggle from '../../components/ThemeToggle';
import LanguageToggle from '../../components/LanguageToggle';

const TemplateCreatorInner = () => {
  const {
    authData,
    authLoading,
    t,
    error,
    setError,
    loading,
    setLoading,
    hasPrivilege,
    setHasPrivilege,
    setCreatedBy,
    setReportNames,
    updatePreviews,
  } = useTemplate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mode, setMode] = useState('manual');

  useEffect(() => {
    console.log('TemplateCreator: useEffect running with:', { authLoading, authData });
    if (authLoading) return;

    if (!authData?.access_token) {
      console.log('TemplateCreator: No access token, setting error');
      setError(t('templates.no_permission'));
      setLoading(false);
      console.log('TemplateCreator: Set loading to false (no access token)');
      return;
    }

    if (authData.privilege_ids.includes(1)) {
      console.log('TemplateCreator: Privilege 1 found, setting hasPrivilege');
      setHasPrivilege(true);
      setCreatedBy(authData.user_id || 'user_001');

      const fetchReportNames = async () => {
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL}/api/reports_names`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'x-access-tokens': authData.access_token,
            },
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Failed to fetch report names: ${response.status}`);
          }

          const data = await response.json();
          setReportNames(data);
        } catch (err) {
          console.error('Error fetching report names:', err);
          setError(t('templates.fetch_report_types_error', { message: err.message }));
        }
      };

      fetchReportNames();
      setLoading(false);
      console.log('TemplateCreator: Set loading to false (has privilege)');
    } else {
      console.log('TemplateCreator: Privilege 1 not found, setting error');
      setError(t('templates.no_permission'));
      setHasPrivilege(false);
      setLoading(false);
      console.log('TemplateCreator: Set loading to false (no privilege)');
    }
  }, [authData, authLoading, t, setError, setLoading, setHasPrivilege, setCreatedBy, setReportNames]);

  if (authLoading || !authData) {
    console.log('TemplateCreator: Rendering LoadingSpinner due to authLoading or no authData');
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
                  {t('templates.title')}
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

            {loading ? (
              <LoadingSpinner />
            ) : (
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="w-full lg:w-8/12 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
                    {t('templates.define_template')}
                  </h2>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('templates.select_mode')}
                    </label>
                    <div className="flex space-x-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="mode"
                          value="manual"
                          checked={mode === 'manual'}
                          onChange={() => setMode('manual')}
                          className="mr-2"
                        />
                        {t('templates.manual_mode')}
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="mode"
                          value="ai"
                          checked={mode === 'ai'}
                          onChange={() => setMode('ai')}
                          className="mr-2"
                        />
                        {t('templates.ai_mode')}
                      </label>
                    </div>
                  </div>
                  {mode === 'manual' ? <ManualTemplateCreator /> : <AITemplateCreator />}
                </div>

                <div className="w-full lg:w-2/12 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
                    {t('templates.json_preview')}
                  </h2>
                  <pre
                    id="templatePreview"
                    className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md overflow-x-auto h-[80vh] text-xs text-gray-800 dark:text-gray-200"
                  ></pre>
                </div>

                <div className="w-full lg:w-2/12 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                      {t('templates.ui_preview')}
                    </h2>
                    <button
                      type="button"
                      onClick={() => updatePreviews()}
                      className="bg-indigo-500 hover:bg-indigo-600 text-white p-2 rounded-md transition duration-200"
                    >
                      {t('common.sync_ui_preview')}
                    </button>
                  </div>
                  <div className="space-y-4 h-[80vh] overflow-auto">
                    <div>
                      <h3 className="text-lg font-medium mb-2 text-gray-800 dark:text-gray-100">
                        {t('templates.header')}
                      </h3>
                      <div id="userUIHeaderFields" className="space-y-2"></div>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium mb-2 text-gray-800 dark:text-gray-100">
                        {t('templates.body')}
                      </h3>
                      <div id="userUIBodyFields" className="space-y-2"></div>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium mb-2 text-gray-800 dark:text-gray-100">
                        {t('templates.footer')}
                      </h3>
                      <div id="userUIFooterFields" className="space-y-2"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

const TemplateCreator = () => (
  <TemplateProvider>
    <TemplateCreatorInner />
  </TemplateProvider>
);

export default TemplateCreator;