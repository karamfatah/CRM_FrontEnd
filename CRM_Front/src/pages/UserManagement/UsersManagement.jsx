// // // import React, { useState, useEffect } from 'react';
// // // import { useAuth } from '../../context/AuthContext';
// // // import { useLanguage } from '../../context/LanguageContext';
// // // import { usersManagementService } from '../../lib/usersManagementService';
// // // import ModalSearch from '../../components/ModalSearch';
// // // import Header from '../../partials/Header';
// // // import Sidebar from '../../partials/Sidebar';
// // // import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
// // // import LoadingSpinner from '../../components/LoadingSpinner';

// // // const UsersManagement = () => {
// // //   const { authData, loading: authLoading } = useAuth();
// // //   const { language, t } = useLanguage();
// // //   const [users, setUsers] = useState([]);
// // //   const [editingUser, setEditingUser] = useState(null);
// // //   const [newUser, setNewUser] = useState({
// // //     first_name: '',
// // //     last_name: '',
// // //     email: '',
// // //     privilege_ids: [],
// // //     user_image: null,
// // //   });
// // //   const [editUser, setEditUser] = useState(null);
// // //   const [activateUser, setActivateUser] = useState({
// // //     email: '',
// // //     otp: '',
// // //   });
// // //   const [privileges, setPrivileges] = useState([]);
// // //   const [userUpdates, setUserUpdates] = useState([]);
// // //   const [otpDisplay, setOtpDisplay] = useState('');
// // //   const [userImagePreview, setUserImagePreview] = useState('');
// // //   const [error, setError] = useState('');
// // //   const [success, setSuccess] = useState('');
// // //   const [loading, setLoading] = useState(true);
// // //   const [sidebarOpen, setSidebarOpen] = useState(false);
// // //   const [currentView, setCurrentView] = useState('manage-users');
// // //   const [hasPrivilege, setHasPrivilege] = useState(false);
// // //   const [currentPage, setCurrentPage] = useState(1);
// // //   const itemsPerPage = 5;

// // //   // Check authentication and privileges
// // //   useEffect(() => {
// // //     if (authLoading) return;

// // //     if (!authData?.access_token) {
// // //       setError(t('users.no_permission'));
// // //       setLoading(false);
// // //       return;
// // //     }

// // //     if (authData.privilege_ids.includes(1)) {
// // //       setHasPrivilege(true);
// // //     } else {
// // //       setError(t('users.no_permission'));
// // //       setLoading(false);
// // //     }
// // //   }, [authData, authLoading, t]);

// // //   // Fetch users and privileges
// // //   const fetchUsers = async () => {
// // //     if (!authData?.org_id || !hasPrivilege) {
// // //       setLoading(false);
// // //       return;
// // //     }

// // //     setLoading(true);
// // //     try {
// // //       const [userData, privilegeData] = await Promise.all([
// // //         usersManagementService.getUsers(authData.org_id),
// // //         usersManagementService.getPrivileges(),
// // //       ]);
// // //       console.debug('Raw user data from API:', userData);
// // //       setUsers(userData);
// // //       setPrivileges(privilegeData);
// // //       setError('');
// // //     } catch (err) {
// // //       console.error('Error fetching data:', err);
// // //       setError(err.message || t('users.fetch_error'));
// // //     } finally {
// // //       setLoading(false);
// // //     }
// // //   };

// // //   useEffect(() => {
// // //     if (hasPrivilege && authData?.org_id && currentView === 'manage-users') {
// // //       fetchUsers();
// // //     }
// // //   }, [authData, hasPrivilege, currentView]);

// // //   // Fetch user updates when editing
// // //   const fetchUserUpdates = async (userId) => {
// // //     try {
// // //       const updates = await usersManagementService.getUserUpdates(userId);
// // //       setUserUpdates(updates);
// // //     } catch (err) {
// // //       console.error('Error fetching user updates:', err);
// // //       setError(err.message || t('users.fetch_updates_error'));
// // //     }
// // //   };

// // //   // Handle view change
// // //   const handleViewChange = (view) => {
// // //     setCurrentView(view);
// // //     setError('');
// // //     setSuccess('');
// // //     setEditingUser(null);
// // //     setEditUser(null);
// // //     setNewUser({ first_name: '', last_name: '', email: '', privilege_ids: [], user_image: null });
// // //     setActivateUser({ email: '', otp: '' });
// // //     setOtpDisplay('');
// // //     setUserImagePreview('');
// // //     setUserUpdates([]);
// // //     setCurrentPage(1);
// // //   };

// // //   // Handle user image change
// // //   const handleUserImageChange = (e) => {
// // //     const file = e.target.files[0];
// // //     if (file) {
// // //       if (currentView === 'edit-users') {
// // //         setEditUser({ ...editUser, user_image: file });
// // //       } else {
// // //         setNewUser({ ...newUser, user_image: file });
// // //       }
// // //       const reader = new FileReader();
// // //       reader.onload = (event) => setUserImagePreview(event.target.result);
// // //       reader.readAsDataURL(file);
// // //     }
// // //   };

// // //   // Handle add new user
// // //   const handleAddUser = async (e) => {
// // //     e.preventDefault();
// // //     if (!hasPrivilege) {
// // //       setError(t('users.no_permission'));
// // //       return;
// // //     }

// // //     if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUser.email)) {
// // //       setError(t('users.invalid_email'));
// // //       return;
// // //     }

// // //     if (newUser.privilege_ids.length === 0) {
// // //       setError(t('users.privileges_required'));
// // //       return;
// // //     }

// // //     try {
// // //       const userId = await usersManagementService.registerUser(
// // //         newUser,
// // //         authData.org_id,
// // //         authData.country_id
// // //       );
// // //       for (const privilege_id of newUser.privilege_ids) {
// // //         await usersManagementService.createRole({
// // //           user_id: userId,
// // //           privilege: privilege_id,
// // //           org_id: authData.org_id,
// // //         });
// // //       }
// // //       if (newUser.user_image) {
// // //         await usersManagementService.updateProfileImage(userId, newUser.user_image);
// // //       }
// // //       setSuccess(t('users.add_success'));
// // //       setTimeout(() => {
// // //         setSuccess('');
// // //         setActivateUser({ ...activateUser, email: newUser.email });
// // //         handleViewChange('activate-new-user');
// // //       }, 3000);
// // //     } catch (err) {
// // //       console.error('Add user error:', err);
// // //       setError(err.message || t('users.add_error'));
// // //     }
// // //   };

// // //   // Handle edit user
// // //   const handleEditUser = async (user) => {
// // //     if (!hasPrivilege) {
// // //       setError(t('users.no_permission'));
// // //       return;
// // //     }

// // //     const userId = user._id;
// // //     if (!userId) {
// // //       console.error('Invalid user object:', user);
// // //       setError(t('users.invalid_user_id'));
// // //       return;
// // //     }

// // //     try {
// // //       const [userResult, rolesResult, profileResult] = await Promise.allSettled([
// // //         usersManagementService.getUser(userId, authData.org_id),
// // //         usersManagementService.getRolesByUser(userId, authData.org_id),
// // //         usersManagementService.getUserProfile(userId),
// // //       ]);

// // //       if (userResult.status === 'rejected') {
// // //         throw new Error(`Failed to fetch user data: ${userResult.reason}`);
// // //       }

// // //       const roles = rolesResult.status === 'fulfilled' ? rolesResult.value : [];
// // //       if (rolesResult.status === 'rejected') {
// // //         console.warn('Failed to fetch user roles:', rolesResult.reason);
// // //         setError(t('users.partial_fetch_error_roles'));
// // //       }

// // //       const profile = profileResult.status === 'fulfilled' ? profileResult.value : { user_image: null };
// // //       if (profileResult.status === 'rejected' && !profileResult.reason.message.includes('User profile not found')) {
// // //         console.warn('Unexpected error fetching user profile:', profileResult.reason);
// // //         setError(t('users.partial_fetch_error_profile'));
// // //       }

// // //       // Ensure valid fallback values
// // //       const [derivedFirstName, derivedLastName] = userResult.value.name
// // //         ? userResult.value.name.split(' ').filter(Boolean)
// // //         : ['', ''];
// // //       const email = userResult.value.email || user.email || '';
// // //       if (!email) {
// // //         throw new Error('User email is missing');
// // //       }

// // //       setEditingUser(user);
// // //       setEditUser({
// // //         first_name: user.first_name || derivedFirstName || '',
// // //         last_name: user.last_name || derivedLastName || '',
// // //         email,
// // //         privilege_ids: roles.map((role) => role.privilege),
// // //         user_image: null,
// // //       });
// // //       setUserImagePreview(profile.user_image || '');
// // //       fetchUserUpdates(userId);
// // //       setCurrentView('edit-users');
// // //     } catch (err) {
// // //       console.error('Fetch user error:', err);
// // //       setError(err.message || t('users.fetch_edit_error'));
// // //     }
// // //   };

// // //   // Handle update user
// // //   const handleUpdateUser = async (e) => {
// // //     e.preventDefault();
// // //     if (!hasPrivilege) {
// // //       setError(t('users.no_permission'));
// // //       return;
// // //     }

// // //     const userId = editingUser?._id;
// // //     if (!userId) {
// // //       setError(t('users.invalid_user_id'));
// // //       return;
// // //     }

// // //     if (!editUser) {
// // //       setError(t('users.form_not_loaded'));
// // //       return;
// // //     }

// // //     if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editUser.email)) {
// // //       setError(t('users.invalid_email'));
// // //       return;
// // //     }

// // //     if (!editUser.first_name || !editUser.last_name) {
// // //       setError(t('users.name_required'));
// // //       return;
// // //     }

// // //     if (editUser.privilege_ids.length === 0) {
// // //       setError(t('users.privileges_required'));
// // //       return;
// // //     }

// // //     try {
// // //       await usersManagementService.updateUser(userId, editUser, authData.org_id);
// // //       await usersManagementService.updateUserRoles(userId, editUser.privilege_ids, authData.org_id);
// // //       if (editUser.user_image) {
// // //         await usersManagementService.updateProfileImage(userId, editUser.user_image);
// // //       }
// // //       setEditingUser(null);
// // //       setEditUser(null);
// // //       setUserImagePreview('');
// // //       setUserUpdates([]);
// // //       fetchUsers();
// // //       setSuccess(t('users.update_success'));
// // //       setTimeout(() => {
// // //         setSuccess('');
// // //         handleViewChange('manage-users');
// // //       }, 3000);
// // //     } catch (err) {
// // //       console.error('Update user error:', err);
// // //       setError(err.message || t('users.update_error'));
// // //     }
// // //   };

// // //   // Handle activate user
// // //   const handleShowOtp = async () => {
// // //     if (!hasPrivilege) {
// // //       setError(t('users.no_permission'));
// // //       return;
// // //     }

// // //     if (!activateUser.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(activateUser.email)) {
// // //       setError(t('users.invalid_email'));
// // //       return;
// // //     }

// // //     try {
// // //       const result = await usersManagementService.getOtp(activateUser.email, authData.org_id);
// // //       setOtpDisplay(result.otp || '');
// // //       if (!result.otp) {
// // //         setError(t('users.fetch_otp_error'));
// // //       }
// // //     } catch (err) {
// // //       console.error('Fetch OTP error:', err);
// // //       setError(err.message || t('users.fetch_otp_error'));
// // //       setOtpDisplay('');
// // //     }
// // //   };

// // //   const handleActivateUser = async (e) => {
// // //     e.preventDefault();
// // //     if (!hasPrivilege) {
// // //       setError(t('users.no_permission'));
// // //       return;
// // //     }

// // //     if (!activateUser.email || !activateUser.otp) {
// // //       setError(t('users.email_otp_required'));
// // //       return;
// // //     }

// // //     try {
// // //       await usersManagementService.activateUser(
// // //         { email: activateUser.email, otp: activateUser.otp },
// // //         authData.org_id
// // //       );
// // //       setSuccess(t('users.activate_success'));
// // //       setTimeout(() => {
// // //         setSuccess('');
// // //         handleViewChange('manage-users');
// // //       }, 3000);
// // //     } catch (err) {
// // //       console.error('Activate user error:', err);
// // //       setError(err.message || t('users.activate_error'));
// // //     }
// // //   };

// // //   // Handle delete user
// // //   const handleDeleteUser = async (id) => {
// // //     if (!hasPrivilege) {
// // //       setError(t('users.no_permission'));
// // //       return;
// // //     }

// // //     if (!id) {
// // //       setError(t('users.invalid_user_id'));
// // //       return;
// // //     }

// // //     if (window.confirm(t('users.delete_confirm'))) {
// // //       try {
// // //         await usersManagementService.deleteUser(id, authData.org_id);
// // //         fetchUsers();
// // //         setSuccess(t('users.delete_success'));
// // //         setTimeout(() => setSuccess(''), 3000);
// // //       } catch (err) {
// // //         console.error('Delete user error:', err);
// // //         setError(err.message || t('users.delete_error'));
// // //       }
// // //     }
// // //   };

// // //   // Pagination logic
// // //   const totalPages = Math.ceil(users.length / itemsPerPage);
// // //   const start = (currentPage - 1) * itemsPerPage;
// // //   const end = start + itemsPerPage;
// // //   const paginatedUsers = users.slice(start, end);

// // //   const handlePageChange = (page) => {
// // //     setCurrentPage(page);
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
// // //                   {t('users.title')}
// // //                 </h1>
// // //                 <div className="grid grid-flow-col sm:auto-cols-max justify-start gap-2 mt-4">
// // //                   <button
// // //                     onClick={() => handleViewChange('manage-users')}
// // //                     className={`px-4 py-2 rounded ${currentView === 'manage-users' ? 'bg-indigo-500 text-white' : 'bg-gray-300 text-gray-800'} hover:bg-indigo-600 transition duration-200`}
// // //                   >
// // //                     {t('users.manage_users')}
// // //                   </button>
// // //                   <button
// // //                     onClick={() => handleViewChange('add-new-user')}
// // //                     className={`px-4 py-2 rounded ${currentView === 'add-new-user' ? 'bg-indigo-500 text-white' : 'bg-gray-300 text-gray-800'} hover:bg-indigo-600 transition duration-200`}
// // //                   >
// // //                     {t('users.add_new_user')}
// // //                   </button>
// // //                   <button
// // //                     onClick={() => handleViewChange('activate-new-user')}
// // //                     className={`px-4 py-2 rounded ${currentView === 'activate-new-user' ? 'bg-indigo-500 text-white' : 'bg-gray-300 text-gray-800'} hover:bg-indigo-600 transition duration-200`}
// // //                   >
// // //                     {t('users.activate_new_user')}
// // //                   </button>
// // //                 </div>
// // //               </div>
// // //               <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
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

