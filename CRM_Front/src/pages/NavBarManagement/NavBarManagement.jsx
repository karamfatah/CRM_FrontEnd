// // // import React, { useState, useEffect } from 'react';
// // // import { useAuth } from '../../context/AuthContext';
// // // import { useLanguage } from '../../context/LanguageContext';
// // // import { navBarService } from '../../lib/navBarService';
// // // import ModalSearch from '../../components/ModalSearch';
// // // import Header from '../../partials/Header';
// // // import Sidebar from '../../partials/Sidebar';
// // // import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
// // // import LoadingSpinner from '../../components/LoadingSpinner';

// // // const NavBarManagement = () => {
// // //   const { authData, loading: authLoading } = useAuth();
// // //   const { language, t } = useLanguage();
// // //   const [navGroups, setNavGroups] = useState([]);
// // //   const [editingNavGroup, setEditingNavGroup] = useState(null);
// // //   const [newNavGroup, setNewNavGroup] = useState({
// // //     key: '',
// // //     name_en: '',
// // //     name_ar: '',
// // //     main_sections: [],
// // //   });
// // //   const [templateNames, setTemplateNames] = useState([]);
// // //   const [error, setError] = useState('');
// // //   const [loading, setLoading] = useState(true);
// // //   const [sidebarOpen, setSidebarOpen] = useState(false);
// // //   const [isCreating, setIsCreating] = useState(false);
// // //   const [hasPrivilege, setHasPrivilege] = useState(false);

// // //   // Check authentication and privileges
// // //   useEffect(() => {
// // //     if (authLoading) return;

// // //     if (!authData?.access_token) {
// // //       setError(t('nav_groups.no_permission'));
// // //       setLoading(false);
// // //       return;
// // //     }

// // //     if (authData.privilege_ids.includes(1)) {
// // //       setHasPrivilege(true);
// // //     } else {
// // //       setError(t('nav_groups.no_permission'));
// // //       setLoading(false);
// // //     }
// // //   }, [authData, authLoading, t]);

// // //   // Fetch navigation groups
// // //   const fetchNavGroups = async () => {
// // //     if (!authData?.org_id || !hasPrivilege) {
// // //       setLoading(false);
// // //       return;
// // //     }

// // //     setLoading(true);
// // //     try {
// // //       // Fetch template names first
// // //       const templates = await navBarService.getTemplateNames();
// // //       setTemplateNames(templates);

// // //       const data = await navBarService.getNavGroups(authData.org_id);
// // //       // Map sub_page_variable names to IDs
// // //       const mappedData = data.map((group) => ({
// // //         ...group,
// // //         main_sections: group.main_sections.map((section) => ({
// // //           ...section,
// // //           subsections: section.subsections.map((sub) => {
// // //             const template = templates.find((t) => t.name === sub.sub_page_variable || t._id === sub.sub_page_variable);
// // //             return {
// // //               ...sub,
// // //               sub_page_variable: template ? template._id : '',
// // //             };
// // //           }),
// // //         })),
// // //       }));

// // //       if (process.env.NODE_ENV !== 'production') {
// // //         console.debug('Fetched and mapped navigation groups:', mappedData);
// // //       }
// // //       setNavGroups(mappedData);
// // //       setError('');
// // //     } catch (err) {
// // //       console.error('Error fetching navigation groups:', err.message);
// // //       setError(err.message || t('nav_groups.fetch_error'));
// // //     } finally {
// // //       setLoading(false);
// // //     }
// // //   };

// // //   useEffect(() => {
// // //     if (hasPrivilege && authData?.org_id) {
// // //       fetchNavGroups();
// // //     }
// // //   }, [authData, hasPrivilege]);

// // //   // Fetch template names when modal opens
// // //   useEffect(() => {
// // //     if (isCreating || editingNavGroup) {
// // //       const fetchTemplates = async () => {
// // //         try {
// // //           const templates = await navBarService.getTemplateNames();
// // //           setTemplateNames(templates);
// // //         } catch (err) {
// // //           console.error('Error fetching template names:', err.message);
// // //           setError(err.message || t('nav_groups.fetch_templates_error'));
// // //         }
// // //       };
// // //       fetchTemplates();
// // //     }
// // //   }, [isCreating, editingNavGroup, t]);

// // //   // Handle edit
// // //   const handleEdit = async (navGroup) => {
// // //     if (!hasPrivilege) {
// // //       setError(t('nav_groups.no_permission'));
// // //       return;
// // //     }

// // //     try {
// // //       const data = await navBarService.getNavGroup(navGroup.id, authData.org_id);
// // //       const templates = templateNames.length ? templateNames : await navBarService.getTemplateNames();
// // //       const mappedData = {
// // //         ...data,
// // //         main_sections: data.main_sections.map((section) => ({
// // //           ...section,
// // //           subsections: section.subsections.map((sub) => {
// // //             const template = templates.find((t) => t.name === sub.sub_page_variable || t._id === sub.sub_page_variable);
// // //             return {
// // //               ...sub,
// // //               sub_page_variable: template ? template._id : '',
// // //             };
// // //           }),
// // //         })),
// // //       };

// // //       if (process.env.NODE_ENV !== 'production') {
// // //         console.debug('Fetched and mapped navigation group for edit:', mappedData);
// // //       }
// // //       setEditingNavGroup(navGroup);
// // //       setNewNavGroup({
// // //         key: mappedData.key,
// // //         name_en: mappedData.name_en,
// // //         name_ar: mappedData.name_ar,
// // //         main_sections: mappedData.main_sections,
// // //       });
// // //     } catch (err) {
// // //       console.error('Error fetching navigation group for edit:', err.message);
// // //       setError(err.message || t('nav_groups.fetch_edit_error'));
// // //     }
// // //   };

// // //   // Handle create
// // //   const initiateCreate = () => {
// // //     if (!hasPrivilege) {
// // //       setError(t('nav_groups.no_permission'));
// // //       return;
// // //     }

// // //     setIsCreating(true);
// // //     setNewNavGroup({
// // //       key: '',
// // //       name_en: '',
// // //       name_ar: '',
// // //       main_sections: [],
// // //     });
// // //   };

// // //   // Handle update
// // //   const handleUpdate = async (e) => {
// // //     e.preventDefault();
// // //     if (!hasPrivilege) return;

// // //     try {
// // //       // Validate that all sub_page_variable are valid IDs
// // //       const invalidSubsection = newNavGroup.main_sections.some((section) =>
// // //         section.subsections.some((sub) => {
// // //           if (!sub.sub_page_variable) return true;
// // //           return !templateNames.some((t) => t._id === sub.sub_page_variable);
// // //         })
// // //       );
// // //       if (invalidSubsection) {
// // //         throw new Error(t('nav_groups.invalid_template'));
// // //       }

// // //       if (process.env.NODE_ENV !== 'production') {
// // //         console.debug('Updating navigation group with payload:', newNavGroup);
// // //       }
// // //       await navBarService.updateNavGroup(
// // //         editingNavGroup.id,
// // //         newNavGroup,
// // //         authData.org_id
// // //       );
// // //       setEditingNavGroup(null);
// // //       setNewNavGroup({ key: '', name_en: '', name_ar: '', main_sections: [] });
// // //       fetchNavGroups();
// // //     } catch (err) {
// // //       console.error('Error updating navigation group:', err.message);
// // //       setError(err.message || t('nav_groups.update_error'));
// // //     }
// // //   };

// // //   // Handle save new
// // //   const handleSaveNew = async (e) => {
// // //     e.preventDefault();
// // //     if (!hasPrivilege) return;

// // //     try {
// // //       // Validate that all sub_page_variable are valid IDs
// // //       const invalidSubsection = newNavGroup.main_sections.some((section) =>
// // //         section.subsections.some((sub) => {
// // //           if (!sub.sub_page_variable) return true;
// // //           return !templateNames.some((t) => t._id === sub.sub_page_variable);
// // //         })
// // //       );
// // //       if (invalidSubsection) {
// // //         throw new Error(t('nav_groups.invalid_template'));
// // //       }

// // //       if (process.env.NODE_ENV !== 'production') {
// // //         console.debug('Creating navigation group with payload:', newNavGroup);
// // //       }
// // //       await navBarService.createNavGroup(newNavGroup, authData.org_id);
// // //       setIsCreating(false);
// // //       setNewNavGroup({ key: '', name_en: '', name_ar: '', main_sections: [] });
// // //       fetchNavGroups();
// // //     } catch (err) {
// // //       console.error('Error creating navigation group:', err.message);
// // //       setError(err.message || t('nav_groups.create_error'));
// // //     }
// // //   };

// // //   // Handle delete
// // //   const handleDelete = async (id) => {
// // //     if (!hasPrivilege) return;

// // //     if (window.confirm(t('nav_groups.delete_confirm'))) {
// // //       try {
// // //         await navBarService.deleteNavGroup(id, authData.org_id);
// // //         if (process.env.NODE_ENV !== 'production') {
// // //           console.debug('Deleted navigation group:', id);
// // //         }
// // //         fetchNavGroups();
// // //       } catch (err) {
// // //         console.error('Error deleting navigation group:', err.message);
// // //         setError(err.message || t('nav_groups.delete_error'));
// // //       }
// // //     }
// // //   };

// // //   // Handle adding a main section
// // //   const addMainSection = () => {
// // //     setNewNavGroup({
// // //       ...newNavGroup,
// // //       main_sections: [
// // //         ...newNavGroup.main_sections,
// // //         { key: '', name_en: '', name_ar: '', subsections: [] },
// // //       ],
// // //     });
// // //   };

// // //   // Handle updating a main section
// // //   const updateMainSection = (index, field, value) => {
// // //     const updatedSections = [...newNavGroup.main_sections];
// // //     updatedSections[index] = { ...updatedSections[index], [field]: value };
// // //     setNewNavGroup({ ...newNavGroup, main_sections: updatedSections });
// // //   };

// // //   // Handle deleting a main section
// // //   const deleteMainSection = (index) => {
// // //     const updatedSections = newNavGroup.main_sections.filter((_, i) => i !== index);
// // //     setNewNavGroup({ ...newNavGroup, main_sections: updatedSections });
// // //   };

// // //   // Handle adding a subsection
// // //   const addSubsection = (sectionIndex) => {
// // //     const updatedSections = [...newNavGroup.main_sections];
// // //     updatedSections[sectionIndex].subsections.push({
// // //       key: '',
// // //       title: '',
// // //       sub_page_variable: '',
// // //       route: '',
// // //     });
// // //     setNewNavGroup({ ...newNavGroup, main_sections: updatedSections });
// // //   };

// // //   // Handle updating a subsection
// // //   const updateSubsection = (sectionIndex, subIndex, field, value) => {
// // //     const updatedSections = [...newNavGroup.main_sections];
// // //     updatedSections[sectionIndex].subsections[subIndex] = {
// // //       ...updatedSections[sectionIndex].subsections[subIndex],
// // //       [field]: value,
// // //     };
// // //     setNewNavGroup({ ...newNavGroup, main_sections: updatedSections });
// // //   };

// // //   // Handle deleting a subsection
// // //   const deleteSubsection = (sectionIndex, subIndex) => {
// // //     const updatedSections = [...newNavGroup.main_sections];
// // //     updatedSections[sectionIndex].subsections = updatedSections[
// // //       sectionIndex
// // //     ].subsections.filter((_, i) => i !== subIndex);
// // //     setNewNavGroup({ ...newNavGroup, main_sections: updatedSections });
// // //   };

// // //   // Get template name by ID or name
// // //   const getTemplateName = (value) => {
// // //     const template = templateNames.find((t) => t._id === value || t.name === value);
// // //     return template ? template.name : t('nav_groups.template_not_found');
// // //   };

