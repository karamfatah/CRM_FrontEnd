// import React, { useState, useEffect } from 'react';
// import { useAuth } from '../../context/AuthContext';
// import { useLanguage } from '../../context/LanguageContext';
// import { locationsQaService } from '../../lib/locationsQaService';
// import { mainLocationService } from '../../lib/mainLocationService';
// import ModalSearch from '../../components/ModalSearch';
// import ThemeToggle from '../../components/ThemeToggle';
// import LanguageToggle from '../../components/LanguageToggle'; // Import LanguageToggle
// import Header from '../../partials/Header';
// import Sidebar from '../../partials/Sidebar';
// import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

// const LocationsQa = () => {
//   const { authData } = useAuth();
//   const { language, t } = useLanguage();
//   const [locations, setLocations] = useState([]);
//   const [mainLocations, setMainLocations] = useState([]);
//   const [selectedMainLocation, setSelectedMainLocation] = useState('');
//   const [editingLocation, setEditingLocation] = useState(null);
//   const [newLocation, setNewLocation] = useState({
//     main_location_id: '',
//     location_en: '',
//     location_ar: '',
//   });
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(true);
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [isCreating, setIsCreating] = useState(false);
//   const [hasPrivilege, setHasPrivilege] = useState(false);

//   useEffect(() => {
//     if (authData && authData.privilege_ids.includes(1)) {
//       setHasPrivilege(true);
//     } else {
//       setError(t('locations.no_permission'));
//     }
//   }, [authData, t]);

//   const fetchMainLocations = async () => {
//     if (!authData?.org_id) {
//       setError(t('locations.no_org_id'));
//       return;
//     }
//     try {
//       console.log('Fetching main locations for dropdown');
//       const data = await mainLocationService.getMainLocations(authData.org_id);
//       console.log('Main Locations received:', data);
//       setMainLocations(Array.isArray(data) ? data : []);
//     } catch (err) {
//       console.error('Error fetching main locations:', err.message);
//       setError(t('locations.fetch_main_locations_error'));
//     }
//   };

//   const fetchLocations = async (mainLocationId = null) => {
//     if (!authData?.org_id || !hasPrivilege) {
//       setLoading(false);
//       return;
//     }
//     setLoading(true);
//     try {
//       console.log('Fetching locations from API with main_location_id:', mainLocationId);
//       const data = await locationsQaService.getLocations(authData.org_id, mainLocationId);
//       console.log('Locations received:', data);
//       setLocations(Array.isArray(data) ? data : []);
//       setError('');
//     } catch (err) {
//       console.error('Error fetching locations:', err.message);
//       setError(t('locations.fetch_error'));
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     console.log('useEffect triggered to fetch main locations');
//     fetchMainLocations();
//   }, [authData?.org_id, hasPrivilege, t]);

//   useEffect(() => {
//     if (mainLocations.length > 0) {
//       console.log('useEffect triggered to fetch locations with selectedMainLocation:', selectedMainLocation);
//       fetchLocations(selectedMainLocation ? parseInt(selectedMainLocation) : null);
//     }
//   }, [selectedMainLocation, authData?.org_id, hasPrivilege, mainLocations, t]);

//   const handleEdit = async (location) => {
//     if (!hasPrivilege) {
//       setError(t('locations.no_permission'));
//       return;
//     }
//     console.log('Editing location:', location);
//     try {
//       const data = await locationsQaService.getLocation(location.locations_qa_id, authData.org_id);
//       setEditingLocation(location);
//       setNewLocation({
//         main_location_id: data.main_location_id,
//         location_en: data.location_en,
//         location_ar: data.location_ar,
//       });
//     } catch (err) {
//       console.error('Error fetching location for edit:', err.message);
//       setError(err.message || t('locations.fetch_edit_error'));
//     }
//   };

//   const initiateCreate = () => {
//     if (!hasPrivilege) {
//       setError(t('locations.no_permission'));
//       return;
//     }
//     console.log('Opening create location modal');
//     setIsCreating(true);
//     setNewLocation({
//       main_location_id: selectedMainLocation || '',
//       location_en: '',
//       location_ar: '',
//     });
//   };

//   const handleUpdate = async (e) => {
//     e.preventDefault();
//     if (!hasPrivilege) {
//       setError(t('locations.no_permission'));
//       return;
//     }
//     console.log('Updating location:', { id: editingLocation.locations_qa_id, ...newLocation });
//     try {
//       await locationsQaService.updateLocation(
//         editingLocation.locations_qa_id,
//         newLocation,
//         authData.org_id
//       );
//       console.log('Location updated successfully');
//       setEditingLocation(null);
//       setNewLocation({ main_location_id: selectedMainLocation || '', location_en: '', location_ar: '' });
//       fetchLocations(selectedMainLocation ? parseInt(selectedMainLocation) : null);
//     } catch (err) {
//       console.error('Error updating location:', err.message);
//       setError(err.message || t('locations.update_error'));
//     }
//   };

