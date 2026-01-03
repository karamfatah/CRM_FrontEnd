// import React, { useState, useEffect } from 'react';
// import { useAuth } from '../../context/AuthContext';
// import { useLanguage } from '../../context/LanguageContext';
// import { shiftService } from '../../lib/shiftService';
// import ModalSearch from '../../components/ModalSearch';
// import ThemeToggle from '../../components/ThemeToggle';
// import LanguageToggle from '../../components/LanguageToggle'; // Import LanguageToggle
// import Header from '../../partials/Header';
// import Sidebar from '../../partials/Sidebar';
// import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

// const Shift = () => {
//   const { authData } = useAuth();
//   const { language, t } = useLanguage();
//   const [shifts, setShifts] = useState([]);
//   const [editingShift, setEditingShift] = useState(null);
//   const [newShift, setNewShift] = useState({
//     shift_name_en: '',
//     shift_name_ar: '',
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
//       setError(t('shifts.no_permission'));
//       setHasPrivilege(false);
//     }
//   }, [authData, t]);

//   const fetchShifts = async () => {
//     if (!authData?.org_id || !hasPrivilege) {
//       setLoading(false);
//       return;
//     }
//     setLoading(true);
//     try {
//       console.log('Fetching shifts from API');
//       const data = await shiftService.getShifts(authData.org_id);
//       console.log('Shifts received:', data);
//       setShifts(Array.isArray(data) ? data : []);
//       setError('');
//     } catch (err) {
//       console.error('Error fetching shifts:', err.message);
//       setError(t('shifts.fetch_error'));
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     console.log('useEffect triggered to fetch shifts');
//     fetchShifts();
//   }, [authData, hasPrivilege, t]);

//   const handleEdit = async (shift) => {
//     if (!hasPrivilege) {
//       setError(t('shifts.no_permission'));
//       return;
//     }
//     console.log('Editing shift:', shift);
//     try {
//       const data = await shiftService.getShift(shift.id, authData.org_id);
//       setEditingShift(shift);
//       setNewShift({
//         shift_name_en: data.shift_name_en,
//         shift_name_ar: data.shift_name_ar,
//       });
//     } catch (err) {
//       console.error('Error fetching shift for edit:', err.message);
//       setError(t('shifts.fetch_edit_error'));
//     }
//   };

//   const initiateCreate = () => {
//     if (!hasPrivilege) {
//       setError(t('shifts.no_permission'));
//       return;
//     }
//     console.log('Opening create shift modal');
//     setIsCreating(true);
//     setNewShift({
//       shift_name_en: '',
//       shift_name_ar: '',
//     });
//   };

//   const handleUpdate = async (e) => {
//     e.preventDefault();
//     if (!hasPrivilege) {
//       setError(t('shifts.no_permission'));
//       return;
//     }
//     console.log('Updating shift:', { id: editingShift.id, ...newShift });
//     try {
//       await shiftService.updateShift(editingShift.id, newShift, authData.org_id);
//       console.log('Shift updated successfully');
//       setEditingShift(null);
//       setNewShift({ shift_name_en: '', shift_name_ar: '' });
//       fetchShifts();
//     } catch (err) {
//       console.error('Error updating shift:', err.message);
//       setError(t('shifts.update_error'));
//     }
//   };

//   const handleSaveNew = async (e) => {
//     e.preventDefault();
//     if (!hasPrivilege) {
//       setError(t('shifts.no_permission'));
//       return;
//     }
//     console.log('Creating new shift:', newShift);
//     try {
//       await shiftService.createShift(newShift, authData.org_id);
//       console.log('Shift created successfully');
//       setIsCreating(false);
//       setNewShift({ shift_name_en: '', shift_name_ar: '' });
//       fetchShifts();
//     } catch (err) {
//       console.error('Error creating shift:', err.message);
//       setError(t('shifts.create_error'));
//     }
//   };