// // //             {success && (
// // //               <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
// // //                 <span>{success}</span>
// // //                 <button
// // //                   onClick={() => setSuccess('')}
// // //                   className="absolute top-0 right-0 px-4 py-3"
// // //                   aria-label={t('common.dismiss_success')}
// // //                 >
// // //                   <svg className="fill-current h-6 w-6 text-green-500" viewBox="0 0 20 20">
// // //                     <path d="M10 8.586L2.929 1.515 1.515 2.929 8.586 10l-7.071 7.071 1.414 1.414L10 11.414l7.071 7.071 1.414-1.414L11.414 10l7.071-7.071-1.414-1.414L10 8.586z" />
// // //                   </svg>
// // //                 </button>
// // //               </div>
// // //             )}

// // //             {loading ? (
// // //               <LoadingSpinner />
// // //             ) : (
// // //               <>
// // //                 {currentView === 'manage-users' && (
// // //                   <>
// // //                     {users.length === 0 ? (
// // //                       <div className="text-gray-600 dark:text-gray-300">{t('users.no_users')}</div>
// // //                     ) : (
// // //                       <>
// // //                         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
// // //                           {paginatedUsers.map((user) => (
// // //                             <div
// // //                               key={user._id}
// // //                               className="bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow duration-200"
// // //                               role="region"
// // //                               aria-label={`${t('users.user_name')}: ${user.name}`}
// // //                             >
// // //                               <div className="space-y-4">
// // //                                 <div>
// // //                                   <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
// // //                                     {t('users.name')}
// // //                                   </span>
// // //                                   <p className="text-gray-800 dark:text-gray-100 font-semibold">
// // //                                     {user.name}
// // //                                   </p>
// // //                                 </div>
// // //                                 <div>
// // //                                   <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
// // //                                     {t('users.email')}
// // //                                   </span>
// // //                                   <p className="text-gray-800 dark:text-gray-100 font-semibold">
// // //                                     {user.email}
// // //                                   </p>
// // //                                 </div>
// // //                                 <div>
// // //                                   <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
// // //                                     {t('users.phone')}
// // //                                   </span>
// // //                                   <p className="text-gray-800 dark:text-gray-100 font-semibold">
// // //                                     {user.phone || t('users.unknown')}
// // //                                   </p>
// // //                                 </div>
// // //                                 <div>
// // //                                   <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
// // //                                     {t('users.privileges')}
// // //                                   </span>
// // //                                   <p className="text-gray-800 dark:text-gray-100 font-semibold">
// // //                                     {user.privilege_ids
// // //                                       .map((id) => privileges.find((p) => p.privilege_id === id)?.privilege_name || t('users.unknown'))
// // //                                       .join(', ') || t('users.none')}
// // //                                   </p>
// // //                                 </div>
// // //                               </div>
// // //                               {hasPrivilege && (
// // //                                 <div className="flex justify-end gap-3 mt-4">
// // //                                   <button
// // //                                     onClick={() => handleEditUser(user)}
// // //                                     className="flex items-center text-indigo-500 hover:text-indigo-600 text-sm font-medium transition-colors duration-200"
// // //                                     aria-label={t('users.edit')}
// // //                                   >
// // //                                     <PencilIcon className="w-4 h-4 mr-1" />
// // //                                     {t('users.edit')}
// // //                                   </button>
// // //                                   <button
// // //                                     onClick={() => handleDeleteUser(user._id)}
// // //                                     className="flex items-center text-red-500 hover:text-red-600 text-sm font-medium transition-colors duration-200"
// // //                                     aria-label={t('users.delete')}
// // //                                   >
// // //                                     <TrashIcon className="w-4 h-4 mr-1" />
// // //                                     {t('users.delete')}
// // //                                   </button>
// // //                                 </div>
// // //                               )}
// // //                             </div>
// // //                           ))}
// // //                         </div>
// // //                         {totalPages > 1 && (
// // //                           <div className="flex justify-center gap-2 mt-6">
// // //                             {currentPage > 1 && (
// // //                               <button
// // //                                 onClick={() => handlePageChange(currentPage - 1)}
// // //                                 className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
// // //                               >
// // //                                 {t('users.previous')}
// // //                               </button>
// // //                             )}
// // //                             {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
// // //                               <button
// // //                                 key={`page-${page}`}
// // //                                 onClick={() => handlePageChange(page)}
// // //                                 className={`${
// // //                                   page === currentPage ? 'bg-indigo-500 text-white' : 'bg-gray-300 text-gray-800'
// // //                                 } hover:bg-indigo-600 font-bold py-2 px-4 rounded`}
// // //                                 disabled={page === currentPage}
// // //                               >
// // //                                 {page}
// // //                               </button>
// // //                             ))}
// // //                             {currentPage < totalPages && (
// // //                               <button
// // //                                 onClick={() => handlePageChange(currentPage + 1)}
// // //                                 className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
// // //                               >
// // //                                 {t('users.next')}
// // //                               </button>
// // //                             )}
// // //                           </div>
// // //                         )}
// // //                       </>
// // //                     )}
// // //                   </>
// // //                 )}

// // //                 {currentView === 'add-new-user' && (
// // //                   <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
// // //                     <div className="bg-white dark:bg-gray-900 rounded-lg p-8 w-full max-w-md shadow-2xl">
// // //                       <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
// // //                         {t('users.add_title')}
// // //                       </h2>
// // //                       <form id="addUserForm" onSubmit={handleAddUser} className="space-y-6">
// // //                         <div>
// // //                           <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="userImageInput">
// // //                             {t('users.profile_picture')}
// // //                           </label>
// // //                           <input
// // //                             type="file"
// // //                             id="userImageInput"
// // //                             accept="image/*"
// // //                             onChange={handleUserImageChange}
// // //                             className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
// // //                           />
// // //                           {userImagePreview && (
// // //                             <img
// // //                               id="userImagePreview"
// // //                               src={userImagePreview}
// // //                               alt="Profile Preview"
// // //                               className="mt-2 w-24 h-24 object-cover rounded"
// // //                             />
// // //                           )}
// // //                         </div>
// // //                         <div>
// // //                           <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="first_name">
// // //                             {t('users.first_name')}
// // //                           </label>
// // //                           <input
// // //                             type="text"
// // //                             id="first_name"
// // //                             value={newUser.first_name}
// // //                             onChange={(e) => setNewUser({ ...newUser, first_name: e.target.value })}
// // //                             className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
// // //                             required
// // //                           />
// // //                         </div>
// // //                         <div>
// // //                           <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="last_name">
// // //                             {t('users.last_name')}
// // //                           </label>
// // //                           <input
// // //                             type="text"
// // //                             id="last_name"
// // //                             value={newUser.last_name}
// // //                             onChange={(e) => setNewUser({ ...newUser, last_name: e.target.value })}
// // //                             className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
// // //                             required
// // //                           />
// // //                         </div>
// // //                         <div>
// // //                           <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="email">
// // //                             {t('users.email')}
// // //                           </label>
// // //                           <input
// // //                             type="email"
// // //                             id="email"
// // //                             value={newUser.email}
// // //                             onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
// // //                             className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
// // //                             required
// // //                           />
// // //                         </div>
// // //                         <div>
// // //                           <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="privileges">
// // //                             {t('users.privileges')}
// // //                           </label>
// // //                           <select
// // //                             id="privileges"
// // //                             multiple
// // //                             value={newUser.privilege_ids}
// // //                             onChange={(e) =>
// // //                               setNewUser({
// // //                                 ...newUser,
// // //                                 privilege_ids: Array.from(e.target.selectedOptions, (option) => Number(option.value)),
// // //                               })
// // //                             }
// // //                             className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
// // //                             required
// // //                           >
// // //                             {privileges.map((privilege) => (
// // //                               <option key={privilege._id} value={privilege.privilege_id}>
// // //                                 {privilege.privilege_name}
// // //                               </option>
// // //                             ))}
// // //                           </select>
// // //                         </div>
// // //                         <div className="flex justify-end gap-3">
// // //                           <button
// // //                             type="button"
// // //                             onClick={() => handleViewChange('manage-users')}
// // //                             className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded transition duration-200"
// // //                           >
// // //                             {t('users.cancel')}
// // //                           </button>
// // //                           <button
// // //                             type="submit"
// // //                             className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded transition duration-200"
// // //                           >
// // //                             {t('users.create')}
// // //                           </button>
// // //                         </div>
// // //                       </form>
// // //                     </div>
// // //                   </div>
// // //                 )}

// // //                 {currentView === 'edit-users' && editingUser && editUser && (
// // //                   <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
// // //                     <div className="bg-white dark:bg-gray-900 rounded-lg p-8 w-full max-w-md shadow-2xl">
// // //                       <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
// // //                         {t('users.edit_title')}
// // //                       </h2>
// // //                       <form id="editUserForm" onSubmit={handleUpdateUser} className="space-y-6">
// // //                         <div>
// // //                           <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="userImageInput">
// // //                             {t('users.profile_picture')}
// // //                           </label>
// // //                           <input
// // //                             type="file"
// // //                             id="userImageInput"
// // //                             accept="image/*"
// // //                             onChange={handleUserImageChange}
// // //                             className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
// // //                           />
// // //                           {userImagePreview && (
// // //                             <img
// // //                               id="userImagePreview"
// // //                               src={userImagePreview}
// // //                               alt="Profile Preview"
// // //                               className="mt-2 w-24 h-24 object-cover rounded"
// // //                             />
// // //                           )}
// // //                         </div>
// // //                         <div>
// // //                           <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="first_name">
// // //                             {t('users.first_name')}
// // //                           </label>
// // //                           <input
// // //                             type="text"
// // //                             id="first_name"
// // //                             value={editUser.first_name}
// // //                             onChange={(e) => setEditUser({ ...editUser, first_name: e.target.value })}
// // //                             className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
// // //                             required
// // //                           />
// // //                         </div>
// // //                         <div>
// // //                           <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="last_name">
// // //                             {t('users.last_name')}
// // //                           </label>
// // //                           <input
// // //                             type="text"
// // //                             id="last_name"
// // //                             value={editUser.last_name}
// // //                             onChange={(e) => setEditUser({ ...editUser, last_name: e.target.value })}
// // //                             className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
// // //                             required
// // //                           />
// // //                         </div>
// // //                         <div>
// // //                           <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="email">
// // //                             {t('users.email')}
// // //                           </label>
// // //                           <input
// // //                             type="email"
// // //                             id="email"
// // //                             value={editUser.email}
// // //                             onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
// // //                             className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
// // //                             required
// // //                           />
// // //                         </div>
// // //                         <div>
// // //                           <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="privileges">
// // //                             {t('users.privileges')}
// // //                           </label>
// // //                           <select
// // //                             id="privileges"
// // //                             multiple
// // //                             value={editUser.privilege_ids}
// // //                             onChange={(e) =>
// // //                               setEditUser({
// // //                                 ...editUser,
// // //                                 privilege_ids: Array.from(e.target.selectedOptions, (option) => Number(option.value)),
// // //                               })
// // //                             }
// // //                             className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
// // //                             required
// // //                           >
// // //                             {privileges.map((privilege) => (
// // //                               <option key={privilege._id} value={privilege.privilege_id}>
// // //                                 {privilege.privilege_name}
// // //                               </option>
// // //                             ))}
// // //                           </select>
// // //                         </div>
// // //                         <div>
// // //                           <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
// // //                             {t('users.update_history')}
// // //                           </h3>
// // //                           {userUpdates.length === 0 ? (
// // //                             <p className="text-gray-600 dark:text-gray-300">{t('users.no_updates')}</p>
// // //                           ) : (
// // //                             <ul className="space-y-2">
// // //                               {userUpdates.map((update) => (
// // //                                 <li key={update._id} className="text-gray-700 dark:text-gray-300">
// // //                                   {t('users.update_item', {
// // //                                     date: new Date(update.createdAt).toLocaleString(),
// // //                                     field: update.field,
// // //                                     oldValue: update.old_value || t('users.unknown'),
// // //                                     newValue: update.new_value || t('users.unknown'),
// // //                                   })}
// // //                                 </li>
// // //                               ))}
// // //                             </ul>
// // //                           )}
// // //                         </div>
// // //                         <div className="flex justify-end gap-3">
// // //                           <button
// // //                             type="button"
// // //                             onClick={() => handleViewChange('manage-users')}
// // //                             className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded transition duration-200"
// // //                           >
// // //                             {t('users.cancel')}
// // //                           </button>
// // //                           <button
// // //                             type="submit"
// // //                             className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded transition duration-200"
// // //                           >
// // //                             {t('users.save')}
// // //                           </button>
// // //                         </div>
// // //                       </form>
// // //                     </div>
// // //                   </div>
// // //                 )}

// // //                 {currentView === 'activate-new-user' && (
// // //                   <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
// // //                     <div className="bg-white dark:bg-gray-900 rounded-lg p-8 w-full max-w-md shadow-2xl">
// // //                       <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
// // //                         {t('users.activate_title')}
// // //                       </h2>
// // //                       <form id="activateUserForm" onSubmit={handleActivateUser} className="space-y-6">
// // //                         <div>
// // //                           <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="email">
// // //                             {t('users.email')}
// // //                           </label>
// // //                           <input
// // //                             type="email"
// // //                             id="email"
// // //                             name="email"
// // //                             value={activateUser.email}
// // //                             onChange={(e) => setActivateUser({ ...activateUser, email: e.target.value })}
// // //                             className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
// // //                             required
// // //                           />
// // //                         </div>
// // //                         <div>
// // //                           <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="otp">
// // //                             {t('users.otp')}
// // //                           </label>
// // //                           <input
// // //                             type="text"
// // //                             id="otp"
// // //                             name="otp"
// // //                             value={activateUser.otp}
// // //                             onChange={(e) => setActivateUser({ ...activateUser, otp: e.target.value })}
// // //                             className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
// // //                             required
// // //                           />
// // //                         </div>
// // //                         <div>
// // //                           <button
// // //                             type="button"
// // //                             id="showOtpButton"
// // //                             onClick={handleShowOtp}
// // //                             className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded transition duration-200"
// // //                           >
// // //                             {t('users.show_otp')}
// // //                           </button>
// // //                           {otpDisplay && (
// // //                             <p id="otpDisplay" className="mt-2 text-gray-700 dark:text-gray-300">
// // //                               {t('users.otp_display')}: {otpDisplay}
// // //                             </p>
// // //                           )}
// // //                         </div>
// // //                         <div className="flex justify-end gap-3">
// // //                           <button
// // //                             type="button"
// // //                             onClick={() => handleViewChange('manage-users')}
// // //                             className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded transition duration-200"
// // //                           >
// // //                             {t('users.cancel')}
// // //                           </button>
// // //                           <button
// // //                             type="submit"
// // //                             className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded transition duration-200"
// // //                           >
// // //                             {t('users.activate')}
// // //                           </button>
// // //                         </div>
// // //                       </form>
// // //                     </div>
// // //                   </div>
// // //                 )}
// // //               </>
// // //             )}
// // //           </div>
// // //         </main>
// // //       </div>
// // //     </div>
// // //   );
// // // };