//   const handleSaveNew = async (e) => {
//     e.preventDefault();
//     if (!hasPrivilege) {
//       setError(t('locations.no_permission'));
//       return;
//     }
//     console.log('Creating new location:', newLocation);
//     try {
//       await locationsQaService.createLocation(newLocation, authData.org_id);
//       console.log('Location created successfully');
//       setIsCreating(false);
//       setNewLocation({ main_location_id: selectedMainLocation || '', location_en: '', location_ar: '' });
//       fetchLocations(selectedMainLocation ? parseInt(selectedMainLocation) : null);
//     } catch (err) {
//       console.error('Error creating location:', err.message);
//       setError(err.message || t('locations.create_error'));
//     }
//   };

//   const handleDelete = async (id) => {
//     if (!hasPrivilege) {
//       setError(t('locations.no_permission'));
//       return;
//     }
//     if (window.confirm(t('locations.delete_confirm'))) {
//       console.log('Deleting location:', id);
//       try {
//         await locationsQaService.deleteLocation(id, authData.org_id);
//         console.log('Location deleted successfully');
//         fetchLocations(selectedMainLocation ? parseInt(selectedMainLocation) : null);
//       } catch (err) {
//         console.error('Error deleting location:', err.message);
//         setError(err.message || t('locations.delete_error'));
//       }
//     }
//   };

//   const getMainLocationName = (main_location_id) => {
//     console.log('getMainLocationName called with main_location_id:', main_location_id);
//     console.log('Current mainLocations:', mainLocations);
//     if (!main_location_id) {
//       console.log('main_location_id is undefined or null');
//       return t('locations.not_assigned');
//     }
//     const mainLocation = mainLocations.find((ml) => ml.main_location_id === main_location_id);
//     console.log('Found mainLocation:', mainLocation);
//     return mainLocation
//       ? (language === 'en' ? mainLocation.main_location_name_en : mainLocation.main_location_ar)
//       : t('locations.not_assigned');
//   };

//   if (!authData) {
//     return <div className="text-gray-600">{t('common.loading')}</div>;
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
//                 <h1 className="text-2xl md:text-3xl text-gray-800 font-bold">
//                   {t('locations.title')}
//                 </h1>
//               </div>
//               <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
//                 <select
//                   value={selectedMainLocation}
//                   onChange={(e) => setSelectedMainLocation(e.target.value)}
//                   className="shadow appearance-none border border-gray-300 rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
//                   aria-label={t('locations.main_location')}
//                 >
//                   <option value="">{t('locations.all_locations')}</option>
//                   {mainLocations.map((ml) => (
//                     <option key={ml.main_location_id} value={ml.main_location_id}>
//                       {language === 'en' ? ml.main_location_name_en : ml.main_location_ar}
//                     </option>
//                   ))}
//                 </select>
//                 {/* <LanguageToggle /> Use LanguageToggle component */}
//                 {hasPrivilege && (
//                   <button
//                     onClick={initiateCreate}
//                     className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded transition duration-200"
//                   >
//                     {t('locations.add_location')}
//                   </button>
//                 )}
//                 <ModalSearch />
//                 {/* <ThemeToggle /> */}
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
//               <div className="text-gray-600">{t('locations.loading')}</div>
//             ) : locations.length === 0 ? (
//               <div className="text-gray-600">{t('locations.no_locations')}</div>
//             ) : (
//               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//                 {locations.map((location) => (
//                   <div
//                     key={location.locations_qa_id}
//                     className="bg-white shadow-lg rounded-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow duration-200"
//                     role="region"
//                     aria-label={`${t('locations.location_name')}: ${language === 'en' ? location.location_en : location.location_ar}`}
//                   >
//                     <div className="space-y-4">
//                       <div>
//                         <span className="text-gray-500 text-sm font-medium">{t('locations.main_location')}</span>
//                         <p className="text-gray-800 font-semibold">{getMainLocationName(location.main_location_id)}</p>
//                       </div>
//                       <div>
//                         <span className="text-gray-500 text-sm font-medium">{t('locations.location_name')}</span>
//                         <p className="text-gray-800 font-semibold">
//                           {language === 'en' ? location.location_en : location.location_ar}
//                         </p>
//                       </div>
//                     </div>
//                     {hasPrivilege && (
//                       <div className="flex justify-end gap-3 mt-4">
//                         <button
//                           onClick={() => handleEdit(location)}
//                           className="flex items-center text-indigo-500 hover:text-indigo-600 text-sm font-medium transition-colors duration-200"
//                           aria-label={t('locations.edit')}
//                         >
//                           <PencilIcon className="w-4 h-4 mr-1" />
//                           {t('locations.edit')}
//                         </button>
//                         <button
//                           onClick={() => handleDelete(location.locations_qa_id)}
//                           className="flex items-center text-red-500 hover:text-red-600 text-sm font-medium transition-colors duration-200"
//                           aria-label={t('locations.delete')}
//                         >
//                           <TrashIcon className="w-4 h-4 mr-1" />
//                           {t('locations.delete')}
//                         </button>
//                       </div>
//                     )}
//                   </div>
//                 ))}
//               </div>
//             )}