//   const handleDelete = async (id) => {
//     if (!hasPrivilege) {
//       setError(t('shifts.no_permission'));
//       return;
//     }
//     if (window.confirm(t('shifts.delete_confirm'))) {
//       console.log('Deleting shift:', id);
//       try {
//         await shiftService.deleteShift(id, authData.org_id);
//         console.log('Shift deleted successfully');
//         fetchShifts();
//       } catch (err) {
//         console.error('Error deleting shift:', err.message);
//         setError(t('shifts.delete_error'));
//       }
//     }
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
//                   {t('shifts.title')}
//                 </h1>
//               </div>
//               <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
//               {/*   <LanguageToggle /> {/* Use LanguageToggle component */}
//                 {hasPrivilege && (
//                   <button
//                     onClick={initiateCreate}
//                     className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded transition duration-200"
//                   >
//                     {t('shifts.add_shift')}
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
//               <div className="text-gray-600">{t('shifts.loading')}</div>
//             ) : shifts.length === 0 ? (
//               <div className="text-gray-600">{t('shifts.no_shifts')}</div>
//             ) : (
//               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//                 {shifts.map((shift) => (
//                   <div
//                     key={shift.id}
//                     className="bg-white shadow-lg rounded-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow duration-200"
//                     role="region"
//                     aria-label={`${t('shifts.shift_name')}: ${language === 'en' ? shift.name_en : shift.name_ar}`}
//                   >
//                     <div className="space-y-4">
//                       <div>
//                         <span className="text-gray-500 text-sm font-medium">{t('shifts.shift_name')}</span>
//                         <p className="text-gray-800 font-semibold">
//                           {language === 'en' ? shift.name_en : shift.name_ar}
//                         </p>
//                       </div>
//                     </div>
//                     {hasPrivilege && (
//                       <div className="flex justify-end gap-3 mt-4">
//                         <button
//                           onClick={() => handleEdit(shift)}
//                           className="flex items-center text-indigo-500 hover:text-indigo-600 text-sm font-medium transition-colors duration-200"
//                           aria-label={t('shifts.edit')}
//                         >
//                           <PencilIcon className="w-4 h-4 mr-1" />
//                           {t('shifts.edit')}
//                         </button>
//                         <button
//                           onClick={() => handleDelete(shift.id)}
//                           className="flex items-center text-red-500 hover:text-red-600 text-sm font-medium transition-colors duration-200"
//                           aria-label={t('shifts.delete')}
//                         >
//                           <TrashIcon className="w-4 h-4 mr-1" />
//                           {t('shifts.delete')}
//                         </button>
//                       </div>
//                     )}
//                   </div>
//                 ))}
//               </div>
//             )}

//             {(editingShift || isCreating) && (
//               <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//                 <div className="bg-white rounded-lg p-8 w-full max-w-md shadow-2xl">
//                   <h2 className="text-2xl font-bold text-gray-800 mb-6">
//                     {isCreating ? t('shifts.add_title') : t('shifts.edit_title')}
//                   </h2>
//                   <form onSubmit={isCreating ? handleSaveNew : handleUpdate} className="space-y-6">
//                     <div>
//                       <label
//                         className="block text-gray-700 text-sm font-bold mb-2"
//                         htmlFor="shift_name_en"
//                       >
//                         {t('shifts.shift_name_en')}
//                       </label>
//                       <input
//                         type="text"
//                         id="shift_name_en"
//                         value={newShift.shift_name_en}
//                         onChange={(e) =>
//                           setNewShift({
//                             ...newShift,
//                             shift_name_en: e.target.value,
//                           })
//                         }
//                         className="shadow appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
//                         required
//                       />
//                     </div>
//                     <div>
//                       <label
//                         className="block text-gray-700 text-sm font-bold mb-2"
//                         htmlFor="shift_name_ar"
//                       >
//                         {t('shifts.shift_name_ar')}
//                       </label>
//                       <input
//                         type="text"
//                         id="shift_name_ar"
//                         value={newShift.shift_name_ar}
//                         onChange={(e) =>
//                           setNewShift({
//                             ...newShift,
//                             shift_name_ar: e.target.value,
//                           })
//                         }
//                         className="shadow appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
//                         required
//                       />
//                     </div>
//                     <div className="flex justify-end gap-3">
//                       <button
//                         type="button"
//                         onClick={() => {
//                           setEditingShift(null);
//                           setIsCreating(false);
//                         }}
//                         className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded transition duration-200"
//                       >
//                         {t('shifts.cancel')}
//                       </button>
//                       <button
//                         type="submit"
//                         className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded transition duration-200"
//                       >
//                         {isCreating ? t('shifts.create') : t('shifts.save')}
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

