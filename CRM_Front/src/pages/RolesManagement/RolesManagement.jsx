// import React, { useState, useEffect } from 'react';
// import { useAuth } from '../../context/AuthContext';
// import { useLanguage } from '../../context/LanguageContext';
// import { roleService } from '../../lib/roleService';
// import { usersManagementService } from '../../lib/usersManagementService';
// import ModalSearch from '../../components/ModalSearch';
// import Header from '../../partials/Header';
// import Sidebar from '../../partials/Sidebar';
// import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
// import LoadingSpinner from '../../components/LoadingSpinner';

// const RolesManagement = () => {
//   const { authData, loading: authLoading } = useAuth();
//   const { language, t } = useLanguage();
//   const [roles, setRoles] = useState([]);
//   const [users, setUsers] = useState([]);
//   const [privileges, setPrivileges] = useState([]);
//   const [editingUserId, setEditingUserId] = useState(null);
//   const [newRole, setNewRole] = useState({
//     user_id: '',
//     privilege_ids: [],
//   });
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');
//   const [loading, setLoading] = useState(true);
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [isCreating, setIsCreating] = useState(false);
//   const [hasPrivilege, setHasPrivilege] = useState(false);

//   // Check authentication and privileges
//   useEffect(() => {
//     if (authLoading) return;

//     if (!authData?.access_token) {
//       setError(t('roles.no_permission'));
//       setLoading(false);
//       return;
//     }

//     if (authData.privilege_ids.includes(1)) {
//       setHasPrivilege(true);
//     } else {
//       setError(t('roles.no_permission'));
//       setLoading(false);
//     }
//   }, [authData, authLoading, t]);

//   // Fetch roles, users, and privileges
//   const fetchData = async () => {
//     if (!authData?.org_id || !hasPrivilege) {
//       setLoading(false);
//       return;
//     }

