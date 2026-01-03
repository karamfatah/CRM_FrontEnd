// import React, { useState, useEffect } from 'react';
// import { useAuth } from '../../context/AuthContext';
// import { useLanguage } from '../../context/LanguageContext';
// import { sectionQaService } from '../../lib/sectionQaService';
// import { locationsQaService } from '../../lib/locationsQaService';
// import { mainLocationService } from '../../lib/mainLocationService';
// import ModalSearch from '../../components/ModalSearch';
// import ThemeToggle from '../../components/ThemeToggle';
// import LanguageToggle from '../../components/LanguageToggle';
// import Header from '../../partials/Header';
// import Sidebar from '../../partials/Sidebar';
// import LoadingSpinner from '../../components/LoadingSpinner';
// import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

// const SectionsQa = () => {
//   const { authData, loading: authLoading } = useAuth();
//   const { language, t } = useLanguage();
//   const [sections, setSections] = useState([]);
//   const [mainLocations, setMainLocations] = useState([]);
//   const [locations, setLocations] = useState([]);
//   const [selectedMainLocation, setSelectedMainLocation] = useState('');
//   const [selectedLocation, setSelectedLocation] = useState('');
//   const [editingSection, setEditingSection] = useState(null);
//   const [newSection, setNewSection] = useState({
//     section_en: '',
//     section_ar: '',
//     locations_qa_id: '',
//   });
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(true);
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [isCreating, setIsCreating] = useState(false);
//   const [hasPrivilege, setHasPrivilege] = useState(false);

//   // Check authentication and privileges
//   useEffect(() => {
//     if (authLoading) return;

//     console.log('authData:', authData); // Debug authData

//     if (!authData?.access_token) {
//       setError(t('sections.no_permission'));
//       setLoading(false);
//       return;
//     }

//     const privilegeCheck = authData.privilege_ids?.includes(1) || false;
//     console.log('hasPrivilege:', privilegeCheck); // Debug privilege
//     setHasPrivilege(privilegeCheck);

//     if (!privilegeCheck) {
//       setError(t('sections.no_permission'));
//       setLoading(false);
//     }
//   }, [authData, authLoading, t]);

//   // Fetch main locations
//   const fetchMainLocations = async () => {
//     if (!authData?.org_id || !hasPrivilege) {
//       console.log('Skipping fetchMainLocations: missing org_id or privilege');
//       setLoading(false);
//       return;
//     }

//     try {
//       const data = await mainLocationService.getMainLocations(authData.org_id);
//       const filteredMainLocations = data.filter(ml => String(ml.org_id) === String(authData.org_id));
//       console.log('Filtered main locations:', filteredMainLocations);
//       setMainLocations(Array.isArray(filteredMainLocations) ? filteredMainLocations : []);
//       if (filteredMainLocations.length > 0 && !selectedMainLocation) {
//         setSelectedMainLocation(filteredMainLocations[0].main_location_id.toString());
//       }
//     } catch (err) {
//       console.error('Error fetching main locations:', err.message);
//       setError(err.message || t('sections.fetch_main_locations_error'));
//     }
//   };

//   // Fetch locations based on selected main location
//   const fetchLocations = async (mainLocationId = null) => {
//     if (!authData?.org_id || !hasPrivilege || !mainLocationId) {
//       console.log('Skipping fetchLocations: missing org_id, privilege, or mainLocationId');
//       setLocations([]);
//       setSelectedLocation('');
//       setLoading(false);
//       return;
//     }

//     try {
//       const data = await locationsQaService.getLocations(authData.org_id, mainLocationId ? parseInt(mainLocationId) : null);
//       const filteredLocations = data.filter(loc => String(loc.org_id) === String(authData.org_id));
//       console.log('Filtered locations:', filteredLocations);
//       setLocations(Array.isArray(filteredLocations) ? filteredLocations : []);
//       if (filteredLocations.length > 0 && !selectedLocation) {
//         setSelectedLocation(filteredLocations[0].locations_qa_id.toString());
//       } else {
//         setSelectedLocation('');
//       }
//     } catch (err) {
//       console.error('Error fetching locations:', err.message);
//       setError(err.message || t('sections.fetch_locations_error'));
//     }
//   };

//   // Fetch sections based on selected location
//   const fetchSections = async (locationsQaId = null) => {
//     if (!authData?.org_id || !hasPrivilege || !locationsQaId) {
//       console.log('Skipping fetchSections: missing org_id, privilege, or locationsQaId');
//       setSections([]);
//       setLoading(false);
//       return;
//     }

//     setLoading(true);
//     try {
//       console.log('Fetching sections with org_id:', authData.org_id, 'and locations_qa_id:', locationsQaId);
//       const data = await sectionQaService.getSections(authData.org_id, locationsQaId ? parseInt(locationsQaId) : null);
//       const filteredSections = data.filter(sec => String(sec.org_id) === String(authData.org_id));
//       console.log('Fetched sections:', data);
//       console.log('Filtered sections:', filteredSections);
//       setSections(Array.isArray(filteredSections) ? filteredSections : []);
//       setError('');
//     } catch (err) {
//       console.error('Error fetching sections:', err.message);
//       setError(err.message || t('sections.fetch_error'));
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Fetch main locations on mount
//   useEffect(() => {
//     if (authData?.org_id && hasPrivilege) {
//       fetchMainLocations();
//     } else {
//       setLoading(false);
//     }
//   }, [authData?.org_id, hasPrivilege, t]);

//   // Fetch locations when main location changes
//   useEffect(() => {
//     fetchLocations(selectedMainLocation ? parseInt(selectedMainLocation) : null);
//   }, [selectedMainLocation, authData?.org_id, hasPrivilege, mainLocations, t]);