// // //   if (authLoading) {
// // //     return <LoadingSpinner />;
// // //   }

// // //   return (
// // //     <div className="flex h-screen overflow-hidden">
// // //       <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
// // //       <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
// // //         <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
// // //         <main>
// // //           <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
// // //             <div className="sm:flex sm:justify-between sm:items-center mb-8">
// // //               <div className="mb-4 sm:mb-0">
// // //                 <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
// // //                   {t('nav_groups.title')}
// // //                 </h1>
// // //               </div>
// // //               <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
// // //                 {hasPrivilege && (
// // //                   <button
// // //                     onClick={initiateCreate}
// // //                     className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded transition duration-200"
// // //                   >
// // //                     {t('nav_groups.add_nav_group')}
// // //                   </button>
// // //                 )}
// // //                 <ModalSearch />
// // //               </div>
// // //             </div>

// // //             {error && (
// // //               <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
// // //                 <span>{error}</span>
// // //                 <button
// // //                   onClick={() => setError('')}
// // //                   className="absolute top-0 right-0 px-4 py-3"
// // //                   aria-label={t('common.dismiss_error')}
// // //                 >
// // //                   <svg className="fill-current h-6 w-6 text-red-500" viewBox="0 0 20 20">
// // //                     <path d="M10 8.586L2.929 1.515 1.515 2.929 8.586 10l-7.071 7.071 1.414 1.414L10 11.414l7.071 7.071 1.414-1.414L11.414 10l7.071-7.071-1.414-1.414L10 8.586z" />
// // //                   </svg>
// // //                 </button>
// // //               </div>
// // //             )}

// // //             {loading ? (
// // //               <LoadingSpinner />
// // //             ) : navGroups.length === 0 ? (
// // //               <div className="text-gray-600 dark:text-gray-300">{t('nav_groups.no_groups')}</div>
// // //             ) : (
// // //               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
// // //                 {navGroups.map((navGroup) => (
// // //                   <div
// // //                     key={navGroup.id}
// // //                     className="bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow duration-200"
// // //                     role="region"
// // //                     aria-label={`${t('nav_groups.nav_group_name')}: ${language === 'en' ? navGroup.name_en : navGroup.name_ar}`}
// // //                   >
// // //                     <div className="space-y-4">
// // //                       <div>
// // //                         <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
// // //                           {t('nav_groups.key')}
// // //                         </span>
// // //                         <p className="text-gray-800 dark:text-gray-100 font-semibold">
// // //                           {navGroup.key}
// // //                         </p>
// // //                       </div>
// // //                       <div>
// // //                         <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
// // //                           {t('nav_groups.nav_group_name')}
// // //                         </span>
// // //                         <p className="text-gray-800 dark:text-gray-100 font-semibold">
// // //                           {language === 'en' ? navGroup.name_en : navGroup.name_ar}
// // //                         </p>
// // //                       </div>
// // //                       <div>
// // //                         <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
// // //                           {t('nav_groups.main_sections')}
// // //                         </span>
// // //                         <ul className="text-gray-800 dark:text-gray-100">
// // //                           {navGroup.main_sections.map((section, index) => (
// // //                             <li key={index} className="mt-1">
// // //                               {language === 'en' ? section.name_en : section.name_ar}
// // //                               {section.subsections.length > 0 && (
// // //                                 <ul className="ml-4 mt-1">
// // //                                   {section.subsections.map((sub, subIndex) => (
// // //                                     <li key={subIndex} className="text-sm">
// // //                                       - {sub.title} ({sub.route}, {getTemplateName(sub.sub_page_variable)})
// // //                                     </li>
// // //                                   ))}
// // //                                 </ul>
// // //                               )}
// // //                             </li>
// // //                           ))}
// // //                         </ul>
// // //                       </div>
// // //                     </div>
// // //                     {hasPrivilege && (
// // //                       <div className="flex justify-end gap-3 mt-4">
// // //                         <button
// // //                           onClick={() => handleEdit(navGroup)}
// // //                           className="flex items-center text-indigo-500 hover:text-indigo-600 text-sm font-medium transition-colors duration-200"
// // //                           aria-label={t('nav_groups.edit')}
// // //                         >
// // //                           <PencilIcon className="w-4 h-4 mr-1" />
// // //                           {t('nav_groups.edit')}
// // //                         </button>
// // //                         <button
// // //                           onClick={() => handleDelete(navGroup.id)}
// // //                           className="flex items-center text-red-500 hover:text-red-600 text-sm font-medium transition-colors duration-200"
// // //                           aria-label={t('nav_groups.delete')}
// // //                         >
// // //                           <TrashIcon className="w-4 h-4 mr-1" />
// // //                           {t('nav_groups.delete')}
// // //                         </button>
// // //                       </div>
// // //                     )}
// // //                   </div>
// // //                 ))}
// // //               </div>
// // //             )}

// // //             {(editingNavGroup || isCreating) && (
// // //               <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
// // //                 <div className="bg-white dark:bg-gray-900 rounded-lg p-8 w-full max-w-2xl shadow-2xl max-h-[80vh] overflow-y-auto">
// // //                   <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
// // //                     {isCreating ? t('nav_groups.add_title') : t('nav_groups.edit_title')}
// // //                   </h2>
// // //                   <form onSubmit={isCreating ? handleSaveNew : handleUpdate} className="space-y-6">
// // //                     <div>
// // //                       <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="key">
// // //                         {t('nav_groups.key')}
// // //                       </label>
// // //                       <input
// // //                         type="text"
// // //                         id="key"
// // //                         value={newNavGroup.key}
// // //                         onChange={(e) => setNewNavGroup({ ...newNavGroup, key: e.target.value })}
// // //                         className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
// // //                         required
// // //                       />
// // //                     </div>
// // //                     <div>
// // //                       <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="name_en">
// // //                         {t('nav_groups.name_en')}
// // //                       </label>
// // //                       <input
// // //                         type="text"
// // //                         id="name_en"
// // //                         value={newNavGroup.name_en}
// // //                         onChange={(e) => setNewNavGroup({ ...newNavGroup, name_en: e.target.value })}
// // //                         className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
// // //                         required
// // //                       />
// // //                     </div>
// // //                     <div>
// // //                       <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="name_ar">
// // //                         {t('nav_groups.name_ar')}
// // //                       </label>
// // //                       <input
// // //                         type="text"
// // //                         id="name_ar"
// // //                         value={newNavGroup.name_ar}
// // //                         onChange={(e) => setNewNavGroup({ ...newNavGroup, name_ar: e.target.value })}
// // //                         className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
// // //                         required
// // //                       />
// // //                     </div>
// // //                     <div>
// // //                       <div className="flex justify-between items-center mb-4">
// // //                         <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold">
// // //                           {t('nav_groups.main_sections')}
// // //                         </label>
// // //                         <button
// // //                           type="button"
// // //                           onClick={addMainSection}
// // //                           className="flex items-center bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-2 rounded transition duration-200"
// // //                         >
// // //                           <PlusIcon className="w-4 h-4 mr-1" />
// // //                           {t('nav_groups.add_section')}
// // //                         </button>
// // //                       </div>
// // //                       {newNavGroup.main_sections.map((section, index) => (
// // //                         <div key={index} className="border border-gray-300 dark:border-gray-600 p-4 rounded mb-4">
// // //                           <div className="flex justify-between items-center mb-2">
// // //                             <h3 className="text-gray-700 dark:text-gray-300 font-bold">
// // //                               {t('nav_groups.section')} {index + 1}
// // //                             </h3>
// // //                             <button
// // //                               type="button"
// // //                               onClick={() => deleteMainSection(index)}
// // //                               className="flex items-center text-red-500 hover:text-red-600 text-sm font-medium"
// // //                             >
// // //                               <TrashIcon className="w-4 h-4 mr-1" />
// // //                               {t('nav_groups.delete_section')}
// // //                             </button>
// // //                           </div>
// // //                           <div className="space-y-4">
// // //                             <div>
// // //                               <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor={`section-key-${index}`}>
// // //                                 {t('nav_groups.section_key')}
// // //                               </label>
// // //                               <input
// // //                                 type="text"
// // //                                 id={`section-key-${index}`}
// // //                                 value={section.key}
// // //                                 onChange={(e) => updateMainSection(index, 'key', e.target.value)}
// // //                                 className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
// // //                                 required
// // //                               />
// // //                             </div>
// // //                             <div>
// // //                               <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor={`section-name_en-${index}`}>
// // //                                 {t('nav_groups.section_name_en')}
// // //                               </label>
// // //                               <input
// // //                                 type="text"
// // //                                 id={`section-name_en-${index}`}
// // //                                 value={section.name_en}
// // //                                 onChange={(e) => updateMainSection(index, 'name_en', e.target.value)}
// // //                                 className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
// // //                                 required
// // //                               />
// // //                             </div>
// // //                             <div>
// // //                               <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor={`section-name_ar-${index}`}>
// // //                                 {t('nav_groups.section_name_ar')}
// // //                               </label>
// // //                               <input
// // //                                 type="text"
// // //                                 id={`section-name_ar-${index}`}
// // //                                 value={section.name_ar}
// // //                                 onChange={(e) => updateMainSection(index, 'name_ar', e.target.value)}
// // //                                 className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
// // //                                 required
// // //                               />
// // //                             </div>
// // //                             <div>
// // //                               <div className="flex justify-between items-center mb-2">
// // //                                 <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold">
// // //                                   {t('nav_groups.subsections')}
// // //                                 </label>
// // //                                 <button
// // //                                   type="button"
// // //                                   onClick={() => addSubsection(index)}
// // //                                   className="flex items-center bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-2 rounded transition duration-200"
// // //                                 >
// // //                                   <PlusIcon className="w-4 h-4 mr-1" />
// // //                                   {t('nav_groups.add_subsection')}
// // //                                 </button>
// // //                               </div>
// // //                               {section.subsections.map((sub, subIndex) => (
// // //                                 <div key={subIndex} className="border border-gray-300 dark:border-gray-600 p-4 rounded mb-2">
// // //                                   <div className="flex justify-between items-center mb-2">
// // //                                     <h4 className="text-gray-700 dark:text-gray-300 font-bold">
// // //                                       {t('nav_groups.subsection')} {subIndex + 1}
// // //                                     </h4>
// // //                                     <button
// // //                                       type="button"
// // //                                       onClick={() => deleteSubsection(index, subIndex)}
// // //                                       className="flex items-center text-red-500 hover:text-red-600 text-sm font-medium"
// // //                                     >
// // //                                       <TrashIcon className="w-4 h-4 mr-1" />
// // //                                       {t('nav_groups.delete_subsection')}
// // //                                     </button>
// // //                                   </div>
// // //                                   <div className="space-y-4">
// // //                                     <div>
// // //                                       <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor={`sub-key-${index}-${subIndex}`}>
// // //                                         {t('nav_groups.subsection_key')}
// // //                                       </label>
// // //                                       <input
// // //                                         type="text"
// // //                                         id={`sub-key-${index}-${subIndex}`}
// // //                                         value={sub.key}
// // //                                         onChange={(e) => updateSubsection(index, subIndex, 'key', e.target.value)}
// // //                                         className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
// // //                                         required
// // //                                       />
// // //                                     </div>
// // //                                     <div>
// // //                                       <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor={`sub-title-${index}-${subIndex}`}>
// // //                                         {t('nav_groups.subsection_title')}
// // //                                       </label>
// // //                                       <input
// // //                                         type="text"
// // //                                         id={`sub-title-${index}-${subIndex}`}
// // //                                         value={sub.title}
// // //                                         onChange={(e) => updateSubsection(index, subIndex, 'title', e.target.value)}
// // //                                         className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
// // //                                         required
// // //                                       />
// // //                                     </div>
// // //                                     <div>
// // //                                       <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor={`sub-page-var-${index}-${subIndex}`}>
// // //                                         {t('nav_groups.subsection_sub_page_variable')}
// // //                                       </label>
// // //                                       <select
// // //                                         id={`sub-page-var-${index}-${subIndex}`}
// // //                                         value={sub.sub_page_variable}
// // //                                         onChange={(e) => updateSubsection(index, subIndex, 'sub_page_variable', e.target.value)}
// // //                                         className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
// // //                                         required
// // //                                       >
// // //                                         <option value="">{t('nav_groups.select_template')}</option>
// // //                                         {templateNames.map((template) => (
// // //                                           <option key={template._id} value={template._id}>
// // //                                             {template.name}
// // //                                           </option>
// // //                                         ))}
// // //                                       </select>
// // //                                     </div>
// // //                                     <div>
// // //                                       <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor={`sub-route-${index}-${subIndex}`}>
// // //                                         {t('nav_groups.subsection_route')}
// // //                                       </label>
// // //                                       <input
// // //                                         type="text"
// // //                                         id={`sub-route-${index}-${subIndex}`}
// // //                                         value={sub.route}
// // //                                         onChange={(e) => updateSubsection(index, subIndex, 'route', e.target.value)}
// // //                                         className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
// // //                                         required
// // //                                       />
// // //                                     </div>
// // //                                   </div>
// // //                                 </div>
// // //                               ))}
// // //                             </div>
// // //                           </div>
// // //                         </div>
// // //                       ))}
// // //                     </div>
// // //                     <div className="flex justify-end gap-3">
// // //                       <button
// // //                         type="button"
// // //                         onClick={() => {
// // //                           setEditingNavGroup(null);
// // //                           setIsCreating(false);
// // //                         }}
// // //                         className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded transition duration-200"
// // //                       >
// // //                         {t('nav_groups.cancel')}
// // //                       </button>
// // //                       <button
// // //                         type="submit"
// // //                         className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded transition duration-200"
// // //                       >
// // //                         {isCreating ? t('nav_groups.create') : t('nav_groups.save')}
// // //                       </button>
// // //                     </div>
// // //                   </form>
// // //                 </div>
// // //               </div>
// // //             )}
// // //           </div>
// // //         </main>
// // //       </div>
// // //     </div>
// // //   );
// // // };