// export default Shift;

// import React, { useState, useEffect } from 'react';
// import { useAuth } from '../../context/AuthContext';
// import { useLanguage } from '../../context/LanguageContext';
// import { shiftService } from '../../lib/shiftService';
// import ModalSearch from '../../components/ModalSearch';
// import ThemeToggle from '../../components/ThemeToggle';
// import LanguageToggle from '../../components/LanguageToggle';
// import Header from '../../partials/Header';
// import Sidebar from '../../partials/Sidebar';
// import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
// import LoadingSpinner from '../../components/LoadingSpinner'; // ✅ Spinner import

// const Shift = () => {
//   const { authData } = useAuth();
//   const { language, t } = useLanguage();
//   const [shifts, setShifts] = useState([]);
//   const [editingShift, setEditingShift] = useState(null);
//   const [newShift, setNewShift] = useState({
//     shift_name_en: '',
//     shift_name_ar: '',
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
//       setError(t('shifts.no_permission'));
//       setHasPrivilege(false);
//     }
//   }, [authData, t]);

//   const fetchShifts = async () => {
//     if (!authData?.org_id || !hasPrivilege) {
//       setLoading(false);
//       return;
//     }
//     setLoading(true);
//     try {
//       console.log('Fetching shifts from API');
//       const data = await shiftService.getShifts(authData.org_id);
//       console.log('Shifts received:', data);
//       setShifts(Array.isArray(data) ? data : []);
//       setError('');
//     } catch (err) {
//       console.error('Error fetching shifts:', err.message);
//       setError(t('shifts.fetch_error'));
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     console.log('useEffect triggered to fetch shifts');
//     fetchShifts();
//   }, [authData, hasPrivilege, t]);

//   const handleEdit = async (shift) => {
//     if (!hasPrivilege) {
//       setError(t('shifts.no_permission'));
//       return;
//     }
//     console.log('Editing shift:', shift);
//     try {
//       const data = await shiftService.getShift(shift.id, authData.org_id);
//       setEditingShift(shift);
//       setNewShift({
//         shift_name_en: data.shift_name_en,
//         shift_name_ar: data.shift_name_ar,
//       });
//     } catch (err) {
//       console.error('Error fetching shift for edit:', err.message);
//       setError(t('shifts.fetch_edit_error'));
//     }
//   };

//   const initiateCreate = () => {
//     if (!hasPrivilege) {
//       setError(t('shifts.no_permission'));
//       return;
//     }
//     console.log('Opening create shift modal');
//     setIsCreating(true);
//     setNewShift({
//       shift_name_en: '',
//       shift_name_ar: '',
//     });
//   };

//   const handleUpdate = async (e) => {
//     e.preventDefault();
//     if (!hasPrivilege) {
//       setError(t('shifts.no_permission'));
//       return;
//     }
//     console.log('Updating shift:', { id: editingShift.id, ...newShift });
//     try {
//       await shiftService.updateShift(editingShift.id, newShift, authData.org_id);
//       console.log('Shift updated successfully');
//       setEditingShift(null);
//       setNewShift({ shift_name_en: '', shift_name_ar: '' });
//       fetchShifts();
//     } catch (err) {
//       console.error('Error updating shift:', err.message);
//       setError(t('shifts.update_error'));
//     }
//   };