// // // export default UsersManagement;


// // import React, { useState, useEffect } from 'react';
// // import { useAuth } from '../../context/AuthContext';
// // import { useLanguage } from '../../context/LanguageContext';
// // import { usersManagementService } from '../../lib/usersManagementService';
// // import ModalSearch from '../../components/ModalSearch';
// // import Header from '../../partials/Header';
// // import Sidebar from '../../partials/Sidebar';
// // import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
// // import LoadingSpinner from '../../components/LoadingSpinner';

// // const UsersManagement = () => {
// //   const { authData, loading: authLoading } = useAuth();
// //   const { language, t } = useLanguage();
// //   const [users, setUsers] = useState([]);
// //   const [editingUser, setEditingUser] = useState(null);
// //   const [newUser, setNewUser] = useState({
// //     first_name: '',
// //     last_name: '',
// //     email: '',
// //     password: '',
// //     privilege_ids: [],
// //     user_image: null,
// //     phone: '',
// //   });
// //   const [editUser, setEditUser] = useState(null);
// //   const [activateUser, setActivateUser] = useState({
// //     email: '',
// //     otp: '',
// //   });
// //   const [privileges, setPrivileges] = useState([]);
// //   const [userUpdates, setUserUpdates] = useState([]);
// //   const [otpDisplay, setOtpDisplay] = useState('');
// //   const [userImagePreview, setUserImagePreview] = useState('');
// //   const [error, setError] = useState('');
// //   const [success, setSuccess] = useState('');
// //   const [loading, setLoading] = useState(true);
// //   const [sidebarOpen, setSidebarOpen] = useState(false);
// //   const [currentView, setCurrentView] = useState('manage-users');
// //   const [hasPrivilege, setHasPrivilege] = useState(false);
// //   const [currentPage, setCurrentPage] = useState(1);
// //   const itemsPerPage = 5;

// //   // Check authentication and privileges
// //   useEffect(() => {
// //     if (authLoading) return;

// //     if (!authData?.access_token) {
// //       setError(t('users.no_permission'));
// //       setLoading(false);
// //       return;
// //     }

// //     if (authData.privilege_ids.includes(1)) {
// //       setHasPrivilege(true);
// //     } else {
// //       setError(t('users.no_permission'));
// //       setLoading(false);
// //     }
// //   }, [authData, authLoading, t]);

// //   // Fetch users and privileges
// //   const fetchUsers = async () => {
// //     if (!authData?.org_id || !hasPrivilege) {
// //       setLoading(false);
// //       return;
// //     }