// // // export default NavBarManagement;
// // import React, { useState, useEffect } from 'react';
// // import { useAuth } from '../../context/AuthContext';
// // import { useLanguage } from '../../context/LanguageContext';
// // import { navBarService } from '../../lib/navBarService';
// // import ModalSearch from '../../components/ModalSearch';
// // import Header from '../../partials/Header';
// // import Sidebar from '../../partials/Sidebar';
// // import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
// // import LoadingSpinner from '../../components/LoadingSpinner';

// // const NavBarManagement = () => {
// //   const { authData, loading: authLoading } = useAuth();
// //   const { language, t } = useLanguage();
// //   const [navGroups, setNavGroups] = useState([]);
// //   const [editingNavGroup, setEditingNavGroup] = useState(null);
// //   const [newNavGroup, setNewNavGroup] = useState({
// //     key: '',
// //     name_en: '',
// //     name_ar: '',
// //     main_sections: [],
// //   });
// //   const [templateNames, setTemplateNames] = useState([]);
// //   const [error, setError] = useState('');
// //   const [loading, setLoading] = useState(true);
// //   const [sidebarOpen, setSidebarOpen] = useState(false);
// //   const [isCreating, setIsCreating] = useState(false);
// //   const [hasPrivilege, setHasPrivilege] = useState(false);
// //   const [selectedNavGroup, setSelectedNavGroup] = useState(null);

// //   // Check authentication and privileges
// //   useEffect(() => {
// //     if (authLoading) return;

// //     if (!authData?.access_token) {
// //       setError(t('nav_groups.no_permission'));
// //       setLoading(false);
// //       return;
// //     }

// //     if (authData.privilege_ids.includes(1)) {
// //       setHasPrivilege(true);
// //     } else {
// //       setError(t('nav_groups.no_permission'));
// //       setLoading(false);
// //     }
// //   }, [authData, authLoading, t]);

// //   // Fetch navigation groups
// //   const fetchNavGroups = async () => {
// //     if (!authData?.org_id || !hasPrivilege) {
// //       setLoading(false);
// //       return;
// //     }

// //     setLoading(true);
// //     try {
// //       const templates = await navBarService.getTemplateNames();
// //       setTemplateNames(templates);

// //       const data = await navBarService.getNavGroups(authData.org_id);
// //       const mappedData = data.map((group) => ({
// //         ...group,
// //         main_sections: group.main_sections.map((section) => ({
// //           ...section,
// //           subsections: section.subsections.map((sub) => {
// //             const template = templates.find((t) => t.name === sub.sub_page_variable || t._id === sub.sub_page_variable);
// //             return {
// //               ...sub,
// //               sub_page_variable: template ? template._id : '',
// //             };
// //           }),
// //         })),
// //       }));