//             {(editingLocation || isCreating) && (
//               <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//                 <div className="bg-white rounded-lg p-8 w-full max-w-md shadow-2xl">
//                   <h2 className="text-2xl font-bold text-gray-800 mb-6">
//                     {isCreating ? t('locations.add_title') : t('locations.edit_title')}
//                   </h2>
//                   <form onSubmit={isCreating ? handleSaveNew : handleUpdate} className="space-y-6">
//                     <div>
//                       <label
//                         className="block text-gray-700 text-sm font-bold mb-2"
//                         htmlFor="main_location_id"
//                       >
//                         {t('locations.main_location')}
//                       </label>
//                       <select
//                         id="main_location_id"
//                         value={newLocation.main_location_id}
//                         onChange={(e) =>
//                           setNewLocation({ ...newLocation, main_location_id: e.target.value })
//                         }
//                         className="shadow appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
//                         required
//                         aria-label={t('locations.main_location')}
//                       >
//                         <option value="" disabled>
//                           {t('locations.select_main_location')}
//                         </option>
//                         {mainLocations.map((ml) => (
//                           <option key={ml.main_location_id} value={ml.main_location_id}>
//                             {language === 'en' ? ml.main_location_name_en : ml.main_location_ar}
//                           </option>
//                         ))}
//                       </select>
//                     </div>
//                     <div>
//                       <label
//                         className="block text-gray-700 text-sm font-bold mb-2"
//                         htmlFor="location_en"
//                       >
//                         {t('locations.location_name_en')}
//                       </label>
//                       <input
//                         type="text"
//                         id="location_en"
//                         value={newLocation.location_en}
//                         onChange={(e) =>
//                           setNewLocation({ ...newLocation, location_en: e.target.value })
//                         }
//                         className="shadow appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
//                         required
//                       />
//                     </div>
//                     <div>
//                       <label
//                         className="block text-gray-700 text-sm font-bold mb-2"
//                         htmlFor="location_ar"
//                       >
//                         {t('locations.location_name_ar')}
//                       </label>
//                       <input
//                         type="text"
//                         id="location_ar"
//                         value={newLocation.location_ar}
//                         onChange={(e) =>
//                           setNewLocation({ ...newLocation, location_ar: e.target.value })
//                         }
//                         className="shadow appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
//                         required
//                       />
//                     </div>
//                     <div className="flex justify-end gap-3">
//                       <button
//                         type="button"
//                         onClick={() => {
//                           setEditingLocation(null);
//                           setIsCreating(false);
//                         }}
//                         className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded transition duration-200"
//                       >
//                         {t('locations.cancel')}
//                       </button>
//                       <button
//                         type="submit"
//                         className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded transition duration-200"
//                       >
//                         {isCreating ? t('locations.create') : t('locations.save')}
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

// export default LocationsQa;
// import React, { useState, useEffect } from 'react';
// import { useAuth } from '../../context/AuthContext';
// import { useLanguage } from '../../context/LanguageContext';
// import { locationsQaService } from '../../lib/locationsQaService';
// import { mainLocationService } from '../../lib/mainLocationService';
// import ModalSearch from '../../components/ModalSearch';
// import ThemeToggle from '../../components/ThemeToggle';
// import LanguageToggle from '../../components/LanguageToggle';
// import Header from '../../partials/Header';
// import Sidebar from '../../partials/Sidebar';
// import LoadingSpinner from '../../components/LoadingSpinner';
// import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

// const LocationsQa = () => {
//   const { authData, loading: authLoading } = useAuth();
//   const { language, t } = useLanguage();
//   const [locations, setLocations] = useState([]);
//   const [mainLocations, setMainLocations] = useState([]);
//   const [selectedMainLocation, setSelectedMainLocation] = useState('');
//   const [editingLocation, setEditingLocation] = useState(null);
//   const [newLocation, setNewLocation] = useState({
//     main_location_id: '',
//     location_en: '',
//     location_ar: '',
//   });
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(true);
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [isCreating, setIsCreating] = useState(false);
//   const [hasPrivilege, setHasPrivilege] = useState(false);

//   // Check authentication and privileges
//   useEffect(() => {
//     if (authLoading) return;

//     if (!authData?.access_token) {
//       setError(t('locations.no_permission'));
//       setLoading(false);
//       return;
//     }

//     if (authData.privilege_ids.includes(1)) {
//       setHasPrivilege(true);
//     } else {
//       setError(t('locations.no_permission'));
//       setHasPrivilege(false);
//       setLoading(false);
//     }
//   }, [authData, authLoading, t]);

//   const fetchMainLocations = async () => {
//     if (!authData?.org_id) {
//       setError(t('locations.no_org_id'));
//       setLoading(false);
//       return;
//     }
//     try {
//       console.log('Fetching main locations for dropdown');
//       const data = await mainLocationService.getMainLocations(authData.org_id);
//       console.log('Main Locations received:', data);
//       setMainLocations(Array.isArray(data) ? data : []);
//       setError('');
//     } catch (err) {
//       console.error('Error fetching main locations:', err.message);
//       setError(t('locations.fetch_main_locations_error'));
//     }
//   };