// //     setLoading(true);
// //     try {
// //       const [userData, privilegeData] = await Promise.all([
// //         usersManagementService.getUsers(authData.org_id),
// //         usersManagementService.getPrivileges(),
// //       ]);
// //       console.debug('Raw user data from API:', userData);
// //       setUsers(userData.filter((user) => user._id)); // Filter out invalid users
// //       setPrivileges(privilegeData);
// //       setError('');
// //     } catch (err) {
// //       console.error('Error fetching data:', err);
// //       setError(t('users.fetch_error'));
// //       setUsers([]); // Ensure empty list on failure
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   useEffect(() => {
// //     if (hasPrivilege && authData?.org_id && currentView === 'manage-users') {
// //       fetchUsers();
// //     }
// //   }, [authData, hasPrivilege, currentView]);

// //   // Fetch user updates when editing
// //   const fetchUserUpdates = async (userId) => {
// //     try {
// //       const updates = await usersManagementService.getUserUpdates(userId);
// //       setUserUpdates(updates);
// //     } catch (err) {
// //       console.error('Error fetching user updates:', err);
// //       setError(err.message || t('users.fetch_updates_error'));
// //     }
// //   };

// //   // Handle view change
// //   const handleViewChange = (view) => {
// //     setCurrentView(view);
// //     setError('');
// //     setSuccess('');
// //     setEditingUser(null);
// //     setEditUser(null);
// //     setNewUser({ first_name: '', last_name: '', email: '', password: '', privilege_ids: [], user_image: null, phone: '' });
// //     setActivateUser({ email: '', otp: '' });
// //     setOtpDisplay('');
// //     setUserImagePreview('');
// //     setUserUpdates([]);
// //     setCurrentPage(1);
// //   };

// //   // Handle user image change
// //   const handleUserImageChange = (e) => {
// //     const file = e.target.files[0];
// //     if (file) {
// //       console.log('Selected image:', file.name);
// //       if (currentView === 'edit-users') {
// //         setEditUser({ ...editUser, user_image: file });
// //       } else {
// //         setNewUser({ ...newUser, user_image: file });
// //       }
// //       const reader = new FileReader();
// //       reader.onload = (event) => setUserImagePreview(event.target.result);
// //       reader.readAsDataURL(file);
// //     }
// //   };

// //   // Handle add new user
// //   const handleAddUser = async (e) => {
// //     e.preventDefault();
// //     if (!hasPrivilege) {
// //       setError(t('users.no_permission'));
// //       return;
// //     }

// //     if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUser.email)) {
// //       setError(t('users.invalid_email'));
// //       return;
// //     }

// //     if (newUser.privilege_ids.length === 0) {
// //       setError(t('users.privileges_required'));
// //       return;
// //     }

// //     if (!newUser.password || newUser.password.length < 8) {
// //       setError(t('users.invalid_password'));
// //       return;
// //     }

// //     if (!newUser.phone || !/^\d{10,15}$/.test(newUser.phone)) {
// //       setError(t('users.invalid_phone'));
// //       return;
// //     }

// //     const userData = {
// //       ...newUser,
// //       name: `${newUser.first_name} ${newUser.last_name}`,
// //     };
// //     console.log('Registering user:', {
// //       ...userData,
// //       user_image: userData.user_image ? userData.user_image.name : 'none',
// //       password: '****',
// //     });

// //     try {
// //       setLoading(true);
// //       const userId = await usersManagementService.registerUser(
// //         userData,
// //         authData.org_id,
// //         authData.country_id
// //       );
// //       for (const privilege_id of newUser.privilege_ids) {
// //         await usersManagementService.createRole({
// //           user_id: userId,
// //           privilege: privilege_id,
// //           org_id: authData.org_id,
// //         });
// //       }
// //       if (newUser.user_image) {
// //         await usersManagementService.updateProfileImage(userId, newUser.user_image);
// //       }
// //       setSuccess(t('users.add_success'));
// //       setTimeout(() => {
// //         setSuccess('');
// //         setActivateUser({ ...activateUser, email: newUser.email });
// //         handleViewChange('activate-new-user');
// //       }, 3000);
// //     } catch (err) {
// //       console.error('Add user error:', err);
// //       setError(err.message || t('users.add_error'));
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   // Handle edit user
// //   const handleEditUser = async (user) => {
// //     if (!hasPrivilege) {
// //       setError(t('users.no_permission'));
// //       return;
// //     }

// //     const userId = user._id;
// //     if (!userId) {
// //       console.error('Invalid user object:', user);
// //       setError(t('users.invalid_user_id'));
// //       return;
// //     }

// //     try {
// //       const [userResult, rolesResult, profileResult] = await Promise.allSettled([
// //         usersManagementService.getUser(userId, authData.org_id),
// //         usersManagementService.getRolesByUser(userId, authData.org_id),
// //         usersManagementService.getUserProfile(userId),
// //       ]);

// //       if (userResult.status === 'rejected') {
// //         throw new Error(`Failed to fetch user data: ${userResult.reason}`);
// //       }

// //       const roles = rolesResult.status === 'fulfilled' ? rolesResult.value : [];
// //       if (rolesResult.status === 'rejected') {
// //         console.warn('Failed to fetch user roles:', rolesResult.reason);
// //         setError(t('users.partial_fetch_error_roles'));
// //       }

// //       const profile = profileResult.status === 'fulfilled' ? profileResult.value : { user_image: null };
// //       if (profileResult.status === 'rejected' && !profileResult.reason.message.includes('User profile not found')) {
// //         console.warn('Unexpected error fetching user profile:', profileResult.reason);
// //         setError(t('users.partial_fetch_error_profile'));
// //       }

// //       const [derivedFirstName, derivedLastName] = userResult.value.name
// //         ? userResult.value.name.split(' ').filter(Boolean)
// //         : ['', ''];
// //       const email = userResult.value.email || user.email || '';
// //       if (!email) {
// //         throw new Error('User email is missing');
// //       }

// //       setEditingUser(user);
// //       setEditUser({
// //         first_name: user.first_name || derivedFirstName || '',
// //         last_name: user.last_name || derivedLastName || '',
// //         email,
// //         privilege_ids: roles.map((role) => role.privilege),
// //         user_image: null,
// //         phone: user.phone || '',
// //       });
// //       setUserImagePreview(profile.user_image || '');
// //       fetchUserUpdates(userId);
// //       setCurrentView('edit-users');
// //     } catch (err) {
// //       console.error('Fetch user error:', err);
// //       setError(err.message || t('users.fetch_edit_error'));
// //     }
// //   };

// //   // Handle update user
// //   const handleUpdateUser = async (e) => {
// //     e.preventDefault();
// //     if (!hasPrivilege) {
// //       setError(t('users.no_permission'));
// //       return;
// //     }

// //     const userId = editingUser?._id;
// //     if (!userId) {
// //       setError(t('users.invalid_user_id'));
// //       return;
// //     }

// //     if (!editUser) {
// //       setError(t('users.form_not_loaded'));
// //       return;
// //     }

// //     if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editUser.email)) {
// //       setError(t('users.invalid_email'));
// //       return;
// //     }

// //     if (!editUser.first_name || !editUser.last_name) {
// //       setError(t('users.name_required'));
// //       return;
// //     }

// //     if (editUser.privilege_ids.length === 0) {
// //       setError(t('users.privileges_required'));
// //       return;
// //     }

// //     try {
// //       await usersManagementService.updateUser(userId, editUser, authData.org_id);
// //       await usersManagementService.updateUserRoles(userId, editUser.privilege_ids, authData.org_id);
// //       if (editUser.user_image) {
// //         await usersManagementService.updateProfileImage(userId, editUser.user_image);
// //       }
// //       setEditingUser(null);
// //       setEditUser(null);
// //       setUserImagePreview('');
// //       setUserUpdates([]);
// //       fetchUsers();
// //       setSuccess(t('users.update_success'));
// //       setTimeout(() => {
// //         setSuccess('');
// //         handleViewChange('manage-users');
// //       }, 3000);
// //     } catch (err) {
// //       console.error('Update user error:', err);
// //       setError(err.message || t('users.update_error'));
// //     }
// //   };

// //   // Handle activate user
// //   const handleShowOtp = async () => {
// //     if (!hasPrivilege) {
// //       setError(t('users.no_permission'));
// //       return;
// //     }

// //     if (!activateUser.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(activateUser.email)) {
// //       setError(t('users.invalid_email'));
// //       return;
// //     }

// //     try {
// //       const result = await usersManagementService.getOtp(activateUser.email, authData.org_id);
// //       console.log('Fetched OTP:', result);
// //       setOtpDisplay(result.otp || '');
// //       if (!result.otp) {
// //         setError(t('users.fetch_otp_error'));
// //       }
// //     } catch (err) {
// //       console.error('Fetch OTP error:', err);
// //       setError(err.message || t('users.fetch_otp_error'));
// //       setOtpDisplay('');
// //     }
// //   };

// //   const handleActivateUser = async (e) => {
// //     e.preventDefault();
// //     if (!hasPrivilege) {
// //       setError(t('users.no_permission'));
// //       return;
// //     }

// //     if (!activateUser.email || !activateUser.otp) {
// //       setError(t('users.email_otp_required'));
// //       return;
// //     }

// //     console.log('Activating user:', activateUser);
// //     try {
// //       setLoading(true);
// //       await usersManagementService.activateUser(
// //         { email: activateUser.email, otp: activateUser.otp },
// //         authData.org_id
// //       );
// //       setSuccess(t('users.activate_success'));
// //       setTimeout(() => {
// //         setSuccess('');
// //         handleViewChange('manage-users');
// //       }, 3000);
// //     } catch (err) {
// //       console.error('Activate user error:', err);
// //       setError(err.message || t('users.activate_error'));
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   // Handle delete user
// //   const handleDeleteUser = async (id) => {
// //     if (!hasPrivilege) {
// //       setError(t('users.no_permission'));
// //       return;
// //     }

// //     if (!id) {
// //       setError(t('users.invalid_user_id'));
// //       return;
// //     }

// //     if (window.confirm(t('users.delete_confirm'))) {
// //       try {
// //         await usersManagementService.deleteUser(id, authData.org_id);
// //         fetchUsers();
// //         setSuccess(t('users.delete_success'));
// //         setTimeout(() => setSuccess(''), 3000);
// //       } catch (err) {
// //         console.error('Delete user error:', err);
// //         setError(err.message || t('users.delete_error'));
// //       }
// //     }
// //   };

// //   // Pagination logic
// //   const totalPages = Math.ceil(users.length / itemsPerPage);
// //   const start = (currentPage - 1) * itemsPerPage;
// //   const end = start + itemsPerPage;
// //   const paginatedUsers = users.slice(start, end);

// //   const handlePageChange = (page) => {
// //     setCurrentPage(page);
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
// //                   {t('users.title')}
// //                 </h1>
// //                 <div className="grid grid-flow-col sm:auto-cols-max justify-start gap-2 mt-4">
// //                   <button
// //                     onClick={() => handleViewChange('manage-users')}
// //                     className={`px-4 py-2 rounded ${currentView === 'manage-users' ? 'bg-indigo-500 text-white' : 'bg-gray-300 text-gray-800'} hover:bg-indigo-600 transition duration-200`}
// //                   >
// //                     {t('users.manage_users')}
// //                   </button>
// //                   <button
// //                     onClick={() => handleViewChange('add-new-user')}
// //                     className={`px-4 py-2 rounded ${currentView === 'add-new-user' ? 'bg-indigo-500 text-white' : 'bg-gray-300 text-gray-800'} hover:bg-indigo-600 transition duration-200`}
// //                   >
// //                     {t('users.add_new_user')}
// //                   </button>
// //                   <button
// //                     onClick={() => handleViewChange('activate-new-user')}
// //                     className={`px-4 py-2 rounded ${currentView === 'activate-new-user' ? 'bg-indigo-500 text-white' : 'bg-gray-300 text-gray-800'} hover:bg-indigo-600 transition duration-200`}
// //                   >
// //                     {t('users.activate_new_user')}
// //                   </button>
// //                 </div>
// //               </div>
// //               <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
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

// //             {success && (
// //               <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
// //                 <span>{success}</span>
// //                 <button
// //                   onClick={() => setSuccess('')}
// //                   className="absolute top-0 right-0 px-4 py-3"
// //                   aria-label={t('common.dismiss_success')}
// //                 >
// //                   <svg className="fill-current h-6 w-6 text-green-500" viewBox="0 0 20 20">
// //                     <path d="M10 8.586L2.929 1.515 1.515 2.929 8.586 10l-7.071 7.071 1.414 1.414L10 11.414l7.071 7.071 1.414-1.414L11.414 10l7.071-7.071-1.414-1.414L10 8.586z" />
// //                   </svg>
// //                 </button>
// //               </div>
// //             )}

// //             {loading ? (
// //               <LoadingSpinner />
// //             ) : (
// //               <>
// //                 {currentView === 'manage-users' && (
// //                   <>
// //                     {users.length === 0 ? (
// //                       <div className="text-gray-600 dark:text-gray-300">{t('users.no_users')}</div>
// //                     ) : (
// //                       <>
// //                         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
// //                           {paginatedUsers.map((user) => (
// //                             <div
// //                               key={user._id}
// //                               className="bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow duration-200"
// //                               role="region"
// //                               aria-label={`${t('users.user_name')}: ${user.name}`}
// //                             >
// //                               <div className="space-y-4">
// //                                 <div>
// //                                   <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
// //                                     {t('users.name')}
// //                                   </span>
// //                                   <p className="text-gray-800 dark:text-gray-100 font-semibold">
// //                                     {user.name}
// //                                   </p>
// //                                 </div>
// //                                 <div>
// //                                   <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
// //                                     {t('users.email')}
// //                                   </span>
// //                                   <p className="text-gray-800 dark:text-gray-100 font-semibold">
// //                                     {user.email}
// //                                   </p>
// //                                 </div>
// //                                 <div>
// //                                   <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
// //                                     {t('users.phone')}
// //                                   </span>
// //                                   <p className="text-gray-800 dark:text-gray-100 font-semibold">
// //                                     {user.phone || t('users.unknown')}
// //                                   </p>
// //                                 </div>
// //                                 <div>
// //                                   <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
// //                                     {t('users.privileges')}
// //                                   </span>
// //                                   <p className="text-gray-800 dark:text-gray-100 font-semibold">
// //                                     {user.privilege_ids
// //                                       .map((id) => privileges.find((p) => p.privilege_id === id)?.privilege_name || t('users.unknown'))
// //                                       .join(', ') || t('users.none')}
// //                                   </p>
// //                                 </div>
// //                               </div>
// //                               {hasPrivilege && (
// //                                 <div className="flex justify-end gap-3 mt-4">
// //                                   <button
// //                                     onClick={() => handleEditUser(user)}
// //                                     className="flex items-center text-indigo-500 hover:text-indigo-600 text-sm font-medium transition-colors duration-200"
// //                                     aria-label={t('users.edit')}
// //                                   >
// //                                     <PencilIcon className="w-4 h-4 mr-1" />
// //                                     {t('users.edit')}
// //                                   </button>
// //                                   <button
// //                                     onClick={() => handleDeleteUser(user._id)}
// //                                     className="flex items-center text-red-500 hover:text-red-600 text-sm font-medium transition-colors duration-200"
// //                                     aria-label={t('users.delete')}
// //                                   >
// //                                     <TrashIcon className="w-4 h-4 mr-1" />
// //                                     {t('users.delete')}
// //                                   </button>
// //                                 </div>
// //                               )}
// //                             </div>
// //                           ))}
// //                         </div>
// //                         {totalPages > 1 && (
// //                           <div className="flex justify-center gap-2 mt-6">
// //                             {currentPage > 1 && (
// //                               <button
// //                                 onClick={() => handlePageChange(currentPage - 1)}
// //                                 className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
// //                               >
// //                                 {t('users.previous')}
// //                               </button>
// //                             )}
// //                             {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
// //                               <button
// //                                 key={`page-${page}`}
// //                                 onClick={() => handlePageChange(page)}
// //                                 className={`${
// //                                   page === currentPage ? 'bg-indigo-500 text-white' : 'bg-gray-300 text-gray-800'
// //                                 } hover:bg-indigo-600 font-bold py-2 px-4 rounded`}
// //                                 disabled={page === currentPage}
// //                               >
// //                                 {page}
// //                               </button>
// //                             ))}
// //                             {currentPage < totalPages && (
// //                               <button
// //                                 onClick={() => handlePageChange(currentPage + 1)}
// //                                 className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
// //                               >
// //                                 {t('users.next')}
// //                               </button>
// //                             )}
// //                           </div>
// //                         )}
// //                       </>
// //                     )}
// //                   </>
// //                 )}

// //                 {currentView === 'add-new-user' && (
// //                   <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
// //                     <div className="bg-white dark:bg-gray-900 rounded-lg p-8 w-full max-w-md shadow-2xl">
// //                       <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
// //                         {t('users.add_title')}
// //                       </h2>
// //                       <form id="addUserForm" onSubmit={handleAddUser} className="space-y-6">
// //                         <div>
// //                           <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="userImageInput">
// //                             {t('users.profile_picture')}
// //                           </label>
// //                           <input
// //                             type="file"
// //                             id="userImageInput"
// //                             accept="image/*"
// //                             onChange={handleUserImageChange}
// //                             className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
// //                           />
// //                           {userImagePreview && (
// //                             <img
// //                               id="userImagePreview"
// //                               src={userImagePreview}
// //                               alt="Profile Preview"
// //                               className="mt-2 w-24 h-24 object-cover rounded"
// //                             />
// //                           )}
// //                         </div>
// //                         <div>
// //                           <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="first_name">
// //                             {t('users.first_name')}
// //                           </label>
// //                           <input
// //                             type="text"
// //                             id="first_name"
// //                             value={newUser.first_name}
// //                             onChange={(e) => setNewUser({ ...newUser, first_name: e.target.value })}
// //                             className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
// //                             required
// //                           />
// //                         </div>
// //                         <div>
// //                           <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="last_name">
// //                             {t('users.last_name')}
// //                           </label>
// //                           <input
// //                             type="text"
// //                             id="last_name"
// //                             value={newUser.last_name}
// //                             onChange={(e) => setNewUser({ ...newUser, last_name: e.target.value })}
// //                             className="shadow appearance-none border border-gray-300 dark:border-grey-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
// //                             required
// //                           />
// //                         </div>
// //                         <div>
// //                           <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="email">
// //                             {t('users.email')}
// //                           </label>
// //                           <input
// //                             type="email"
// //                             id="email"
// //                             value={newUser.email}
// //                             onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
// //                             className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
// //                             required
// //                           />
// //                         </div>
// //                         <div>
// //                           <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="password">
// //                             {t('users.password')}
// //                           </label>
// //                           <input
// //                             type="password"
// //                             id="password"
// //                             value={newUser.password}
// //                             onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
// //                             className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
// //                             required
// //                             minLength={8}
// //                           />
// //                         </div>
// //                         <div>
// //                           <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="phone">
// //                             {t('users.phone')}
// //                           </label>
// //                           <input
// //                             type="text"
// //                             id="phone"
// //                             value={newUser.phone}
// //                             onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
// //                             className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
// //                             required
// //                             pattern="\d{10,15}"
// //                           />
// //                         </div>
// //                         <div>
// //                           <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="privileges">
// //                             {t('users.privileges')}
// //                           </label>
// //                           <select
// //                             id="privileges"
// //                             multiple
// //                             value={newUser.privilege_ids}
// //                             onChange={(e) =>
// //                               setNewUser({
// //                                 ...newUser,
// //                                 privilege_ids: Array.from(e.target.selectedOptions, (option) => Number(option.value)),
// //                               })
// //                             }
// //                             className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
// //                             required
// //                           >
// //                             {privileges.map((privilege) => (
// //                               <option key={privilege._id} value={privilege.privilege_id}>
// //                                 {privilege.privilege_name}
// //                               </option>
// //                             ))}
// //                           </select>
// //                         </div>
// //                         <div className="flex justify-end gap-3">
// //                           <button
// //                             type="button"
// //                             onClick={() => handleViewChange('manage-users')}
// //                             className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded transition duration-200"
// //                           >
// //                             {t('users.cancel')}
// //                           </button>
// //                           <button
// //                             type="submit"
// //                             className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded transition duration-200"
// //                           >
// //                             {t('users.create')}
// //                           </button>
// //                         </div>
// //                       </form>
// //                     </div>
// //                   </div>
// //                 )}

// //                 {currentView === 'edit-users' && editingUser && editUser && (
// //                   <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
// //                     <div className="bg-white dark:bg-gray-900 rounded-lg p-8 w-full max-w-md shadow-2xl">
// //                       <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
// //                         {t('users.edit_title')}
// //                       </h2>
// //                       <form id="editUserForm" onSubmit={handleUpdateUser} className="space-y-6">
// //                         <div>
// //                           <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="userImageInput">
// //                             {t('users.profile_picture')}
// //                           </label>
// //                           <input
// //                             type="file"
// //                             id="userImageInput"
// //                             accept="image/*"
// //                             onChange={handleUserImageChange}
// //                             className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
// //                           />
// //                           {userImagePreview && (
// //                             <img
// //                               id="userImagePreview"
// //                               src={userImagePreview}
// //                               alt="Profile Preview"
// //                               className="mt-2 w-24 h-24 object-cover rounded"
// //                             />
// //                           )}
// //                         </div>
// //                         <div>
// //                           <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="first_name">
// //                             {t('users.first_name')}
// //                           </label>
// //                           <input
// //                             type="text"
// //                             id="first_name"
// //                             value={editUser.first_name}
// //                             onChange={(e) => setEditUser({ ...editUser, first_name: e.target.value })}
// //                             className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
// //                             required
// //                           />
// //                         </div>
// //                         <div>
// //                           <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="last_name">
// //                             {t('users.last_name')}
// //                           </label>
// //                           <input
// //                             type="text"
// //                             id="last_name"
// //                             value={editUser.last_name}
// //                             onChange={(e) => setEditUser({ ...editUser, last_name: e.target.value })}
// //                             className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
// //                             required
// //                           />
// //                         </div>
// //                         <div>
// //                           <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="email">
// //                             {t('users.email')}
// //                           </label>
// //                           <input
// //                             type="email"
// //                             id="email"
// //                             value={editUser.email}
// //                             onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
// //                             className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
// //                             required
// //                           />
// //                         </div>
// //                         <div>
// //                           <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="phone">
// //                             {t('users.phone')}
// //                           </label>
// //                           <input
// //                             type="text"
// //                             id="phone"
// //                             value={editUser.phone}
// //                             onChange={(e) => setEditUser({ ...editUser, phone: e.target.value })}
// //                             className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
// //                             required
// //                             pattern="\d{10,15}"
// //                           />
// //                         </div>
// //                         <div>
// //                           <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="privileges">
// //                             {t('users.privileges')}
// //                           </label>
// //                           <select
// //                             id="privileges"
// //                             multiple
// //                             value={editUser.privilege_ids}
// //                             onChange={(e) =>
// //                               setEditUser({
// //                                 ...editUser,
// //                                 privilege_ids: Array.from(e.target.selectedOptions, (option) => Number(option.value)),
// //                               })
// //                             }
// //                             className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
// //                             required
// //                           >
// //                             {privileges.map((privilege) => (
// //                               <option key={privilege._id} value={privilege.privilege_id}>
// //                                 {privilege.privilege_name}
// //                               </option>
// //                             ))}
// //                           </select>
// //                         </div>
// //                         <div>
// //                           <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
// //                             {t('users.update_history')}
// //                           </h3>
// //                           {userUpdates.length === 0 ? (
// //                             <p className="text-gray-600 dark:text-gray-300">{t('users.no_updates')}</p>
// //                           ) : (
// //                             <ul className="space-y-2">
// //                               {userUpdates.map((update) => (
// //                                 <li key={update._id} className="text-gray-700 dark:text-gray-300">
// //                                   {t('users.update_item', {
// //                                     date: new Date(update.createdAt).toLocaleString(),
// //                                     field: update.field,
// //                                     oldValue: update.old_value || t('users.unknown'),
// //                                     newValue: update.new_value || t('users.unknown'),
// //                                   })}
// //                                 </li>
// //                               ))}
// //                             </ul>
// //                           )}
// //                         </div>
// //                         <div className="flex justify-end gap-3">
// //                           <button
// //                             type="button"
// //                             onClick={() => handleViewChange('manage-users')}
// //                             className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded transition duration-200"
// //                           >
// //                             {t('users.cancel')}
// //                           </button>
// //                           <button
// //                             type="submit"
// //                             className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded transition duration-200"
// //                           >
// //                             {t('users.save')}
// //                           </button>
// //                         </div>
// //                       </form>
// //                     </div>
// //                   </div>
// //                 )}

// //                 {currentView === 'activate-new-user' && (
// //                   <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
// //                     <div className="bg-white dark:bg-gray-900 rounded-lg p-8 w-full max-w-md shadow-2xl">
// //                       <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
// //                         {t('users.activate_title')}
// //                       </h2>
// //                       <form id="activateUserForm" onSubmit={handleActivateUser} className="space-y-6">
// //                         <div>
// //                           <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="email">
// //                             {t('users.email')}
// //                           </label>
// //                           <input
// //                             type="email"
// //                             id="email"
// //                             name="email"
// //                             value={activateUser.email}
// //                             onChange={(e) => setActivateUser({ ...activateUser, email: e.target.value })}
// //                             className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
// //                             required
// //                           />
// //                         </div>
// //                         <div>
// //                           <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="otp">
// //                             {t('users.otp')}
// //                           </label>
// //                           <input
// //                             type="text"
// //                             id="otp"
// //                             name="otp"
// //                             value={activateUser.otp}
// //                             onChange={(e) => setActivateUser({ ...activateUser, otp: e.target.value })}
// //                             className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
// //                             required
// //                           />
// //                         </div>
// //                         <div>
// //                           <button
// //                             type="button"
// //                             id="showOtpButton"
// //                             onClick={handleShowOtp}
// //                             className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded transition duration-200"
// //                           >
// //                             {t('users.show_otp')}
// //                           </button>
// //                           {otpDisplay && (
// //                             <p id="otpDisplay" className="mt-2 text-gray-700 dark:text-gray-300">
// //                               {t('users.otp_display')}: {otpDisplay}
// //                             </p>
// //                           )}
// //                         </div>
// //                         <div className="flex justify-end gap-3">
// //                           <button
// //                             type="button"
// //                             onClick={() => handleViewChange('manage-users')}
// //                             className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded transition duration-200"
// //                           >
// //                             {t('users.cancel')}
// //                           </button>
// //                           <button
// //                             type="submit"
// //                             className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded transition duration-200"
// //                           >
// //                             {t('users.activate')}
// //                           </button>
// //                         </div>
// //                       </form>
// //                     </div>
// //                   </div>
// //                 )}
// //               </>
// //             )}
// //           </div>
// //         </main>
// //       </div>
// //     </div>
// //   );
// // };

// // export default UsersManagement;



// import React, { useState, useEffect } from 'react';
// import { useAuth } from '../../context/AuthContext';
// import { useLanguage } from '../../context/LanguageContext';
// import { usersManagementService } from '../../lib/usersManagementService';
// import ModalSearch from '../../components/ModalSearch';
// import Header from '../../partials/Header';
// import Sidebar from '../../partials/Sidebar';
// import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
// import LoadingSpinner from '../../components/LoadingSpinner';

// const UsersManagement = () => {
//   const { authData, loading: authLoading } = useAuth();
//   const { language, t } = useLanguage();
//   const [users, setUsers] = useState([]);
//   const [editingUser, setEditingUser] = useState(null);
//   const [newUser, setNewUser] = useState({
//     first_name: '',
//     last_name: '',
//     email: '',
//     password: '',
//     user_image: null,
//     phone: '',
//   });
//   const [editUser, setEditUser] = useState(null);
//   const [activateUser, setActivateUser] = useState({
//     email: '',
//     otp: '',
//   });
//   const [userUpdates, setUserUpdates] = useState([]);
//   const [otpDisplay, setOtpDisplay] = useState('');
//   const [userImagePreview, setUserImagePreview] = useState('');
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');
//   const [loading, setLoading] = useState(true);
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [currentView, setCurrentView] = useState('manage-users');
//   const [hasPrivilege, setHasPrivilege] = useState(false);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [viewMode, setViewMode] = useState('cards');
//   const itemsPerPage = 5;

//   // Check authentication and privileges
//   useEffect(() => {
//     if (authLoading) return;

//     if (!authData?.access_token) {
//       setError(t('users.no_permission'));
//       setLoading(false);
//       return;
//     }

//     if (authData.privilege_ids?.includes(1)) {
//       setHasPrivilege(true);
//     } else {
//       setError(t('users.no_permission'));
//       setLoading(false);
//     }
//   }, [authData, authLoading, t]);

//   // Fetch users
//   const fetchUsers = async () => {
//     if (!authData?.org_id || !hasPrivilege) {
//       setLoading(false);
//       return;
//     }

//     setLoading(true);
//     try {
//       const userData = await usersManagementService.getUsers(authData.org_id);
//       console.debug('Raw user data from API:', userData);
//       const usersWithProfiles = await Promise.all(
//         userData.filter((user) => user._id).map(async (user) => {
//           try {
//             const cacheKey = `profile_${user._id}`;
//             const cachedProfile = localStorage.getItem(cacheKey);
//             if (cachedProfile) {
//               return {
//                 ...user,
//                 profile_image: JSON.parse(cachedProfile).user_image || null,
//                 image_mime_type: JSON.parse(cachedProfile).image_mime_type || null,
//               };
//             }

//             const API_URL = `${import.meta.env.VITE_API_BASE_URL}`;
//             const response = await fetch(`${API_URL}/api/users/profile?user_id=${user._id}&t=${Date.now()}`, {
//               method: 'GET',
//               headers: {
//                 'Content-Type': 'application/json',
//                 'x-access-tokens': localStorage.getItem('access_token'),
//               },
//             });

//             if (!response.ok) {
//               throw new Error(`Failed to fetch profile for user ${user._id}: ${response.status}`);
//             }

//             const profile = await response.json();
//             const profileData = {
//               user_image: profile.user_image || null,
//               image_mime_type: profile.image_mime_type || null,
//             };

//             localStorage.setItem(cacheKey, JSON.stringify(profileData));

//             return {
//               ...user,
//               profile_image: profileData.user_image,
//               image_mime_type: profileData.image_mime_type,
//             };
//           } catch (error) {
//             console.warn(`Failed to fetch profile for user ${user._id}:`, error);
//             return {
//               ...user,
//               profile_image: null,
//               image_mime_type: null,
//             };
//           }
//         })
//       );
//       setUsers(usersWithProfiles);
//       setError('');
//     } catch (err) {
//       console.error('Error fetching data:', err);
//       setError(t('users.fetch_error'));
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (hasPrivilege && authData?.org_id && currentView === 'manage-users') {
//       fetchUsers();
//     }
//   }, [authData, hasPrivilege, currentView]);

//   // Fetch user updates when editing
//   const fetchUserUpdates = async (userId) => {
//     try {
//       const updates = await usersManagementService.getUserUpdates(userId);
//       setUserUpdates(updates);
//     } catch (err) {
//       console.error('Error fetching user updates:', err);
//       setError(err.message || t('users.fetch_updates_error'));
//     }
//   };

//   // Handle view change
//   const handleViewChange = (view) => {
//     setCurrentView(view);
//     setError('');
//     setSuccess('');
//     setEditingUser(null);
//     setEditUser(null);
//     setNewUser({ first_name: '', last_name: '', email: '', password: '', user_image: null, phone: '' });
//     setActivateUser({ email: '', otp: '' });
//     setOtpDisplay('');
//     setUserImagePreview('');
//     setUserUpdates([]);
//     setCurrentPage(1);
//   };

//   // Handle user image change
//   const handleUserImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       console.log('Selected image:', file.name);
//       if (currentView === 'edit-users') {
//         setEditUser({ ...editUser, user_image: file });
//       } else {
//         setNewUser({ ...newUser, user_image: file });
//       }
//       const reader = new FileReader();
//       reader.onload = (event) => setUserImagePreview(event.target.result);
//       reader.readAsDataURL(file);
//     }
//   };

//   // Handle add new user
//   const handleAddUser = async (e) => {
//     e.preventDefault();
//     if (!hasPrivilege) {
//       setError(t('users.no_permission'));
//       return;
//     }

//     if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUser.email)) {
//       setError(t('users.invalid_email'));
//       return;
//     }

//     if (!newUser.password || newUser.password.length < 8) {
//       setError(t('users.invalid_password'));
//       return;
//     }

//     if (!newUser.phone || !/^\d{10,15}$/.test(newUser.phone)) {
//       setError(t('users.invalid_phone'));
//       return;
//     }

//     if (!newUser.first_name || !newUser.last_name) {
//       setError(t('users.name_required'));
//       return;
//     }

//     try {
//       setLoading(true);
//       const userData = new FormData();
//       userData.append('name', `${newUser.first_name} ${newUser.last_name}`);
//       userData.append('first_name', newUser.first_name);
//       userData.append('last_name', newUser.last_name);
//       userData.append('email', newUser.email);
//       userData.append('password', newUser.password);
//       userData.append('phone', newUser.phone);
//       userData.append('country_id', authData.country_id || '1');
//       userData.append('org_id', authData.org_id || '1');
//       if (newUser.user_image) {
//         userData.append('user_image', newUser.user_image);
//       }

//       console.log('Registering user:', {
//         name: `${newUser.first_name} ${newUser.last_name}`,
//         first_name: newUser.first_name,
//         last_name: newUser.last_name,
//         email: newUser.email,
//         password: '****',
//         phone: newUser.phone,
//         country_id: authData.country_id || '1',
//         org_id: authData.org_id || '1',
//         user_image: newUser.user_image ? newUser.user_image.name : 'none',
//       });

//       const userId = await usersManagementService.registerUser(
//         userData,
//         authData.org_id,
//         authData.country_id
//       );

//       if (newUser.user_image) {
//         await usersManagementService.updateProfileImage(userId, newUser.user_image);
//         const cacheKey = `profile_${userId}`;
//         localStorage.setItem(cacheKey, JSON.stringify({
//           user_image: await new Promise((resolve) => {
//             const reader = new FileReader();
//             reader.onload = () => resolve(reader.result.split(',')[1]);
//             reader.readAsDataURL(newUser.user_image);
//           }),
//           image_mime_type: newUser.user_image.type,
//         }));
//       }

//       setSuccess(t('users.add_success'));
//       setTimeout(() => {
//         setSuccess('');
//         setActivateUser({ ...activateUser, email: newUser.email });
//         handleViewChange('activate-new-user');
//       }, 3000);
//     } catch (err) {
//       console.error('Add user error:', err);
//       const errorMessage = err.message.includes('Internal Server Error')
//         ? t('users.register_error_server')
//         : err.message || t('users.add_error');
//       setError(errorMessage);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle edit user
//   const handleEditUser = async (user) => {
//     if (!hasPrivilege) {
//       setError(t('users.no_permission'));
//       return;
//     }

//     const userId = user._id;
//     if (!userId) {
//       console.error('Invalid user object:', user);
//       setError(t('users.invalid_user_id'));
//       return;
//     }

//     try {
//       const [userResult, profileResult] = await Promise.allSettled([
//         usersManagementService.getUser(userId, authData.org_id),
//         (async () => {
//           const cacheKey = `profile_${userId}`;
//           const cachedProfile = localStorage.getItem(cacheKey);
//           if (cachedProfile) {
//             return JSON.parse(cachedProfile);
//           }
//           const API_URL = `${import.meta.env.VITE_API_BASE_URL}`;
//           const response = await fetch(`${API_URL}/api/users/profile?user_id=${userId}&t=${Date.now()}`, {
//             method: 'GET',
//             headers: {
//               'Content-Type': 'application/json',
//               'x-access-tokens': localStorage.getItem('access_token'),
//             },
//           });
//           if (!response.ok) {
//             throw new Error(`Failed to fetch profile: ${response.status}`);
//           }
//           const profile = await response.json();
//           const profileData = { user_image: profile.user_image || null, image_mime_type: profile.image_mime_type || null };
//           localStorage.setItem(cacheKey, JSON.stringify(profileData));
//           return profileData;
//         })(),
//       ]);

//       if (userResult.status === 'rejected') {
//         throw new Error(`Failed to fetch user data: ${userResult.reason}`);
//       }

//       const profile = profileResult.status === 'fulfilled' ? profileResult.value : { user_image: null, image_mime_type: null };
//       if (profileResult.status === 'rejected' && !profileResult.reason.message.includes('User profile not found')) {
//         console.warn('Unexpected error fetching user profile:', profileResult.reason);
//         setError(t('users.partial_fetch_error_profile'));
//       }

//       const [derivedFirstName, derivedLastName] = userResult.value.name
//         ? userResult.value.name.split(' ').filter(Boolean)
//         : ['', ''];
//       const email = userResult.value.email || user.email || '';
//       if (!email) {
//         throw new Error('User email is missing');
//       }

//       setEditingUser(user);
//       setEditUser({
//         first_name: user.first_name || derivedFirstName || '',
//         last_name: user.last_name || derivedLastName || '',
//         email,
//         user_image: null,
//         phone: user.phone || '',
//       });
//       setUserImagePreview(profile.user_image ? `data:${profile.image_mime_type || 'image/jpeg'};base64,${profile.user_image}` : '');
//       fetchUserUpdates(userId);
//       setCurrentView('edit-users');
//     } catch (err) {
//       console.error('Fetch user error:', err);
//       setError(err.message || t('users.fetch_edit_error'));
//     }
//   };

//   // Handle update user
//   const handleUpdateUser = async (e) => {
//     e.preventDefault();
//     if (!hasPrivilege) {
//       setError(t('users.no_permission'));
//       return;
//     }

//     const userId = editingUser?._id;
//     if (!userId) {
//       setError(t('users.invalid_user_id'));
//       return;
//     }

//     if (!editUser) {
//       setError(t('users.form_not_loaded'));
//       return;
//     }

//     if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editUser.email)) {
//       setError(t('users.invalid_email'));
//       return;
//     }

//     if (!editUser.first_name || !editUser.last_name) {
//       setError(t('users.name_required'));
//       return;
//     }

//     try {
//       // Construct FormData with all required fields
//       const userData = new FormData();
//       userData.append('name', `${editUser.first_name} ${editUser.last_name}`);
//       userData.append('first_name', editUser.first_name || '');
//       userData.append('last_name', editUser.last_name || '');
//       userData.append('email', editUser.email || '');
//       userData.append('phone', editUser.phone || '');

//       // Log FormData for debugging
//       console.debug('Updating user with FormData:', {
//         name: `${editUser.first_name} ${editUser.last_name}`,
//         first_name: editUser.first_name,
//         last_name: editUser.last_name,
//         email: editUser.email,
//         phone: editUser.phone,
//       });

//       // Update user data only if fields have changed
//       const fieldsChanged = (
//         editUser.first_name !== editingUser.first_name ||
//         editUser.last_name !== editingUser.last_name ||
//         editUser.email !== editingUser.email ||
//         editUser.phone !== editingUser.phone
//       );

//       if (fieldsChanged) {
//         await usersManagementService.updateUser(userId, userData, authData.org_id);
//       }

//       // Update profile image if provided
//       if (editUser.user_image) {
//         await usersManagementService.updateProfileImage(userId, editUser.user_image);
//         const cacheKey = `profile_${userId}`;
//         localStorage.setItem(cacheKey, JSON.stringify({
//           user_image: await new Promise((resolve) => {
//             const reader = new FileReader();
//             reader.onload = () => resolve(reader.result.split(',')[1]);
//             reader.readAsDataURL(editUser.user_image);
//           }),
//           image_mime_type: editUser.user_image.type,
//         }));
//       }

//       setEditingUser(null);
//       setEditUser(null);
//       setUserImagePreview('');
//       setUserUpdates([]);
//       fetchUsers();
//       setSuccess(t('users.update_success'));
//       setTimeout(() => {
//         setSuccess('');
//         handleViewChange('manage-users');
//       }, 3000);
//     } catch (err) {
//       console.error('Update user error:', err);
//       const errorMessage = err.message.includes('Missing required fields')
//         ? t('users.update_error_missing_fields')
//         : err.message.includes('Internal Server Error')
//           ? t('users.update_error_server')
//           : err.message || t('users.update_error');
//       setError(errorMessage);
//     }
//   };

//   // Handle activate user
//   const handleShowOtp = async () => {
//     if (!hasPrivilege) {
//       setError(t('users.no_permission'));
//       return;
//     }

//     if (!activateUser.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(activateUser.email)) {
//       setError(t('users.invalid_email'));
//       return;
//     }

//     try {
//       const result = await usersManagementService.getOtp(activateUser.email, authData.org_id);
//       console.log('Fetched OTP:', result);
//       setOtpDisplay(result.otp || '');
//       if (!result.otp) {
//         setError(t('users.fetch_otp_error'));
//       }
//     } catch (err) {
//       console.error('Fetch OTP error:', err);
//       setError(err.message || t('users.fetch_otp_error'));
//       setOtpDisplay('');
//     }
//   };

//   const handleActivateUser = async (e) => {
//     e.preventDefault();
//     if (!hasPrivilege) {
//       setError(t('users.no_permission'));
//       return;
//     }

//     if (!activateUser.email || !activateUser.otp) {
//       setError(t('users.email_otp_required'));
//       return;
//     }

//     console.log('Activating user:', activateUser);
//     try {
//       setLoading(true);
//       await usersManagementService.activateUser(
//         { email: activateUser.email, otp: activateUser.otp },
//         authData.org_id
//       );
//       setSuccess(t('users.activate_success'));
//       setTimeout(() => {
//         setSuccess('');
//         handleViewChange('manage-users');
//       }, 3000);
//     } catch (err) {
//       console.error('Activate user error:', err);
//       setError(err.message || t('users.activate_error'));
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle delete user
//   const handleDeleteUser = async (id) => {
//     if (!hasPrivilege) {
//       setError(t('users.no_permission'));
//       return;
//     }

//     if (!id) {
//       setError(t('users.invalid_user_id'));
//       return;
//     }

//     if (window.confirm(t('users.delete_confirm'))) {
//       try {
//         await usersManagementService.deleteUser(id, authData.org_id);
//         localStorage.removeItem(`profile_${id}`);
//         fetchUsers();
//         setSuccess(t('users.delete_success'));
//         setTimeout(() => setSuccess(''), 3000);
//       } catch (err) {
//         console.error('Delete user error:', err);
//         setError(err.message || t('users.delete_error'));
//       }
//     }
//   };

//   // Pagination logic
//   const totalPages = Math.ceil(users.length / itemsPerPage);
//   const start = (currentPage - 1) * itemsPerPage;
//   const end = start + itemsPerPage;
//   const paginatedUsers = users.slice(start, end);

//   const handlePageChange = (page) => {
//     setCurrentPage(page);
//   };

//   // Toggle view mode
//   const toggleViewMode = () => {
//     setViewMode(viewMode === 'cards' ? 'table' : 'cards');
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
//                   {t('users.title')}
//                 </h1>
//                 <div className="grid grid-flow-col sm:auto-cols-max justify-start gap-2 mt-4">
//                   <button
//                     onClick={() => handleViewChange('manage-users')}
//                     className={`px-4 py-2 rounded ${currentView === 'manage-users' ? 'bg-indigo-500 text-white' : 'bg-gray-300 text-gray-800'} hover:bg-indigo-600 transition duration-200`}
//                   >
//                     {t('users.manage_users')}
//                   </button>
//                   <button
//                     onClick={() => handleViewChange('add-new-user')}
//                     className={`px-4 py-2 rounded ${currentView === 'add-new-user' ? 'bg-indigo-500 text-white' : 'bg-gray-300 text-gray-800'} hover:bg-indigo-600 transition duration-200`}
//                   >
//                     {t('users.add_new_user')}
//                   </button>
//                   <button
//                     onClick={() => handleViewChange('activate-new-user')}
//                     className={`px-4 py-2 rounded ${currentView === 'activate-new-user' ? 'bg-indigo-500 text-white' : 'bg-gray-300 text-gray-800'} hover:bg-indigo-600 transition duration-200`}
//                   >
//                     {t('users.activate_new_user')}
//                   </button>
//                   <button
//                     onClick={toggleViewMode}
//                     className="px-4 py-2 rounded bg-gray-300 text-gray-800 hover:bg-gray-400 transition duration-200"
//                   >
//                     {viewMode === 'cards' ? 'Table View' : 'Card View'}
//                   </button>
//                 </div>
//               </div>
//               <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
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
//                 {currentView === 'manage-users' && (
//                   <>
//                     {users.length === 0 ? (
//                       <div className="text-gray-600 dark:text-gray-300">{t('users.no_users')}</div>
//                     ) : (
//                       <>
//                         {viewMode === 'cards' ? (
//                           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//                             {paginatedUsers.map((user) => (
//                               <div
//                                 key={user._id}
//                                 className="bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow duration-200"
//                                 role="region"
//                                 aria-label={`${t('users.user_name')}: ${user.name}`}
//                               >
//                                 <div className="space-y-4">
//                                   <div className="flex items-center">
//                                     <img
//                                       className="w-10 h-10 rounded-full mr-3"
//                                       src={
//                                         user.profile_image
//                                           ? `data:${user.image_mime_type || 'image/jpeg'};base64,${user.profile_image}`
//                                           : '/images/def_avatar.svg'
//                                       }
//                                       alt={`${user.name}'s profile`}
//                                     />
//                                     <div>
//                                       <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
//                                         {t('users.name')}
//                                       </span>
//                                       <p className="text-gray-800 dark:text-gray-100 font-semibold">
//                                         {user.name}
//                                       </p>
//                                     </div>
//                                   </div>
//                                   <div>
//                                     <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
//                                       {t('users.email')}
//                                     </span>
//                                     <p className="text-gray-800 dark:text-gray-100 font-semibold">
//                                       {user.email}
//                                     </p>
//                                   </div>
//                                   <div>
//                                     <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
//                                       {t('users.phone')}
//                                     </span>
//                                     <p className="text-gray-800 dark:text-gray-100 font-semibold">
//                                       {user.phone || t('users.unknown')}
//                                     </p>
//                                   </div>
//                                 </div>
//                                 {hasPrivilege && (
//                                   <div className="flex justify-end gap-3 mt-4">
//                                     <button
//                                       onClick={() => handleEditUser(user)}
//                                       className="flex items-center text-indigo-500 hover:text-indigo-600 text-sm font-medium transition-colors duration-200"
//                                       aria-label={t('users.edit')}
//                                     >
//                                       <PencilIcon className="w-4 h-4 mr-1" />
//                                       {t('users.edit')}
//                                     </button>
//                                     <button
//                                       onClick={() => handleDeleteUser(user._id)}
//                                       className="flex items-center text-red-500 hover:text-red-600 text-sm font-medium transition-colors duration-200"
//                                       aria-label={t('users.delete')}
//                                     >
//                                       <TrashIcon className="w-4 h-4 mr-1" />
//                                       {t('users.delete')}
//                                     </button>
//                                   </div>
//                                 )}
//                               </div>
//                             ))}
//                           </div>
//                         ) : (
//                           <div className="overflow-x-auto">
//                             <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
//                               <thead>
//                                 <tr className="bg-gray-100 dark:bg-gray-700">
//                                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                                     {t('users.profile')}
//                                   </th>
//                                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                                     {t('users.name')}
//                                   </th>
//                                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                                     {t('users.email')}
//                                   </th>
//                                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                                     {t('users.phone')}
//                                   </th>
//                                   {hasPrivilege && (
//                                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                                       {t('users.actions')}
//                                     </th>
//                                   )}
//                                 </tr>
//                               </thead>
//                               <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
//                                 {paginatedUsers.map((user) => (
//                                   <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
//                                     <td className="px-6 py-4 whitespace-nowrap">
//                                       <img
//                                         className="w-8 h-8 rounded-full"
//                                         src={
//                                           user.profile_image
//                                             ? `data:${user.image_mime_type || 'image/jpeg'};base64,${user.profile_image}`
//                                             : '/images/def_avatar.svg'
//                                         }
//                                         alt={`${user.name}'s profile`}
//                                       />
//                                     </td>
//                                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-100">
//                                       {user.name}
//                                     </td>
//                                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-100">
//                                       {user.email}
//                                     </td>
//                                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-100">
//                                       {user.phone || t('users.unknown')}
//                                     </td>
//                                     {hasPrivilege && (
//                                       <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                                         <button
//                                           onClick={() => handleEditUser(user)}
//                                           className="text-indigo-500 hover:text-indigo-600 mr-4"
//                                           aria-label={t('users.edit')}
//                                         >
//                                           <PencilIcon className="w-5 h-5" />
//                                         </button>
//                                         <button
//                                           onClick={() => handleDeleteUser(user._id)}
//                                           className="text-red-500 hover:text-red-600"
//                                           aria-label={t('users.delete')}
//                                         >
//                                           <TrashIcon className="w-5 h-5" />
//                                         </button>
//                                       </td>
//                                     )}
//                                   </tr>
//                                 ))}
//                               </tbody>
//                             </table>
//                           </div>
//                         )}
//                         {totalPages > 1 && (
//                           <div className="flex justify-center gap-2 mt-6">
//                             {currentPage > 1 && (
//                               <button
//                                 onClick={() => handlePageChange(currentPage - 1)}
//                                 className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
//                               >
//                                 {t('users.previous')}
//                               </button>
//                             )}
//                             {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
//                               <button
//                                 key={`page-${page}`}
//                                 onClick={() => handlePageChange(page)}
//                                 className={`${
//                                   page === currentPage ? 'bg-indigo-500 text-white' : 'bg-gray-300 text-gray-800'
//                                 } hover:bg-indigo-600 font-bold py-2 px-4 rounded`}
//                                 disabled={page === currentPage}
//                               >
//                                 {page}
//                               </button>
//                             ))}
//                             {currentPage < totalPages && (
//                               <button
//                                 onClick={() => handlePageChange(currentPage + 1)}
//                                 className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
//                               >
//                                 {t('users.next')}
//                               </button>
//                             )}
//                           </div>
//                         )}
//                       </>
//                     )}
//                   </>
//                 )}

//                 {currentView === 'add-new-user' && (
//                   <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//                     <div className="bg-white dark:bg-gray-900 rounded-lg p-8 w-full max-w-md shadow-2xl">
//                       <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
//                         {t('users.add_title')}
//                       </h2>
//                       <form id="addUserForm" onSubmit={handleAddUser} className="space-y-6">
//                         <div>
//                           <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="userImageInput">
//                             {t('users.profile_picture')}
//                           </label>
//                           <input
//                             type="file"
//                             id="userImageInput"
//                             accept="image/*"
//                             onChange={handleUserImageChange}
//                             className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
//                           />
//                           {userImagePreview && (
//                             <img
//                               id="userImagePreview"
//                               src={userImagePreview}
//                               alt="Profile Preview"
//                               className="mt-2 w-24 h-24 object-cover rounded"
//                             />
//                           )}
//                         </div>
//                         <div>
//                           <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="first_name">
//                             {t('users.first_name')}
//                           </label>
//                           <input
//                             type="text"
//                             id="first_name"
//                             value={newUser.first_name}
//                             onChange={(e) => setNewUser({ ...newUser, first_name: e.target.value })}
//                             className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
//                             required
//                           />
//                         </div>
//                         <div>
//                           <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="last_name">
//                             {t('users.last_name')}
//                           </label>
//                           <input
//                             type="text"
//                             id="last_name"
//                             value={newUser.last_name}
//                             onChange={(e) => setNewUser({ ...newUser, last_name: e.target.value })}
//                             className="shadow appearance-none border border-gray-300 dark:border-grey-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
//                             required
//                           />
//                         </div>
//                         <div>
//                           <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="email">
//                             {t('users.email')}
//                           </label>
//                           <input
//                             type="email"
//                             id="email"
//                             value={newUser.email}
//                             onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
//                             className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
//                             required
//                           />
//                         </div>
//                         <div>
//                           <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="password">
//                             {t('users.password')}
//                           </label>
//                           <input
//                             type="password"
//                             id="password"
//                             value={newUser.password}
//                             onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
//                             className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
//                             required
//                             minLength={8}
//                           />
//                         </div>
//                         <div>
//                           <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="phone">
//                             {t('users.phone')}
//                           </label>
//                           <input
//                             type="text"
//                             id="phone"
//                             value={newUser.phone}
//                             onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
//                             className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
//                             required
//                             pattern="\d{10,15}"
//                           />
//                         </div>
//                         <div className="flex justify-end gap-3">
//                           <button
//                             type="button"
//                             onClick={() => handleViewChange('manage-users')}
//                             className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded transition duration-200"
//                           >
//                             {t('users.cancel')}
//                           </button>
//                           <button
//                             type="submit"
//                             className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded transition duration-200"
//                           >
//                             {t('users.create')}
//                           </button>
//                         </div>
//                       </form>
//                     </div>
//                   </div>
//                 )}

//                 {currentView === 'edit-users' && editingUser && editUser && (
//                   <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//                     <div className="bg-white dark:bg-gray-900 rounded-lg p-8 w-full max-w-md shadow-2xl">
//                       <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
//                         {t('users.edit_title')}
//                       </h2>
//                       <form id="editUserForm" onSubmit={handleUpdateUser} className="space-y-6">
//                         <div>
//                           <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="userImageInput">
//                             {t('users.profile_picture')}
//                           </label>
//                           <input
//                             type="file"
//                             id="userImageInput"
//                             accept="image/*"
//                             onChange={handleUserImageChange}
//                             className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
//                           />
//                           {userImagePreview && (
//                             <img
//                               id="userImagePreview"
//                               src={userImagePreview}
//                               alt="Profile Preview"
//                               className="mt-2 w-24 h-24 object-cover rounded"
//                             />
//                           )}
//                         </div>
//                         <div>
//                           <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="first_name">
//                             {t('users.first_name')}
//                           </label>
//                           <input
//                             type="text"
//                             id="first_name"
//                             value={editUser.first_name}
//                             onChange={(e) => setEditUser({ ...editUser, first_name: e.target.value })}
//                             className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
//                             required
//                           />
//                         </div>
//                         <div>
//                           <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="last_name">
//                             {t('users.last_name')}
//                           </label>
//                           <input
//                             type="text"
//                             id="last_name"
//                             value={editUser.last_name}
//                             onChange={(e) => setEditUser({ ...editUser, last_name: e.target.value })}
//                             className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
//                             required
//                           />
//                         </div>
//                         <div>
//                           <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="email">
//                             {t('users.email')}
//                           </label>
//                           <input
//                             type="email"
//                             id="email"
//                             value={editUser.email}
//                             onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
//                             className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
//                             required
//                           />
//                         </div>
//                         <div>
//                           <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="phone">
//                             {t('users.phone')}
//                           </label>
//                           <input
//                             type="text"
//                             id="phone"
//                             value={editUser.phone}
//                             onChange={(e) => setEditUser({ ...editUser, phone: e.target.value })}
//                             className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
//                             required
//                             pattern="\d{10,15}"
//                           />
//                         </div>
//                         <div>
//                           <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
//                             {t('users.update_history')}
//                           </h3>
//                           {userUpdates.length === 0 ? (
//                             <p className="text-gray-600 dark:text-gray-300">{t('users.no_updates')}</p>
//                           ) : (
//                             <ul className="space-y-2">
//                               {userUpdates.map((update) => (
//                                 <li key={update._id} className="text-gray-700 dark:text-gray-300">
//                                   {t('users.update_item', {
//                                     date: new Date(update.createdAt).toLocaleString(),
//                                     field: update.field,
//                                     oldValue: update.old_value || t('users.unknown'),
//                                     newValue: update.new_value || t('users.unknown'),
//                                   })}
//                                 </li>
//                               ))}
//                             </ul>
//                           )}
//                         </div>
//                         <div className="flex justify-end gap-3">
//                           <button
//                             type="button"
//                             onClick={() => handleViewChange('manage-users')}
//                             className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded transition duration-200"
//                           >
//                             {t('users.cancel')}
//                           </button>
//                           <button
//                             type="submit"
//                             className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded transition duration-200"
//                           >
//                             {t('users.save')}
//                           </button>
//                         </div>
//                       </form>
//                     </div>
//                   </div>
//                 )}

//                 {currentView === 'activate-new-user' && (
//                   <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//                     <div className="bg-white dark:bg-gray-900 rounded-lg p-8 w-full max-w-md shadow-2xl">
//                       <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
//                         {t('users.activate_title')}
//                       </h2>
//                       <form id="activateUserForm" onSubmit={handleActivateUser} className="space-y-6">
//                         <div>
//                           <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="email">
//                             {t('users.email')}
//                           </label>
//                           <input
//                             type="email"
//                             id="email"
//                             name="email"
//                             value={activateUser.email}
//                             onChange={(e) => setActivateUser({ ...activateUser, email: e.target.value })}
//                             className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
//                             required
//                           />
//                         </div>
//                         <div>
//                           <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="otp">
//                             {t('users.otp')}
//                           </label>
//                           <input
//                             type="text"
//                             id="otp"
//                             name="otp"
//                             value={activateUser.otp}
//                             onChange={(e) => setActivateUser({ ...activateUser, otp: e.target.value })}
//                             className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
//                             required
//                           />
//                         </div>
//                         <div>
//                           <button
//                             type="button"
//                             id="showOtpButton"
//                             onClick={handleShowOtp}
//                             className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded transition duration-200"
//                           >
//                             {t('users.show_otp')}
//                           </button>
//                           {otpDisplay && (
//                             <p id="otpDisplay" className="mt-2 text-gray-700 dark:text-gray-300">
//                               {t('users.otp_display')}: {otpDisplay}
//                             </p>
//                           )}
//                         </div>
//                         <div className="flex justify-end gap-3">
//                           <button
//                             type="button"
//                             onClick={() => handleViewChange('manage-users')}
//                             className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded transition duration-200"
//                           >
//                             {t('users.cancel')}
//                           </button>
//                           <button
//                             type="submit"
//                             className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded transition duration-200"
//                           >
//                             {t('users.activate')}
//                           </button>
//                         </div>
//                       </form>
//                     </div>
//                   </div>
//                 )}
//               </>
//             )}
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// };

// export default UsersManagement;



import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { usersManagementService } from '../../lib/usersManagementService';
import { locationsQaService } from '../../lib/locationsQaService';
import ModalSearch from '../../components/ModalSearch';
import Header from '../../partials/Header';
import Sidebar from '../../partials/Sidebar';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/LoadingSpinner';

const UsersManagement = () => {
  const { authData, loading: authLoading } = useAuth();
  const { language, t } = useLanguage();
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [newUser, setNewUser] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    user_image: null,
    phone: '',
    branch: '',
  });
  const [locations, setLocations] = useState([]);
  const [editUser, setEditUser] = useState(null);
  const [activateUser, setActivateUser] = useState({
    email: '',
    otp: '',
  });
  const [userUpdates, setUserUpdates] = useState([]);
  const [otpDisplay, setOtpDisplay] = useState('');
  const [userImagePreview, setUserImagePreview] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState('manage-users');
  const [hasPrivilege, setHasPrivilege] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('cards');
  const itemsPerPage = 5;

  // Check authentication and privileges
  useEffect(() => {
    if (authLoading) return;

    if (!authData?.access_token) {
      setError(t('users.no_permission'));
      setLoading(false);
      return;
    }

    if (authData.privilege_ids?.includes(1)) {
      setHasPrivilege(true);
    } else {
      setError(t('users.no_permission'));
      setLoading(false);
    }
  }, [authData, authLoading, t]);

  // Fetch locations
  const fetchLocations = async () => {
    if (!authData?.org_id) return;
    try {
      const locationsData = await locationsQaService.getLocations(authData.org_id);
      setLocations(locationsData);
    } catch (err) {
      console.error('Error fetching locations:', err);
    }
  };

  // Fetch users
  const fetchUsers = async () => {
    if (!authData?.org_id || !hasPrivilege) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const userData = await usersManagementService.getUsers(authData.org_id);
      console.debug('Raw user data from API:', userData);
      const usersWithProfiles = await Promise.all(
        userData.filter((user) => user._id).map(async (user) => {
          try {
            const cacheKey = `profile_${user._id}`;
            const cachedProfile = localStorage.getItem(cacheKey);
            if (cachedProfile) {
              return {
                ...user,
                profile_image: JSON.parse(cachedProfile).user_image || null,
                image_mime_type: JSON.parse(cachedProfile).image_mime_type || null,
              };
            }

            const API_URL = `${import.meta.env.VITE_API_BASE_URL}`;
            const response = await fetch(`${API_URL}/api/users/profile?user_id=${user._id}&t=${Date.now()}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'x-access-tokens': localStorage.getItem('access_token'),
              },
            });

            if (!response.ok) {
              throw new Error(`Failed to fetch profile for user ${user._id}: ${response.status}`);
            }

            const profile = await response.json();
            const profileData = {
              user_image: profile.user_image || null,
              image_mime_type: profile.image_mime_type || null,
            };

            localStorage.setItem(cacheKey, JSON.stringify(profileData));

            return {
              ...user,
              profile_image: profileData.user_image,
              image_mime_type: profileData.image_mime_type,
            };
          } catch (error) {
            console.warn(`Failed to fetch profile for user ${user._id}:`, error);
            return {
              ...user,
              profile_image: null,
              image_mime_type: null,
            };
          }
        })
      );
      setUsers(usersWithProfiles);
      setError('');
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(t('users.fetch_error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasPrivilege && authData?.org_id && currentView === 'manage-users') {
      fetchUsers();
    }
  }, [authData, hasPrivilege, currentView]);

  useEffect(() => {
    if (authData?.org_id) {
      fetchLocations();
    }
  }, [authData?.org_id]);

  // Fetch user updates when editing
  const fetchUserUpdates = async (userId) => {
    try {
      const updates = await usersManagementService.getUserUpdates(userId);
      setUserUpdates(updates);
    } catch (err) {
      console.error('Error fetching user updates:', err);
      setError(err.message || t('users.fetch_updates_error'));
    }
  };

  // Handle view change
  const handleViewChange = (view) => {
    setCurrentView(view);
    setError('');
    setSuccess('');
    setEditingUser(null);
    setEditUser(null);
    setNewUser({ first_name: '', last_name: '', email: '', password: '', user_image: null, phone: '', branch: '' });
    setActivateUser({ email: '', otp: '' });
    setOtpDisplay('');
    setUserImagePreview('');
    setUserUpdates([]);
    setCurrentPage(1);
  };

  // Handle user image change
  const handleUserImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log('Selected image:', file.name);
      if (currentView === 'edit-users') {
        setEditUser({ ...editUser, user_image: file });
      } else {
        setNewUser({ ...newUser, user_image: file });
      }
      const reader = new FileReader();
      reader.onload = (event) => setUserImagePreview(event.target.result);
      reader.readAsDataURL(file);
    }
  };

  // Handle add new user
  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!hasPrivilege) {
      setError(t('users.no_permission'));
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUser.email)) {
      setError(t('users.invalid_email'));
      return;
    }

    if (!newUser.password || newUser.password.length < 8) {
      setError(t('users.invalid_password'));
      return;
    }

    if (!newUser.phone || !/^\d{10,15}$/.test(newUser.phone)) {
      setError(t('users.invalid_phone'));
      return;
    }

    if (!newUser.first_name || !newUser.last_name) {
      setError(t('users.name_required'));
      return;
    }

    try {
      setLoading(true);
      const userData = new FormData();
      userData.append('name', `${newUser.first_name} ${newUser.last_name}`);
      userData.append('first_name', newUser.first_name);
      userData.append('last_name', newUser.last_name);
      userData.append('email', newUser.email);
      userData.append('password', newUser.password);
      userData.append('phone', newUser.phone);
      if (newUser.branch) {
        userData.append('branch', newUser.branch);
      }
      userData.append('country_id', authData.country_id || '1');
      userData.append('org_id', authData.org_id || '1');
      if (newUser.user_image) {
        userData.append('user_image', newUser.user_image);
      }

      // Log FormData for debugging
      const formDataEntries = {};
      for (const [key, value] of userData.entries()) {
        formDataEntries[key] = value instanceof File ? value.name : value;
      }
      console.log('Registering user with FormData:', formDataEntries);

      const userId = await usersManagementService.registerUser(userData);

      if (newUser.user_image) {
        await usersManagementService.updateProfileImage(userId, newUser.user_image);
        const cacheKey = `profile_${userId}`;
        localStorage.setItem(cacheKey, JSON.stringify({
          user_image: await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.readAsDataURL(newUser.user_image);
          }),
          image_mime_type: newUser.user_image.type,
        }));
      }

      setSuccess(t('users.add_success'));
      setTimeout(() => {
        setSuccess('');
        setActivateUser({ ...activateUser, email: newUser.email });
        handleViewChange('activate-new-user');
      }, 3000);
    } catch (err) {
      console.error('Add user error:', err);
      const errorMessage = err.message.includes('Missing required fields')
        ? t('users.register_error_missing_fields')
        : err.message.includes('Internal Server Error')
          ? t('users.register_error_server')
          : err.message || t('users.add_error');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle edit user
  const handleEditUser = async (user) => {
    if (!hasPrivilege) {
      setError(t('users.no_permission'));
      return;
    }

    const userId = user._id;
    if (!userId) {
      console.error('Invalid user object:', user);
      setError(t('users.invalid_user_id'));
      return;
    }

    try {
      const [userResult, profileResult] = await Promise.allSettled([
        usersManagementService.getUser(userId, authData.org_id),
        (async () => {
          const cacheKey = `profile_${userId}`;
          const cachedProfile = localStorage.getItem(cacheKey);
          if (cachedProfile) {
            return JSON.parse(cachedProfile);
          }
          const API_URL = `${import.meta.env.VITE_API_BASE_URL}`;
          const response = await fetch(`${API_URL}/api/users/profile?user_id=${userId}&t=${Date.now()}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'x-access-tokens': localStorage.getItem('access_token'),
            },
          });
          if (!response.ok) {
            throw new Error(`Failed to fetch profile: ${response.status}`);
          }
          const profile = await response.json();
          const profileData = { user_image: profile.user_image || null, image_mime_type: profile.image_mime_type || null };
          localStorage.setItem(cacheKey, JSON.stringify(profileData));
          return profileData;
        })(),
      ]);

      if (userResult.status === 'rejected') {
        throw new Error(`Failed to fetch user data: ${userResult.reason}`);
      }

      const profile = profileResult.status === 'fulfilled' ? profileResult.value : { user_image: null, image_mime_type: null };
      if (profileResult.status === 'rejected' && !profileResult.reason.message.includes('User profile not found')) {
        console.warn('Unexpected error fetching user profile:', profileResult.reason);
        setError(t('users.partial_fetch_error_profile'));
      }

      const [derivedFirstName, derivedLastName] = userResult.value.name
        ? userResult.value.name.split(' ').filter(Boolean)
        : ['', ''];
      const email = userResult.value.email || user.email || '';
      if (!email) {
        throw new Error('User email is missing');
      }

      setEditingUser(user);
      setEditUser({
        first_name: user.first_name || derivedFirstName || '',
        last_name: user.last_name || derivedLastName || '',
        email,
        user_image: null,
        phone: user.phone || '',
        branch: user.branch || '',
      });
      setUserImagePreview(profile.user_image ? `data:${profile.image_mime_type || 'image/jpeg'};base64,${profile.user_image}` : '');
      fetchUserUpdates(userId);
      setCurrentView('edit-users');
    } catch (err) {
      console.error('Fetch user error:', err);
      setError(err.message || t('users.fetch_edit_error'));
    }
  };

  // Handle update user
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!hasPrivilege) {
      setError(t('users.no_permission'));
      return;
    }

    const userId = editingUser?._id;
    if (!userId) {
      setError(t('users.invalid_user_id'));
      return;
    }

    if (!editUser) {
      setError(t('users.form_not_loaded'));
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editUser.email)) {
      setError(t('users.invalid_email'));
      return;
    }

    if (!editUser.first_name || !editUser.last_name) {
      setError(t('users.name_required'));
      return;
    }

    try {
      const userData = new FormData();
      userData.append('name', `${editUser.first_name} ${editUser.last_name}`);
      userData.append('first_name', editUser.first_name);
      userData.append('last_name', editUser.last_name);
      userData.append('email', editUser.email);
      userData.append('phone', editUser.phone || '');
      if (editUser.branch !== undefined) {
        userData.append('branch', editUser.branch || '');
      }

      // Log FormData for debugging
      const formDataEntries = {};
      for (const [key, value] of userData.entries()) {
        formDataEntries[key] = value instanceof File ? value.name : value;
      }
      console.log('Updating user with FormData:', formDataEntries);

      const fieldsChanged = (
        editUser.first_name !== editingUser.first_name ||
        editUser.last_name !== editingUser.last_name ||
        editUser.email !== editingUser.email ||
        editUser.phone !== editingUser.phone ||
        editUser.branch !== (editingUser.branch || '')
      );

      if (fieldsChanged) {
        await usersManagementService.updateUser(userId, userData, authData.org_id);
      }

      if (editUser.user_image) {
        await usersManagementService.updateProfileImage(userId, editUser.user_image);
        const cacheKey = `profile_${userId}`;
        localStorage.setItem(cacheKey, JSON.stringify({
          user_image: await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.readAsDataURL(editUser.user_image);
          }),
          image_mime_type: editUser.user_image.type,
        }));
      }

      setEditingUser(null);
      setEditUser(null);
      setUserImagePreview('');
      setUserUpdates([]);
      fetchUsers();
      setSuccess(t('users.update_success'));
      setTimeout(() => {
        setSuccess('');
        handleViewChange('manage-users');
      }, 3000);
    } catch (err) {
      console.error('Update user error:', err);
      const errorMessage = err.message.includes('Missing required fields')
        ? t('users.update_error_missing_fields')
        : err.message.includes('Internal Server Error')
          ? t('users.update_error_server')
          : err.message || t('users.update_error');
      setError(errorMessage);
    }
  };

  // Handle activate user
  const handleShowOtp = async () => {
    if (!hasPrivilege) {
      setError(t('users.no_permission'));
      return;
    }

    if (!activateUser.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(activateUser.email)) {
      setError(t('users.invalid_email'));
      return;
    }

    try {
      const result = await usersManagementService.getOtp(activateUser.email, authData.org_id);
      console.log('Fetched OTP:', result);
      setOtpDisplay(result.otp || '');
      if (!result.otp) {
        setError(t('users.fetch_otp_error'));
      }
    } catch (err) {
      console.error('Fetch OTP error:', err);
      setError(err.message || t('users.fetch_otp_error'));
      setOtpDisplay('');
    }
  };

  const handleActivateUser = async (e) => {
    e.preventDefault();
    if (!hasPrivilege) {
      setError(t('users.no_permission'));
      return;
    }

    if (!activateUser.email || !activateUser.otp) {
      setError(t('users.email_otp_required'));
      return;
    }

    console.log('Activating user:', activateUser);
    try {
      setLoading(true);
      await usersManagementService.activateUser(
        { email: activateUser.email, otp: activateUser.otp },
        authData.org_id
      );
      setSuccess(t('users.activate_success'));
      setTimeout(() => {
        setSuccess('');
        handleViewChange('manage-users');
      }, 3000);
    } catch (err) {
      console.error('Activate user error:', err);
      setError(err.message || t('users.activate_error'));
    } finally {
      setLoading(false);
    }
  };

  // Handle delete user
  const handleDeleteUser = async (id) => {
    if (!hasPrivilege) {
      setError(t('users.no_permission'));
      return;
    }

    if (!id) {
      setError(t('users.invalid_user_id'));
      return;
    }

    if (window.confirm(t('users.delete_confirm'))) {
      try {
        await usersManagementService.deleteUser(id, authData.org_id);
        localStorage.removeItem(`profile_${id}`);
        fetchUsers();
        setSuccess(t('users.delete_success'));
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        console.error('Delete user error:', err);
        setError(err.message || t('users.delete_error'));
      }
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(users.length / itemsPerPage);
  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const paginatedUsers = users.slice(start, end);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Toggle view mode
  const toggleViewMode = () => {
    setViewMode(viewMode === 'cards' ? 'table' : 'cards');
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
                  {t('users.title')}
                </h1>
                <div className="grid grid-flow-col sm:auto-cols-max justify-start gap-2 mt-4">
                  <button
                    onClick={() => handleViewChange('manage-users')}
                    className={`px-4 py-2 rounded ${currentView === 'manage-users' ? 'bg-indigo-500 text-white' : 'bg-gray-300 text-gray-800'} hover:bg-indigo-600 transition duration-200`}
                  >
                    {t('users.manage_users')}
                  </button>
                  <button
                    onClick={() => handleViewChange('add-new-user')}
                    className={`px-4 py-2 rounded ${currentView === 'add-new-user' ? 'bg-indigo-500 text-white' : 'bg-gray-300 text-gray-800'} hover:bg-indigo-600 transition duration-200`}
                  >
                    {t('users.add_new_user')}
                  </button>
                  <button
                    onClick={() => handleViewChange('activate-new-user')}
                    className={`px-4 py-2 rounded ${currentView === 'activate-new-user' ? 'bg-indigo-500 text-white' : 'bg-gray-300 text-gray-800'} hover:bg-indigo-600 transition duration-200`}
                  >
                    {t('users.activate_new_user')}
                  </button>
                  <button
                    onClick={toggleViewMode}
                    className="px-4 py-2 rounded bg-gray-300 text-gray-800 hover:bg-gray-400 transition duration-200"
                  >
                    {viewMode === 'cards' ? 'Table View' : 'Card View'}
                  </button>
                </div>
              </div>
              <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
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
                {currentView === 'manage-users' && (
                  <>
                    {users.length === 0 ? (
                      <div className="text-gray-600 dark:text-gray-300">{t('users.no_users')}</div>
                    ) : (
                      <>
                        {viewMode === 'cards' ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {paginatedUsers.map((user) => (
                              <div
                                key={user._id}
                                className="bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow duration-200"
                                role="region"
                                aria-label={`${t('users.user_name')}: ${user.name}`}
                              >
                                <div className="space-y-4">
                                  <div className="flex items-center">
                                    <img
                                      className="w-10 h-10 rounded-full mr-3"
                                      src={
                                        user.profile_image
                                          ? `data:${user.image_mime_type || 'image/jpeg'};base64,${user.profile_image}`
                                          : '/images/default-avatar.jpg'
                                      }
                                      alt={`${user.name}'s profile`}
                                    />
                                    <div>
                                      <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                                        {t('users.name')}
                                      </span>
                                      <p className="text-gray-800 dark:text-gray-100 font-semibold">
                                        {user.name}
                                      </p>
                                    </div>
                                  </div>
                                  <div>
                                    <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                                      {t('users.email')}
                                    </span>
                                    <p className="text-gray-800 dark:text-gray-100 font-semibold">
                                      {user.email}
                                    </p>
                                  </div>
                                  <div>
                                    <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                                      {t('users.phone')}
                                    </span>
                                    <p className="text-gray-800 dark:text-gray-100 font-semibold">
                                      {user.phone || t('users.unknown')}
                                    </p>
                                  </div>
                                  {user.branch && (
                                    <div>
                                      <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                                        {t('users.branch')}
                                      </span>
                                      <p className="text-gray-800 dark:text-gray-100 font-semibold">
                                        {user.branch}
                                      </p>
                                    </div>
                                  )}
                                </div>
                                {hasPrivilege && (
                                  <div className="flex justify-end gap-3 mt-4">
                                    <button
                                      onClick={() => handleEditUser(user)}
                                      className="flex items-center text-indigo-500 hover:text-indigo-600 text-sm font-medium transition-colors duration-200"
                                      aria-label={t('users.edit')}
                                    >
                                      <PencilIcon className="w-4 h-4 mr-1" />
                                      {t('users.edit')}
                                    </button>
                                    <button
                                      onClick={() => handleDeleteUser(user._id)}
                                      className="flex items-center text-red-500 hover:text-red-600 text-sm font-medium transition-colors duration-200"
                                      aria-label={t('users.delete')}
                                    >
                                      <TrashIcon className="w-4 h-4 mr-1" />
                                      {t('users.delete')}
                                    </button>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                              <thead>
                                <tr className="bg-gray-100 dark:bg-gray-700">
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    {t('users.profile')}
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    {t('users.name')}
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    {t('users.email')}
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    {t('users.phone')}
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    {t('users.branch')}
                                  </th>
                                  {hasPrivilege && (
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                      {t('users.actions')}
                                    </th>
                                  )}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {paginatedUsers.map((user) => (
                                  <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <img
                                        className="w-8 h-8 rounded-full"
                                        src={
                                          user.profile_image
                                            ? `data:${user.image_mime_type || 'image/jpeg'};base64,${user.profile_image}`
                                            : '/images/default-avatar.jpg'
                                        }
                                        alt={`${user.name}'s profile`}
                                      />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-100">
                                      {user.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-100">
                                      {user.email}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-100">
                                      {user.phone || t('users.unknown')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-100">
                                      {user.branch || t('users.unknown')}
                                    </td>
                                    {hasPrivilege && (
                                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                          onClick={() => handleEditUser(user)}
                                          className="text-indigo-500 hover:text-indigo-600 mr-4"
                                          aria-label={t('users.edit')}
                                        >
                                          <PencilIcon className="w-5 h-5" />
                                        </button>
                                        <button
                                          onClick={() => handleDeleteUser(user._id)}
                                          className="text-red-500 hover:text-red-600"
                                          aria-label={t('users.delete')}
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
                        {totalPages > 1 && (
                          <div className="flex justify-center gap-2 mt-6">
                            {currentPage > 1 && (
                              <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                              >
                                {t('users.previous')}
                              </button>
                            )}
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                              <button
                                key={`page-${page}`}
                                onClick={() => handlePageChange(page)}
                                className={`${
                                  page === currentPage ? 'bg-indigo-500 text-white' : 'bg-gray-300 text-gray-800'
                                } hover:bg-indigo-600 font-bold py-2 px-4 rounded`}
                                disabled={page === currentPage}
                              >
                                {page}
                              </button>
                            ))}
                            {currentPage < totalPages && (
                              <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                              >
                                {t('users.next')}
                              </button>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}

                {currentView === 'add-new-user' && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-900 rounded-lg p-8 w-full max-w-md shadow-2xl">
                      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                        {t('users.add_title')}
                      </h2>
                      <form id="addUserForm" onSubmit={handleAddUser} className="space-y-6">
                        <div>
                          <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="userImageInput">
                            {t('users.profile_picture')}
                          </label>
                          <input
                            type="file"
                            id="userImageInput"
                            accept="image/*"
                            onChange={handleUserImageChange}
                            className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                          />
                          {userImagePreview && (
                            <img
                              id="userImagePreview"
                              src={userImagePreview}
                              alt="Profile Preview"
                              className="mt-2 w-24 h-24 object-cover rounded"
                            />
                          )}
                        </div>
                        <div>
                          <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="first_name">
                            {t('users.first_name')}
                          </label>
                          <input
                            type="text"
                            id="first_name"
                            value={newUser.first_name}
                            onChange={(e) => setNewUser({ ...newUser, first_name: e.target.value })}
                            className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="last_name">
                            {t('users.last_name')}
                          </label>
                          <input
                            type="text"
                            id="last_name"
                            value={newUser.last_name}
                            onChange={(e) => setNewUser({ ...newUser, last_name: e.target.value })}
                            className="shadow appearance-none border border-gray-300 dark:border-grey-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="email">
                            {t('users.email')}
                          </label>
                          <input
                            type="email"
                            id="email"
                            value={newUser.email}
                            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                            className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="password">
                            {t('users.password')}
                          </label>
                          <input
                            type="password"
                            id="password"
                            value={newUser.password}
                            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                            className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                            required
                            minLength={8}
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="phone">
                            {t('users.phone')}
                          </label>
                          <input
                            type="text"
                            id="phone"
                            value={newUser.phone}
                            onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                            className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                            required
                            pattern="\d{10,15}"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="branch">
                            {t('users.branch')}
                          </label>
                          <select
                            id="branch"
                            value={newUser.branch}
                            onChange={(e) => setNewUser({ ...newUser, branch: e.target.value })}
                            className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                          >
                            <option value="">{t('users.select_branch')}</option>
                            {locations.map((location) => (
                              <option key={location.locations_qa_id} value={location.location_en || ''}>
                                {language === 'ar' ? location.location_ar : location.location_en}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex justify-end gap-3">
                          <button
                            type="button"
                            onClick={() => handleViewChange('manage-users')}
                            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded transition duration-200"
                          >
                            {t('users.cancel')}
                          </button>
                          <button
                            type="submit"
                            className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded transition duration-200"
                          >
                            {t('users.create')}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {currentView === 'edit-users' && editingUser && editUser && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-900 rounded-lg p-8 w-full max-w-md shadow-2xl">
                      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                        {t('users.edit_title')}
                      </h2>
                      <form id="editUserForm" onSubmit={handleUpdateUser} className="space-y-6">
                        <div>
                          <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="userImageInput">
                            {t('users.profile_picture')}
                          </label>
                          <input
                            type="file"
                            id="userImageInput"
                            accept="image/*"
                            onChange={handleUserImageChange}
                            className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                          />
                          {userImagePreview && (
                            <img
                              id="userImagePreview"
                              src={userImagePreview}
                              alt="Profile Preview"
                              className="mt-2 w-24 h-24 object-cover rounded"
                            />
                          )}
                        </div>
                        <div>
                          <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="first_name">
                            {t('users.first_name')}
                          </label>
                          <input
                            type="text"
                            id="first_name"
                            value={editUser.first_name}
                            onChange={(e) => setEditUser({ ...editUser, first_name: e.target.value })}
                            className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="last_name">
                            {t('users.last_name')}
                          </label>
                          <input
                            type="text"
                            id="last_name"
                            value={editUser.last_name}
                            onChange={(e) => setEditUser({ ...editUser, last_name: e.target.value })}
                            className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="email">
                            {t('users.email')}
                          </label>
                          <input
                            type="email"
                            id="email"
                            value={editUser.email}
                            onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                            className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="phone">
                            {t('users.phone')}
                          </label>
                          <input
                            type="text"
                            id="phone"
                            value={editUser.phone}
                            onChange={(e) => setEditUser({ ...editUser, phone: e.target.value })}
                            className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                            required
                            pattern="\d{10,15}"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="branch_edit">
                            {t('users.branch')}
                          </label>
                          <select
                            id="branch_edit"
                            value={editUser.branch || ''}
                            onChange={(e) => setEditUser({ ...editUser, branch: e.target.value })}
                            className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                          >
                            <option value="">{t('users.select_branch')}</option>
                            {locations.map((location) => (
                              <option key={location.locations_qa_id} value={location.location_en || ''}>
                                {language === 'ar' ? location.location_ar : location.location_en}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
                            {t('users.update_history')}
                          </h3>
                          {userUpdates.length === 0 ? (
                            <p className="text-gray-600 dark:text-gray-300">{t('users.no_updates')}</p>
                          ) : (
                            <ul className="space-y-2">
                              {userUpdates.map((update) => (
                                <li key={update._id} className="text-gray-700 dark:text-gray-300">
                                  {t('users.update_item', {
                                    date: new Date(update.createdAt).toLocaleString(),
                                    field: update.field,
                                    oldValue: update.old_value || t('users.unknown'),
                                    newValue: update.new_value || t('users.unknown'),
                                  })}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                        <div className="flex justify-end gap-3">
                          <button
                            type="button"
                            onClick={() => handleViewChange('manage-users')}
                            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded transition duration-200"
                          >
                            {t('users.cancel')}
                          </button>
                          <button
                            type="submit"
                            className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded transition duration-200"
                          >
                            {t('users.save')}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {currentView === 'activate-new-user' && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-900 rounded-lg p-8 w-full max-w-md shadow-2xl">
                      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                        {t('users.activate_title')}
                      </h2>
                      <form id="activateUserForm" onSubmit={handleActivateUser} className="space-y-6">
                        <div>
                          <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="email">
                            {t('users.email')}
                          </label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={activateUser.email}
                            onChange={(e) => setActivateUser({ ...activateUser, email: e.target.value })}
                            className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="otp">
                            {t('users.otp')}
                          </label>
                          <input
                            type="text"
                            id="otp"
                            name="otp"
                            value={activateUser.otp}
                            onChange={(e) => setActivateUser({ ...activateUser, otp: e.target.value })}
                            className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                            required
                          />
                        </div>
                        <div>
                          <button
                            type="button"
                            id="showOtpButton"
                            onClick={handleShowOtp}
                            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded transition duration-200"
                          >
                            {t('users.show_otp')}
                          </button>
                          {otpDisplay && (
                            <p id="otpDisplay" className="mt-2 text-gray-700 dark:text-gray-300">
                              {t('users.otp_display')}: {otpDisplay}
                            </p>
                          )}
                        </div>
                        <div className="flex justify-end gap-3">
                          <button
                            type="button"
                            onClick={() => handleViewChange('manage-users')}
                            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded transition duration-200"
                          >
                            {t('users.cancel')}
                          </button>
                          <button
                            type="submit"
                            className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded transition duration-200"
                          >
                            {t('users.activate')}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default UsersManagement;