//   // Fetch sections when location changes
//   useEffect(() => {
//     console.log('Fetching sections with selectedLocation:', selectedLocation);
//     fetchSections(selectedLocation ? parseInt(selectedLocation) : null);
//   }, [selectedLocation, authData?.org_id, hasPrivilege, t]);

//   // Debug locations state
//   useEffect(() => {
//     console.log('Locations state:', locations);
//   }, [locations]);

//   // Debug sections state
//   useEffect(() => {
//     console.log('Sections state:', sections);
//   }, [sections]);

//   const handleEdit = async (section) => {
//     if (!hasPrivilege) {
//       setError(t('sections.no_permission'));
//       return;
//     }

//     try {
//       const data = await sectionQaService.getSection(section.section_qa_id, authData.org_id);
//       setEditingSection(section);
//       setNewSection({
//         section_en: data.section_en,
//         section_ar: data.section_ar,
//         locations_qa_id: data.locations_qa_id.toString(),
//       });
//     } catch (err) {
//       console.error('Error fetching section for edit:', err.message);
//       setError(err.message || t('sections.fetch_edit_error'));
//     }
//   };

//   const initiateCreate = () => {
//     if (!hasPrivilege) {
//       setError(t('sections.no_permission'));
//       return;
//     }

//     if (locations.length === 0) {
//       setError(t('sections.no_locations'));
//       return;
//     }

//     setIsCreating(true);
//     setNewSection({
//       section_en: '',
//       section_ar: '',
//       locations_qa_id: selectedLocation || locations[0].locations_qa_id.toString(),
//     });
//   };

//   const handleUpdate = async (e) => {
//     e.preventDefault();
//     if (!hasPrivilege) return;

//     if (!newSection.locations_qa_id) {
//       setError(t('sections.select_location_error'));
//       return;
//     }

//     try {
//       await sectionQaService.updateSection(
//         editingSection.section_qa_id,
//         {
//           name_en: newSection.section_en,
//           name_ar: newSection.section_ar,
//           locations_qa_id: parseInt(newSection.locations_qa_id),
//         },
//         authData.org_id
//       );
//       setEditingSection(null);
//       setNewSection({ section_en: '', section_ar: '', locations_qa_id: selectedLocation || '' });
//       fetchSections(selectedLocation ? parseInt(selectedLocation) : null);
//     } catch (err) {
//       console.error('Error updating section:', err.message);
//       setError(err.message || t('sections.update_error'));
//     }
//   };

//   const handleSaveNew = async (e) => {
//     e.preventDefault();
//     if (!hasPrivilege) return;

//     if (!newSection.locations_qa_id) {
//       setError(t('sections.select_location_error'));
//       return;
//     }

//     if (!newSection.section_en || !newSection.section_ar) {
//       setError(t('sections.missing_fields_error'));
//       return;
//     }

//     try {
//       await sectionQaService.createSection(
//         {
//           name_en: newSection.section_en,
//           name_ar: newSection.section_ar,
//           locations_qa_id: parseInt(newSection.locations_qa_id),
//         },
//         authData.org_id
//       );
//       setIsCreating(false);
//       setNewSection({ section_en: '', section_ar: '', locations_qa_id: selectedLocation || '' });
//       fetchSections(selectedLocation ? parseInt(selectedLocation) : null);
//     } catch (err) {
//       console.error('Error creating section:', err.message);
//       setError(err.message || t('sections.create_error'));
//     }
//   };

//   const handleDelete = async (id) => {
//     if (!hasPrivilege) return;

//     if (window.confirm(t('sections.delete_confirm'))) {
//       try {
//         await sectionQaService.deleteSection(id, authData.org_id);
//         fetchSections(selectedLocation ? parseInt(selectedLocation) : null);
//       } catch (err) {
//         console.error('Error deleting section:', err.message);
//         setError(err.message || t('sections.delete_error'));
//       }
//     }
//   };

//   const getLocationName = (locations_qa_id) => {
//     if (!locations_qa_id) {
//       return t('sections.not_assigned');
//     }
//     const location = locations.find((loc) => loc.locations_qa_id === locations_qa_id);
//     return location
//       ? (language === 'en' ? location.location_en : location.location_ar)
//       : t('sections.not_assigned');
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
//                   {t('sections.title')}
//                 </h1>
//               </div>
//               <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
//                 <select
//                   value={selectedMainLocation}
//                   onChange={(e) => {
//                     setSelectedMainLocation(e.target.value);
//                     setSelectedLocation(''); // Reset location when main location changes
//                   }}
//                   className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
//                   aria-label={t('sections.main_location')}
//                 >
//                   <option value="" disabled>
//                     {t('sections.select_main_location')}
//                   </option>
//                   {mainLocations.map((ml) => (
//                     <option key={ml.main_location_id} value={ml.main_location_id}>
//                       {language === 'en' ? ml.main_location_name_en : ml.main_location_ar}
//                     </option>
//                   ))}
//                 </select>
//                 <select
//                   value={selectedLocation}
//                   onChange={(e) => setSelectedLocation(e.target.value)}
//                   className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
//                   aria-label={t('sections.location')}
//                   disabled={locations.length === 0}
//                 >
//                   <option value="" disabled>
//                     {t('sections.select_location')}
//                   </option>
//                   {locations.map((loc) => (
//                     <option key={loc.locations_qa_id} value={loc.locations_qa_id}>
//                       {language === 'en' ? loc.location_en : loc.location_ar}
//                     </option>
//                   ))}
//                 </select>
//                 <LanguageToggle />
//                 {hasPrivilege && (
//                   <button
//                     onClick={initiateCreate}
//                     className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded transition duration-200"
//                     disabled={locations.length === 0}
//                   >
//                     {t('sections.add_section')}
//                   </button>
//                 )}
//                 <ModalSearch />
//                 <ThemeToggle />
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