//   const fetchLocations = async (mainLocationId = null) => {
//     if (!authData?.org_id || !hasPrivilege) {
//       setLoading(false);
//       return;
//     }
//     setLoading(true);
//     try {
//       console.log('Fetching locations from API with main_location_id:', mainLocationId);
//       const data = await locationsQaService.getLocations(authData.org_id, mainLocationId);
//       console.log('Locations received:', data);
//       setLocations(Array.isArray(data) ? data : []);
//       setError('');
//     } catch (err) {
//       console.error('Error fetching locations:', err.message);
//       setError(t('locations.fetch_error'));
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (!authLoading && authData?.org_id && hasPrivilege) {
//       fetchMainLocations();
//     }
//   }, [authData?.org_id, hasPrivilege, authLoading, t]);

//   useEffect(() => {
//     if (mainLocations.length > 0 && hasPrivilege) {
//       fetchLocations(selectedMainLocation ? parseInt(selectedMainLocation) : null);
//     }
//   }, [selectedMainLocation, authData?.org_id, hasPrivilege, mainLocations, t]);

//   const handleEdit = async (location) => {
//     if (!hasPrivilege) {
//       setError(t('locations.no_permission'));
//       return;
//     }
//     console.log('Editing location:', location);
//     try {
//       const data = await locationsQaService.getLocation(location.locations_qa_id, authData.org_id);
//       setEditingLocation(location);
//       setNewLocation({
//         main_location_id: data.main_location_id,
//         location_en: data.location_en,
//         location_ar: data.location_ar,
//       });
//     } catch (err) {
//       console.error('Error fetching location for edit:', err.message);
//       setError(err.message || t('locations.fetch_edit_error'));
//     }
//   };

//   const initiateCreate = () => {
//     if (!hasPrivilege) {
//       setError(t('locations.no_permission'));
//       return;
//     }
//     console.log('Opening create location modal');
//     setIsCreating(true);
//     setNewLocation({
//       main_location_id: selectedMainLocation || '',
//       location_en: '',
//       location_ar: '',
//     });
//   };

//   const handleUpdate = async (e) => {
//     e.preventDefault();
//     if (!hasPrivilege) {
//       setError(t('locations.no_permission'));
//       return;
//     }
//     console.log('Updating location:', { id: editingLocation.locations_qa_id, ...newLocation });
//     try {
//       await locationsQaService.updateLocation(
//         editingLocation.locations_qa_id,
//         newLocation,
//         authData.org_id
//       );
//       console.log('Location updated successfully');
//       setEditingLocation(null);
//       setNewLocation({ main_location_id: selectedMainLocation || '', location_en: '', location_ar: '' });
//       fetchLocations(selectedMainLocation ? parseInt(selectedMainLocation) : null);
//     } catch (err) {
//       console.error('Error updating location:', err.message);
//       setError(err.message || t('locations.update_error'));
//     }
//   };

//   const handleSaveNew = async (e) => {
//     e.preventDefault();
//     if (!hasPrivilege) {
//       setError(t('locations.no_permission'));
//       return;
//     }
//     console.log('Creating new location:', newLocation);
//     try {
//       await locationsQaService.createLocation(newLocation, authData.org_id);
//       console.log('Location created successfully');
//       setIsCreating(false);
//       setNewLocation({ main_location_id: selectedMainLocation || '', location_en: '', location_ar: '' });
//       fetchLocations(selectedMainLocation ? parseInt(selectedMainLocation) : null);
//     } catch (err) {
//       console.error('Error creating location:', err.message);
//       setError(err.message || t('locations.create_error'));
//     }
//   };

//   const handleDelete = async (id) => {
//     if (!hasPrivilege) {
//       setError(t('locations.no_permission'));
//       return;
//     }
//     if (window.confirm(t('locations.delete_confirm'))) {
//       console.log('Deleting location:', id);
//       try {
//         await locationsQaService.deleteLocation(id, authData.org_id);
//         console.log('Location deleted successfully');
//         fetchLocations(selectedMainLocation ? parseInt(selectedMainLocation) : null);
//       } catch (err) {
//         console.error('Error deleting location:', err.message);
//         setError(err.message || t('locations.delete_error'));
//       }
//     }
//   };

//   const getMainLocationName = (main_location_id) => {
//     console.log('getMainLocationName called with main_location_id:', main_location_id);
//     console.log('Current mainLocations:', mainLocations);
//     if (!main_location_id) {
//       console.log('main_location_id is undefined or null');
//       return t('locations.not_assigned');
//     }
//     const mainLocation = mainLocations.find((ml) => ml.main_location_id === main_location_id);
//     console.log('Found mainLocation:', mainLocation);
//     return mainLocation
//       ? (language === 'en' ? mainLocation.main_location_name_en : mainLocation.main_location_ar)
//       : t('locations.not_assigned');
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
//               <div className="mb-4 sm:mb-0">
//                 <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
//                   {t('locations.title')}
//                 </h1>
//               </div>
//               <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
//                 <select
//                   value={selectedMainLocation}
//                   onChange={(e) => setSelectedMainLocation(e.target.value)}
//                   className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
//                   aria-label={t('locations.main_location')}
//                 >
//                   <option value="">{t('locations.all_locations')}</option>
//                   {mainLocations.map((ml) => (
//                     <option key={ml.main_location_id} value={ml.main_location_id}>
//                       {language === 'en' ? ml.main_location_name_en : ml.main_location_ar}
//                     </option>
//                   ))}
//                 </select>
//                 <LanguageToggle />
//                 {hasPrivilege && (
//                   <button
//                     onClick={initiateCreate}
//                     className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded transition duration-200"
//                   >
//                     {t('locations.add_location')}
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
//             ) : locations.length === 0 ? (
//               <div className="text-gray-600 dark:text-gray-300">{t('locations.no_locations')}</div>
//             ) : (
//               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//                 {locations.map((location) => (
//                   <div
//                     key={location.locations_qa_id}
//                     className="bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow duration-200"
//                     role="region"
//                     aria-label={`${t('locations.location_name')}: ${language === 'en' ? location.location_en : location.location_ar}`}
//                   >
//                     <div className="space-y-4">
//                       <div>
//                         <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">{t('locations.main_location')}</span>
//                         <p className="text-gray-800 dark:text-gray-100 font-semibold">{getMainLocationName(location.main_location_id)}</p>
//                       </div>
//                       <div>
//                         <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">{t('locations.location_name')}</span>
//                         <p className="text-gray-800 dark:text-gray-100 font-semibold">
//                           {language === 'en' ? location.location_en : location.location_ar}
//                         </p>
//                       </div>
//                     </div>
//                     {hasPrivilege && (
//                       <div className="flex justify-end gap-3 mt-4">
//                         <button
//                           onClick={() => handleEdit(location)}
//                           className="flex items-center text-indigo-500 hover:text-indigo-600 text-sm font-medium transition-colors duration-200"
//                           aria-label={t('locations.edit')}
//                         >
//                           <PencilIcon className="w-4 h-4 mr-1" />
//                           {t('locations.edit')}
//                         </button>
//                         <button
//                           onClick={() => handleDelete(location.locations_qa_id)}
//                           className="flex items-center text-red-500 hover:text-red-600 text-sm font-medium transition-colors duration-200"
//                           aria-label={t('locations.delete')}
//                         >
//                           <TrashIcon className="w-4 h-4 mr-1" />
//                           {t('locations.delete')}
//                         </button>
//                       </div>
//                     )}
//                   </div>
//                 ))}
//               </div>
//             )}

//             {(editingLocation || isCreating) && (
//               <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//                 <div className="bg-white dark:bg-gray-900 rounded-lg p-8 w-full max-w-md shadow-2xl">
//                   <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
//                     {isCreating ? t('locations.add_title') : t('locations.edit_title')}
//                   </h2>
//                   <form onSubmit={isCreating ? handleSaveNew : handleUpdate} className="space-y-6">
//                     <div>
//                       <label
//                         className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
//                         htmlFor="main_location_id"
//                       >
//                         {t('locations.main_location')}
//                       </label>
//                       <select
//                         id="main_location_id"
//                         value={newLocation.main_location_id}
//                         onChange={(e) =>
//                           setNewLocation({ ...newLocation, main_location_id: e.target.value })
//                         }
//                         className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
//                         required
//                         aria-label={t('locations.main_location')}
//                       >
//                         <option value="" disabled>
//                           {t('locations.select_main_location')}
//                         </option>
//                         {mainLocations.map((ml) => (
//                           <option key={ml.main_location_id} value={ml.main_location_id}>
//                             {language === 'en' ? ml.main_location_name_en : ml.main_location_ar}
//                           </option>
//                         ))}
//                       </select>
//                     </div>
//                     <div>
//                       <label
//                         className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
//                         htmlFor="location_en"
//                       >
//                         {t('locations.location_name_en')}
//                       </label>
//                       <input
//                         type="text"
//                         id="location_en"
//                         value={newLocation.location_en}
//                         onChange={(e) =>
//                           setNewLocation({ ...newLocation, location_en: e.target.value })
//                         }
//                         className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
//                         required
//                       />
//                     </div>
//                     <div>
//                       <label
//                         className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
//                         htmlFor="location_ar"
//                       >
//                         {t('locations.location_name_ar')}
//                       </label>
//                       <input
//                         type="text"
//                         id="location_ar"
//                         value={newLocation.location_ar}
//                         onChange={(e) =>
//                           setNewLocation({ ...newLocation, location_ar: e.target.value })
//                         }
//                         className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
//                         required
//                       />
//                     </div>
//                     <div className="flex justify-end gap-3">
//                       <button
//                         type="button"
//                         onClick={() => {
//                           setEditingLocation(null);
//                           setIsCreating(false);
//                           setError('');
//                         }}
//                         className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded transition duration-200"
//                       >
//                         {t('locations.cancel')}
//                       </button>
//                       <button
//                         type="submit"
//                         className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded transition duration-200"
//                       >
//                         {isCreating ? t('locations.create') : t('locations.save')}
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

// export default LocationsQa;

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { locationsQaService } from '../../lib/locationsQaService';
import { mainLocationService } from '../../lib/mainLocationService';
import ModalSearch from '../../components/ModalSearch';
import ThemeToggle from '../../components/ThemeToggle';
import LanguageToggle from '../../components/LanguageToggle';
import Header from '../../partials/Header';
import Sidebar from '../../partials/Sidebar';
import LoadingSpinner from '../../components/LoadingSpinner';
import { PencilIcon, TrashIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';

const LocationsQa = () => {
  const { authData, loading: authLoading } = useAuth();
  const { language, t } = useLanguage();
  const [locations, setLocations] = useState([]);
  const [mainLocations, setMainLocations] = useState([]);
  const [selectedMainLocation, setSelectedMainLocation] = useState('');
  const [editingLocation, setEditingLocation] = useState(null);
  const [newLocation, setNewLocation] = useState({
    main_location_id: '',
    location_en: '',
    location_ar: '',
    location_email: '',
    location_manager_emails: [],
    location_phone: '',
    location_manager_phones: [],
  });
  const [managerEmailInput, setManagerEmailInput] = useState('');
  const [managerPhoneInput, setManagerPhoneInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [hasPrivilege, setHasPrivilege] = useState(false);

  // Check authentication and privileges
  useEffect(() => {
    if (authLoading) return;

    if (!authData?.access_token) {
      setError(t('locations.no_permission'));
      setLoading(false);
      return;
    }

    if (authData.privilege_ids.includes(1)) {
      setHasPrivilege(true);
    } else {
      setError(t('locations.no_permission'));
      setHasPrivilege(false);
      setLoading(false);
    }
  }, [authData, authLoading, t]);

  const fetchMainLocations = async () => {
    if (!authData?.org_id) {
      setError(t('locations.no_org_id'));
      setLoading(false);
      return;
    }
    try {
      console.log('Fetching main locations for dropdown');
      const data = await mainLocationService.getMainLocations(authData.org_id);
      console.log('Main Locations received:', data);
      setMainLocations(Array.isArray(data) ? data : []);
      setError('');
    } catch (err) {
      console.error('Error fetching main locations:', err.message);
      setError(t('locations.fetch_main_locations_error'));
    }
  };

  const fetchLocations = async (mainLocationId = null) => {
    if (!authData?.org_id || !hasPrivilege) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      console.log('Fetching locations from API with main_location_id:', mainLocationId);
      const data = await locationsQaService.getLocations(authData.org_id, mainLocationId);
      console.log('Locations received:', data);
      setLocations(Array.isArray(data) ? data : []);
      setError('');
    } catch (err) {
      console.error('Error fetching locations:', err.message);
      setError(t('locations.fetch_error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && authData?.org_id && hasPrivilege) {
      fetchMainLocations();
    }
  }, [authData?.org_id, hasPrivilege, authLoading, t]);

  useEffect(() => {
    if (mainLocations.length > 0 && hasPrivilege) {
      fetchLocations(selectedMainLocation ? selectedMainLocation : null);
    }
  }, [selectedMainLocation, authData?.org_id, hasPrivilege, mainLocations, t]);

  const handleEdit = async (location) => {
    if (!hasPrivilege) {
      setError(t('locations.no_permission'));
      return;
    }
    console.log('Editing location:', location);
    try {
      const data = await locationsQaService.getLocation(location.locations_qa_id, authData.org_id);
      setEditingLocation(location);
      setNewLocation({
        main_location_id: data.main_location_id,
        location_en: data.location_en,
        location_ar: data.location_ar,
        location_email: data.location_email || '',
        location_manager_emails: Array.isArray(data.location_manager_emails) ? [...data.location_manager_emails] : [],
        location_phone: data.location_phone || '',
        location_manager_phones: Array.isArray(data.location_manager_phones) ? [...data.location_manager_phones] : [],
      });
      setManagerEmailInput('');
      setManagerPhoneInput('');
    } catch (err) {
      console.error('Error fetching location for edit:', err.message);
      setError(err.message || t('locations.fetch_edit_error'));
    }
  };

  const initiateCreate = () => {
    if (!hasPrivilege) {
      setError(t('locations.no_permission'));
      return;
    }
    console.log('Opening create location modal');
    setIsCreating(true);
    setNewLocation({
      main_location_id: selectedMainLocation || '',
      location_en: '',
      location_ar: '',
      location_email: '',
      location_manager_emails: [],
      location_phone: '',
      location_manager_phones: [],
    });
    setManagerEmailInput('');
    setManagerPhoneInput('');
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!hasPrivilege) {
      setError(t('locations.no_permission'));
      return;
    }
    console.log('Updating location:', { id: editingLocation.locations_qa_id, ...newLocation });
    try {
      await locationsQaService.updateLocation(
        editingLocation.locations_qa_id,
        newLocation,
        authData.org_id
      );
      console.log('Location updated successfully');
      setEditingLocation(null);
      setNewLocation({ 
        main_location_id: selectedMainLocation || '', 
        location_en: '', 
        location_ar: '',
        location_email: '',
        location_manager_emails: [],
        location_phone: '',
        location_manager_phones: [],
      });
      setManagerEmailInput('');
      setManagerPhoneInput('');
      fetchLocations(selectedMainLocation ? selectedMainLocation : null);
    } catch (err) {
      console.error('Error updating location:', err.message);
      setError(err.message || t('locations.update_error'));
    }
  };

  const handleSaveNew = async (e) => {
    e.preventDefault();
    if (!hasPrivilege) {
      setError(t('locations.no_permission'));
      return;
    }
    console.log('Creating new location:', newLocation);
    try {
      await locationsQaService.createLocation(newLocation, authData.org_id);
      console.log('Location created successfully');
      setIsCreating(false);
      setNewLocation({ 
        main_location_id: selectedMainLocation || '', 
        location_en: '', 
        location_ar: '',
        location_email: '',
        location_manager_emails: [],
        location_phone: '',
        location_manager_phones: [],
      });
      setManagerEmailInput('');
      setManagerPhoneInput('');
      fetchLocations(selectedMainLocation ? selectedMainLocation : null);
    } catch (err) {
      console.error('Error creating location:', err.message);
      setError(err.message || t('locations.create_error'));
    }
  };

  const handleDelete = async (id) => {
    if (!hasPrivilege) {
      setError(t('locations.no_permission'));
      return;
    }
    if (window.confirm(t('locations.delete_confirm'))) {
      console.log('Deleting location:', id);
      try {
        await locationsQaService.deleteLocation(id, authData.org_id);
        console.log('Location deleted successfully');
        fetchLocations(selectedMainLocation ? selectedMainLocation : null);
      } catch (err) {
        console.error('Error deleting location:', err.message);
        setError(err.message || t('locations.delete_error'));
      }
    }
  };

  const getMainLocationName = (main_location_id) => {
    console.log('getMainLocationName called with main_location_id:', main_location_id);
    console.log('Current mainLocations:', mainLocations);
    if (!main_location_id) {
      console.log('main_location_id is undefined or null');
      return t('locations.not_assigned');
    }
    const mainLocation = mainLocations.find((ml) => ml.id === main_location_id);
    console.log('Found mainLocation:', mainLocation);
    return mainLocation
      ? (language === 'en' ? mainLocation.main_location_name_en : mainLocation.main_location_ar)
      : t('locations.not_assigned');
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
                  {t('locations.title')}
                </h1>
              </div>
              <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
                <select
                  value={selectedMainLocation}
                  onChange={(e) => setSelectedMainLocation(e.target.value)}
                  className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                  aria-label={t('locations.main_location')}
                >
                  <option value="">{t('locations.all_locations')}</option>
                  {mainLocations.map((ml) => (
                    <option key={ml.id} value={ml.id}>
                      {language === 'en' ? ml.main_location_name_en : ml.main_location_ar}
                    </option>
                  ))}
                </select>
                <LanguageToggle />
                {hasPrivilege && (
                  <button
                    onClick={initiateCreate}
                    className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded transition duration-200"
                  >
                    {t('locations.add_location')}
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
            ) : locations.length === 0 ? (
              <div className="text-gray-600 dark:text-gray-300">{t('locations.no_locations')}</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {locations.map((location) => (
                  <div
                    key={location.locations_qa_id}
                    className="bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow duration-200"
                    role="region"
                    aria-label={`${t('locations.location_name')}: ${language === 'en' ? location.location_en : location.location_ar}`}
                  >
                    <div className="space-y-4">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">{t('locations.main_location')}</span>
                        <p className="text-gray-800 dark:text-gray-100 font-semibold">{getMainLocationName(location.main_location_id)}</p>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">{t('locations.location_name')}</span>
                        <p className="text-gray-800 dark:text-gray-100 font-semibold">
                          {language === 'en' ? location.location_en : location.location_ar}
                        </p>
                      </div>
                    </div>
                    {hasPrivilege && (
                      <div className="flex justify-end gap-3 mt-4">
                        <button
                          onClick={() => handleEdit(location)}
                          className="flex items-center text-indigo-500 hover:text-indigo-600 text-sm font-medium transition-colors duration-200"
                          aria-label={t('locations.edit')}
                        >
                          <PencilIcon className="w-4 h-4 mr-1" />
                          {t('locations.edit')}
                        </button>
                        <button
                          onClick={() => handleDelete(location.locations_qa_id)}
                          className="flex items-center text-red-500 hover:text-red-600 text-sm font-medium transition-colors duration-200"
                          aria-label={t('locations.delete')}
                        >
                          <TrashIcon className="w-4 h-4 mr-1" />
                          {t('locations.delete')}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {(editingLocation || isCreating) && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
                <div className="bg-white dark:bg-gray-900 rounded-lg p-8 w-full max-w-2xl shadow-2xl my-8">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                    {isCreating ? t('locations.add_title') : t('locations.edit_title')}
                  </h2>
                  <form onSubmit={isCreating ? handleSaveNew : handleUpdate} className="space-y-6">
                    <div>
                      <label
                        className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
                        htmlFor="main_location_id"
                      >
                        {t('locations.main_location')}
                      </label>
                      <select
                        id="main_location_id"
                        value={newLocation.main_location_id}
                        onChange={(e) =>
                          setNewLocation({ ...newLocation, main_location_id: e.target.value })
                        }
                        className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                        required
                        aria-label={t('locations.main_location')}
                      >
                        <option value="" disabled>
                          {t('locations.select_main_location')}
                        </option>
                        {mainLocations.map((ml) => (
                          <option key={ml.id} value={ml.id}>
                            {language === 'en' ? ml.main_location_name_en : ml.main_location_ar}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label
                        className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
                        htmlFor="location_en"
                      >
                        {t('locations.location_name_en')}
                      </label>
                      <input
                        type="text"
                        id="location_en"
                        value={newLocation.location_en}
                        onChange={(e) =>
                          setNewLocation({ ...newLocation, location_en: e.target.value })
                        }
                        className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                        required
                      />
                    </div>
                    <div>
                      <label
                        className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
                        htmlFor="location_ar"
                      >
                        {t('locations.location_name_ar')}
                      </label>
                      <input
                        type="text"
                        id="location_ar"
                        value={newLocation.location_ar}
                        onChange={(e) =>
                          setNewLocation({ ...newLocation, location_ar: e.target.value })
                        }
                        className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                        required
                      />
                    </div>
                    <div>
                      <label
                        className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
                        htmlFor="location_email"
                      >
                        {t('locations.location_email') || 'Location Email'}
                      </label>
                      <input
                        type="email"
                        id="location_email"
                        value={newLocation.location_email}
                        onChange={(e) =>
                          setNewLocation({ ...newLocation, location_email: e.target.value })
                        }
                        className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                        placeholder={t('locations.location_email_placeholder') || 'location@example.com'}
                      />
                    </div>
                    <div>
                      <label
                        className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
                        htmlFor="location_manager_emails"
                      >
                        {t('locations.location_manager_emails') || 'Location Manager Emails'}
                      </label>
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <input
                            type="email"
                            id="location_manager_emails"
                            value={managerEmailInput}
                            onChange={(e) => setManagerEmailInput(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                if (managerEmailInput.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(managerEmailInput.trim())) {
                                  setNewLocation({
                                    ...newLocation,
                                    location_manager_emails: [...newLocation.location_manager_emails, managerEmailInput.trim()],
                                  });
                                  setManagerEmailInput('');
                                }
                              }
                            }}
                            className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                            placeholder={t('locations.manager_email_placeholder') || 'manager@example.com'}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (managerEmailInput.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(managerEmailInput.trim())) {
                                setNewLocation({
                                  ...newLocation,
                                  location_manager_emails: [...newLocation.location_manager_emails, managerEmailInput.trim()],
                                });
                                setManagerEmailInput('');
                              }
                            }}
                            className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded transition duration-200 flex items-center"
                            title={t('locations.add_manager_email') || 'Add Email'}
                          >
                            <PlusIcon className="w-5 h-5" />
                          </button>
                        </div>
                        {newLocation.location_manager_emails.length > 0 && (
                          <div className="space-y-1">
                            {newLocation.location_manager_emails.map((email, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 rounded px-3 py-2"
                              >
                                <span className="text-sm text-gray-700 dark:text-gray-300">{email}</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updatedEmails = newLocation.location_manager_emails.filter((_, i) => i !== index);
                                    setNewLocation({ ...newLocation, location_manager_emails: updatedEmails });
                                  }}
                                  className="text-red-500 hover:text-red-700 transition duration-200"
                                  title={t('locations.remove_manager_email') || 'Remove Email'}
                                >
                                  <XMarkIcon className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <label
                        className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
                        htmlFor="location_phone"
                      >
                        {t('locations.location_phone') || 'Location Phone'}
                      </label>
                      <input
                        type="tel"
                        id="location_phone"
                        value={newLocation.location_phone}
                        onChange={(e) =>
                          setNewLocation({ ...newLocation, location_phone: e.target.value })
                        }
                        className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                        placeholder={t('locations.location_phone_placeholder') || '+1234567890'}
                      />
                    </div>
                    <div>
                      <label
                        className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
                        htmlFor="location_manager_phones"
                      >
                        {t('locations.location_manager_phones') || 'Location Manager Phones'}
                      </label>
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <input
                            type="tel"
                            id="location_manager_phones"
                            value={managerPhoneInput}
                            onChange={(e) => setManagerPhoneInput(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                if (managerPhoneInput.trim() && /^[\d\s\+\-\(\)]+$/.test(managerPhoneInput.trim())) {
                                  setNewLocation({
                                    ...newLocation,
                                    location_manager_phones: [...newLocation.location_manager_phones, managerPhoneInput.trim()],
                                  });
                                  setManagerPhoneInput('');
                                }
                              }
                            }}
                            className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                            placeholder={t('locations.manager_phone_placeholder') || '+1234567890'}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (managerPhoneInput.trim() && /^[\d\s\+\-\(\)]+$/.test(managerPhoneInput.trim())) {
                                setNewLocation({
                                  ...newLocation,
                                  location_manager_phones: [...newLocation.location_manager_phones, managerPhoneInput.trim()],
                                });
                                setManagerPhoneInput('');
                              }
                            }}
                            className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded transition duration-200 flex items-center"
                            title={t('locations.add_manager_phone') || 'Add Phone'}
                          >
                            <PlusIcon className="w-5 h-5" />
                          </button>
                        </div>
                        {newLocation.location_manager_phones.length > 0 && (
                          <div className="space-y-1">
                            {newLocation.location_manager_phones.map((phone, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 rounded px-3 py-2"
                              >
                                <span className="text-sm text-gray-700 dark:text-gray-300">{phone}</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updatedPhones = newLocation.location_manager_phones.filter((_, i) => i !== index);
                                    setNewLocation({ ...newLocation, location_manager_phones: updatedPhones });
                                  }}
                                  className="text-red-500 hover:text-red-700 transition duration-200"
                                  title={t('locations.remove_manager_phone') || 'Remove Phone'}
                                >
                                  <XMarkIcon className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingLocation(null);
                          setIsCreating(false);
                          setError('');
                          setManagerEmailInput('');
                          setManagerPhoneInput('');
                        }}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded transition duration-200"
                      >
                        {t('locations.cancel')}
                      </button>
                      <button
                        type="submit"
                        className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded transition duration-200"
                      >
                        {isCreating ? t('locations.create') : t('locations.save')}
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

export default LocationsQa;