//   const handleSaveNew = async (e) => {
//     e.preventDefault();
//     if (!hasPrivilege) {
//       setError(t('shifts.no_permission'));
//       return;
//     }
//     console.log('Creating new shift:', newShift);
//     try {
//       await shiftService.createShift(newShift, authData.org_id);
//       console.log('Shift created successfully');
//       setIsCreating(false);
//       setNewShift({ shift_name_en: '', shift_name_ar: '' });
//       fetchShifts();
//     } catch (err) {
//       console.error('Error creating shift:', err.message);
//       setError(t('shifts.create_error'));
//     }
//   };

//   const handleDelete = async (id) => {
//     if (!hasPrivilege) {
//       setError(t('shifts.no_permission'));
//       return;
//     }
//     if (window.confirm(t('shifts.delete_confirm'))) {
//       console.log('Deleting shift:', id);
//       try {
//         await shiftService.deleteShift(id, authData.org_id);
//         console.log('Shift deleted successfully');
//         fetchShifts();
//       } catch (err) {
//         console.error('Error deleting shift:', err.message);
//         setError(t('shifts.delete_error'));
//       }
//     }
//   };

//   if (!authData) {
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
//                   {t('shifts.title')}
//                 </h1>
//               </div>
//               <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
//                 {/* <LanguageToggle /> */}
//                 {hasPrivilege && (
//                   <button
//                     onClick={initiateCreate}
//                     className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded transition duration-200"
//                   >
//                     {t('shifts.add_shift')}
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
//               <LoadingSpinner />
//             ) : shifts.length === 0 ? (
//               <div className="text-gray-600 dark:text-gray-300">{t('shifts.no_shifts')}</div>
//             ) : (
//               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//                 {shifts.map((shift) => (
//                   <div
//                     key={shift.id}
//                     className="bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow duration-200"
//                     role="region"
//                     aria-label={`${t('shifts.shift_name')}: ${language === 'en' ? shift.name_en : shift.name_ar}`}
//                   >
//                     <div className="space-y-4">
//                       <div>
//                         <span className="text-gray-500 text-sm font-medium">{t('shifts.shift_name')}</span>
//                         <p className="text-gray-800 dark:text-gray-100 font-semibold">
//                           {language === 'en' ? shift.name_en : shift.name_ar}
//                         </p>
//                       </div>
//                     </div>
//                     {hasPrivilege && (
//                       <div className="flex justify-end gap-3 mt-4">
//                         <button
//                           onClick={() => handleEdit(shift)}
//                           className="flex items-center text-indigo-500 hover:text-indigo-600 text-sm font-medium transition-colors duration-200"
//                           aria-label={t('shifts.edit')}
//                         >
//                           <PencilIcon className="w-4 h-4 mr-1" />
//                           {t('shifts.edit')}
//                         </button>
//                         <button
//                           onClick={() => handleDelete(shift.id)}
//                           className="flex items-center text-red-500 hover:text-red-600 text-sm font-medium transition-colors duration-200"
//                           aria-label={t('shifts.delete')}
//                         >
//                           <TrashIcon className="w-4 h-4 mr-1" />
//                           {t('shifts.delete')}
//                         </button>
//                       </div>
//                     )}
//                   </div>
//                 ))}
//               </div>
//             )}

//             {(editingShift || isCreating) && (
//               <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//                 <div className="bg-white dark:bg-gray-900 rounded-lg p-8 w-full max-w-md shadow-2xl">
//                   <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
//                     {isCreating ? t('shifts.add_title') : t('shifts.edit_title')}
//                   </h2>
//                   <form onSubmit={isCreating ? handleSaveNew : handleUpdate} className="space-y-6">
//                     <div>
//                       <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="shift_name_en">
//                         {t('shifts.shift_name_en')}
//                       </label>
//                       <input
//                         type="text"
//                         id="shift_name_en"
//                         value={newShift.shift_name_en}
//                         onChange={(e) => setNewShift({ ...newShift, shift_name_en: e.target.value })}
//                         className="shadow appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 dark:text-white dark:bg-gray-800 dark:border-gray-600 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
//                         required
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="shift_name_ar">
//                         {t('shifts.shift_name_ar')}
//                       </label>
//                       <input
//                         type="text"
//                         id="shift_name_ar"
//                         value={newShift.shift_name_ar}
//                         onChange={(e) => setNewShift({ ...newShift, shift_name_ar: e.target.value })}
//                         className="shadow appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 dark:text-white dark:bg-gray-800 dark:border-gray-600 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
//                         required
//                       />
//                     </div>
//                     <div className="flex justify-end gap-3">
//                       <button
//                         type="button"
//                         onClick={() => {
//                           setEditingShift(null);
//                           setIsCreating(false);
//                         }}
//                         className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded transition duration-200"
//                       >
//                         {t('shifts.cancel')}
//                       </button>
//                       <button
//                         type="submit"
//                         className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded transition duration-200"
//                       >
//                         {isCreating ? t('shifts.create') : t('shifts.save')}
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