//             {loading ? (
//               <LoadingSpinner />
//             ) : sections.length === 0 ? (
//               <div className="text-gray-600 dark:text-gray-300">{t('sections.no_sections')}</div>
//             ) : (
//               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//                 {sections.map((section) => (
//                   <div
//                     key={section.section_qa_id}
//                     className="bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow duration-200"
//                     role="region"
//                     aria-label={`${t('sections.section_name')}: ${language === 'en' ? section.section_en : section.section_ar}`}
//                   >
//                     <div className="space-y-4">
//                       <div>
//                         <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">{t('sections.location_qa')}</span>
//                         <p className="text-gray-800 dark:text-gray-100 font-semibold">{getLocationName(section.locations_qa_id)}</p>
//                       </div>
//                       <div>
//                         <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">{t('sections.section_name')}</span>
//                         <p className="text-gray-800 dark:text-gray-100 font-semibold">
//                           {language === 'en' ? section.section_en : section.section_ar || t('sections.unknown')}
//                         </p>
//                       </div>
//                     </div>
//                     {hasPrivilege && (
//                       <div className="flex justify-end gap-3 mt-4">
//                         <button
//                           onClick={() => handleEdit(section)}
//                           className="flex items-center text-indigo-500 hover:text-indigo-600 text-sm font-medium transition-colors duration-200"
//                           aria-label={t('sections.edit')}
//                         >
//                           <PencilIcon className="w-4 h-4 mr-1" />
//                           {t('sections.edit')}
//                         </button>
//                         <button
//                           onClick={() => handleDelete(section.section_qa_id)}
//                           className="flex items-center text-red-500 hover:text-red-600 text-sm font-medium transition-colors duration-200"
//                           aria-label={t('sections.delete')}
//                         >
//                           <TrashIcon className="w-4 h-4 mr-1" />
//                           {t('sections.delete')}
//                         </button>
//                       </div>
//                     )}
//                   </div>
//                 ))}
//               </div>
//             )}

//             {(editingSection || isCreating) && (
//               <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//                 <div className="bg-white dark:bg-gray-900 rounded-lg p-8 w-full max-w-md shadow-2xl">
//                   <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
//                     {isCreating ? t('sections.add_title') : t('sections.edit_title')}
//                   </h2>
//                   <form onSubmit={isCreating ? handleSaveNew : handleUpdate} className="space-y-6">
//                     <div>
//                       <label
//                         className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
//                         htmlFor="locations_qa_id"
//                       >
//                         {t('sections.location_qa')}
//                       </label>
//                       <select
//                         id="locations_qa_id"
//                         value={newSection.locations_qa_id}
//                         onChange={(e) =>
//                           setNewSection({ ...newSection, locations_qa_id: e.target.value })
//                         }
//                         className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
//                         required
//                         aria-label={t('sections.location_qa')}
//                       >
//                         <option value="" disabled>
//                           {t('sections.select_location')}
//                         </option>
//                         {locations.map((loc) => (
//                           <option key={loc.locations_qa_id} value={loc.locations_qa_id}>
//                             {language === 'en' ? loc.location_en : loc.location_ar}
//                           </option>
//                         ))}
//                       </select>
//                     </div>
//                     <div>
//                       <label
//                         className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
//                         htmlFor="section_en"
//                       >
//                         {t('sections.section_name_en')}
//                       </label>
//                       <input
//                         type="text"
//                         id="section_en"
//                         value={newSection.section_en}
//                         onChange={(e) =>
//                           setNewSection({ ...newSection, section_en: e.target.value })
//                         }
//                         className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
//                         required
//                       />
//                     </div>
//                     <div>
//                       <label
//                         className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
//                         htmlFor="section_ar"
//                       >
//                         {t('sections.section_name_ar')}
//                       </label>
//                       <input
//                         type="text"
//                         id="section_ar"
//                         value={newSection.section_ar}
//                         onChange={(e) =>
//                           setNewSection({ ...newSection, section_ar: e.target.value })
//                         }
//                         className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
//                         required
//                       />
//                     </div>
//                     <div className="flex justify-end gap-3">
//                       <button
//                         type="button"
//                         onClick={() => {
//                           setEditingSection(null);
//                           setIsCreating(false);
//                           setError('');
//                         }}
//                         className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded transition duration-200"
//                       >
//                         {t('sections.cancel')}
//                       </button>
//                       <button
//                         type="submit"
//                         className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded transition duration-200"
//                         disabled={!newSection.locations_qa_id}
//                       >
//                         {isCreating ? t('sections.create') : t('sections.save')}
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
// // sub
// export default SectionsQa;

// import React, { useState, useEffect } from 'react';
// import { useAuth } from '../../context/AuthContext';
// import { useLanguage } from '../../context/LanguageContext';
// import { sectionQaService } from '../../lib/sectionQaService';
// import { locationsQaService } from '../../lib/locationsQaService';
// import { mainLocationService } from '../../lib/mainLocationService';
// import ModalSearch from '../../components/ModalSearch';
// import ThemeToggle from '../../components/ThemeToggle';
// import LanguageToggle from '../../components/LanguageToggle';
// import Header from '../../partials/Header';
// import Sidebar from '../../partials/Sidebar';
// import LoadingSpinner from '../../components/LoadingSpinner';
// import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

// const SectionsQa = () => {
//   const { authData, loading: authLoading } = useAuth();
//   const { language, t } = useLanguage();
//   const [sections, setSections] = useState([]);
//   const [mainLocations, setMainLocations] = useState([]);
//   const [locations, setLocations] = useState([]);
//   const [selectedMainLocation, setSelectedMainLocation] = useState('');
//   const [selectedLocation, setSelectedLocation] = useState('');
//   const [editingSection, setEditingSection] = useState(null);
//   const [newSection, setNewSection] = useState({
//     section_en: '',
//     section_ar: '',
//     locations_qa_id: '',
//   });
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(true);
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [isCreating, setIsCreating] = useState(false);
//   const [hasPrivilege, setHasPrivilege] = useState(false);