// //       if (process.env.NODE_ENV !== 'production') {
// //         console.debug('Fetched and mapped navigation groups:', mappedData);
// //       }
// //       setNavGroups(mappedData);
// //       setSelectedNavGroup(mappedData[0] || null);
// //       setError('');
// //     } catch (err) {
// //       console.error('Error fetching navigation groups:', err.message);
// //       setError(err.message || t('nav_groups.fetch_error'));
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   useEffect(() => {
// //     if (hasPrivilege && authData?.org_id) {
// //       fetchNavGroups();
// //     }
// //   }, [authData, hasPrivilege]);

// //   useEffect(() => {
// //     if (isCreating || editingNavGroup) {
// //       const fetchTemplates = async () => {
// //         try {
// //           const templates = await navBarService.getTemplateNames();
// //           setTemplateNames(templates);
// //         } catch (err) {
// //           console.error('Error fetching template names:', err.message);
// //           setError(err.message || t('nav_groups.fetch_templates_error'));
// //         }
// //       };
// //       fetchTemplates();
// //     }
// //   }, [isCreating, editingNavGroup, t]);

// //   const handleEdit = async (navGroup) => {
// //     if (!hasPrivilege) {
// //       setError(t('nav_groups.no_permission'));
// //       return;
// //     }

// //     try {
// //       const data = await navBarService.getNavGroup(navGroup.id, authData.org_id);
// //       const templates = templateNames.length ? templateNames : await navBarService.getTemplateNames();
// //       const mappedData = {
// //         ...data,
// //         main_sections: data.main_sections.map((section) => ({
// //           ...section,
// //           subsections: section.subsections.map((sub) => {
// //             const template = templates.find((t) => t.name === sub.sub_page_variable || t._id === sub.sub_page_variable);
// //             return {
// //               ...sub,
// //               sub_page_variable: template ? template._id : '',
// //             };
// //           }),
// //         })),
// //       };

// //       if (process.env.NODE_ENV !== 'production') {
// //         console.debug('Fetched and mapped navigation group for edit:', mappedData);
// //       }
// //       setEditingNavGroup(navGroup);
// //       setNewNavGroup({
// //         key: mappedData.key,
// //         name_en: mappedData.name_en,
// //         name_ar: mappedData.name_ar,
// //         main_sections: mappedData.main_sections,
// //       });
// //     } catch (err) {
// //       console.error('Error fetching navigation group for edit:', err.message);
// //       setError(err.message || t('nav_groups.fetch_edit_error'));
// //     }
// //   };

// //   const initiateCreate = () => {
// //     if (!hasPrivilege) {
// //       setError(t('nav_groups.no_permission'));
// //       return;
// //     }

// //     setIsCreating(true);
// //     setNewNavGroup({
// //       key: '',
// //       name_en: '',
// //       name_ar: '',
// //       main_sections: [],
// //     });
// //   };

// //   const handleUpdate = async (e) => {
// //     e.preventDefault();
// //     if (!hasPrivilege) return;

// //     try {
// //       const invalidSubsection = newNavGroup.main_sections.some((section) =>
// //         section.subsections.some((sub) => {
// //           if (!sub.sub_page_variable) return true;
// //           return !templateNames.some((t) => t._id === sub.sub_page_variable);
// //         })
// //       );
// //       if (invalidSubsection) {
// //         throw new Error(t('nav_groups.invalid_template'));
// //       }

// //       if (process.env.NODE_ENV !== 'production') {
// //         console.debug('Updating navigation group with payload:', newNavGroup);
// //       }
// //       await navBarService.updateNavGroup(
// //         editingNavGroup.id,
// //         newNavGroup,
// //         authData.org_id
// //       );
// //       setEditingNavGroup(null);
// //       setNewNavGroup({ key: '', name_en: '', name_ar: '', main_sections: [] });
// //       fetchNavGroups();
// //     } catch (err) {
// //       console.error('Error updating navigation group:', err.message);
// //       setError(err.message || t('nav_groups.update_error'));
// //     }
// //   };

// //   const handleSaveNew = async (e) => {
// //     e.preventDefault();
// //     if (!hasPrivilege) return;

// //     try {
// //       const invalidSubsection = newNavGroup.main_sections.some((section) =>
// //         section.subsections.some((sub) => {
// //           if (!sub.sub_page_variable) return true;
// //           return !templateNames.some((t) => t._id === sub.sub_page_variable);
// //         })
// //       );
// //       if (invalidSubsection) {
// //         throw new Error(t('nav_groups.invalid_template'));
// //       }

// //       if (process.env.NODE_ENV !== 'production') {
// //         console.debug('Creating navigation group with payload:', newNavGroup);
// //       }
// //       await navBarService.createNavGroup(newNavGroup, authData.org_id);
// //       setIsCreating(false);
// //       setNewNavGroup({ key: '', name_en: '', name_ar: '', main_sections: [] });
// //       fetchNavGroups();
// //     } catch (err) {
// //       console.error('Error creating navigation group:', err.message);
// //       setError(err.message || t('nav_groups.create_error'));
// //     }
// //   };

// //   const handleDelete = async (id) => {
// //     if (!hasPrivilege) return;

// //     if (window.confirm(t('nav_groups.delete_confirm'))) {
// //       try {
// //         await navBarService.deleteNavGroup(id, authData.org_id);
// //         if (process.env.NODE_ENV !== 'production') {
// //           console.debug('Deleted navigation group:', id);
// //         }
// //         fetchNavGroups();
// //       } catch (err) {
// //         console.error('Error deleting navigation group:', err.message);
// //         setError(err.message || t('nav_groups.delete_error'));
// //       }
// //     }
// //   };

// //   const addMainSection = () => {
// //     setNewNavGroup({
// //       ...newNavGroup,
// //       main_sections: [
// //         ...newNavGroup.main_sections,
// //         { key: '', name_en: '', name_ar: '', subsections: [] },
// //       ],
// //     });
// //   };

// //   const updateMainSection = (index, field, value) => {
// //     const updatedSections = [...newNavGroup.main_sections];
// //     updatedSections[index] = { ...updatedSections[index], [field]: value };
// //     setNewNavGroup({ ...newNavGroup, main_sections: updatedSections });
// //   };

// //   const deleteMainSection = (index) => {
// //     const updatedSections = newNavGroup.main_sections.filter((_, i) => i !== index);
// //     setNewNavGroup({ ...newNavGroup, main_sections: updatedSections });
// //   };

// //   const addSubsection = (sectionIndex) => {
// //     const updatedSections = [...newNavGroup.main_sections];
// //     updatedSections[sectionIndex].subsections.push({
// //       key: '',
// //       title: '',
// //       sub_page_variable: '',
// //       route: '',
// //     });
// //     setNewNavGroup({ ...newNavGroup, main_sections: updatedSections });
// //   };

// //   const updateSubsection = (sectionIndex, subIndex, field, value) => {
// //     const updatedSections = [...newNavGroup.main_sections];
// //     updatedSections[sectionIndex].subsections[subIndex] = {
// //       ...updatedSections[sectionIndex].subsections[subIndex],
// //       [field]: value,
// //     };
// //     setNewNavGroup({ ...newNavGroup, main_sections: updatedSections });
// //   };

// //   const deleteSubsection = (sectionIndex, subIndex) => {
// //     const updatedSections = [...newNavGroup.main_sections];
// //     updatedSections[sectionIndex].subsections = updatedSections[
// //       sectionIndex
// //     ].subsections.filter((_, i) => i !== subIndex);
// //     setNewNavGroup({ ...newNavGroup, main_sections: updatedSections });
// //   };

// //   const getTemplateName = (value) => {
// //     const template = templateNames.find((t) => t._id === value || t.name === value);
// //     return template ? template.name : t('nav_groups.template_not_found');
// //   };

// //   if (authLoading) {
// //     return <LoadingSpinner />;
// //   }

// //   return (
// //     <div className="flex h-screen overflow-hidden">
// //       <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
// //       <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
// //         <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
// //         <main>
// //           <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
// //             <div className="sm:flex sm:justify-between sm:items-center mb-8">
// //               <div className="mb-4 sm:mb-0">
// //                 <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
// //                   {t('nav_groups.title')}
// //                 </h1>
// //               </div>
// //               <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
// //                 {hasPrivilege && (
// //                   <button
// //                     onClick={initiateCreate}
// //                     className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded transition duration-200"
// //                   >
// //                     {t('nav_groups.add_nav_group')}
// //                   </button>
// //                 )}
// //                 <ModalSearch />
// //               </div>
// //             </div>

// //             {error && (
// //               <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
// //                 <span>{error}</span>
// //                 <button
// //                   onClick={() => setError('')}
// //                   className="absolute top-0 right-0 px-4 py-3"
// //                   aria-label={t('common.dismiss_error')}
// //                 >
// //                   <svg className="fill-current h-6 w-6 text-red-500" viewBox="0 0 20 20">
// //                     <path d="M10 8.586L2.929 1.515 1.515 2.929 8.586 10l-7.071 7.071 1.414 1.414L10 11.414l7.071 7.071 1.414-1.414L11.414 10l7.071-7.071-1.414-1.414L10 8.586z" />
// //                   </svg>
// //                 </button>
// //               </div>
// //             )}

// //             <div className="flex flex-col lg:flex-row gap-6">
// //               {/* Left Section: Cards View */}
// //               <div className="lg:w-1/2">
// //                 {loading ? (
// //                   <LoadingSpinner />
// //                 ) : navGroups.length === 0 ? (
// //                   <div className="text-gray-600 dark:text-gray-300">{t('nav_groups.no_groups')}</div>
// //                 ) : (
// //                   <div className="grid grid-cols-1 gap-6">
// //                     {navGroups.map((navGroup) => (
// //                       <div
// //                         key={navGroup.id}
// //                         className={`bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow duration-200 cursor-pointer ${
// //                           selectedNavGroup?.id === navGroup.id ? 'ring-2 ring-indigo-500' : ''
// //                         }`}
// //                         role="region"
// //                         aria-label={`${t('nav_groups.nav_group_name')}: ${language === 'en' ? navGroup.name_en : navGroup.name_ar}`}
// //                         onClick={() => setSelectedNavGroup(navGroup)}
// //                       >
// //                         <div className="space-y-4">
// //                           <div>
// //                             <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
// //                               {t('nav_groups.key')}
// //                             </span>
// //                             <p className="text-gray-800 dark:text-gray-100 font-semibold">
// //                               {navGroup.key}
// //                             </p>
// //                           </div>
// //                           <div>
// //                             <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
// //                               {t('nav_groups.nav_group_name')}
// //                             </span>
// //                             <p className="text-gray-800 dark:text-gray-100 font-semibold">
// //                               {language === 'en' ? navGroup.name_en : navGroup.name_ar}
// //                             </p>
// //                           </div>
// //                           <div>
// //                             <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
// //                               {t('nav_groups.main_sections')}
// //                             </span>
// //                             <ul className="text-gray-800 dark:text-gray-100">
// //                               {navGroup.main_sections.map((section, index) => (
// //                                 <li key={index} className="mt-1">
// //                                   {language === 'en' ? section.name_en : section.name_ar}
// //                                   {section.subsections.length > 0 && (
// //                                     <ul className="ml-4 mt-1">
// //                                       {section.subsections.map((sub, subIndex) => (
// //                                         <li key={subIndex} className="text-sm">
// //                                           - {sub.title} ({sub.route}, {getTemplateName(sub.sub_page_variable)})
// //                                         </li>
// //                                       ))}
// //                                     </ul>
// //                                   )}
// //                                 </li>
// //                               ))}
// //                             </ul>
// //                           </div>
// //                         </div>
// //                         {hasPrivilege && (
// //                           <div className="flex justify-end gap-3 mt-4">
// //                             <button
// //                               onClick={(e) => {
// //                                 e.stopPropagation();
// //                                 handleEdit(navGroup);
// //                               }}
// //                               className="flex items-center text-indigo-500 hover:text-indigo-600 text-sm font-medium transition-colors duration-200"
// //                               aria-label={t('nav_groups.edit')}
// //                             >
// //                               <PencilIcon className="w-4 h-4 mr-1" />
// //                               {t('nav_groups.edit')}
// //                             </button>
// //                             <button
// //                               onClick={(e) => {
// //                                 e.stopPropagation();
// //                                 handleDelete(navGroup.id);
// //                               }}
// //                               className="flex items-center text-red-500 hover:text-red-600 text-sm font-medium transition-colors duration-200"
// //                               aria-label={t('nav_groups.delete')}
// //                             >
// //                               <TrashIcon className="w-4 h-4 mr-1" />
// //                               {t('nav_groups.delete')}
// //                             </button>
// //                           </div>
// //                         )}
// //                       </div>
// //                     ))}
// //                   </div>
// //                 )}
// //               </div>

// //               {/* Right Section: Mobile Navdrawer View */}
// //               <div className="lg:w-1/2">
// //                 <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
// //                   Mobile Navdrawer View
// //                 </h2>
// //                 <div className="flex justify-center">
// //                   <div className="relative w-[300px] h-[600px] bg-gray-100 dark:bg-gray-700 rounded-3xl shadow-xl overflow-hidden border-8 border-gray-800 dark:border-gray-900">
// //                     {/* Mobile Header */}
// //                     <div className="absolute top-0 left-0 right-0 h-12 bg-gray-800 dark:bg-gray-900 flex items-center justify-between px-4">
// //                       <span className="text-white text-sm font-semibold">
// //                         {selectedNavGroup ? (language === 'en' ? selectedNavGroup.name_en : selectedNavGroup.name_ar) : t('nav_groups.no_group_selected')}
// //                       </span>
// //                       <button className="text-white">
// //                         <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
// //                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
// //                         </svg>
// //                       </button>
// //                     </div>
// //                     {/* Mobile Content */}
// //                     <div className="mt-12 h-full bg-white dark:bg-gray-800 overflow-y-auto">
// //                       {selectedNavGroup ? (
// //                         <ul className="p-4">
// //                           {selectedNavGroup.main_sections.map((section, index) => (
// //                             <li key={index} className="mb-4">
// //                               <div className="text-gray-800 dark:text-gray-100 font-semibold">
// //                                 {language === 'en' ? section.name_en : section.name_ar}
// //                               </div>
// //                               {section.subsections.length > 0 && (
// //                                 <ul className="ml-4 mt-2">
// //                                   {section.subsections.map((sub, subIndex) => (
// //                                     <li key={subIndex} className="text-gray-600 dark:text-gray-300 text-sm py-1">
// //                                       {sub.title}
// //                                     </li>
// //                                   ))}
// //                                 </ul>
// //                               )}
// //                             </li>
// //                           ))}
// //                         </ul>
// //                       ) : (
// //                         <div className="p-4 text-gray-600 dark:text-gray-300 text-center">
// //                           {t('nav_groups.select_group_to_preview')}
// //                         </div>
// //                       )}
// //                     </div>
// //                   </div>
// //                 </div>
// //               </div>
// //             </div>

// //             {(editingNavGroup || isCreating) && (
// //               <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
// //                 <div className="bg-white dark:bg-gray-900 rounded-lg p-8 w-full max-w-2xl shadow-2xl max-h-[80vh] overflow-y-auto">
// //                   <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
// //                     {isCreating ? t('nav_groups.add_title') : t('nav_groups.edit_title')}
// //                   </h2>
// //                   <form onSubmit={isCreating ? handleSaveNew : handleUpdate} className="space-y-6">
// //                     <div>
// //                       <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="key">
// //                         {t('nav_groups.key')}
// //                       </label>
// //                       <input
// //                         type="text"
// //                         id="key"
// //                         value={newNavGroup.key}
// //                         onChange={(e) => setNewNavGroup({ ...newNavGroup, key: e.target.value })}
// //                         className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
// //                         required
// //                       />
// //                     </div>
// //                     <div>
// //                       <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="name_en">
// //                         {t('nav_groups.name_en')}
// //                       </label>
// //                       <input
// //                         type="text"
// //                         id="name_en"
// //                         value={newNavGroup.name_en}
// //                         onChange={(e) => setNewNavGroup({ ...newNavGroup, name_en: e.target.value })}
// //                         className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
// //                         required
// //                       />
// //                     </div>
// //                     <div>
// //                       <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="name_ar">
// //                         {t('nav_groups.name_ar')}
// //                       </label>
// //                       <input
// //                         type="text"
// //                         id="name_ar"
// //                         value={newNavGroup.name_ar}
// //                         onChange={(e) => setNewNavGroup({ ...newNavGroup, name_ar: e.target.value })}
// //                         className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
// //                         required
// //                       />
// //                     </div>
// //                     <div>
// //                       <div className="flex justify-between items-center mb-4">
// //                         <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold">
// //                           {t('nav_groups.main_sections')}
// //                         </label>
// //                         <button
// //                           type="button"
// //                           onClick={addMainSection}
// //                           className="flex items-center bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-2 rounded transition duration-200"
// //                         >
// //                           <PlusIcon className="w-4 h-4 mr-1" />
// //                           {t('nav_groups.add_section')}
// //                         </button>
// //                       </div>
// //                       {newNavGroup.main_sections.map((section, index) => (
// //                         <div key={index} className="border border-gray-300 dark:border-gray-600 p-4 rounded mb-4">
// //                           <div className="flex justify-between items-center mb-2">
// //                             <h3 className="text-gray-700 dark:text-gray-300 font-bold">
// //                               {t('nav_groups.section')} {index + 1}
// //                             </h3>
// //                             <button
// //                               type="button"
// //                               onClick={() => deleteMainSection(index)}
// //                               className="flex items-center text-red-500 hover:text-red-600 text-sm font-medium"
// //                             >
// //                               <TrashIcon className="w-4 h-4 mr-1" />
// //                               {t('nav_groups.delete_section')}
// //                             </button>
// //                           </div>
// //                           <div className="space-y-4">
// //                             <div>
// //                               <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor={`section-key-${index}`}>
// //                                 {t('nav_groups.section_key')}
// //                               </label>
// //                               <input
// //                                 type="text"
// //                                 id={`section-key-${index}`}
// //                                 value={section.key}
// //                                 onChange={(e) => updateMainSection(index, 'key', e.target.value)}
// //                                 className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
// //                                 required
// //                               />
// //                             </div>
// //                             <div>
// //                               <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor={`section-name_en-${index}`}>
// //                                 {t('nav_groups.section_name_en')}
// //                               </label>
// //                               <input
// //                                 type="text"
// //                                 id={`section-name_en-${index}`}
// //                                 value={section.name_en}
// //                                 onChange={(e) => updateMainSection(index, 'name_en', e.target.value)}
// //                                 className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
// //                                 required
// //                               />
// //                             </div>
// //                             <div>
// //                               <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor={`section-name_ar-${index}`}>
// //                                 {t('nav_groups.section_name_ar')}
// //                               </label>
// //                               <input
// //                                 type="text"
// //                                 id={`section-name_ar-${index}`}
// //                                 value={section.name_ar}
// //                                 onChange={(e) => updateMainSection(index, 'name_ar', e.target.value)}
// //                                 className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
// //                                 required
// //                               />
// //                             </div>
// //                             <div>
// //                               <div className="flex justify-between items-center mb-2">
// //                                 <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold">
// //                                   {t('nav_groups.subsections')}
// //                                 </label>
// //                                 <button
// //                                   type="button"
// //                                   onClick={() => addSubsection(index)}
// //                                   className="flex items-center bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-2 rounded transition duration-200"
// //                                 >
// //                                   <PlusIcon className="w-4 h-4 mr-1" />
// //                                   {t('nav_groups.add_subsection')}
// //                                 </button>
// //                               </div>
// //                               {section.subsections.map((sub, subIndex) => (
// //                                 <div key={subIndex} className="border border-gray-300 dark:border-gray-600 p-4 rounded mb-2">
// //                                   <div className="flex justify-between items-center mb-2">
// //                                     <h4 className="text-gray-700 dark:text-gray-300 font-bold">
// //                                       {t('nav_groups.subsection')} {subIndex + 1}
// //                                     </h4>
// //                                     <button
// //                                       type="button"
// //                                       onClick={() => deleteSubsection(index, subIndex)}
// //                                       className="flex items-center text-red-500 hover:text-red-600 text-sm font-medium"
// //                                     >
// //                                       <TrashIcon className="w-4 h-4 mr-1" />
// //                                       {t('nav_groups.delete_subsection')}
// //                                     </button>
// //                                   </div>
// //                                   <div className="space-y-4">
// //                                     <div>
// //                                       <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor={`sub-key-${index}-${subIndex}`}>
// //                                         {t('nav_groups.subsection_key')}
// //                                       </label>
// //                                       <input
// //                                         type="text"
// //                                         id={`sub-key-${index}-${subIndex}`}
// //                                         value={sub.key}
// //                                         onChange={(e) => updateSubsection(index, subIndex, 'key', e.target.value)}
// //                                         className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
// //                                         required
// //                                       />
// //                                     </div>
// //                                     <div>
// //                                       <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor={`sub-title-${index}-${subIndex}`}>
// //                                         {t('nav_groups.subsection_title')}
// //                                       </label>
// //                                       <input
// //                                         type="text"
// //                                         id={`sub-title-${index}-${subIndex}`}
// //                                         value={sub.title}
// //                                         onChange={(e) => updateSubsection(index, subIndex, 'title', e.target.value)}
// //                                         className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
// //                                         required
// //                                       />
// //                                     </div>
// //                                     <div>
// //                                       <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor={`sub-page-var-${index}-${subIndex}`}>
// //                                         {t('nav_groups.subsection_sub_page_variable')}
// //                                       </label>
// //                                       <select
// //                                         id={`sub-page-var-${index}-${subIndex}`}
// //                                         value={sub.sub_page_variable}
// //                                         onChange={(e) => updateSubsection(index, subIndex, 'sub_page_variable', e.target.value)}
// //                                         className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
// //                                         required
// //                                       >
// //                                         <option value="">{t('nav_groups.select_template')}</option>
// //                                         {templateNames.map((template) => (
// //                                           <option key={template._id} value={template._id}>
// //                                             {template.name}
// //                                           </option>
// //                                         ))}
// //                                       </select>
// //                                     </div>
// //                                     <div>
// //                                       <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor={`sub-route-${index}-${subIndex}`}>
// //                                         {t('nav_groups.subsection_route')}
// //                                       </label>
// //                                       <input
// //                                         type="text"
// //                                         id={`sub-route-${index}-${subIndex}`}
// //                                         value={sub.route}
// //                                         onChange={(e) => updateSubsection(index, subIndex, 'route', e.target.value)}
// //                                         className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
// //                                         required
// //                                       />
// //                                     </div>
// //                                   </div>
// //                                 </div>
// //                               ))}
// //                             </div>
// //                           </div>
// //                         </div>
// //                       ))}
// //                     </div>
// //                     <div className="flex justify-end gap-3">
// //                       <button
// //                         type="button"
// //                         onClick={() => {
// //                           setEditingNavGroup(null);
// //                           setIsCreating(false);
// //                         }}
// //                         className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded transition duration-200"
// //                       >
// //                         {t('nav_groups.cancel')}
// //                       </button>
// //                       <button
// //                         type="submit"
// //                         className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded transition duration-200"
// //                       >
// //                         {isCreating ? t('nav_groups.create') : t('nav_groups.save')}
// //                       </button>
// //                     </div>
// //                   </form>
// //                 </div>
// //               </div>
// //             )}
// //           </div>
// //         </main>
// //       </div>
// //     </div>
// //   );
// // };

// // export default NavBarManagement;


// // Working 100 





// import React, { useState, useEffect } from 'react';
// import { useAuth } from '../../context/AuthContext';
// import { useLanguage } from '../../context/LanguageContext';
// import { navBarService } from '../../lib/navBarService';
// import ModalSearch from '../../components/ModalSearch';
// import Header from '../../partials/Header';
// import Sidebar from '../../partials/Sidebar';
// import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
// import LoadingSpinner from '../../components/LoadingSpinner';

// const NavBarManagement = () => {
//   const { authData, loading: authLoading } = useAuth();
//   const { language, t } = useLanguage();
//   const [navGroups, setNavGroups] = useState([]);
//   const [editingNavGroup, setEditingNavGroup] = useState(null);
//   const [newNavGroup, setNewNavGroup] = useState({
//     key: 'dynamic_groups',
//     name_en: 'QA Custom',
//     name_ar: 'المجموعات الديناميكية',
//     main_sections: [],
//   });
//   const [templateNames, setTemplateNames] = useState([]);
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(true);
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [isCreating, setIsCreating] = useState(false);
//   const [hasPrivilege, setHasPrivilege] = useState(false);
//   const [selectedNavGroup, setSelectedNavGroup] = useState(null);

//   // Check authentication and privileges
//   useEffect(() => {
//     if (authLoading) return;

//     if (!authData?.access_token) {
//       setError(t('nav_groups.no_permission'));
//       setLoading(false);
//       return;
//     }

//     if (authData.privilege_ids.includes(1)) {
//       setHasPrivilege(true);
//     } else {
//       setError(t('nav_groups.no_permission'));
//       setLoading(false);
//     }
//   }, [authData, authLoading, t]);

//   // Fetch navigation groups
//   const fetchNavGroups = async () => {
//     if (!authData?.org_id || !hasPrivilege) {
//       setLoading(false);
//       return;
//     }

//     setLoading(true);
//     try {
//       const templates = await navBarService.getTemplateNames();
//       setTemplateNames(templates);

//       const data = await navBarService.getNavGroups(authData.org_id);
//       const mappedData = data.map((group) => ({
//         ...group,
//         main_sections: group.main_sections.map((section) => ({
//           ...section,
//           subsections: section.subsections.map((sub) => {
//             const template = templates.find((t) => t.name === sub.sub_page_variable || t._id === sub.sub_page_variable);
//             return {
//               ...sub,
//               sub_page_variable: template ? template._id : '',
//             };
//           }),
//         })),
//       }));

//       if (process.env.NODE_ENV !== 'production') {
//         console.debug('Fetched and mapped navigation groups:', mappedData);
//       }
//       setNavGroups(mappedData);
//       setSelectedNavGroup(mappedData[0] || null);
//       setError('');
//     } catch (err) {
//       console.error('Error fetching navigation groups:', err.message);
//       setError(err.message || t('nav_groups.fetch_error'));
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (hasPrivilege && authData?.org_id) {
//       fetchNavGroups();
//     }
//   }, [authData, hasPrivilege]);

//   useEffect(() => {
//     if (isCreating || editingNavGroup) {
//       const fetchTemplates = async () => {
//         try {
//           const templates = await navBarService.getTemplateNames();
//           setTemplateNames(templates);
//         } catch (err) {
//           console.error('Error fetching template names:', err.message);
//           setError(err.message || t('nav_groups.fetch_templates_error'));
//         }
//       };
//       fetchTemplates();
//     }
//   }, [isCreating, editingNavGroup, t]);

//   const handleEdit = async (navGroup) => {
//     if (!hasPrivilege) {
//       setError(t('nav_groups.no_permission'));
//       return;
//     }

//     try {
//       const data = await navBarService.getNavGroup(navGroup.id, authData.org_id);
//       const templates = templateNames.length ? templateNames : await navBarService.getTemplateNames();
//       const mappedData = {
//         ...data,
//         // Override with static values
//         key: 'dynamic_groups',
//         name_en: 'QA Custom',
//         name_ar: 'المجموعات الديناميكية',
//         main_sections: data.main_sections.map((section) => ({
//           ...section,
//           // Ensure section key matches name_en
//           key: section.name_en,
//           subsections: section.subsections.map((sub) => {
//             const template = templates.find((t) => t.name === sub.sub_page_variable || t._id === sub.sub_page_variable);
//             return {
//               ...sub,
//               sub_page_variable: template ? template._id : '',
//               // Ensure subsection key matches title and route is /dyn
//               key: sub.title,
//               route: '/dyn',
//             };
//           }),
//         })),
//       };

//       if (process.env.NODE_ENV !== 'production') {
//         console.debug('Fetched and mapped navigation group for edit:', mappedData);
//       }
//       setEditingNavGroup(navGroup);
//       setNewNavGroup(mappedData);
//     } catch (err) {
//       console.error('Error fetching navigation group for edit:', err.message);
//       setError(err.message || t('nav_groups.fetch_edit_error'));
//     }
//   };

//   const initiateCreate = () => {
//     if (!hasPrivilege) {
//       setError(t('nav_groups.no_permission'));
//       return;
//     }

//     setIsCreating(true);
//     setNewNavGroup({
//       key: 'dynamic_groups',
//       name_en: 'QA Custom',
//       name_ar: 'المجموعات الديناميكية',
//       main_sections: [],
//     });
//   };

//   const handleUpdate = async (e) => {
//     e.preventDefault();
//     if (!hasPrivilege) return;

//     try {
//       const invalidSubsection = newNavGroup.main_sections.some((section) =>
//         section.subsections.some((sub) => {
//           if (!sub.sub_page_variable) return true;
//           return !templateNames.some((t) => t._id === sub.sub_page_variable);
//         })
//       );
//       if (invalidSubsection) {
//         throw new Error(t('nav_groups.invalid_template'));
//       }

//       // Ensure static values are sent
//       const payload = {
//         ...newNavGroup,
//         key: 'dynamic_groups',
//         name_en: 'QA Custom',
//         name_ar: 'المجموعات الديناميكية',
//       };

//       if (process.env.NODE_ENV !== 'production') {
//         console.debug('Updating navigation group with payload:', payload);
//       }
//       await navBarService.updateNavGroup(
//         editingNavGroup.id,
//         payload,
//         authData.org_id
//       );
//       setEditingNavGroup(null);
//       setNewNavGroup({
//         key: 'dynamic_groups',
//         name_en: 'QA Custom',
//         name_ar: 'المجموعات الديناميكية',
//         main_sections: [],
//       });
//       fetchNavGroups();
//     } catch (err) {
//       console.error('Error updating navigation group:', err.message);
//       setError(err.message || t('nav_groups.update_error'));
//     }
//   };

//   const handleSaveNew = async (e) => {
//     e.preventDefault();
//     if (!hasPrivilege) return;

//     try {
//       const invalidSubsection = newNavGroup.main_sections.some((section) =>
//         section.subsections.some((sub) => {
//           if (!sub.sub_page_variable) return true;
//           return !templateNames.some((t) => t._id === sub.sub_page_variable);
//         })
//       );
//       if (invalidSubsection) {
//         throw new Error(t('nav_groups.invalid_template'));
//       }

//       // Ensure static values are sent
//       const payload = {
//         ...newNavGroup,
//         key: 'dynamic_groups',
//         name_en: 'QA Custom',
//         name_ar: 'المجموعات الديناميكية',
//       };

//       if (process.env.NODE_ENV !== 'production') {
//         console.debug('Creating navigation group with payload:', payload);
//       }
//       await navBarService.createNavGroup(payload, authData.org_id);
//       setIsCreating(false);
//       setNewNavGroup({
//         key: 'dynamic_groups',
//         name_en: 'QA Custom',
//         name_ar: 'المجموعات الديناميكية',
//         main_sections: [],
//       });
//       fetchNavGroups();
//     } catch (err) {
//       console.error('Error creating navigation group:', err.message);
//       setError(err.message || t('nav_groups.create_error'));
//     }
//   };

//   const handleDelete = async (id) => {
//     if (!hasPrivilege) return;

//     if (window.confirm(t('nav_groups.delete_confirm'))) {
//       try {
//         await navBarService.deleteNavGroup(id, authData.org_id);
//         if (process.env.NODE_ENV !== 'production') {
//           console.debug('Deleted navigation group:', id);
//         }
//         fetchNavGroups();
//       } catch (err) {
//         console.error('Error deleting navigation group:', err.message);
//         setError(err.message || t('nav_groups.delete_error'));
//       }
//     }
//   };

//   const addMainSection = () => {
//     setNewNavGroup({
//       ...newNavGroup,
//       main_sections: [
//         ...newNavGroup.main_sections,
//         { key: '', name_en: '', name_ar: '', subsections: [] },
//       ],
//     });
//   };

//   const updateMainSection = (index, field, value) => {
//     const updatedSections = [...newNavGroup.main_sections];
//     updatedSections[index] = { ...updatedSections[index], [field]: value };
//     // If updating name_en, set key to match name_en
//     if (field === 'name_en') {
//       updatedSections[index].key = value;
//     }
//     setNewNavGroup({ ...newNavGroup, main_sections: updatedSections });
//   };

//   const deleteMainSection = (index) => {
//     const updatedSections = newNavGroup.main_sections.filter((_, i) => i !== index);
//     setNewNavGroup({ ...newNavGroup, main_sections: updatedSections });
//   };

//   const addSubsection = (sectionIndex) => {
//     const updatedSections = [...newNavGroup.main_sections];
//     updatedSections[sectionIndex].subsections.push({
//       key: '',
//       title: '',
//       sub_page_variable: '',
//       route: '/dyn',
//     });
//     setNewNavGroup({ ...newNavGroup, main_sections: updatedSections });
//   };

//   const updateSubsection = (sectionIndex, subIndex, field, value) => {
//     const updatedSections = [...newNavGroup.main_sections];
//     const updatedSubsection = {
//       ...updatedSections[sectionIndex].subsections[subIndex],
//       [field]: value,
//     };
//     // If updating title, set key to match title
//     if (field === 'title') {
//       updatedSubsection.key = value;
//     }
//     // Ensure route is always /dyn
//     updatedSubsection.route = '/dyn';
//     updatedSections[sectionIndex].subsections[subIndex] = updatedSubsection;
//     setNewNavGroup({ ...newNavGroup, main_sections: updatedSections });
//   };

//   const deleteSubsection = (sectionIndex, subIndex) => {
//     const updatedSections = [...newNavGroup.main_sections];
//     updatedSections[sectionIndex].subsections = updatedSections[
//       sectionIndex
//     ].subsections.filter((_, i) => i !== subIndex);
//     setNewNavGroup({ ...newNavGroup, main_sections: updatedSections });
//   };

//   const getTemplateName = (value) => {
//     const template = templateNames.find((t) => t._id === value || t.name === value);
//     return template ? template.name : t('nav_groups.template_not_found');
//   };

//   if (authLoading) {
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
//               <div className="mb-4 sm:mb-0">
//                 <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
//                   {t('nav_groups.title')}
//                 </h1>
//               </div>
//               <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
//                 {hasPrivilege && (
//                   <button
//                     onClick={initiateCreate}
//                     className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded transition duration-200"
//                   >
//                     {t('nav_groups.add_nav_group')}
//                   </button>
//                 )}
//                 <ModalSearch />
//               </div>
//             </div>

//             {error && (
//               <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
//                 <span>{error}</span>
//                 <button
//                   onClick={() => setError('')}
//                   className="absolute top-0 right-0 px-4 py-3"
//                   aria-label={t('common.dismiss_error')}
//                 >
//                   <svg className="fill-current h-6 w-6 text-red-500" viewBox="0 0 20 20">
//                     <path d="M10 8.586L2.929 1.515 1.515 2.929 8.586 10l-7.071 7.071 1.414 1.414L10 11.414l7.071 7.071 1.414-1.414L11.414 10l7.071-7.071-1.414-1.414L10 8.586z" />
//                   </svg>
//                 </button>
//               </div>
//             )}

//             <div className="flex flex-col lg:flex-row gap-6">
//               {/* Left Section: Cards View */}
//               <div className="lg:w-1/2">
//                 {loading ? (
//                   <LoadingSpinner />
//                 ) : navGroups.length === 0 ? (
//                   <div className="text-gray-600 dark:text-gray-300">{t('nav_groups.no_groups')}</div>
//                 ) : (
//                   <div className="grid grid-cols-1 gap-6">
//                     {navGroups.map((navGroup) => (
//                       <div
//                         key={navGroup.id}
//                         className={`bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow duration-200 cursor-pointer ${
//                           selectedNavGroup?.id === navGroup.id ? 'ring-2 ring-indigo-500' : ''
//                         }`}
//                         role="region"
//                         aria-label={`${t('nav_groups.nav_group_name')}: ${language === 'en' ? navGroup.name_en : navGroup.name_ar}`}
//                         onClick={() => setSelectedNavGroup(navGroup)}
//                       >
//                         <div className="space-y-4">
//                           <div>
//                             <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
//                               {t('nav_groups.key')}
//                             </span>
//                             <p className="text-gray-800 dark:text-gray-100 font-semibold">
//                               {navGroup.key}
//                             </p>
//                           </div>
//                           <div>
//                             <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
//                               {t('nav_groups.nav_group_name')}
//                             </span>
//                             <p className="text-gray-800 dark:text-gray-100 font-semibold">
//                               {language === 'en' ? navGroup.name_en : navGroup.name_ar}
//                             </p>
//                           </div>
//                           <div>
//                             <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
//                               {t('nav_groups.main_sections')}
//                             </span>
//                             <ul className="text-gray-800 dark:text-gray-100">
//                               {navGroup.main_sections.map((section, index) => (
//                                 <li key={index} className="mt-1">
//                                   {language === 'en' ? section.name_en : section.name_ar}
//                                   {section.subsections.length > 0 && (
//                                     <ul className="ml-4 mt-1">
//                                       {section.subsections.map((sub, subIndex) => (
//                                         <li key={subIndex} className="text-sm">
//                                           - {sub.title} ({sub.route}, {getTemplateName(sub.sub_page_variable)})
//                                         </li>
//                                       ))}
//                                     </ul>
//                                   )}
//                                 </li>
//                               ))}
//                             </ul>
//                           </div>
//                         </div>
//                         {hasPrivilege && (
//                           <div className="flex justify-end gap-3 mt-4">
//                             <button
//                               onClick={(e) => {
//                                 e.stopPropagation();
//                                 handleEdit(navGroup);
//                               }}
//                               className="flex items-center text-indigo-500 hover:text-indigo-600 text-sm font-medium transition-colors duration-200"
//                               aria-label={t('nav_groups.edit')}
//                             >
//                               <PencilIcon className="w-4 h-4 mr-1" />
//                               {t('nav_groups.edit')}
//                             </button>
//                             <button
//                               onClick={(e) => {
//                                 e.stopPropagation();
//                                 handleDelete(navGroup.id);
//                               }}
//                               className="flex items-center text-red-500 hover:text-red-600 text-sm font-medium transition-colors duration-200"
//                               aria-label={t('nav_groups.delete')}
//                             >
//                               <TrashIcon className="w-4 h-4 mr-1" />
//                               {t('nav_groups.delete')}
//                             </button>
//                           </div>
//                         )}
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>

//               {/* Right Section: Mobile Navdrawer View */}
//               <div className="lg:w-1/2">
//                 <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
//                   Mobile Navdrawer View
//                 </h2>
//                 <div className="flex justify-center">
//                   <div className="relative w-[300px] h-[600px] bg-gray-100 dark:bg-gray-700 rounded-3xl shadow-xl overflow-hidden border-8 border-gray-800 dark:border-gray-900">
//                     {/* Mobile Header */}
//                     <div className="absolute top-0 left-0 right-0 h-12 bg-gray-800 dark:bg-gray-900 flex items-center justify-between px-4">
//                       <span className="text-white text-sm font-semibold">
//                         {selectedNavGroup ? (language === 'en' ? selectedNavGroup.name_en : selectedNavGroup.name_ar) : t('nav_groups.no_group_selected')}
//                       </span>
//                       <button className="text-white">
//                         <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
//                         </svg>
//                       </button>
//                     </div>
//                     {/* Mobile Content */}
//                     <div className="mt-12 h-full bg-white dark:bg-gray-800 overflow-y-auto">
//                       {selectedNavGroup ? (
//                         <ul className="p-4">
//                           {selectedNavGroup.main_sections.map((section, index) => (
//                             <li key={index} className="mb-4">
//                               <div className="text-gray-800 dark:text-gray-100 font-semibold">
//                                 {language === 'en' ? section.name_en : section.name_ar}
//                               </div>
//                               {section.subsections.length > 0 && (
//                                 <ul className="ml-4 mt-2">
//                                   {section.subsections.map((sub, subIndex) => (
//                                     <li key={subIndex} className="text-gray-600 dark:text-gray-300 text-sm py-1">
//                                       {sub.title}
//                                     </li>
//                                   ))}
//                                 </ul>
//                               )}
//                             </li>
//                           ))}
//                         </ul>
//                       ) : (
//                         <div className="p-4 text-gray-600 dark:text-gray-300 text-center">
//                           {t('nav_groups.select_group_to_preview')}
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {(editingNavGroup || isCreating) && (
//               <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//                 <div className="bg-white dark:bg-gray-900 rounded-lg p-8 w-full max-w-2xl shadow-2xl max-h-[80vh] overflow-y-auto">
//                   <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
//                     {isCreating ? t('nav_groups.add_title') : t('nav_groups.edit_title')}
//                   </h2>
//                   <form onSubmit={isCreating ? handleSaveNew : handleUpdate} className="space-y-6">
//                     <div>
//                       <div className="flex justify-between items-center mb-4">
//                         <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold">
//                           {t('nav_groups.main_sections')}
//                         </label>
//                         <button
//                           type="button"
//                           onClick={addMainSection}
//                           className="flex items-center bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-2 rounded transition duration-200"
//                         >
//                           <PlusIcon className="w-4 h-4 mr-1" />
//                           {t('nav_groups.add_section')}
//                         </button>
//                       </div>
//                       {newNavGroup.main_sections.map((section, index) => (
//                         <div key={index} className="border border-gray-300 dark:border-gray-600 p-4 rounded mb-4">
//                           <div className="flex justify-between items-center mb-2">
//                             <h3 className="text-gray-700 dark:text-gray-300 font-bold">
//                               {t('nav_groups.section')} {index + 1}
//                             </h3>
//                             <button
//                               type="button"
//                               onClick={() => deleteMainSection(index)}
//                               className="flex items-center text-red-500 hover:text-red-600 text-sm font-medium"
//                             >
//                               <TrashIcon className="w-4 h-4 mr-1" />
//                               {t('nav_groups.delete_section')}
//                             </button>
//                           </div>
//                           <div className="space-y-4">
//                             <div>
//                               <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor={`section-name_en-${index}`}>
//                                 {t('nav_groups.section_name_en')}
//                               </label>
//                               <input
//                                 type="text"
//                                 id={`section-name_en-${index}`}
//                                 value={section.name_en}
//                                 onChange={(e) => updateMainSection(index, 'name_en', e.target.value)}
//                                 className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
//                                 required
//                               />
//                             </div>
//                             <div>
//                               <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor={`section-name_ar-${index}`}>
//                                 {t('nav_groups.section_name_ar')}
//                               </label>
//                               <input
//                                 type="text"
//                                 id={`section-name_ar-${index}`}
//                                 value={section.name_ar}
//                                 onChange={(e) => updateMainSection(index, 'name_ar', e.target.value)}
//                                 className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
//                                 required
//                               />
//                             </div>
//                             <div>
//                               <div className="flex justify-between items-center mb-2">
//                                 <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold">
//                                   {t('nav_groups.subsections')}
//                                 </label>
//                                 <button
//                                   type="button"
//                                   onClick={() => addSubsection(index)}
//                                   className="flex items-center bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-2 rounded transition duration-200"
//                                 >
//                                   <PlusIcon className="w-4 h-4 mr-1" />
//                                   {t('nav_groups.add_subsection')}
//                                 </button>
//                               </div>
//                               {section.subsections.map((sub, subIndex) => (
//                                 <div key={subIndex} className="border border-gray-300 dark:border-gray-600 p-4 rounded mb-2">
//                                   <div className="flex justify-between items-center mb-2">
//                                     <h4 className="text-gray-700 dark:text-gray-300 font-bold">
//                                       {t('nav_groups.subsection')} {subIndex + 1}
//                                     </h4>
//                                     <button
//                                       type="button"
//                                       onClick={() => deleteSubsection(index, subIndex)}
//                                       className="flex items-center text-red-500 hover:text-red-600 text-sm font-medium"
//                                     >
//                                       <TrashIcon className="w-4 h-4 mr-1" />
//                                       {t('nav_groups.delete_subsection')}
//                                     </button>
//                                   </div>
//                                   <div className="space-y-4">
//                                     <div>
//                                       <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor={`sub-title-${index}-${subIndex}`}>
//                                         {t('nav_groups.subsection_title')}
//                                       </label>
//                                       <input
//                                         type="text"
//                                         id={`sub-title-${index}-${subIndex}`}
//                                         value={sub.title}
//                                         onChange={(e) => updateSubsection(index, subIndex, 'title', e.target.value)}
//                                         className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
//                                         required
//                                       />
//                                     </div>
//                                     <div>
//                                       <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor={`sub-page-var-${index}-${subIndex}`}>
//                                         {t('nav_groups.subsection_sub_page_variable')}
//                                       </label>
//                                       <select
//                                         id={`sub-page-var-${index}-${subIndex}`}
//                                         value={sub.sub_page_variable}
//                                         onChange={(e) => updateSubsection(index, subIndex, 'sub_page_variable', e.target.value)}
//                                         className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
//                                         required
//                                       >
//                                         <option value="">{t('nav_groups.select_template')}</option>
//                                         {templateNames.map((template) => (
//                                           <option key={template._id} value={template._id}>
//                                             {template.name}
//                                           </option>
//                                         ))}
//                                       </select>
//                                     </div>
//                                   </div>
//                                 </div>
//                               ))}
//                             </div>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                     <div className="flex justify-end gap-3">
//                       <button
//                         type="button"
//                         onClick={() => {
//                           setEditingNavGroup(null);
//                           setIsCreating(false);
//                         }}
//                         className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded transition duration-200"
//                       >
//                         {t('nav_groups.cancel')}
//                       </button>
//                       <button
//                         type="submit"
//                         className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded transition duration-200"
//                       >
//                         {isCreating ? t('nav_groups.create') : t('nav_groups.save')}
//                       </button>
//                     </div>
//                   </form>
//                 </div>
//               </div>
//             )}
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// };

// export default NavBarManagement;

// Befor ORG FIX 


import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { navBarService } from '../../lib/navBarService';
import ModalSearch from '../../components/ModalSearch';
import Header from '../../partials/Header';
import Sidebar from '../../partials/Sidebar';
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/LoadingSpinner';

const NavBarManagement = () => {
  const { authData, loading: authLoading } = useAuth();
  const { language, t } = useLanguage();
  const [navGroups, setNavGroups] = useState([]);
  const [editingNavGroup, setEditingNavGroup] = useState(null);
  const [newNavGroup, setNewNavGroup] = useState({
    key: 'dynamic_groups',
    name_en: 'QA Custom',
    name_ar: 'المجموعات الديناميكية',
    main_sections: [],
  });
  const [templateNames, setTemplateNames] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [hasPrivilege, setHasPrivilege] = useState(false);
  const [selectedNavGroup, setSelectedNavGroup] = useState(null);

  // Check authentication and privileges
  useEffect(() => {
    if (authLoading) return;

    if (!authData?.access_token) {
      setError(t('nav_groups.no_permission'));
      setLoading(false);
      return;
    }

    if (authData.privilege_ids.includes(1)) {
      setHasPrivilege(true);
    } else {
      setError(t('nav_groups.no_permission'));
      setLoading(false);
    }
  }, [authData, authLoading, t]);

  // Fetch navigation groups
  const fetchNavGroups = async () => {
    if (!authData?.org_id || !hasPrivilege) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const templates = await navBarService.getTemplateNames(authData.org_id);
      setTemplateNames(templates);

      const data = await navBarService.getNavGroups(authData.org_id);
      const mappedData = data.map((group) => ({
        ...group,
        main_sections: group.main_sections.map((section) => ({
          ...section,
          subsections: section.subsections.map((sub) => {
            const template = templates.find((t) => t.name === sub.sub_page_variable || t._id === sub.sub_page_variable);
            return {
              ...sub,
              sub_page_variable: template ? template._id : '',
            };
          }),
        })),
      }));

      if (process.env.NODE_ENV !== 'production') {
        console.debug('Fetched and mapped navigation groups:', mappedData);
      }
      setNavGroups(mappedData);
      setSelectedNavGroup(mappedData[0] || null);
      setError('');
    } catch (err) {
      console.error('Error fetching navigation groups:', err.message);
      setError(err.message || t('nav_groups.fetch_error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasPrivilege && authData?.org_id) {
      fetchNavGroups();
    }
  }, [authData, hasPrivilege]);

  useEffect(() => {
    if (isCreating || editingNavGroup) {
      const fetchTemplates = async () => {
        try {
          const templates = await navBarService.getTemplateNames(authData.org_id);
          setTemplateNames(templates);
        } catch (err) {
          console.error('Error fetching template names:', err.message);
          setError(err.message || t('nav_groups.fetch_templates_error'));
        }
      };
      fetchTemplates();
    }
  }, [isCreating, editingNavGroup, t]);

  const handleEdit = async (navGroup) => {
    if (!hasPrivilege) {
      setError(t('nav_groups.no_permission'));
      return;
    }

    try {
      const data = await navBarService.getNavGroup(navGroup.id, authData.org_id);
      const templates = templateNames.length ? templateNames : await navBarService.getTemplateNames(authData.org_id);
      const mappedData = {
        ...data,
        // Override with static values
        key: 'dynamic_groups',
        name_en: 'QA Custom',
        name_ar: 'المجموعات الديناميكية',
        main_sections: data.main_sections.map((section) => ({
          ...section,
          // Ensure section key matches name_en
          key: section.name_en,
          subsections: section.subsections.map((sub) => {
            const template = templates.find((t) => t.name === sub.sub_page_variable || t._id === sub.sub_page_variable);
            return {
              ...sub,
              sub_page_variable: template ? template._id : '',
              // Ensure subsection key matches title and route is /dyn
              key: sub.title,
              route: '/dyn',
            };
          }),
        })),
      };

      if (process.env.NODE_ENV !== 'production') {
        console.debug('Fetched and mapped navigation group for edit:', mappedData);
      }
      setEditingNavGroup(navGroup);
      setNewNavGroup(mappedData);
    } catch (err) {
      console.error('Error fetching navigation group for edit:', err.message);
      setError(err.message || t('nav_groups.fetch_edit_error'));
    }
  };

  const initiateCreate = () => {
    if (!hasPrivilege) {
      setError(t('nav_groups.no_permission'));
      return;
    }

    setIsCreating(true);
    setNewNavGroup({
      key: 'dynamic_groups',
      name_en: 'QA Custom',
      name_ar: 'المجموعات الديناميكية',
      main_sections: [],
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!hasPrivilege) return;

    try {
      const invalidSubsection = newNavGroup.main_sections.some((section) =>
        section.subsections.some((sub) => {
          if (!sub.sub_page_variable) return true;
          return !templateNames.some((t) => t._id === sub.sub_page_variable);
        })
      );
      if (invalidSubsection) {
        throw new Error(t('nav_groups.invalid_template'));
      }

      // Ensure static values are sent
      const payload = {
        ...newNavGroup,
        key: 'dynamic_groups',
        name_en: 'QA Custom',
        name_ar: 'المجموعات الديناميكية',
      };

      if (process.env.NODE_ENV !== 'production') {
        console.debug('Updating navigation group with payload:', payload);
      }
      await navBarService.updateNavGroup(
        editingNavGroup.id,
        payload,
        authData.org_id
      );
      setEditingNavGroup(null);
      setNewNavGroup({
        key: 'dynamic_groups',
        name_en: 'QA Custom',
        name_ar: 'المجموعات الديناميكية',
        main_sections: [],
      });
      fetchNavGroups();
    } catch (err) {
      console.error('Error updating navigation group:', err.message);
      setError(err.message || t('nav_groups.update_error'));
    }
  };

  const handleSaveNew = async (e) => {
    e.preventDefault();
    if (!hasPrivilege) return;

    try {
      const invalidSubsection = newNavGroup.main_sections.some((section) =>
        section.subsections.some((sub) => {
          if (!sub.sub_page_variable) return true;
          return !templateNames.some((t) => t._id === sub.sub_page_variable);
        })
      );
      if (invalidSubsection) {
        throw new Error(t('nav_groups.invalid_template'));
      }

      // Ensure static values are sent
      const payload = {
        ...newNavGroup,
        key: 'dynamic_groups',
        name_en: 'QA Custom',
        name_ar: 'المجموعات الديناميكية',
      };

      if (process.env.NODE_ENV !== 'production') {
        console.debug('Creating navigation group with payload:', payload);
      }
      await navBarService.createNavGroup(payload, authData.org_id);
      setIsCreating(false);
      setNewNavGroup({
        key: 'dynamic_groups',
        name_en: 'QA Custom',
        name_ar: 'المجموعات الديناميكية',
        main_sections: [],
      });
      fetchNavGroups();
    } catch (err) {
      console.error('Error creating navigation group:', err.message);
      setError(err.message || t('nav_groups.create_error'));
    }
  };

  const handleDelete = async (id) => {
    if (!hasPrivilege) return;

    if (window.confirm(t('nav_groups.delete_confirm'))) {
      try {
        await navBarService.deleteNavGroup(id, authData.org_id);
        if (process.env.NODE_ENV !== 'production') {
          console.debug('Deleted navigation group:', id);
        }
        fetchNavGroups();
      } catch (err) {
        console.error('Error deleting navigation group:', err.message);
        setError(err.message || t('nav_groups.delete_error'));
      }
    }
  };

  const addMainSection = () => {
    setNewNavGroup({
      ...newNavGroup,
      main_sections: [
        ...newNavGroup.main_sections,
        { key: '', name_en: '', name_ar: '', subsections: [] },
      ],
    });
  };

  const updateMainSection = (index, field, value) => {
    const updatedSections = [...newNavGroup.main_sections];
    updatedSections[index] = { ...updatedSections[index], [field]: value };
    // If updating name_en, set key to match name_en
    if (field === 'name_en') {
      updatedSections[index].key = value;
    }
    setNewNavGroup({ ...newNavGroup, main_sections: updatedSections });
  };

  const deleteMainSection = (index) => {
    const updatedSections = newNavGroup.main_sections.filter((_, i) => i !== index);
    setNewNavGroup({ ...newNavGroup, main_sections: updatedSections });
  };

  const addSubsection = (sectionIndex) => {
    const updatedSections = [...newNavGroup.main_sections];
    updatedSections[sectionIndex].subsections.push({
      key: '',
      title: '',
      sub_page_variable: '',
      route: '/dyn',
    });
    setNewNavGroup({ ...newNavGroup, main_sections: updatedSections });
  };

  const updateSubsection = (sectionIndex, subIndex, field, value) => {
    const updatedSections = [...newNavGroup.main_sections];
    const updatedSubsection = {
      ...updatedSections[sectionIndex].subsections[subIndex],
      [field]: value,
    };
    // If updating title, set key to match title
    if (field === 'title') {
      updatedSubsection.key = value;
    }
    // Ensure route is always /dyn
    updatedSubsection.route = '/dyn';
    updatedSections[sectionIndex].subsections[subIndex] = updatedSubsection;
    setNewNavGroup({ ...newNavGroup, main_sections: updatedSections });
  };

  const deleteSubsection = (sectionIndex, subIndex) => {
    const updatedSections = [...newNavGroup.main_sections];
    updatedSections[sectionIndex].subsections = updatedSections[
      sectionIndex
    ].subsections.filter((_, i) => i !== subIndex);
    setNewNavGroup({ ...newNavGroup, main_sections: updatedSections });
  };

  const getTemplateName = (value) => {
    const template = templateNames.find((t) => t._id === value || t.name === value);
    return template ? template.name : t('nav_groups.template_not_found');
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
                  {t('nav_groups.title')}
                </h1>
              </div>
              <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
                {hasPrivilege && (
                  <button
                    onClick={initiateCreate}
                    className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded transition duration-200"
                  >
                    {t('nav_groups.add_nav_group')}
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

            <div className="flex flex-col lg:flex-row gap-6">
              {/* Left Section: Cards View */}
              <div className="lg:w-1/2">
                {loading ? (
                  <LoadingSpinner />
                ) : navGroups.length === 0 ? (
                  <div className="text-gray-600 dark:text-gray-300">{t('nav_groups.no_groups')}</div>
                ) : (
                  <div className="grid grid-cols-1 gap-6">
                    {navGroups.map((navGroup) => (
                      <div
                        key={navGroup.id}
                        className={`bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow duration-200 cursor-pointer ${
                          selectedNavGroup?.id === navGroup.id ? 'ring-2 ring-indigo-500' : ''
                        }`}
                        role="region"
                        aria-label={`${t('nav_groups.nav_group_name')}: ${language === 'en' ? navGroup.name_en : navGroup.name_ar}`}
                        onClick={() => setSelectedNavGroup(navGroup)}
                      >
                        <div className="space-y-4">
                          <div>
                            <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                              {t('nav_groups.key')}
                            </span>
                            <p className="text-gray-800 dark:text-gray-100 font-semibold">
                              {navGroup.key}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                              {t('nav_groups.nav_group_name')}
                            </span>
                            <p className="text-gray-800 dark:text-gray-100 font-semibold">
                              {language === 'en' ? navGroup.name_en : navGroup.name_ar}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                              {t('nav_groups.main_sections')}
                            </span>
                            <ul className="text-gray-800 dark:text-gray-100">
                              {navGroup.main_sections.map((section, index) => (
                                <li key={index} className="mt-1">
                                  {language === 'en' ? section.name_en : section.name_ar}
                                  {section.subsections.length > 0 && (
                                    <ul className="ml-4 mt-1">
                                      {section.subsections.map((sub, subIndex) => (
                                        <li key={subIndex} className="text-sm">
                                          - {sub.title} ({sub.route}, {getTemplateName(sub.sub_page_variable)})
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        {hasPrivilege && (
                          <div className="flex justify-end gap-3 mt-4">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(navGroup);
                              }}
                              className="flex items-center text-indigo-500 hover:text-indigo-600 text-sm font-medium transition-colors duration-200"
                              aria-label={t('nav_groups.edit')}
                            >
                              <PencilIcon className="w-4 h-4 mr-1" />
                              {t('nav_groups.edit')}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(navGroup.id);
                              }}
                              className="flex items-center text-red-500 hover:text-red-600 text-sm font-medium transition-colors duration-200"
                              aria-label={t('nav_groups.delete')}
                            >
                              <TrashIcon className="w-4 h-4 mr-1" />
                              {t('nav_groups.delete')}
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Section: Mobile Navdrawer View */}
              <div className="lg:w-1/2">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
                  Mobile Navdrawer View
                </h2>
                <div className="flex justify-center">
                  <div className="relative w-[300px] h-[600px] bg-gray-100 dark:bg-gray-700 rounded-3xl shadow-xl overflow-hidden border-8 border-gray-800 dark:border-gray-900">
                    {/* Mobile Header */}
                    <div className="absolute top-0 left-0 right-0 h-12 bg-gray-800 dark:bg-gray-900 flex items-center justify-between px-4">
                      <span className="text-white text-sm font-semibold">
                        {selectedNavGroup ? (language === 'en' ? selectedNavGroup.name_en : selectedNavGroup.name_ar) : t('nav_groups.no_group_selected')}
                      </span>
                      <button className="text-white">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    {/* Mobile Content */}
                    <div className="mt-12 h-full bg-white dark:bg-gray-800 overflow-y-auto">
                      {selectedNavGroup ? (
                        <ul className="p-4">
                          {selectedNavGroup.main_sections.map((section, index) => (
                            <li key={index} className="mb-4">
                              <div className="text-gray-800 dark:text-gray-100 font-semibold">
                                {language === 'en' ? section.name_en : section.name_ar}
                              </div>
                              {section.subsections.length > 0 && (
                                <ul className="ml-4 mt-2">
                                  {section.subsections.map((sub, subIndex) => (
                                    <li key={subIndex} className="text-gray-600 dark:text-gray-300 text-sm py-1">
                                      {sub.title}
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="p-4 text-gray-600 dark:text-gray-300 text-center">
                          {t('nav_groups.select_group_to_preview')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {(editingNavGroup || isCreating) && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-gray-900 rounded-lg p-8 w-full max-w-2xl shadow-2xl max-h-[80vh] overflow-y-auto">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                    {isCreating ? t('nav_groups.add_title') : t('nav_groups.edit_title')}
                  </h2>
                  <form onSubmit={isCreating ? handleSaveNew : handleUpdate} className="space-y-6">
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold">
                          {t('nav_groups.main_sections')}
                        </label>
                        <button
                          type="button"
                          onClick={addMainSection}
                          className="flex items-center bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-2 rounded transition duration-200"
                        >
                          <PlusIcon className="w-4 h-4 mr-1" />
                          {t('nav_groups.add_section')}
                        </button>
                      </div>
                      {newNavGroup.main_sections.map((section, index) => (
                        <div key={index} className="border border-gray-300 dark:border-gray-600 p-4 rounded mb-4">
                          <div className="flex justify-between items-center mb-2">
                            <h3 className="text-gray-700 dark:text-gray-300 font-bold">
                              {t('nav_groups.section')} {index + 1}
                            </h3>
                            <button
                              type="button"
                              onClick={() => deleteMainSection(index)}
                              className="flex items-center text-red-500 hover:text-red-600 text-sm font-medium"
                            >
                              <TrashIcon className="w-4 h-4 mr-1" />
                              {t('nav_groups.delete_section')}
                            </button>
                          </div>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor={`section-name_en-${index}`}>
                                {t('nav_groups.section_name_en')}
                              </label>
                              <input
                                type="text"
                                id={`section-name_en-${index}`}
                                value={section.name_en}
                                onChange={(e) => updateMainSection(index, 'name_en', e.target.value)}
                                className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor={`section-name_ar-${index}`}>
                                {t('nav_groups.section_name_ar')}
                              </label>
                              <input
                                type="text"
                                id={`section-name_ar-${index}`}
                                value={section.name_ar}
                                onChange={(e) => updateMainSection(index, 'name_ar', e.target.value)}
                                className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                                required
                              />
                            </div>
                            <div>
                              <div className="flex justify-between items-center mb-2">
                                <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold">
                                  {t('nav_groups.subsections')}
                                </label>
                                <button
                                  type="button"
                                  onClick={() => addSubsection(index)}
                                  className="flex items-center bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-2 rounded transition duration-200"
                                >
                                  <PlusIcon className="w-4 h-4 mr-1" />
                                  {t('nav_groups.add_subsection')}
                                </button>
                              </div>
                              {section.subsections.map((sub, subIndex) => (
                                <div key={subIndex} className="border border-gray-300 dark:border-gray-600 p-4 rounded mb-2">
                                  <div className="flex justify-between items-center mb-2">
                                    <h4 className="text-gray-700 dark:text-gray-300 font-bold">
                                      {t('nav_groups.subsection')} {subIndex + 1}
                                    </h4>
                                    <button
                                      type="button"
                                      onClick={() => deleteSubsection(index, subIndex)}
                                      className="flex items-center text-red-500 hover:text-red-600 text-sm font-medium"
                                    >
                                      <TrashIcon className="w-4 h-4 mr-1" />
                                      {t('nav_groups.delete_subsection')}
                                    </button>
                                  </div>
                                  <div className="space-y-4">
                                    <div>
                                      <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor={`sub-title-${index}-${subIndex}`}>
                                        {t('nav_groups.subsection_title')}
                                      </label>
                                      <input
                                        type="text"
                                        id={`sub-title-${index}-${subIndex}`}
                                        value={sub.title}
                                        onChange={(e) => updateSubsection(index, subIndex, 'title', e.target.value)}
                                        className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                                        required
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor={`sub-page-var-${index}-${subIndex}`}>
                                        {t('nav_groups.subsection_sub_page_variable')}
                                      </label>
                                      <select
                                        id={`sub-page-var-${index}-${subIndex}`}
                                        value={sub.sub_page_variable}
                                        onChange={(e) => updateSubsection(index, subIndex, 'sub_page_variable', e.target.value)}
                                        className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                                        required
                                      >
                                        <option value="">{t('nav_groups.select_template')}</option>
                                        {templateNames.map((template) => (
                                          <option key={template._id} value={template._id}>
                                            {template.name}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingNavGroup(null);
                          setIsCreating(false);
                        }}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded transition duration-200"
                      >
                        {t('nav_groups.cancel')}
                      </button>
                      <button
                        type="submit"
                        className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded transition duration-200"
                      >
                        {isCreating ? t('nav_groups.create') : t('nav_groups.save')}
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

export default NavBarManagement;