// export default Shift;

// import React, { useState, useEffect } from 'react';
// import { useAuth } from '../../context/AuthContext';
// import { useLanguage } from '../../context/LanguageContext';
// import { shiftService } from '../../lib/shiftService';
// import ModalSearch from '../../components/ModalSearch';
// import ThemeToggle from '../../components/ThemeToggle';
// import LanguageToggle from '../../components/LanguageToggle';
// import Header from '../../partials/Header';
// import Sidebar from '../../partials/Sidebar';
// import LoadingSpinner from '../../components/LoadingSpinner';
// import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

// const Shift = () => {
//   const { authData, loading: authLoading } = useAuth();
//   const { language, t } = useLanguage();
//   const [shifts, setShifts] = useState([]);
//   const [editingShift, setEditingShift] = useState(null);
//   const [newShift, setNewShift] = useState({
//     shift_name_en: '',
//     shift_name_ar: '',
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
//       setError(t('shifts.no_permission'));
//       setLoading(false);
//       return;
//     }

//     if (authData.privilege_ids.includes(1)) {
//       setHasPrivilege(true);
//     } else {
//       setError(t('shifts.no_permission'));
//       setHasPrivilege(false);
//       setLoading(false);
//     }
//   }, [authData, authLoading, t]);

//   const fetchShifts = async () => {
//     if (!authData?.org_id || !hasPrivilege) {
//       setLoading(false);
//       return;
//     }