//   // Check authentication and privileges
//   useEffect(() => {
//     if (authLoading) return;

//     console.log('authData:', authData);

//     if (!authData?.access_token) {
//       setError(t('sections.no_permission'));
//       setLoading(false);
//       return;
//     }

//     const privilegeCheck = authData.privilege_ids?.includes(1) || false;
//     console.log('hasPrivilege:', privilegeCheck);
//     setHasPrivilege(privilegeCheck);

//     if (!privilegeCheck) {
//       setError(t('sections.no_permission'));
//       setLoading(false);
//     }
//   }, [authData, authLoading, t]);

//   // Fetch main locations
//   const fetchMainLocations = async () => {
//     if (!authData?.org_id || !hasPrivilege) {
//       console.log('Skipping fetchMainLocations: missing org_id or privilege');
//       setLoading(false);
//       return;
//     }

//     try {
//       const data = await mainLocationService.getMainLocations(authData.org_id);
//       console.log('Main locations:', data);
//       setMainLocations(Array.isArray(data) ? data : []);
//       if (data.length > 0 && !selectedMainLocation) {
//         setSelectedMainLocation(data[0].id.toString());
//       }
//     } catch (err) {
//       console.error('Error fetching main locations:', err.message);
//       setError(err.message || t('sections.fetch_main_locations_error'));
//     }
//   };

//   // Fetch locations based on selected main location
//   const fetchLocations = async (mainLocationId = null) => {
//     if (!authData?.org_id || !hasPrivilege || !mainLocationId) {
//       console.log('Skipping fetchLocations: missing org_id, privilege, or mainLocationId');
//       setLocations([]);
//       setSelectedLocation('');
//       setLoading(false);
//       return;
//     }

//     try {
//       const data = await locationsQaService.getLocations(authData.org_id, mainLocationId);
//       console.log('Locations:', data);
//       setLocations(Array.isArray(data) ? data : []);
//       if (data.length > 0 && !selectedLocation) {
//         setSelectedLocation(data[0].locations_qa_id.toString());
//       } else {
//         setSelectedLocation('');
//       }
//     } catch (err) {
//       console.error('Error fetching locations:', err.message);
//       setError(err.message || t('sections.fetch_locations_error'));
//     }
//   };

//   // Fetch sections based on selected location
//   const fetchSections = async (locationsQaId = null) => {
//     if (!authData?.org_id || !hasPrivilege || !locationsQaId) {
//       console.log('Skipping fetchSections: missing org_id, privilege, or locationsQaId');
//       setSections([]);
//       setLoading(false);
//       return;
//     }

//     setLoading(true);
//     try {
//       console.log('Fetching sections with org_id:', authData.org_id, 'and locations_qa_id:', locationsQaId);
//       const data = await sectionQaService.getSections(authData.org_id, locationsQaId);
//       console.log('Sections:', data);
//       setSections(Array.isArray(data) ? data : []);
//       setError('');
//     } catch (err) {
//       console.error('Error fetching sections:', err.message);
//       setError(err.message || t('sections.fetch_error'));
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Fetch main locations on mount
//   useEffect(() => {
//     if (!authLoading && hasPrivilege) {
//       fetchMainLocations();
//     } else {
//       setLoading(false);
//     }
//   }, [authData, hasPrivilege, authLoading, t]);

//   // Fetch locations when main location changes
//   useEffect(() => {
//     if (selectedMainLocation) {
//       fetchLocations(selectedMainLocation);
//     }
//   }, [selectedMainLocation, hasPrivilege, mainLocations, t]);

//   // Fetch sections when location changes
//   useEffect(() => {
//     console.log('Fetching sections with selectedLocation:', selectedLocation);
//     if (selectedLocation) {
//       fetchSections(selectedLocation);
//     }
//   }, [selectedLocation, hasPrivilege, t]);

//   // Debug locations state
//   useEffect(() => {
//     console.log('Locations state:', locations);
//   }, [locations]);

//   // Debug sections state
//   useEffect(() => {
//     console.log('Sections state:', sections);
//   }, [sections]);

//   const handleEdit = async (section) => {
//     if (!hasPrivilege) {
//       setError(t('sections.no_permission'));
//       return;
//     }

//     try {
//       const data = await sectionQaService.getSection(section.section_qa_id, authData.org_id);
//       setEditingSection(section);
//       setNewSection({
//         section_en: data.section_en,
//         section_ar: data.section_ar,
//         locations_qa_id: data.locations_qa_id.toString(),
//       });
//     } catch (err) {
//       console.error('Error fetching section for edit:', err.message);
//       setError(err.message || t('sections.fetch_edit_error'));
//     }
//   };

//   const initiateCreate = () => {
//     if (!hasPrivilege) {
//       setError(t('sections.no_permission'));
//       return;
//     }

//     if (locations.length === 0) {
//       setError(t('sections.no_locations'));
//       return;
//     }

//     setIsCreating(true);
//     setNewSection({
//       section_en: '',
//       section_ar: '',
//       locations_qa_id: selectedLocation || locations[0].locations_qa_id.toString(),
//     });
//   };

//   const handleUpdate = async (e) => {
//     e.preventDefault();
//     if (!hasPrivilege) return;

//     if (!newSection.locations_qa_id) {
//       setError(t('sections.select_location_error'));
//       return;
//     }

//     try {
//       await sectionQaService.updateSection(
//         editingSection.section_qa_id,
//         {
//           name_en: newSection.section_en,
//           name_ar: newSection.section_ar,
//           locations_qa_id: newSection.locations_qa_id,
//         },
//         authData.org_id
//       );
//       setEditingSection(null);
//       setNewSection({ section_en: '', section_ar: '', locations_qa_id: selectedLocation || '' });
//       fetchSections(selectedLocation);
//     } catch (err) {
//       console.error('Error updating section:', err.message);
//       setError(err.message || t('sections.update_error'));
//     }
//   };