//     setLoading(true);
//     try {
//       const [roleData, userData, privilegeData] = await Promise.all([
//         roleService.getRoles(authData.org_id),
//         usersManagementService.getUsers(authData.org_id),
//         usersManagementService.getPrivileges(),
//       ]);
//       // Group roles by user_id
//       const rolesByUser = userData.map((user) => ({
//         user_id: user._id || user.public_id,
//         name: user.name || user.email,
//         privilege_ids: roleData
//           .filter((role) => role.user_id === (user._id || user.public_id))
//           .map((role) => role.privilege),
//       }));
//       setRoles(rolesByUser.filter((user) => user.privilege_ids.length > 0));
//       setUsers(userData.filter((user) => user._id || user.public_id));
//       setPrivileges(privilegeData);
//       setError('');
//     } catch (err) {
//       console.error('Error fetching data:', err);
//       setError(err.message || t('roles.fetch_error'));
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (hasPrivilege && authData?.org_id) {
//       fetchData();
//     }
//   }, [authData, hasPrivilege]);

//   // Handle create
//   const initiateCreate = () => {
//     if (!hasPrivilege) {
//       setError(t('roles.no_permission'));
//       return;
//     }

//     setIsCreating(true);
//     setNewRole({
//       user_id: '',
//       privilege_ids: [],
//     });
//   };

//   // Handle edit
//   const handleEdit = async (userId) => {
//     if (!hasPrivilege) {
//       setError(t('roles.no_permission'));
//       return;
//     }

//     try {
//       const userRoles = roles.find((r) => r.user_id === userId);
//       setEditingUserId(userId);
//       setNewRole({
//         user_id: userId,
//         privilege_ids: userRoles ? userRoles.privilege_ids : [],
//       });
//     } catch (err) {
//       console.error('Error preparing role for edit:', err);
//       setError(err.message || t('roles.fetch_edit_error'));
//     }
//   };

//   // Handle save new
//   const handleSaveNew = async (e) => {
//     e.preventDefault();
//     if (!hasPrivilege) return;

//     if (!newRole.user_id) {
//       setError(t('roles.select_user'));
//       return;
//     }

//     if (newRole.privilege_ids.length === 0) {
//       setError(t('roles.select_privilege'));
//       return;
//     }

//     try {
//       await roleService.createRolesBulk({
//         user_id: newRole.user_id,
//         privilege_ids: newRole.privilege_ids.map(Number),
//         org_id: authData.org_id,
//         created_by_user: authData._id || newRole.user_id,
//       });
//       setIsCreating(false);
//       setNewRole({ user_id: '', privilege_ids: [] });
//       fetchData();
//       setSuccess(t('roles.create_success'));
//       setTimeout(() => setSuccess(''), 3000);
//     } catch (err) {
//       console.error('Error creating roles:', err);
//       const errorMessage = err.message.includes('Role ID already exists')
//         ? t('roles.role_id_exists')
//         : err.message || t('roles.create_error');
//       setError(errorMessage);
//     }
//   };

//   // Handle update
//   const handleUpdate = async (e) => {
//     e.preventDefault();
//     if (!hasPrivilege) return;

//     if (!newRole.user_id) {
//       setError(t('roles.select_user'));
//       return;
//     }

//     if (newRole.privilege_ids.length === 0) {
//       setError(t('roles.select_privilege'));
//       return;
//     }

//     try {
//       await roleService.updateUserRoles(editingUserId, {
//         user_id: newRole.user_id,
//         privilege_ids: newRole.privilege_ids.map(Number),
//         org_id: authData.org_id,
//       });
//       setEditingUserId(null);
//       setNewRole({ user_id: '', privilege_ids: [] });
//       fetchData();
//       setSuccess(t('roles.update_success'));
//       setTimeout(() => setSuccess(''), 3000);
//     } catch (err) {
//       console.error('Error updating roles:', err);
//       const errorMessage = err.message.includes('Role ID already exists')
//         ? t('roles.role_id_exists')
//         : err.message || t('roles.update_error');
//       setError(errorMessage);
//     }
//   };

//   // Handle delete
//   const handleDelete = async (userId) => {
//     if (!hasPrivilege) return;

//     if (window.confirm(t('roles.delete_confirm'))) {
//       try {
//         await roleService.deleteRolesByUser(userId, authData.org_id);
//         fetchData();
//         setSuccess(t('roles.delete_success'));
//         setTimeout(() => setSuccess(''), 3000);
//       } catch (err) {
//         console.error('Error deleting roles:', err);
//         setError(err.message || t('roles.delete_error'));
//       }
//     }
//   };

//   // Get privilege names by IDs
//   const getPrivilegeNames = (privilegeIds) => {
//     return privilegeIds
//       .map((id) => privileges.find((p) => p.privilege_id === id)?.privilege_name || t('roles.unknown'))
//       .join(', ');
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
//                   {t('roles.title')}
//                 </h1>
//               </div>
//               <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
//                 {hasPrivilege && (
//                   <button
//                     onClick={initiateCreate}
//                     className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded transition duration-200"
//                   >
//                     {t('roles.add_role')}
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

//             {success && (
//               <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
//                 <span>{success}</span>
//                 <button
//                   onClick={() => setSuccess('')}
//                   className="absolute top-0 right-0 px-4 py-3"
//                   aria-label={t('common.dismiss_success')}
//                 >
//                   <svg className="fill-current h-6 w-6 text-green-500" viewBox="0 0 20 20">
//                     <path d="M10 8.586L2.929 1.515 1.515 2.929 8.586 10l-7.071 7.071 1.414 1.414L10 11.414l7.071 7.071 1.414-1.414L11.414 10l7.071-7.071-1.414-1.414L10 8.586z" />
//                   </svg>
//                 </button>
//               </div>
//             )}

//             {loading ? (
//               <LoadingSpinner />
//             ) : roles.length === 0 ? (
//               <div className="text-gray-600 dark:text-gray-300">{t('roles.no_roles')}</div>
//             ) : (
//               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//                 {roles.map((userRole) => (
//                   <div
//                     key={userRole.user_id}
//                     className="bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow duration-200"
//                     role="region"
//                     aria-label={`${t('roles.user_id')}: ${userRole.name}`}
//                   >
//                     <div className="space-y-4">
//                       <div>
//                         <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
//                           {t('roles.user_id')}
//                         </span>
//                         <p className="text-gray-800 dark:text-gray-100 font-semibold">
//                           {userRole.name}
//                         </p>
//                       </div>
//                       <div>
//                         <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
//                           {t('roles.privilege')}
//                         </span>
//                         <p className="text-gray-800 dark:text-gray-100 font-semibold">
//                           {getPrivilegeNames(userRole.privilege_ids) || t('roles.none')}
//                         </p>
//                       </div>
//                     </div>
//                     {hasPrivilege && (
//                       <div className="flex justify-end gap-3 mt-4">
//                         <button
//                           onClick={() => handleEdit(userRole.user_id)}
//                           className="flex items-center text-indigo-500 hover:text-indigo-600 text-sm font-medium transition-colors duration-200"
//                           aria-label={t('roles.edit')}
//                         >
//                           <PencilIcon className="w-4 h-4 mr-1" />
//                           {t('roles.edit')}
//                         </button>
//                         <button
//                           onClick={() => handleDelete(userRole.user_id)}
//                           className="flex items-center text-red-500 hover:text-red-600 text-sm font-medium transition-colors duration-200"
//                           aria-label={t('roles.delete')}
//                         >
//                           <TrashIcon className="w-4 h-4 mr-1" />
//                           {t('roles.delete')}
//                         </button>
//                       </div>
//                     )}
//                   </div>
//                 ))}
//               </div>
//             )}

//             {(editingUserId || isCreating) && (
//               <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//                 <div className="bg-white dark:bg-gray-900 rounded-lg p-8 w-full max-w-md shadow-2xl">
//                   <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
//                     {isCreating ? t('roles.add_title') : t('roles.edit_title')}
//                   </h2>
//                   <form onSubmit={isCreating ? handleSaveNew : handleUpdate} className="space-y-6">
//                     <div>
//                       <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="user_id">
//                         {t('roles.user_id')}
//                       </label>
//                       <select
//                         id="user_id"
//                         value={newRole.user_id}
//                         onChange={(e) => setNewRole({ ...newRole, user_id: e.target.value })}
//                         className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
//                         required
//                         disabled={!isCreating}
//                       >
//                         <option value="">{t('roles.select_user')}</option>
//                         {users.map((user) => (
//                           <option key={user._id || user.public_id} value={user._id || user.public_id}>
//                             {user.name || user.email}
//                           </option>
//                         ))}
//                       </select>
//                     </div>
//                     <div>
//                       <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="privilege_ids">
//                         {t('roles.privilege')}
//                       </label>
//                       <select
//                         id="privilege_ids"
//                         multiple
//                         value={newRole.privilege_ids}
//                         onChange={(e) =>
//                           setNewRole({
//                             ...newRole,
//                             privilege_ids: Array.from(e.target.selectedOptions, (option) => option.value),
//                           })
//                         }
//                         className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
//                         required
//                       >
//                         {privileges.map((privilege) => (
//                           <option key={privilege._id} value={privilege.privilege_id}>
//                             {privilege.privilege_name}
//                           </option>
//                         ))}
//                       </select>
//                     </div>
//                     <div className="flex justify-end gap-3">
//                       <button
//                         type="button"
//                         onClick={() => {
//                           setEditingUserId(null);
//                           setIsCreating(false);
//                         }}
//                         className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded transition duration-200"
//                       >
//                         {t('roles.cancel')}
//                       </button>
//                       <button
//                         type="submit"
//                         className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded transition duration-200"
//                       >
//                         {isCreating ? t('roles.create') : t('roles.save')}
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

// export default RolesManagement;

// import React, { useState, useEffect, useMemo } from 'react';
// import { useAuth } from '../../context/AuthContext';
// import { useLanguage } from '../../context/LanguageContext';
// import { roleService } from '../../lib/roleService';
// import { usersManagementService } from '../../lib/usersManagementService';
// import ModalSearch from '../../components/ModalSearch';
// import Header from '../../partials/Header';
// import Sidebar from '../../partials/Sidebar';
// import { PencilIcon, TrashIcon, PlusIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';
// import LoadingSpinner from '../../components/LoadingSpinner';

// const RolesManagement = () => {
//   const { authData, loading: authLoading } = useAuth();
//   const { language, t } = useLanguage();
//   const [roles, setRoles] = useState([]);
//   const [adminRoles, setAdminRoles] = useState([]);
//   const [users, setUsers] = useState([]);
//   const [privileges, setPrivileges] = useState([]);
//   const [editingUserId, setEditingUserId] = useState(null);
//   const [newRole, setNewRole] = useState({
//     user_id: '',
//     privilege_ids: [],
//   });
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');
//   const [loading, setLoading] = useState(true);
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [isCreating, setIsCreating] = useState(false);
//   const [hasPrivilege, setHasPrivilege] = useState(false);
//   const [userNameFilter, setUserNameFilter] = useState('');
//   const [privilegeNameFilter, setPrivilegeNameFilter] = useState('');
//   const [searchTerm, setSearchTerm] = useState('');
//   const [sortConfig, setSortConfig] = useState({ key: null, direction: null });

//   // Check authentication and privileges
//   useEffect(() => {
//     if (authLoading) return;

//     if (!authData?.access_token) {
//       setError(t('roles.no_permission'));
//       setLoading(false);
//       return;
//     }

//     if (authData.privilege_ids.includes(1)) {
//       setHasPrivilege(true);
//     } else {
//       setError(t('roles.no_permission'));
//       setLoading(false);
//     }
//   }, [authData, authLoading, t]);

//   // Fetch roles, admin roles, users, and privileges
//   const fetchData = async () => {
//     if (!authData?.org_id || !hasPrivilege) {
//       setLoading(false);
//       return;
//     }

//     setLoading(true);
//     try {
//       const [roleData, adminRoleData, userData, privilegeData] = await Promise.all([
//         roleService.getRoles(authData.org_id),
//         roleService.getAdminRoles(authData.org_id),
//         usersManagementService.getUsers(authData.org_id),
//         usersManagementService.getPrivileges(),
//       ]);
//       const rolesByUser = userData.map((user) => ({
//         user_id: user._id || user.public_id,
//         name: user.name || user.email,
//         privilege_ids: roleData
//           .filter((role) => role.user_id === (user._id || user.public_id))
//           .map((role) => role.privilege),
//       }));
//       setRoles(rolesByUser.filter((user) => user.privilege_ids.length > 0));
//       setAdminRoles(adminRoleData);
//       setUsers(userData.filter((user) => user._id || user.public_id));
//       setPrivileges(privilegeData);
//       setError('');
//     } catch (err) {
//       console.error('Error fetching data:', err);
//       setError(err.message || t('roles.fetch_error'));
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (hasPrivilege && authData?.org_id) {
//       fetchData();
//     }
//   }, [authData, hasPrivilege]);

//   // Handle create
//   const initiateCreate = () => {
//     if (!hasPrivilege) {
//       setError(t('roles.no_permission'));
//       return;
//     }

//     setIsCreating(true);
//     setNewRole({
//       user_id: '',
//       privilege_ids: [],
//     });
//   };

//   // Handle edit
//   const handleEdit = async (userId) => {
//     if (!hasPrivilege) {
//       setError(t('roles.no_permission'));
//       return;
//     }

//     try {
//       const userRoles = roles.find((r) => r.user_id === userId);
//       setEditingUserId(userId);
//       setNewRole({
//         user_id: userId,
//         privilege_ids: userRoles ? userRoles.privilege_ids : [],
//       });
//     } catch (err) {
//       console.error('Error preparing role for edit:', err);
//       setError(err.message || t('roles.fetch_edit_error'));
//     }
//   };

//   // Handle save new
//   const handleSaveNew = async (e) => {
//     e.preventDefault();
//     if (!hasPrivilege) return;

//     if (!newRole.user_id) {
//       setError(t('roles.select_user'));
//       return;
//     }

//     if (newRole.privilege_ids.length === 0) {
//       setError(t('roles.select_privilege'));
//       return;
//     }

//     try {
//       await roleService.createRolesBulk({
//         user_id: newRole.user_id,
//         privilege_ids: newRole.privilege_ids.map(Number),
//         org_id: authData.org_id,
//         created_by_user: authData._id || newRole.user_id,
//       });
//       setIsCreating(false);
//       setNewRole({ user_id: '', privilege_ids: [] });
//       fetchData();
//       setSuccess(t('roles.create_success'));
//       setTimeout(() => setSuccess(''), 3000);
//     } catch (err) {
//       console.error('Error creating roles:', err);
//       const errorMessage = err.message.includes('Role ID already exists')
//         ? t('roles.role_id_exists')
//         : err.message || t('roles.create_error');
//       setError(errorMessage);
//     }
//   };

//   // Handle update
//   const handleUpdate = async (e) => {
//     e.preventDefault();
//     if (!hasPrivilege) return;

//     if (!newRole.user_id) {
//       setError(t('roles.select_user'));
//       return;
//     }

//     if (newRole.privilege_ids.length === 0) {
//       setError(t('roles.select_privilege'));
//       return;
//     }

//     try {
//       await roleService.updateUserRoles(editingUserId, {
//         user_id: newRole.user_id,
//         privilege_ids: newRole.privilege_ids.map(Number),
//         org_id: authData.org_id,
//       });
//       setEditingUserId(null);
//       setNewRole({ user_id: '', privilege_ids: [] });
//       fetchData();
//       setSuccess(t('roles.update_success'));
//       setTimeout(() => setSuccess(''), 3000);
//     } catch (err) {
//       console.error('Error updating roles:', err);
//       const errorMessage = err.message.includes('Role ID already exists')
//         ? t('roles.role_id_exists')
//         : err.message || t('roles.update_error');
//       setError(errorMessage);
//     }
//   };

//   // Handle delete
//   const handleDelete = async (userId) => {
//     if (!hasPrivilege) return;

//     if (window.confirm(t('roles.delete_confirm'))) {
//       try {
//         await roleService.deleteRolesByUser(userId, authData.org_id);
//         fetchData();
//         setSuccess(t('roles.delete_success'));
//         setTimeout(() => setSuccess(''), 3000);
//       } catch (err) {
//         console.error('Error deleting roles:', err);
//         setError(err.message || t('roles.delete_error'));
//       }
//     }
//   };

//   // Get privilege names by IDs
//   const getPrivilegeNames = (privilegeIds) => {
//     return privilegeIds
//       .map((id) => privileges.find((p) => p.privilege_id === id)?.privilege_name || t('roles.unknown'))
//       .join(', ');
//   };

//   // Filter and sort data
//   const filteredAndSortedRoles = useMemo(() => {
//     let filtered = [...adminRoles];

//     // Apply filters
//     if (userNameFilter) {
//       filtered = filtered.filter((role) => role.user_name === userNameFilter);
//     }
//     if (privilegeNameFilter) {
//       filtered = filtered.filter((role) => role.privilege_name === privilegeNameFilter);
//     }
//     if (searchTerm) {
//       const lowerSearch = searchTerm.toLowerCase();
//       filtered = filtered.filter(
//         (role) =>
//           (role.user_name || '').toLowerCase().includes(lowerSearch) ||
//           (role.privilege_name || '').toLowerCase().includes(lowerSearch)
//       );
//     }

//     // Apply sorting
//     if (sortConfig.key) {
//       filtered.sort((a, b) => {
//         const aValue = a[sortConfig.key] || '';
//         const bValue = b[sortConfig.key] || '';
//         if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
//         if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
//         return 0;
//       });
//     }

//     return filtered;
//   }, [adminRoles, userNameFilter, privilegeNameFilter, searchTerm, sortConfig]);

//   // Get unique filter options
//   const uniqueUserNames = useMemo(() => {
//     const names = new Set(adminRoles.map((role) => role.user_name).filter(Boolean));
//     return ['', ...Array.from(names).sort()];
//   }, [adminRoles]);

//   const uniquePrivilegeNames = useMemo(() => {
//     const names = new Set(adminRoles.map((role) => role.privilege_name).filter(Boolean));
//     return ['', ...Array.from(names).sort()];
//   }, [adminRoles]);

//   // Handle sorting
//   const handleSort = (key) => {
//     setSortConfig((prev) => {
//       if (prev.key === key && prev.direction === 'asc') {
//         return { key, direction: 'desc' };
//       }
//       return { key, direction: 'asc' };
//     });
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
//                   {t('roles.title')}
//                 </h1>
//               </div>
//               <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
//                 {hasPrivilege && (
//                   <button
//                     onClick={initiateCreate}
//                     className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded transition duration-200"
//                   >
//                     {t('roles.add_role')}
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

//             {success && (
//               <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
//                 <span>{success}</span>
//                 <button
//                   onClick={() => setSuccess('')}
//                   className="absolute top-0 right-0 px-4 py-3"
//                   aria-label={t('common.dismiss_success')}
//                 >
//                   <svg className="fill-current h-6 w-6 text-green-500" viewBox="0 0 20 20">
//                     <path d="M10 8.586L2.929 1.515 1.515 2.929 8.586 10l-7.071 7.071 1.414 1.414L10 11.414l7.071 7.071 1.414-1.414L11.414 10l7.071-7.071-1.414-1.414L10 8.586z" />
//                   </svg>
//                 </button>
//               </div>
//             )}

//             {loading ? (
//               <LoadingSpinner />
//             ) : (
//               <>
//                 <div className="mb-4 flex flex-col sm:flex-row gap-4">
//                   <div className="flex-1">
//                     <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="search">
//                       {t('roles.search')}
//                     </label>
//                     <input
//                       id="search"
//                       type="text"
//                       value={searchTerm}
//                       onChange={(e) => setSearchTerm(e.target.value)}
//                       placeholder={t('roles.search_placeholder')}
//                       className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
//                     />
//                   </div>
//                   <div className="flex-1">
//                     <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="userNameFilter">
//                       {t('roles.user_name')}
//                     </label>
//                     <select
//                       id="userNameFilter"
//                       value={userNameFilter}
//                       onChange={(e) => setUserNameFilter(e.target.value)}
//                       className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
//                     >
//                       {uniqueUserNames.map((name) => (
//                         <option key={name || 'all'} value={name}>
//                           {name || t('roles.all')}
//                         </option>
//                       ))}
//                     </select>
//                   </div>
//                   <div className="flex-1">
//                     <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="privilegeNameFilter">
//                       {t('roles.privilege_name')}
//                     </label>
//                     <select
//                       id="privilegeNameFilter"
//                       value={privilegeNameFilter}
//                       onChange={(e) => setPrivilegeNameFilter(e.target.value)}
//                       className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
//                     >
//                       {uniquePrivilegeNames.map((name) => (
//                         <option key={name || 'all'} value={name}>
//                           {name || t('roles.all')}
//                         </option>
//                       ))}
//                     </select>
//                   </div>
//                 </div>

//                 {filteredAndSortedRoles.length === 0 ? (
//                   <div className="text-gray-600 dark:text-gray-300">{t('roles.no_roles')}</div>
//                 ) : (
//                   <div className="overflow-x-auto">
//                     <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
//                       <thead>
//                         <tr className="bg-gray-100 dark:bg-gray-700">
//                           <th
//                             className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
//                             onClick={() => handleSort('user_name')}
//                           >
//                             <div className="flex items-center">
//                               {t('roles.user_name')}
//                               {sortConfig.key === 'user_name' && (
//                                 sortConfig.direction === 'asc' ? (
//                                   <ArrowUpIcon className="w-4 h-4 ml-1" />
//                                 ) : (
//                                   <ArrowDownIcon className="w-4 h-4 ml-1" />
//                                 )
//                               )}
//                             </div>
//                           </th>
//                           <th
//                             className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
//                             onClick={() => handleSort('privilege_name')}
//                           >
//                             <div className="flex items-center">
//                               {t('roles.privilege_name')}
//                               {sortConfig.key === 'privilege_name' && (
//                                 sortConfig.direction === 'asc' ? (
//                                   <ArrowUpIcon className="w-4 h-4 ml-1" />
//                                 ) : (
//                                   <ArrowDownIcon className="w-4 h-4 ml-1" />
//                                 )
//                               )}
//                             </div>
//                           </th>
//                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                             {t('roles.date_created')}
//                           </th>
//                           {hasPrivilege && (
//                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                               {t('roles.actions')}
//                             </th>
//                           )}
//                         </tr>
//                       </thead>
//                       <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
//                         {filteredAndSortedRoles.map((role) => (
//                           <tr key={role._id} className="hover:bg-gray-50 dark:hover:bg-gray-600">
//                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-100">
//                               {role.user_name || t('roles.unknown')}
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-100">
//                               {role.privilege_name || t('roles.unknown')}
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-100">
//                               {new Date(role.date_created).toLocaleDateString()}
//                             </td>
//                             {hasPrivilege && (
//                               <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                                 <button
//                                   onClick={() => handleEdit(role.user_id)}
//                                   className="text-indigo-500 hover:text-indigo-600 mr-4"
//                                   aria-label={t('roles.edit')}
//                                 >
//                                   <PencilIcon className="w-5 h-5" />
//                                 </button>
//                                 <button
//                                   onClick={() => handleDelete(role.user_id)}
//                                   className="text-red-500 hover:text-red-600"
//                                   aria-label={t('roles.delete')}
//                                 >
//                                   <TrashIcon className="w-5 h-5" />
//                                 </button>
//                               </td>
//                             )}
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>
//                 )}
//               </>
//             )}

//             {(editingUserId || isCreating) && (
//               <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//                 <div className="bg-white dark:bg-gray-900 rounded-lg p-8 w-full max-w-md shadow-2xl">
//                   <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
//                     {isCreating ? t('roles.add_title') : t('roles.edit_title')}
//                   </h2>
//                   <form onSubmit={isCreating ? handleSaveNew : handleUpdate} className="space-y-6">
//                     <div>
//                       <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="user_id">
//                         {t('roles.user_id')}
//                       </label>
//                       <select
//                         id="user_id"
//                         value={newRole.user_id}
//                         onChange={(e) => setNewRole({ ...newRole, user_id: e.target.value })}
//                         className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
//                         required
//                         disabled={!isCreating}
//                       >
//                         <option value="">{t('roles.select_user')}</option>
//                         {users.map((user) => (
//                           <option key={user._id || user.public_id} value={user._id || user.public_id}>
//                             {user.name || user.email}
//                           </option>
//                         ))}
//                       </select>
//                     </div>
//                     <div>
//                       <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="privilege_ids">
//                         {t('roles.privilege')}
//                       </label>
//                       <select
//                         id="privilege_ids"
//                         multiple
//                         value={newRole.privilege_ids}
//                         onChange={(e) =>
//                           setNewRole({
//                             ...newRole,
//                             privilege_ids: Array.from(e.target.selectedOptions, (option) => option.value),
//                           })
//                         }
//                         className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
//                         required
//                       >
//                         {privileges.map((privilege) => (
//                           <option key={privilege._id} value={privilege.privilege_id}>
//                             {privilege.privilege_name}
//                           </option>
//                         ))}
//                       </select>
//                     </div>
//                     <div className="flex justify-end gap-3">
//                       <button
//                         type="button"
//                         onClick={() => {
//                           setEditingUserId(null);
//                           setIsCreating(false);
//                         }}
//                         className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded transition duration-200"
//                       >
//                         {t('roles.cancel')}
//                       </button>
//                       <button
//                         type="submit"
//                         className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded transition duration-200"
//                       >
//                         {isCreating ? t('roles.create') : t('roles.save')}
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

// export default RolesManagement;


// Working Friday 


import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { roleService } from '../../lib/roleService';
import ModalSearch from '../../components/ModalSearch';
import Header from '../../partials/Header';
import Sidebar from '../../partials/Sidebar';
import { PencilIcon, TrashIcon, PlusIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/LoadingSpinner';

const RolesManagement = () => {
  const { authData, loading: authLoading } = useAuth();
  const { language, t } = useLanguage();
  const [roles, setRoles] = useState([]);
  const [adminRoles, setAdminRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [privileges, setPrivileges] = useState([]);
  const [editingUserId, setEditingUserId] = useState(null);
  const [newRole, setNewRole] = useState({
    user_id: '',
    privilege_ids: [],
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [hasPrivilege, setHasPrivilege] = useState(false);
  const [userNameFilter, setUserNameFilter] = useState('');
  const [privilegeNameFilter, setPrivilegeNameFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });

  // Check authentication and privileges
  useEffect(() => {
    if (authLoading) return;

    if (!authData?.access_token) {
      setError(t('roles.no_permission'));
      setLoading(false);
      return;
    }

    if (authData.privilege_ids.includes(1)) {
      setHasPrivilege(true);
    } else {
      setError(t('roles.no_permission'));
      setLoading(false);
    }
  }, [authData, authLoading, t]);

  // Fetch roles, admin roles, users, and privileges
  const fetchData = async () => {
    if (!authData?.org_id || !hasPrivilege) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [roleData, adminRoleData, userData, privilegeData] = await Promise.all([
        roleService.getRoles(authData.org_id),
        roleService.getAdminRoles(authData.org_id),
        roleService.getUsers(authData.org_id),
        roleService.getPrivileges(),
      ]);
      const rolesByUser = userData.map((user) => ({
        user_id: user._id || user.public_id,
        name: user.name || user.email,
        privilege_ids: roleData
          .filter((role) => role.user_id === (user._id || user.public_id))
          .map((role) => role.privilege),
      }));
      setRoles(rolesByUser.filter((user) => user.privilege_ids.length > 0));
      setAdminRoles(adminRoleData);
      setUsers(userData.filter((user) => user._id || user.public_id));
      setPrivileges(privilegeData);
      setError('');
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message || t('roles.fetch_error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasPrivilege && authData?.org_id) {
      fetchData();
    }
  }, [authData, hasPrivilege]);

  // Handle create
  const initiateCreate = () => {
    if (!hasPrivilege) {
      setError(t('roles.no_permission'));
      return;
    }

    setIsCreating(true);
    setNewRole({
      user_id: '',
      privilege_ids: [],
    });
  };

  // Handle edit
  const handleEdit = async (userId) => {
    if (!hasPrivilege) {
      setError(t('roles.no_permission'));
      return;
    }

    try {
      const userRoles = roles.find((r) => r.user_id === userId);
      setEditingUserId(userId);
      setNewRole({
        user_id: userId,
        privilege_ids: userRoles ? userRoles.privilege_ids : [],
      });
    } catch (err) {
      console.error('Error preparing role for edit:', err);
      setError(err.message || t('roles.fetch_edit_error'));
    }
  };

  // Handle save new
  const handleSaveNew = async (e) => {
    e.preventDefault();
    if (!hasPrivilege) return;

    if (!newRole.user_id) {
      setError(t('roles.select_user'));
      return;
    }

    if (newRole.privilege_ids.length === 0) {
      setError(t('roles.select_privilege'));
      return;
    }

    try {
      await roleService.createRolesBulk({
        user_id: newRole.user_id,
        privilege_ids: newRole.privilege_ids.map(Number),
        org_id: authData.org_id,
        created_by_user: authData._id || newRole.user_id,
      });
      setIsCreating(false);
      setNewRole({ user_id: '', privilege_ids: [] });
      fetchData();
      setSuccess(t('roles.create_success'));
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error creating roles:', err);
      const errorMessage = err.message.includes('Role ID already exists')
        ? t('roles.role_id_exists')
        : err.message || t('roles.create_error');
      setError(errorMessage);
    }
  };

  // Handle update
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!hasPrivilege) return;

    if (!newRole.user_id) {
      setError(t('roles.select_user'));
      return;
    }

    if (newRole.privilege_ids.length === 0) {
      setError(t('roles.select_privilege'));
      return;
    }

    try {
      await roleService.updateUserRoles(editingUserId, {
        user_id: newRole.user_id,
        privilege_ids: newRole.privilege_ids.map(Number),
        org_id: authData.org_id,
      });
      setEditingUserId(null);
      setNewRole({ user_id: '', privilege_ids: [] });
      fetchData();
      setSuccess(t('roles.update_success'));
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error updating roles:', err);
      const errorMessage = err.message.includes('Role ID already exists')
        ? t('roles.role_id_exists')
        : err.message || t('roles.update_error');
      setError(errorMessage);
    }
  };

  // Handle delete
  const handleDelete = async (userId) => {
    if (!hasPrivilege) return;

    if (window.confirm(t('roles.delete_confirm'))) {
      try {
        await roleService.deleteRolesByUser(userId, authData.org_id);
        fetchData();
        setSuccess(t('roles.delete_success'));
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        console.error('Error deleting roles:', err);
        setError(err.message || t('roles.delete_error'));
      }
    }
  };

  // Get privilege names by IDs
  const getPrivilegeNames = (privilegeIds) => {
    return privilegeIds
      .map((id) => privileges.find((p) => p.privilege_id === id)?.privilege_name || t('roles.unknown'))
      .join(', ');
  };

  // Filter and sort data
  const filteredAndSortedRoles = useMemo(() => {
    let filtered = [...adminRoles];

    // Apply filters
    if (userNameFilter) {
      filtered = filtered.filter((role) => role.user_name === userNameFilter);
    }
    if (privilegeNameFilter) {
      filtered = filtered.filter((role) => role.privilege_name === privilegeNameFilter);
    }
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (role) =>
          (role.user_name || '').toLowerCase().includes(lowerSearch) ||
          (role.privilege_name || '').toLowerCase().includes(lowerSearch)
      );
    }

    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key] || '';
        const bValue = b[sortConfig.key] || '';
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [adminRoles, userNameFilter, privilegeNameFilter, searchTerm, sortConfig]);

  // Get unique filter options
  const uniqueUserNames = useMemo(() => {
    const names = new Set(adminRoles.map((role) => role.user_name).filter(Boolean));
    return ['', ...Array.from(names).sort()];
  }, [adminRoles]);

  const uniquePrivilegeNames = useMemo(() => {
    const names = new Set(adminRoles.map((role) => role.privilege_name).filter(Boolean));
    return ['', ...Array.from(names).sort()];
  }, [adminRoles]);

  // Handle sorting
  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key && prev.direction === 'asc') {
        return { key, direction: 'desc' };
      }
      return { key, direction: 'asc' };
    });
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
                  {t('roles.title')}
                </h1>
              </div>
              <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
                {hasPrivilege && (
                  <button
                    onClick={initiateCreate}
                    className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded transition duration-200"
                  >
                    {t('roles.add_role')}
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
            ) : (
              <>
                <div className="mb-4 flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="search">
                      {t('roles.search')}
                    </label>
                    <input
                      id="search"
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder={t('roles.search_placeholder')}
                      className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="userNameFilter">
                      {t('roles.user_name')}
                    </label>
                    <select
                      id="userNameFilter"
                      value={userNameFilter}
                      onChange={(e) => setUserNameFilter(e.target.value)}
                      className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                    >
                      {uniqueUserNames.map((name) => (
                        <option key={name || 'all'} value={name}>
                          {name || t('roles.all')}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="privilegeNameFilter">
                      {t('roles.privilege_name')}
                    </label>
                    <select
                      id="privilegeNameFilter"
                      value={privilegeNameFilter}
                      onChange={(e) => setPrivilegeNameFilter(e.target.value)}
                      className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                    >
                      {uniquePrivilegeNames.map((name) => (
                        <option key={name || 'all'} value={name}>
                          {name || t('roles.all')}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {filteredAndSortedRoles.length === 0 ? (
                  <div className="text-gray-600 dark:text-gray-300">{t('roles.no_roles')}</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
                      <thead>
                        <tr className="bg-gray-100 dark:bg-gray-700">
                          <th
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                            onClick={() => handleSort('user_name')}
                          >
                            <div className="flex items-center">
                              {t('roles.user_name')}
                              {sortConfig.key === 'user_name' && (
                                sortConfig.direction === 'asc' ? (
                                  <ArrowUpIcon className="w-4 h-4 ml-1" />
                                ) : (
                                  <ArrowDownIcon className="w-4 h-4 ml-1" />
                                )
                              )}
                            </div>
                          </th>
                          <th
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                            onClick={() => handleSort('privilege_name')}
                          >
                            <div className="flex items-center">
                              {t('roles.privilege_name')}
                              {sortConfig.key === 'privilege_name' && (
                                sortConfig.direction === 'asc' ? (
                                  <ArrowUpIcon className="w-4 h-4 ml-1" />
                                ) : (
                                  <ArrowDownIcon className="w-4 h-4 ml-1" />
                                )
                              )}
                            </div>
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            {t('roles.date_created')}
                          </th>
                          {hasPrivilege && (
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              {t('roles.actions')}
                            </th>
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredAndSortedRoles.map((role) => (
                          <tr key={role._id} className="hover:bg-gray-50 dark:hover:bg-gray-600">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-100">
                              {role.user_name || t('roles.unknown')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-100">
                              {role.privilege_name || t('roles.unknown')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-100">
                              {new Date(role.date_created).toLocaleDateString()}
                            </td>
                            {hasPrivilege && (
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button
                                  onClick={() => handleEdit(role.user_id)}
                                  className="text-indigo-500 hover:text-indigo-600 mr-4"
                                  aria-label={t('roles.edit')}
                                >
                                  <PencilIcon className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => handleDelete(role.user_id)}
                                  className="text-red-500 hover:text-red-600"
                                  aria-label={t('roles.delete')}
                                >
                                  <TrashIcon className="w-5 h-5" />
                                </button>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}

            {(editingUserId || isCreating) && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-gray-900 rounded-lg p-8 w-full max-w-md shadow-2xl">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                    {isCreating ? t('roles.add_title') : t('roles.edit_title')}
                  </h2>
                  <form onSubmit={isCreating ? handleSaveNew : handleUpdate} className="space-y-6">
                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="user_id">
                        {t('roles.user_id')}
                      </label>
                      <select
                        id="user_id"
                        value={newRole.user_id}
                        onChange={(e) => setNewRole({ ...newRole, user_id: e.target.value })}
                        className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                        required
                        disabled={!isCreating}
                      >
                        <option value="">{t('roles.select_user')}</option>
                        {users.map((user) => (
                          <option key={user._id || user.public_id} value={user._id || user.public_id}>
                            {user.name || user.email}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="privilege_ids">
                        {t('roles.privilege')}
                      </label>
                      <select
                        id="privilege_ids"
                        multiple
                        value={newRole.privilege_ids}
                        onChange={(e) =>
                          setNewRole({
                            ...newRole,
                            privilege_ids: Array.from(e.target.selectedOptions, (option) => option.value),
                          })
                        }
                        className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                        required
                      >
                        {privileges.map((privilege) => (
                          <option key={privilege._id} value={privilege.privilege_id}>
                            {privilege.privilege_name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingUserId(null);
                          setIsCreating(false);
                        }}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded transition duration-200"
                      >
                        {t('roles.cancel')}
                      </button>
                      <button
                        type="submit"
                        className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded transition duration-200"
                      >
                        {isCreating ? t('roles.create') : t('roles.save')}
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

export default RolesManagement;