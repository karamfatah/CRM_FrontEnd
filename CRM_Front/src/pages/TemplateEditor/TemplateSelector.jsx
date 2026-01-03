// import React, { useState, useEffect } from 'react';
// import { useAuth } from '../../context/AuthContext';
// import { useLanguage } from '../../context/LanguageContext';
// import { useNavigate } from 'react-router-dom';
// import Header from '../../partials/Header';
// import Sidebar from '../../partials/Sidebar';
// import LoadingSpinner from '../../components/LoadingSpinner';
// import ModalSearch from '../../components/ModalSearch';
// import ThemeToggle from '../../components/ThemeToggle';
// import LanguageToggle from '../../components/LanguageToggle';
// import templateService from '../../lib/templateService';

// const TemplateSelector = () => {
//   const { authData, loading: authLoading } = useAuth();
//   const { t } = useLanguage();
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(true);
//   const [templates, setTemplates] = useState([]);
//   const [selectedTemplateId, setSelectedTemplateId] = useState('');
//   const navigate = useNavigate();

//   useEffect(() => {
//     if (authLoading) {
//       console.log('Auth is loading');
//       return;
//     }

//     if (!authData?.access_token) {
//       console.log('Missing auth data:', { token: authData?.access_token });
//       setError(t('templates.no_permission'));
//       setLoading(false);
//       return;
//     }

//     console.log('Fetching templates');

//     const fetchTemplates = async () => {
//       try {
//         const templateData = await templateService.fetchTemplateNames(authData.access_token);
//         console.log('Fetched templates:', templateData);
//         setTemplates(templateData);

//         if (templateData.length === 0) {
//           setError(t('templates.no_templates'));
//         }
//       } catch (err) {
//         console.error('Error fetching templates:', err);
//         setError(t('templates.fetch_error', { message: err.message }));
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchTemplates();
//   }, [authData, authLoading, t]);

//   const handleLoadTemplate = () => {
//     if (selectedTemplateId) {
//       console.log('Navigating to edit template:', selectedTemplateId);
//       navigate(`/templates/edit/${selectedTemplateId}`);
//     } else {
//       setError(t('templates.select_template'));
//     }
//   };

//   if (authLoading || !authData) {
//     return <LoadingSpinner />;
//   }

//   return (
//     <div className="flex h-screen overflow-hidden">
//       <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
//       <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
//         <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
//         <main>
//           <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
//             <div className="sm:flex sm:justify-between sm:items-center mb-8">
//               <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
//                 {t('templates.select_template')}
//               </h1>
//               <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
//                 <LanguageToggle />
//                 <ModalSearch />
//                 <ThemeToggle />
//               </div>
//             </div>

//             {error && (
//               <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
//                 <span>{error}</span>
//                 <button onClick={() => setError('')} className="absolute top-0 right-0 px-4 py-3">
//                   <svg className="fill-current h-6 w-6 text-red-500" viewBox="0 0 20 20">
//                     <path d="M10 8.586L2.929 1.515 1.515 2.929 8.586 10l-7.071 7.071 1.414 1.414L10 11.414l7.071 7.071 1.414-1.414L11.414 10l7.071-7.071-1.414-1.414L10 8.586z" />
//                   </svg>
//                 </button>
//               </div>
//             )}

//             {loading ? (
//               <LoadingSpinner />
//             ) : (
//               <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
//                 <div className="space-y-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                       {t('templates.template_name')}
//                     </label>
//                     <select
//                       value={selectedTemplateId}
//                       onChange={(e) => setSelectedTemplateId(e.target.value)}
//                       className="p-2 border rounded-md w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
//                     >
//                       <option value="">{t('templates.select_template')}</option>
//                       {templates.length > 0 ? (
//                         templates.map((template) => (
//                           <option key={template._id} value={template._id}>
//                             {template.name}
//                           </option>
//                         ))
//                       ) : (
//                         <option disabled>{t('templates.no_templates')}</option>
//                       )}
//                     </select>
//                   </div>
//                   <button
//                     onClick={handleLoadTemplate}
//                     className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-md transition duration-200"
//                     disabled={!selectedTemplateId}
//                   >
//                     {t('templates.load_template')}
//                   </button>
//                 </div>
//               </div>
//             )}
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// };

// export default TemplateSelector;



// Before Fix ORG ID 

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import Header from '../../partials/Header';
import Sidebar from '../../partials/Sidebar';
import LoadingSpinner from '../../components/LoadingSpinner';
import ModalSearch from '../../components/ModalSearch';
import ThemeToggle from '../../components/ThemeToggle';
import LanguageToggle from '../../components/LanguageToggle';
import templateService from '../../lib/templateService';

const TemplateSelector = () => {
  const { authData, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading) {
      console.log('Auth is loading');
      return;
    }

    if (!authData?.access_token) {
      console.log('Missing auth data:', { token: authData?.access_token });
      setError(t('templates.no_permission'));
      setLoading(false);
      return;
    }

    console.log('Fetching templates');

    const fetchTemplates = async () => {
      try {
        const orgId = authData.org_id || 1; // Use org_id from authData or fallback to 1
        const templateData = await templateService.fetchTemplateNames(authData.access_token, orgId);
        console.log('Fetched templates:', templateData);
        setTemplates(templateData);

        if (templateData.length === 0) {
          setError(t('templates.no_templates'));
        }
      } catch (err) {
        console.error('Error fetching templates:', err);
        setError(t('templates.fetch_error', { message: err.message }));
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, [authData, authLoading, t]);

  const handleLoadTemplate = () => {
    if (selectedTemplateId) {
      console.log('Navigating to edit template:', selectedTemplateId);
      navigate(`/templates/edit/${selectedTemplateId}`);
    } else {
      setError(t('templates.select_template'));
    }
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
              <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
                {t('templates.select_template')}
              </h1>
              <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
                <LanguageToggle />
                <ModalSearch />
                <ThemeToggle />
              </div>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                <span>{error}</span>
                <button onClick={() => setError('')} className="absolute top-0 right-0 px-4 py-3">
                  <svg className="fill-current h-6 w-6 text-red-500" viewBox="0 0 20 20">
                    <path d="M10 8.586L2.929 1.515 1.515 2.929 8.586 10l-7.071 7.071 1.414 1.414L10 11.414l7.071 7.071 1.414-1.414L11.414 10l7.071-7.071-1.414-1.414L10 8.586z" />
                  </svg>
                </button>
              </div>
            )}

            {loading ? (
              <LoadingSpinner />
            ) : (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('templates.template_name')}
                    </label>
                    <select
                      value={selectedTemplateId}
                      onChange={(e) => setSelectedTemplateId(e.target.value)}
                      className="p-2 border rounded-md w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                    >
                      <option value="">{t('templates.select_template')}</option>
                      {templates.length > 0 ? (
                        templates.map((template) => (
                          <option key={template._id} value={template._id}>
                            {template.name}
                          </option>
                        ))
                      ) : (
                        <option disabled>{t('templates.no_templates')}</option>
                      )}
                    </select>
                  </div>
                  <button
                    onClick={handleLoadTemplate}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-md transition duration-200"
                    disabled={!selectedTemplateId}
                  >
                    {t('templates.load_template')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default TemplateSelector;