//   const handleSaveNew = async (e) => {
//     e.preventDefault();
//     if (!hasPrivilege) return;

//     if (!newSection.locations_qa_id) {
//       setError(t('sections.select_location_error'));
//       return;
//     }

//     if (!newSection.section_en || !newSection.section_ar) {
//       setError(t('sections.missing_fields_error'));
//       return;
//     }

//     try {
//       await sectionQaService.createSection(
//         {
//           name_en: newSection.section_en,
//           name_ar: newSection.section_ar,
//           locations_qa_id: newSection.locations_qa_id,
//         },
//         authData.org_id
//       );
//       setIsCreating(false);
//       setNewSection({ section_en: '', section_ar: '', locations_qa_id: selectedLocation || '' });
//       fetchSections(selectedLocation);
//     } catch (err) {
//       console.error('Error creating section:', err.message);
//       setError(err.message || t('sections.create_error'));
//     }
//   };

//   const handleDelete = async (id) => {
//     if (!hasPrivilege) return;

//     if (window.confirm(t('sections.delete_confirm'))) {
//       try {
//         await sectionQaService.deleteSection(id, authData.org_id);
//         fetchSections(selectedLocation);
//       } catch (err) {
//         console.error('Error deleting section:', err.message);
//         setError(err.message || t('sections.delete_error'));
//       }
//     }
//   };

//   const getLocationName = (locations_qa_id) => {
//     if (!locations_qa_id) {
//       return t('sections.not_assigned');
//     }
//     const location = locations.find((loc) => loc.locations_qa_id === locations_qa_id);
//     return location
//       ? (language === 'en' ? location.location_en : location.location_ar)
//       : t('sections.not_assigned');
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
//                   {t('sections.title')}
//                 </h1>
//               </div>
//               <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
//                 <select
//                   value={selectedMainLocation}
//                   onChange={(e) => {
//                     setSelectedMainLocation(e.target.value);
//                     setSelectedLocation('');
//                   }}
//                   className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
//                   aria-label={t('sections.main_location')}
//                 >
//                   <option value="" disabled>
//                     {t('sections.select_main_location')}
//                   </option>
//                   {mainLocations.map((ml) => (
//                     <option key={ml.id} value={ml.id}>
//                       {language === 'en' ? ml.main_location_name_en : ml.main_location_ar}
//                     </option>
//                   ))}
//                 </select>
//                 <select
//                   value={selectedLocation}
//                   onChange={(e) => setSelectedLocation(e.target.value)}
//                   className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
//                   aria-label={t('sections.location')}
//                   disabled={locations.length === 0}
//                 >
//                   <option value="" disabled>
//                     {t('sections.select_location')}
//                   </option>
//                   {locations.map((loc) => (
//                     <option key={loc.locations_qa_id} value={loc.locations_qa_id}>
//                       {language === 'en' ? loc.location_en : loc.location_ar}
//                     </option>
//                   ))}
//                 </select>
//                 <LanguageToggle />
//                 {hasPrivilege && (
//                   <button
//                     onClick={initiateCreate}
//                     className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded transition duration-200"
//                     disabled={locations.length === 0}
//                   >
//                     {t('sections.add_section')}
//                   </button>
//                 )}
//                 <ModalSearch />
//                 <ThemeToggle />
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

//             {loading ? (
//               <LoadingSpinner />
//             ) : sections.length === 0 ? (
//               <div className="text-gray-600 dark:text-gray-300">{t('sections.no_sections')}</div>
//             ) : (
//               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//                 {sections.map((section) => (
//                   <div
//                     key={section.section_qa_id}
//                     className="bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow duration-200"
//                     role="region"
//                     aria-label={`${t('sections.section_name')}: ${language === 'en' ? section.section_en : section.section_ar}`}
//                   >
//                     <div className="space-y-4">
//                       <div>
//                         <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">{t('sections.location_qa')}</span>
//                         <p className="text-gray-800 dark:text-gray-100 font-semibold">{getLocationName(section.locations_qa_id)}</p>
//                       </div>
//                       <div>
//                         <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">{t('sections.section_name')}</span>
//                         <p className="text-gray-800 dark:text-gray-100 font-semibold">
//                           {language === 'en' ? section.section_en : section.section_ar || t('sections.unknown')}
//                         </p>
//                       </div>
//                     </div>
//                     {hasPrivilege && (
//                       <div className="flex justify-end gap-3 mt-4">
//                         <button
//                           onClick={() => handleEdit(section)}
//                           className="flex items-center text-indigo-500 hover:text-indigo-600 text-sm font-medium transition-colors duration-200"
//                           aria-label={t('sections.edit')}
//                         >
//                           <PencilIcon className="w-4 h-4 mr-1" />
//                           {t('sections.edit')}
//                         </button>
//                         <button
//                           onClick={() => handleDelete(section.section_qa_id)}
//                           className="flex items-center text-red-500 hover:text-red-600 text-sm font-medium transition-colors duration-200"
//                           aria-label={t('sections.delete')}
//                         >
//                           <TrashIcon className="w-4 h-4 mr-1" />
//                           {t('sections.delete')}
//                         </button>
//                       </div>
//                     )}
//                   </div>
//                 ))}
//               </div>
//             )}