//     setLoading(true);
//     try {
//       const data = await shiftService.getShifts(authData.org_id);
//       setShifts(Array.isArray(data) ? data : []);
//       setError('');
//     } catch (err) {
//       console.error('Error fetching shifts:', err.message);
//       setError(t('shifts.fetch_error'));
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (!authLoading && authData?.org_id && hasPrivilege) {
//       fetchShifts();
//     }
//   }, [authData?.org_id, hasPrivilege, authLoading, t]);

//   const handleEdit = async (shift) => {
//     if (!hasPrivilege) {
//       setError(t('shifts.no_permission'));
//       return;
//     }
//     try {
//       const data = await shiftService.getShift(shift.id, authData.org_id);
//       setEditingShift(shift);
//       setNewShift({
//         shift_name_en: data.shift_name_en,
//         shift_name_ar: data.shift_name_ar,
//       });
//     } catch (err) {
//       console.error('Error fetching shift for edit:', err.message);
//       setError(t('shifts.fetch_edit_error'));
//     }
//   };

//   const initiateCreate = () => {
//     if (!hasPrivilege) {
//       setError(t('shifts.no_permission'));
//       return;
//     }
//     setIsCreating(true);
//     setNewShift({
//       shift_name_en: '',
//       shift_name_ar: '',
//     });
//   };

//   const handleUpdate = async (e) => {
//     e.preventDefault();
//     if (!hasPrivilege) {
//       setError(t('shifts.no_permission'));
//       return;
//     }
//     try {
//       await shiftService.updateShift(editingShift.id, newShift, authData.org_id);
//       setEditingShift(null);
//       setNewShift({ shift_name_en: '', shift_name_ar: '' });
//       fetchShifts();
//     } catch (err) {
//       console.error('Error updating shift:', err.message);
//       setError(t('shifts.update_error'));
//     }
//   };

//   const handleSaveNew = async (e) => {
//     e.preventDefault();
//     if (!hasPrivilege) {
//       setError(t('shifts.no_permission'));
//       return;
//     }
//     try {
//       await shiftService.createShift(newShift, authData.org_id);
//       setIsCreating(false);
//       setNewShift({ shift_name_en: '', shift_name_ar: '' });
//       fetchShifts();
//     } catch (err) {
//       console.error('Error creating shift:', err.message);
//       setError(t('shifts.create_error'));
//     }
//   };

//   const handleDelete = async (id) => {
//     if (!hasPrivilege) {
//       setError(t('shifts.no_permission'));
//       return;
//     }
//     if (window.confirm(t('shifts.delete_confirm'))) {
//       try {
//         await shiftService.deleteShift(id, authData.org_id);
//         fetchShifts();
//       } catch (err) {
//         console.error('Error deleting shift:', err.message);
//         setError(t('shifts.delete_error'));
//       }
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
//               <div className="mb-4 sm:mb-0">
//                 <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
//                   {t('shifts.title')}
//                 </h1>
//               </div>
//               <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
//                 <LanguageToggle />
//                 {hasPrivilege && (
//                   <button
//                     onClick={initiateCreate}
//                     className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded transition duration-200"
//                   >
//                     {t('shifts.add_shift')}
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
//             ) : shifts.length === 0 ? (
//               <div className="text-gray-600 dark:text-gray-300">{t('shifts.no_shifts')}</div>
//             ) : (
//               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//                 {shifts.map((shift) => (
//                   <div
//                     key={shift.id}
//                     className="bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow duration-200"
//                     role="region"
//                     aria-label={`${t('shifts.shift_name')}: ${language === 'en' ? shift.name_en : shift.name_ar}`}
//                   >
//                     <div className="space-y-4">
//                       <div>
//                         <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">{t('shifts.shift_name')}</span>
//                         <p className="text-gray-800 dark:text-gray-100 font-semibold">
//                           {language === 'en' ? shift.name_en : shift.name_ar}
//                         </p>
//                       </div>
//                     </div>
//                     {hasPrivilege && (
//                       <div className="flex justify-end gap-3 mt-4">
//                         <button
//                           onClick={() => handleEdit(shift)}
//                           className="flex items-center text-indigo-500 hover:text-indigo-600 text-sm font-medium transition-colors duration-200"
//                           aria-label={t('shifts.edit')}
//                         >
//                           <PencilIcon className="w-4 h-4 mr-1" />
//                           {t('shifts.edit')}
//                         </button>
//                         <button
//                           onClick={() => handleDelete(shift.id)}
//                           className="flex items-center text-red-500 hover:text-red-600 text-sm font-medium transition-colors duration-200"
//                           aria-label={t('shifts.delete')}
//                         >
//                           <TrashIcon className="w-4 h-4 mr-1" />
//                           {t('shifts.delete')}
//                         </button>
//                       </div>
//                     )}
//                   </div>
//                 ))}
//               </div>
//             )}

//             {(editingShift || isCreating) && (
//               <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//                 <div className="bg-white dark:bg-gray-900 rounded-lg p-8 w-full max-w-md shadow-2xl">
//                   <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
//                     {isCreating ? t('shifts.add_title') : t('shifts.edit_title')}
//                   </h2>
//                   <form onSubmit={isCreating ? handleSaveNew : handleUpdate} className="space-y-6">
//                     <div>
//                       <label
//                         className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
//                         htmlFor="shift_name_en"
//                       >
//                         {t('shifts.shift_name_en')}
//                       </label>
//                       <input
//                         type="text"
//                         id="shift_name_en"
//                         value={newShift.shift_name_en}
//                         onChange={(e) =>
//                           setNewShift({ ...newShift, shift_name_en: e.target.value })
//                         }
//                         className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
//                         required
//                       />
//                     </div>
//                     <div>
//                       <label
//                         className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
//                         htmlFor="shift_name_ar"
//                       >
//                         {t('shifts.shift_name_ar')}
//                       </label>
//                       <input
//                         type="text"
//                         id="shift_name_ar"
//                         value={newShift.shift_name_ar}
//                         onChange={(e) =>
//                           setNewShift({ ...newShift, shift_name_ar: e.target.value })
//                         }
//                         className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
//                         required
//                       />
//                     </div>
//                     <div className="flex justify-end gap-3">
//                       <button
//                         type="button"
//                         onClick={() => {
//                           setEditingShift(null);
//                           setIsCreating(false);
//                           setError('');
//                         }}
//                         className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded transition duration-200"
//                       >
//                         {t('shifts.cancel')}
//                       </button>
//                       <button
//                         type="submit"
//                         className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded transition duration-200"
//                       >
//                         {isCreating ? t('shifts.create') : t('shifts.save')}
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

// export default Shift;

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { shiftService } from '../../lib/shiftService';
import ModalSearch from '../../components/ModalSearch';
import ThemeToggle from '../../components/ThemeToggle';
import LanguageToggle from '../../components/LanguageToggle';
import Header from '../../partials/Header';
import Sidebar from '../../partials/Sidebar';
import LoadingSpinner from '../../components/LoadingSpinner';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

const Shift = () => {
  const { authData, loading: authLoading } = useAuth();
  const { language, t } = useLanguage();
  const [shifts, setShifts] = useState([]);
  const [editingShift, setEditingShift] = useState(null);
  const [newShift, setNewShift] = useState({
    shift_name_en: '',
    shift_name_ar: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [hasPrivilege, setHasPrivilege] = useState(false);

  // Check authentication and privileges
  useEffect(() => {
    if (authLoading) return;

    if (!authData?.access_token) {
      setError(t('shifts.no_permission'));
      setLoading(false);
      return;
    }

    if (authData.privilege_ids.includes(1)) {
      setHasPrivilege(true);
    } else {
      setError(t('shifts.no_permission'));
      setHasPrivilege(false);
      setLoading(false);
    }
  }, [authData, authLoading, t]);

  const fetchShifts = async () => {
    if (!authData?.org_id || !hasPrivilege) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await shiftService.getShifts(authData.org_id);
      setShifts(Array.isArray(data) ? data : []);
      setError('');
    } catch (err) {
      console.error('Error fetching shifts:', err.message);
      setError(t('shifts.fetch_error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && authData?.org_id && hasPrivilege) {
      fetchShifts();
    }
  }, [authData?.org_id, hasPrivilege, authLoading, t]);

  const handleEdit = async (shift) => {
    if (!hasPrivilege) {
      setError(t('shifts.no_permission'));
      return;
    }
    try {
      const data = await shiftService.getShift(shift.id, authData.org_id);
      setEditingShift(shift);
      setNewShift({
        shift_name_en: data.shift_name_en,
        shift_name_ar: data.shift_name_ar,
      });
    } catch (err) {
      console.error('Error fetching shift for edit:', err.message);
      setError(t('shifts.fetch_edit_error'));
    }
  };

  const initiateCreate = () => {
    if (!hasPrivilege) {
      setError(t('shifts.no_permission'));
      return;
    }
    setIsCreating(true);
    setNewShift({
      shift_name_en: '',
      shift_name_ar: '',
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!hasPrivilege) {
      setError(t('shifts.no_permission'));
      return;
    }
    try {
      await shiftService.updateShift(editingShift.id, newShift, authData.org_id);
      setEditingShift(null);
      setNewShift({ shift_name_en: '', shift_name_ar: '' });
      fetchShifts();
    } catch (err) {
      console.error('Error updating shift:', err.message);
      setError(t('shifts.update_error'));
    }
  };

  const handleSaveNew = async (e) => {
    e.preventDefault();
    if (!hasPrivilege) {
      setError(t('shifts.no_permission'));
      return;
    }
    try {
      await shiftService.createShift(newShift, authData.org_id);
      setIsCreating(false);
      setNewShift({ shift_name_en: '', shift_name_ar: '' });
      fetchShifts();
    } catch (err) {
      console.error('Error creating shift:', err.message);
      setError(t('shifts.create_error'));
    }
  };

  const handleDelete = async (id) => {
    if (!hasPrivilege) {
      setError(t('shifts.no_permission'));
      return;
    }
    if (window.confirm(t('shifts.delete_confirm'))) {
      try {
        await shiftService.deleteShift(id, authData.org_id);
        fetchShifts();
      } catch (err) {
        console.error('Error deleting shift:', err.message);
        setError(t('shifts.delete_error'));
      }
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
              <div className="mb-4 sm:mb-0">
                <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
                  {t('shifts.title')}
                </h1>
              </div>
              <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
                <LanguageToggle />
                {hasPrivilege && (
                  <button
                    onClick={initiateCreate}
                    className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded transition duration-200"
                  >
                    {t('shifts.add_shift')}
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
            ) : shifts.length === 0 ? (
              <div className="text-gray-600 dark:text-gray-300">{t('shifts.no_shifts')}</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {shifts.map((shift) => (
                  <div
                    key={shift.id}
                    className="bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow duration-200"
                    role="region"
                    aria-label={`${t('shifts.shift_name')}: ${language === 'en' ? shift.shift_name_en : shift.shift_name_ar}`}
                  >
                    <div className="space-y-4">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">{t('shifts.shift_name')}</span>
                        <p className="text-gray-800 dark:text-gray-100 font-semibold">
                          {language === 'en' ? shift.shift_name_en : shift.shift_name_ar}
                        </p>
                      </div>
                    </div>
                    {hasPrivilege && (
                      <div className="flex justify-end gap-3 mt-4">
                        <button
                          onClick={() => handleEdit(shift)}
                          className="flex items-center text-indigo-500 hover:text-indigo-600 text-sm font-medium transition-colors duration-200"
                          aria-label={t('shifts.edit')}
                        >
                          <PencilIcon className="w-4 h-4 mr-1" />
                          {t('shifts.edit')}
                        </button>
                        <button
                          onClick={() => handleDelete(shift.id)}
                          className="flex items-center text-red-500 hover:text-red-600 text-sm font-medium transition-colors duration-200"
                          aria-label={t('shifts.delete')}
                        >
                          <TrashIcon className="w-4 h-4 mr-1" />
                          {t('shifts.delete')}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {(editingShift || isCreating) && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-gray-900 rounded-lg p-8 w-full max-w-md shadow-2xl">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                    {isCreating ? t('shifts.add_title') : t('shifts.edit_title')}
                  </h2>
                  <form onSubmit={isCreating ? handleSaveNew : handleUpdate} className="space-y-6">
                    <div>
                      <label
                        className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
                        htmlFor="shift_name_en"
                      >
                        {t('shifts.shift_name_en')}
                      </label>
                      <input
                        type="text"
                        id="shift_name_en"
                        value={newShift.shift_name_en}
                        onChange={(e) =>
                          setNewShift({ ...newShift, shift_name_en: e.target.value })
                        }
                        className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                        required
                      />
                    </div>
                    <div>
                      <label
                        className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
                        htmlFor="shift_name_ar"
                      >
                        {t('shifts.shift_name_ar')}
                      </label>
                      <input
                        type="text"
                        id="shift_name_ar"
                        value={newShift.shift_name_ar}
                        onChange={(e) =>
                          setNewShift({ ...newShift, shift_name_ar: e.target.value })
                        }
                        className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                        required
                      />
                    </div>
                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingShift(null);
                          setIsCreating(false);
                          setError('');
                        }}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded transition duration-200"
                      >
                        {t('shifts.cancel')}
                      </button>
                      <button
                        type="submit"
                        className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded transition duration-200"
                      >
                        {isCreating ? t('shifts.create') : t('shifts.save')}
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

export default Shift;