//             {(editingSection || isCreating) && (
//               <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//                 <div className="bg-white dark:bg-gray-900 rounded-lg p-8 w-full max-w-md shadow-2xl">
//                   <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
//                     {isCreating ? t('sections.add_title') : t('sections.edit_title')}
//                   </h2>
//                   <form onSubmit={isCreating ? handleSaveNew : handleUpdate} className="space-y-6">
//                     <div>
//                       <label
//                         className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
//                         htmlFor="locations_qa_id"
//                       >
//                         {t('sections.location_qa')}
//                       </label>
//                       <select
//                         id="locations_qa_id"
//                         value={newSection.locations_qa_id}
//                         onChange={(e) =>
//                           setNewSection({ ...newSection, locations_qa_id: e.target.value })
//                         }
//                         className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
//                         required
//                         aria-label={t('sections.location_qa')}
//                       >
//                         <option value="" disabled>
//                           {t('sections.select_location')}
//                         </option>
//                         {locations.map((loc) => (
//                           <option key={loc.locations_qa_id} value={loc.locations_qa_id}>
//                             {language === 'en' ? loc.location_en : loc.location_ar}
//                           </option>
//                         ))}
//                       </select>
//                     </div>
//                     <div>
//                       <label
//                         className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
//                         htmlFor="section_en"
//                       >
//                         {t('sections.section_name_en')}
//                       </label>
//                       <input
//                         type="text"
//                         id="section_en"
//                         value={newSection.section_en}
//                         onChange={(e) =>
//                           setNewSection({ ...newSection, section_en: e.target.value })
//                         }
//                         className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
//                         required
//                       />
//                     </div>
//                     <div>
//                       <label
//                         className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
//                         htmlFor="section_ar"
//                       >
//                         {t('sections.section_name_ar')}
//                       </label>
//                       <input
//                         type="text"
//                         id="section_ar"
//                         value={newSection.section_ar}
//                         onChange={(e) =>
//                           setNewSection({ ...newSection, section_ar: e.target.value })
//                         }
//                         className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
//                         required
//                       />
//                     </div>
//                     <div className="flex justify-end gap-3">
//                       <button
//                         type="button"
//                         onClick={() => {
//                           setEditingSection(null);
//                           setIsCreating(false);
//                           setError('');
//                         }}
//                         className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded transition duration-200"
//                       >
//                         {t('sections.cancel')}
//                       </button>
//                       <button
//                         type="submit"
//                         className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded transition duration-200"
//                         disabled={!newSection.locations_qa_id}
//                       >
//                         {isCreating ? t('sections.create') : t('sections.save')}
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

// export default SectionsQa;

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { sectionQaService } from '../../lib/sectionQaService';
import { locationsQaService } from '../../lib/locationsQaService';
import { mainLocationService } from '../../lib/mainLocationService';
import ModalSearch from '../../components/ModalSearch';
import ThemeToggle from '../../components/ThemeToggle';
import LanguageToggle from '../../components/LanguageToggle';
import Header from '../../partials/Header';
import Sidebar from '../../partials/Sidebar';
import LoadingSpinner from '../../components/LoadingSpinner';
import { PencilIcon, TrashIcon, DocumentArrowUpIcon } from '@heroicons/react/24/outline';
import * as XLSX from 'xlsx';

const SectionsQa = () => {
  const { authData, loading: authLoading } = useAuth();
  const { language, t } = useLanguage();
  const [sections, setSections] = useState([]);
  const [mainLocations, setMainLocations] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedMainLocation, setSelectedMainLocation] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [editingSection, setEditingSection] = useState(null);
  const [newSection, setNewSection] = useState({
    section_en: '',
    section_ar: '',
    locations_qa_id: '',
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
      setError(t('sections.no_permission'));
      setLoading(false);
      return;
    }

    const privilegeCheck = authData.privilege_ids?.includes(1) || false;
    console.log('hasPrivilege:', privilegeCheck);
    setHasPrivilege(privilegeCheck);

    if (!privilegeCheck) {
      setError(t('sections.no_permission'));
      setLoading(false);
    }
  }, [authData, authLoading, t]);

  // Fetch main locations
  const fetchMainLocations = async () => {
    if (!authData?.org_id || !hasPrivilege) {
      console.log('Skipping fetchMainLocations: missing org_id or privilege');
      setLoading(false);
      return;
    }

    try {
      const data = await mainLocationService.getMainLocations(authData.org_id);
      console.log('Main locations:', data);
      setMainLocations(Array.isArray(data) ? data : []);
      if (data.length > 0 && !selectedMainLocation) {
        setSelectedMainLocation(data[0].id.toString());
      }
    } catch (err) {
      console.error('Error fetching main locations:', err.message);
      setError(err.message || t('sections.fetch_main_locations_error'));
    }
  };

  // Fetch locations based on selected main location
  const fetchLocations = async (mainLocationId = null) => {
    if (!authData?.org_id || !hasPrivilege || !mainLocationId) {
      console.log('Skipping fetchLocations: missing org_id, privilege, or mainLocationId');
      setLocations([]);
      setSelectedLocation('');
      setLoading(false);
      return;
    }

    try {
      const data = await locationsQaService.getLocations(authData.org_id, mainLocationId);
      console.log('Locations:', data);
      setLocations(Array.isArray(data) ? data : []);
      if (data.length > 0 && !selectedLocation) {
        setSelectedLocation(data[0].locations_qa_id.toString());
      } else {
        setSelectedLocation('');
      }
      setError('');
    } catch (err) {
      console.error('Error fetching locations:', err.message);
      setError(err.message || t('sections.fetch_locations_error'));
    }
  };

  // Fetch sections based on selected location
  const fetchSections = async (locationsQaId = null) => {
    if (!authData?.org_id || !hasPrivilege || !locationsQaId) {
      console.log('Skipping fetchSections: missing org_id, privilege, or locationsQaId');
      setSections([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      console.log('Fetching sections with org_id:', authData.org_id, 'and locations_qa_id:', locationsQaId);
      const data = await sectionQaService.getSections(authData.org_id, locationsQaId);
      console.log('Sections:', data);
      setSections(Array.isArray(data) ? data : []);
      setError('');
    } catch (err) {
      console.error('Error fetching sections:', err.message);
      setError(err.message || t('sections.fetch_error'));
    } finally {
      setLoading(false);
    }
  };

  // Fetch main locations on mount
  useEffect(() => {
    if (!authLoading && hasPrivilege) {
      fetchMainLocations();
    } else {
      setLoading(false);
    }
  }, [authData, hasPrivilege, authLoading, t]);

  // Fetch locations when main location changes
  useEffect(() => {
    if (selectedMainLocation) {
      fetchLocations(selectedMainLocation);
    }
  }, [selectedMainLocation, hasPrivilege, mainLocations, t]);

  // Fetch sections when location changes
  useEffect(() => {
    console.log('Fetching sections with selectedLocation:', selectedLocation);
    if (selectedLocation) {
      fetchSections(selectedLocation);
    }
  }, [selectedLocation, hasPrivilege, t]);

  // Debug locations state
  useEffect(() => {
    console.log('Locations state:', locations);
  }, [locations]);

  // Debug sections state
  useEffect(() => {
    console.log('Sections state:', sections);
  }, [sections]);

  const handleEdit = async (section) => {
    if (!hasPrivilege) {
      setError(t('sections.no_permission'));
      return;
    }

    try {
      const data = await sectionQaService.getSection(section.section_qa_id, authData.org_id);
      setEditingSection(section);
      setNewSection({
        section_en: data.section_en,
        section_ar: data.section_ar,
        locations_qa_id: data.locations_qa_id.toString(),
      });
    } catch (err) {
      console.error('Error fetching section for edit:', err.message);
      setError(err.message || t('sections.fetch_edit_error'));
    }
  };

  const initiateCreate = () => {
    if (!hasPrivilege) {
      setError(t('sections.no_permission'));
      return;
    }

    if (locations.length === 0) {
      setError(t('sections.no_locations'));
      return;
    }

    setIsCreating(true);
    setIsBulkUpload(false);
    setFile(null);
    setNewSection({
      section_en: '',
      section_ar: '',
      locations_qa_id: selectedLocation || locations[0].locations_qa_id.toString(),
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!hasPrivilege) {
      setError(t('sections.no_permission'));
      return;
    }

    if (!newSection.locations_qa_id) {
      setError(t('sections.select_location_error'));
      return;
    }

    try {
      await sectionQaService.updateSection(
        editingSection.section_qa_id,
        {
          name_en: newSection.section_en,
          name_ar: newSection.section_ar,
          locations_qa_id: newSection.locations_qa_id,
        },
        authData.org_id
      );
      setEditingSection(null);
      setNewSection({ section_en: '', section_ar: '', locations_qa_id: selectedLocation || '' });
      fetchSections(selectedLocation);
      setSuccess(t('sections.update_success'));
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error updating section:', err.message);
      setError(err.message || t('sections.update_error'));
    }
  };

  const handleSaveNew = async (e) => {
    e.preventDefault();
    if (!hasPrivilege) {
      setError(t('sections.no_permission'));
      return;
    }

    if (!newSection.locations_qa_id) {
      setError(t('sections.select_location_error'));
      return;
    }

    if (isBulkUpload) {
      if (!file) {
        setError(t('sections.file_required'));
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
              setError(t('sections.empty_file'));
              return;
            }

            const requiredColumns = ['name_en', 'name_ar'];
            const missingColumns = requiredColumns.filter(col => !Object.keys(jsonData[0]).includes(col));
            if (missingColumns.length > 0) {
              setError(t('sections.missing_columns', { columns: missingColumns.join(', ') }));
              return;
            }

            const bulkData = jsonData.map(row => ({
              locations_qa_id: newSection.locations_qa_id,
              name_en: row.name_en,
              name_ar: row.name_ar,
            }));

            await sectionQaService.bulkCreateSections(bulkData, authData.org_id);
            setIsCreating(false);
            setFile(null);
            setNewSection({ section_en: '', section_ar: '', locations_qa_id: selectedLocation || '' });
            fetchSections(selectedLocation);
            setSuccess(t('sections.bulk_create_success'));
            setTimeout(() => setSuccess(''), 3000);
          } catch (err) {
            console.error('Error parsing file:', err.message);
            setError(err.message || t('sections.file_parse_error'));
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
      if (!newSection.section_en || !newSection.section_ar) {
        setError(t('sections.missing_fields_error'));
        return;
      }

      try {
        await sectionQaService.createSection(
          {
            name_en: newSection.section_en,
            name_ar: newSection.section_ar,
            locations_qa_id: newSection.locations_qa_id,
          },
          authData.org_id
        );
        setIsCreating(false);
        setNewSection({ section_en: '', section_ar: '', locations_qa_id: selectedLocation || '' });
        fetchSections(selectedLocation);
        setSuccess(t('sections.create_success'));
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        console.error('Error creating section:', err.message);
        setError(err.message || t('sections.create_error'));
      }
    }
  };

  const handleDelete = async (id) => {
    if (!hasPrivilege) {
      setError(t('sections.no_permission'));
      return;
    }

    if (window.confirm(t('sections.delete_confirm'))) {
      try {
        await sectionQaService.deleteSection(id, authData.org_id);
        fetchSections(selectedLocation);
      } catch (err) {
        console.error('Error deleting section:', err.message);
        setError(err.message || t('sections.delete_error'));
      }
    }
  };

  const getLocationName = (locations_qa_id) => {
    if (!locations_qa_id) {
      return t('sections.not_assigned');
    }
    const location = locations.find((loc) => loc.locations_qa_id === locations_qa_id);
    return location
      ? (language === 'en' ? location.location_en : location.location_ar)
      : t('sections.not_assigned');
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
                  {t('sections.title')}
                </h1>
              </div>
              <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
                <select
                  value={selectedMainLocation}
                  onChange={(e) => {
                    setSelectedMainLocation(e.target.value);
                    setSelectedLocation('');
                  }}
                  className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                  aria-label={t('sections.main_location')}
                >
                  <option value="" disabled>
                    {t('sections.select_main_location')}
                  </option>
                  {mainLocations.map((ml) => (
                    <option key={ml.id} value={ml.id}>
                      {language === 'en' ? ml.main_location_name_en : ml.main_location_ar}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                  aria-label={t('sections.location')}
                  disabled={locations.length === 0}
                >
                  <option value="" disabled>
                    {t('sections.select_location')}
                  </option>
                  {locations.map((loc) => (
                    <option key={loc.locations_qa_id} value={loc.locations_qa_id}>
                      {language === 'en' ? loc.location_en : loc.location_ar}
                    </option>
                  ))}
                </select>
                <LanguageToggle />
                {hasPrivilege && (
                  <button
                    onClick={initiateCreate}
                    className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded transition duration-200"
                    disabled={locations.length === 0}
                  >
                    {t('sections.add_section')}
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
            ) : sections.length === 0 ? (
              <div className="text-gray-600 dark:text-gray-300">{t('sections.no_sections')}</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {sections.map((section) => (
                  <div
                    key={section.section_qa_id}
                    className="bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow duration-200"
                    role="region"
                    aria-label={`${t('sections.section_name')}: ${language === 'en' ? section.section_en : section.section_ar}`}
                  >
                    <div className="space-y-4">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">{t('sections.location_qa')}</span>
                        <p className="text-gray-800 dark:text-gray-100 font-semibold">{getLocationName(section.locations_qa_id)}</p>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">{t('sections.section_name')}</span>
                        <p className="text-gray-800 dark:text-gray-100 font-semibold">
                          {language === 'en' ? section.section_en : section.section_ar || t('sections.unknown')}
                        </p>
                      </div>
                    </div>
                    {hasPrivilege && (
                      <div className="flex justify-end gap-3 mt-4">
                        <button
                          onClick={() => handleEdit(section)}
                          className="flex items-center text-indigo-500 hover:text-indigo-600 text-sm font-medium transition-colors duration-200"
                          aria-label={t('sections.edit')}
                        >
                          <PencilIcon className="w-4 h-4 mr-1" />
                          {t('sections.edit')}
                        </button>
                        <button
                          onClick={() => handleDelete(section.section_qa_id)}
                          className="flex items-center text-red-500 hover:text-red-600 text-sm font-medium transition-colors duration-200"
                          aria-label={t('sections.delete')}
                        >
                          <TrashIcon className="w-4 h-4 mr-1" />
                          {t('sections.delete')}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {(editingSection || isCreating) && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-gray-900 rounded-lg p-8 w-full max-w-md shadow-2xl">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                    {isCreating ? t('sections.add_title') : t('sections.edit_title')}
                  </h2>
                  <form onSubmit={isCreating ? handleSaveNew : handleUpdate} className="space-y-6">
                    {isCreating && (
                      <div>
                        <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="upload_mode">
                          {t('sections.upload_mode')}
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
                            <span className="text-gray-700 dark:text-gray-300">{t('sections.manual_entry')}</span>
                          </label>
                          <label className="flex items-center space-x-2">
                            <input
                              type="radio"
                              name="uploadMode"
                              checked={isBulkUpload}
                              onChange={() => {
                                setIsBulkUpload(true);
                                setNewSection({ ...newSection, section_en: '', section_ar: '' });
                              }}
                              className="form-radio h-4 w-4 text-indigo-500 transition duration-200"
                            />
                            <span className="text-gray-700 dark:text-gray-300">{t('sections.bulk_upload')}</span>
                          </label>
                        </div>
                      </div>
                    )}
                    <div>
                      <label
                        className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
                        htmlFor="locations_qa_id"
                      >
                        {t('sections.location_qa')}
                      </label>
                      <select
                        id="locations_qa_id"
                        value={newSection.locations_qa_id}
                        onChange={(e) =>
                          setNewSection({ ...newSection, locations_qa_id: e.target.value })
                        }
                        className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                        required
                        disabled={!isCreating}
                        aria-label={t('sections.location_qa')}
                      >
                        <option value="" disabled>
                          {t('sections.select_location')}
                        </option>
                        {locations.map((loc) => (
                          <option key={loc.locations_qa_id} value={loc.locations_qa_id}>
                            {language === 'en' ? loc.location_en : loc.location_ar}
                          </option>
                        ))}
                      </select>
                    </div>
                    {isCreating && isBulkUpload ? (
                      <div>
                        <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="file_upload">
                          {t('sections.upload_file')}
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
                          {t('sections.upload_instruction')}
                        </p>
                      </div>
                    ) : (
                      <>
                        <div>
                          <label
                            className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
                            htmlFor="section_en"
                          >
                            {t('sections.section_name_en')}
                          </label>
                          <input
                            type="text"
                            id="section_en"
                            value={newSection.section_en}
                            onChange={(e) =>
                              setNewSection({ ...newSection, section_en: e.target.value })
                            }
                            className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                            required
                          />
                        </div>
                        <div>
                          <label
                            className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
                            htmlFor="section_ar"
                          >
                            {t('sections.section_name_ar')}
                          </label>
                          <input
                            type="text"
                            id="section_ar"
                            value={newSection.section_ar}
                            onChange={(e) =>
                              setNewSection({ ...newSection, section_ar: e.target.value })
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
                          setEditingSection(null);
                          setIsCreating(false);
                          setError('');
                          setFile(null);
                        }}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded transition duration-200"
                      >
                        {t('sections.cancel')}
                      </button>
                      <button
                        type="submit"
                        className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded transition duration-200"
                        disabled={!newSection.locations_qa_id || (isBulkUpload && !file)}
                      >
                        {isCreating ? t('sections.create') : t('sections.save')}
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

export default SectionsQa;