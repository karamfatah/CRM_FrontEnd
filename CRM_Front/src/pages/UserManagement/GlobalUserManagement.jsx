// import React, { useState, useEffect } from 'react';
// import { useAuth } from '../../context/AuthContext';
// import { useLanguage } from '../../context/LanguageContext';
// import { usersManagementService } from '../../lib/usersManagementService';
// import { orgService } from '../../lib/orgService';
// import ModalSearch from '../../components/ModalSearch';
// import Header from '../../partials/Header';
// import Sidebar from '../../partials/Sidebar';
// import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
// import LoadingSpinner from '../../components/LoadingSpinner';

// const GlobalUserManagement = () => {
//   const { authData, loading: authLoading } = useAuth();
//   const { language, t } = useLanguage();
//   const [users, setUsers] = useState([]);
//   const [organizations, setOrganizations] = useState([]);
//   const [selectedOrgId, setSelectedOrgId] = useState('');
//   const [formOrgId, setFormOrgId] = useState('');
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
//   const [loading, setLoading] = useState(false);
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [currentView, setCurrentView] = useState('manage-users');
//   const [hasPrivilege, setHasPrivilege] = useState(false);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [viewMode, setViewMode] = useState('cards');
//   const [searchQuery, setSearchQuery] = useState('');
//   const itemsPerPage = 5;

//   // Clean up localStorage profile entries
//   const cleanUpLocalStorage = () => {
//     console.debug('Cleaning up localStorage profile entries');
//     const keys = Object.keys(localStorage);
//     const profileKeys = keys.filter((key) => key.startsWith('profile_'));
//     profileKeys.forEach((key) => localStorage.removeItem(key));
//     console.debug('Removed profile keys:', profileKeys.length);
//   };

//   useEffect(() => {
//     console.debug('Checking auth and privileges:', { authData, authLoading });
//     if (authLoading) return;

//     if (!authData?.access_token) {
//       console.error('No access token found');
//       setError(t('users.no_permission'));
//       setLoading(false);
//       return;
//     }

//     if (authData.privilege_ids?.includes(1)) {
//       setHasPrivilege(true);
//     } else {
//       console.error('User lacks required privilege (ID: 1)');
//       setError(t('users.no_permission'));
//       setLoading(false);
//     }
//   }, [authData, authLoading]);

//   const fetchOrganizations = async () => {
//     console.debug('Fetching organizations');
//     setLoading(true);
//     try {
//       const data = await orgService.getAllOrgs();
//       const orgs = Array.isArray(data) ? data : [];
//       console.debug('Organizations fetched:', orgs);
//       setOrganizations(orgs);
//       if (orgs.length > 0 && !selectedOrgId) {
//         const defaultOrgId = orgs[0].org_id.toString();
//         console.debug('Setting default org_id:', defaultOrgId);
//         setSelectedOrgId(defaultOrgId);
//         setFormOrgId(defaultOrgId);
//       }
//     } catch (err) {
//       console.error('Error fetching organizations:', err);
//       setError(t('orgs.fetch_error'));
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchUsers = async (orgId) => {
//     if (!orgId || !hasPrivilege) {
//       console.debug('Skipping fetchUsers: No orgId or no privilege', { orgId, hasPrivilege });
//       setUsers([]);
//       setLoading(false);
//       return;
//     }

//     console.debug('Fetching users for org_id:', orgId);
//     setLoading(true);
//     setUsers([]);
//     try {
//       cleanUpLocalStorage();
//       const userData = await usersManagementService.getUsers(orgId);
//       console.debug('Raw user data from API:', userData);
//       const filteredUsers = userData.filter((user) => {
//         const matchesOrg = user.org_id === orgId || user.org_id === parseInt(orgId);
//         if (!matchesOrg) {
//           console.warn(`User ${user._id} has org_id ${user.org_id}, expected ${orgId}`);
//         }
//         return matchesOrg;
//       });
//       console.debug('Filtered users for org_id:', orgId, filteredUsers);

//       const usersWithProfiles = await Promise.all(
//         filteredUsers.filter((user) => user._id).map(async (user) => {
//           try {
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
//             console.debug(`Profile for user ${user._id}:`, profile);
//             return {
//               ...user,
//               profile_image: profile.user_image || null,
//               image_mime_type: profile.image_mime_type || null,
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
//       console.debug('Users with profiles for org_id:', orgId, usersWithProfiles);
//       setUsers(usersWithProfiles);
//       setError('');
//     } catch (err) {
//       console.error('Error fetching users:', err);
//       setError(t('users.fetch_error'));
//       setUsers([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (hasPrivilege && !authLoading) {
//       console.debug('Triggering fetchOrganizations');
//       fetchOrganizations();
//     }
//   }, [hasPrivilege, authLoading]);

//   useEffect(() => {
//     console.debug('useEffect for fetchUsers triggered:', { hasPrivilege, selectedOrgId, currentView });
//     if (hasPrivilege && selectedOrgId && currentView === 'manage-users') {
//       fetchUsers(selectedOrgId);
//     } else if (!selectedOrgId && currentView === 'manage-users') {
//       console.debug('No selectedOrgId, clearing users');
//       setUsers([]);
//       setLoading(false);
//     }
//   }, [hasPrivilege, selectedOrgId, currentView]);

//   const fetchUserUpdates = async (userId) => {
//     console.debug('Fetching user updates for user_id:', userId);
//     try {
//       const updates = await usersManagementService.getUserUpdates(userId);
//       console.debug('User updates fetched:', updates);
//       setUserUpdates(updates);
//     } catch (err) {
//       console.error('Error fetching user updates:', err);
//       setError(err.message || t('users.fetch_updates_error'));
//     }
//   };

//   const handleViewChange = (view) => {
//     console.debug('Changing view to:', view);
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
//     setFormOrgId(selectedOrgId);
//     setSearchQuery('');
//   };

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

//   const handleAddUser = async (e) => {
//     e.preventDefault();
//     console.debug('Adding new user:', { newUser, formOrgId });
//     if (!hasPrivilege) {
//       console.error('No privilege to add user');
//       setError(t('users.no_permission'));
//       return;
//     }

//     if (!formOrgId) {
//       console.error('No organization selected for add user');
//       setError(t('users.select_organization'));
//       return;
//     }

//     if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUser.email)) {
//       console.error('Invalid email:', newUser.email);
//       setError(t('users.invalid_email'));
//       return;
//     }

//     if (!newUser.password || newUser.password.length < 8) {
//       console.error('Invalid password:', newUser.password);
//       setError(t('users.invalid_password'));
//       return;
//     }

//     if (!newUser.phone || !/^\d{10,15}$/.test(newUser.phone)) {
//       console.error('Invalid phone:', newUser.phone);
//       setError(t('users.invalid_phone'));
//       return;
//     }

//     if (!newUser.first_name || !newUser.last_name) {
//       console.error('Missing name:', { first_name: newUser.first_name, last_name: newUser.last_name });
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
//       userData.append('org_id', formOrgId);
//       if (newUser.user_image) {
//         userData.append('user_image', newUser.user_image);
//       }

//       const formDataEntries = {};
//       for (const [key, value] of userData.entries()) {
//         formDataEntries[key] = value instanceof File ? value.name : value;
//       }
//       console.log('Registering user with FormData:', formDataEntries);

//       const userId = await usersManagementService.registerUser(userData);

//       if (newUser.user_image) {
//         await usersManagementService.updateProfileImage(userId, newUser.user_image);
//       }

//       setSuccess(t('users.add_success'));
//       setTimeout(() => {
//         setSuccess('');
//         setActivateUser({ ...activateUser, email: newUser.email });
//         handleViewChange('activate-new-user');
//       }, 3000);
//       setSelectedOrgId(formOrgId);
//       fetchUsers(formOrgId);
//     } catch (err) {
//       console.error('Add user error:', err);
//       const errorMessage = err.message.includes('Missing required fields')
//         ? t('users.register_error_missing_fields')
//         : err.message.includes('Internal Server Error')
//           ? t('users.register_error_server')
//           : err.message || t('users.add_error');
//       setError(errorMessage);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleEditUser = async (user) => {
//     console.debug('Editing user:', user);
//     if (!hasPrivilege) {
//       console.error('No privilege to edit user');
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
//         usersManagementService.getUser(userId, selectedOrgId),
//         (async () => {
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
//           console.debug(`Profile for user ${userId}:`, profile);
//           return { user_image: profile.user_image || null, image_mime_type: profile.image_mime_type || null };
//         })(),
//       ]);

//       if (userResult.status === 'rejected') {
//         console.error('Failed to fetch user data:', userResult.reason);
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
//         console.error('User email is missing');
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
//       setFormOrgId(selectedOrgId);
//       setUserImagePreview(profile.user_image ? `data:${profile.image_mime_type || 'image/jpeg'};base64,${profile.user_image}` : '');
//       fetchUserUpdates(userId);
//       setCurrentView('edit-users');
//     } catch (err) {
//       console.error('Fetch user error:', err);
//       setError(err.message || t('users.fetch_edit_error'));
//     }
//   };

//   const handleUpdateUser = async (e) => {
//     e.preventDefault();
//     console.debug('Updating user:', { editUser, formOrgId });
//     if (!hasPrivilege) {
//       console.error('No privilege to update user');
//       setError(t('users.no_permission'));
//       return;
//     }

//     const userId = editingUser?._id;
//     if (!userId) {
//       console.error('Invalid user ID');
//       setError(t('users.invalid_user_id'));
//       return;
//     }

//     if (!editUser) {
//       console.error('Edit user form not loaded');
//       setError(t('users.form_not_loaded'));
//       return;
//     }

//     if (!formOrgId) {
//       console.error('No organization selected for update user');
//       setError(t('users.select_organization'));
//       return;
//     }

//     if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editUser.email)) {
//       console.error('Invalid email:', editUser.email);
//       setError(t('users.invalid_email'));
//       return;
//     }

//     if (!editUser.first_name || !editUser.last_name) {
//       console.error('Missing name:', { first_name: editUser.first_name, last_name: editUser.last_name });
//       setError(t('users.name_required'));
//       return;
//     }

//     try {
//       const userData = new FormData();
//       userData.append('name', `${editUser.first_name} ${editUser.last_name}`);
//       userData.append('first_name', editUser.first_name);
//       userData.append('last_name', editUser.last_name);
//       userData.append('email', editUser.email);
//       userData.append('phone', editUser.phone || '');
//       userData.append('org_id', formOrgId);

//       const formDataEntries = {};
//       for (const [key, value] of userData.entries()) {
//         formDataEntries[key] = value instanceof File ? value.name : value;
//       }
//       console.log('Updating user with FormData:', formDataEntries);

//       const fieldsChanged = (
//         editUser.first_name !== editingUser.first_name ||
//         editUser.last_name !== editingUser.last_name ||
//         editUser.email !== editingUser.email ||
//         editUser.phone !== editingUser.phone
//       );

//       if (fieldsChanged) {
//         await usersManagementService.updateUser(userId, userData, formOrgId);
//       }

//       if (editUser.user_image) {
//         await usersManagementService.updateProfileImage(userId, editUser.user_image);
//       }

//       setEditingUser(null);
//       setEditUser(null);
//       setUserImagePreview('');
//       setUserUpdates([]);
//       setSelectedOrgId(formOrgId);
//       fetchUsers(formOrgId);
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

//   const handleShowOtp = async () => {
//     console.debug('Showing OTP for:', activateUser.email);
//     if (!hasPrivilege) {
//       console.error('No privilege to show OTP');
//       setError(t('users.no_permission'));
//       return;
//     }

//     if (!activateUser.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(activateUser.email)) {
//       console.error('Invalid email for OTP:', activateUser.email);
//       setError(t('users.invalid_email'));
//       return;
//     }

//     if (!formOrgId) {
//       console.error('No organization selected for OTP');
//       setError(t('users.select_organization'));
//       return;
//     }

//     try {
//       const result = await usersManagementService.getOtp(activateUser.email, formOrgId);
//       console.log('Fetched OTP:', result);
//       setOtpDisplay(result.otp || '');
//       if (!result.otp) {
//         console.error('No OTP returned');
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
//     console.debug('Activating user:', activateUser);
//     if (!hasPrivilege) {
//       console.error('No privilege to activate user');
//       setError(t('users.no_permission'));
//       return;
//     }

//     if (!activateUser.email || !activateUser.otp) {
//       console.error('Missing email or OTP:', activateUser);
//       setError(t('users.email_otp_required'));
//       return;
//     }

//     if (!formOrgId) {
//       console.error('No organization selected for activation');
//       setError(t('users.select_organization'));
//       return;
//     }

//     try {
//       setLoading(true);
//       await usersManagementService.activateUser(
//         { email: activateUser.email, otp: activateUser.otp },
//         formOrgId
//       );
//       setSuccess(t('users.activate_success'));
//       setTimeout(() => {
//         setSuccess('');
//         handleViewChange('manage-users');
//       }, 3000);
//       setSelectedOrgId(formOrgId);
//       fetchUsers(formOrgId);
//     } catch (err) {
//       console.error('Activate user error:', err);
//       setError(err.message || t('users.activate_error'));
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDeleteUser = async (id) => {
//     console.debug('Deleting user:', id);
//     if (!hasPrivilege) {
//       console.error('No privilege to delete user');
//       setError(t('users.no_permission'));
//       return;
//     }

//     if (!id) {
//       console.error('Invalid user ID');
//       setError(t('users.invalid_user_id'));
//       return;
//     }

//     if (!selectedOrgId) {
//       console.error('No organization selected for delete');
//       setError(t('users.select_organization'));
//       return;
//     }

//     if (window.confirm(t('users.delete_confirm'))) {
//       try {
//         await usersManagementService.deleteUser(id, selectedOrgId);
//         fetchUsers(selectedOrgId);
//         setSuccess(t('users.delete_success'));
//         setTimeout(() => setSuccess(''), 3000);
//       } catch (err) {
//         console.error('Delete user error:', err);
//         setError(err.message || t('users.delete_error'));
//       }
//     }
//   };

//   const filteredUsers = users.filter(user =>
//     user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//     user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//     user.phone?.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
//   const start = (currentPage - 1) * itemsPerPage;
//   const end = start + itemsPerPage;
//   const paginatedUsers = filteredUsers.slice(start, end);

//   const handlePageChange = (page) => {
//     console.debug('Changing page to:', page);
//     setCurrentPage(page);
//   };

//   const toggleViewMode = () => {
//     console.debug('Toggling view mode to:', viewMode === 'cards' ? 'table' : 'cards');
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
//                   {t('users.global_title')}
//                 </h1>
//                 <div className="grid grid-flow-col sm:auto-cols-max justify-start gap-2 mt-4">
//                   <div className="w-64">
//                     <label
//                       className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
//                       htmlFor="organization"
//                     >
//                       {t('orgs.select_organization')}
//                     </label>
//                     <select
//                       id="organization"
//                       value={selectedOrgId}
//                       onChange={(e) => {
//                         const newOrgId = e.target.value;
//                         console.debug('Organization changed to:', newOrgId);
//                         setSelectedOrgId(newOrgId);
//                         setFormOrgId(newOrgId);
//                         if (newOrgId && currentView === 'manage-users') {
//                           console.debug('Triggering fetchUsers for new org_id:', newOrgId);
//                           fetchUsers(newOrgId);
//                         }
//                       }}
//                       className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
//                     >
//                       <option value="">{t('orgs.select_organization')}</option>
//                       {organizations.map((org) => (
//                         <option key={org.org_id} value={org.org_id}>
//                           {language === 'en' ? org.org_name_en : org.org_name_ar}
//                         </option>
//                       ))}
//                     </select>
//                   </div>
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
//                     <div className="mb-4">
//                       <input
//                         type="text"
//                         placeholder={t('users.search_users')}
//                         value={searchQuery}
//                         onChange={(e) => {
//                           setSearchQuery(e.target.value);
//                           setCurrentPage(1);
//                         }}
//                         className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full sm:w-64 py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
//                       />
//                     </div>
//                     {filteredUsers.length === 0 || !selectedOrgId ? (
//                       <div className="text-gray-600 dark:text-gray-300">
//                         {selectedOrgId ? t('users.no_users') : t('users.select_organization')}
//                       </div>
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
//                                           : '/images/default-avatar.jpg'
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
//                                             : '/images/default-avatar.jpg'
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
//                           <label
//                             className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
//                             htmlFor="form_organization"
//                           >
//                             {t('orgs.select_organization')}
//                           </label>
//                           <select
//                             id="form_organization"
//                             value={formOrgId}
//                             onChange={(e) => setFormOrgId(e.target.value)}
//                             className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
//                             required
//                           >
//                             <option value="">{t('orgs.select_organization')}</option>
//                             {organizations.map((org) => (
//                               <option key={org.org_id} value={org.org_id}>
//                                 {language === 'en' ? org.org_name_en : org.org_name_ar}
//                               </option>
//                             ))}
//                           </select>
//                         </div>
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
//                           <label
//                             className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
//                             htmlFor="form_organization"
//                           >
//                             {t('orgs.select_organization')}
//                           </label>
//                           <select
//                             id="form_organization"
//                             value={formOrgId}
//                             onChange={(e) => setFormOrgId(e.target.value)}
//                             className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
//                             required
//                           >
//                             <option value="">{t('orgs.select_organization')}</option>
//                             {organizations.map((org) => (
//                               <option key={org.org_id} value={org.org_id}>
//                                 {language === 'en' ? org.org_name_en : org.org_name_ar}
//                               </option>
//                             ))}
//                           </select>
//                         </div>
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
//                           <label
//                             className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
//                             htmlFor="form_organization"
//                           >
//                             {t('orgs.select_organization')}
//                           </label>
//                           <select
//                             id="form_organization"
//                             value={formOrgId}
//                             onChange={(e) => setFormOrgId(e.target.value)}
//                             className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
//                             required
//                           >
//                             <option value="">{t('orgs.select_organization')}</option>
//                             {organizations.map((org) => (
//                               <option key={org.org_id} value={org.org_id}>
//                                 {language === 'en' ? org.org_name_en : org.org_name_ar}
//                               </option>
//                             ))}
//                           </select>
//                         </div>
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

// export default GlobalUserManagement;

// Working Friday 
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { usersManagementService } from '../../lib/usersManagementService';
import { orgService } from '../../lib/orgService';
import ModalSearch from '../../components/ModalSearch';
import Header from '../../partials/Header';
import Sidebar from '../../partials/Sidebar';
import { PencilIcon, TrashIcon, KeyIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/LoadingSpinner';

const GlobalUserManagement = () => {
  const { authData, loading: authLoading } = useAuth();
  const { language, t } = useLanguage();
  const [users, setUsers] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrgId, setSelectedOrgId] = useState('');
  const [formOrgId, setFormOrgId] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [newUser, setNewUser] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    user_image: null,
    phone: '',
  });
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
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState('manage-users');
  const [hasPrivilege, setHasPrivilege] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('cards');
  const [searchQuery, setSearchQuery] = useState('');
  const [resetPasswordUser, setResetPasswordUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const itemsPerPage = 5;

  // Clean up localStorage profile entries
  const cleanUpLocalStorage = () => {
    console.debug('Cleaning up localStorage profile entries');
    const keys = Object.keys(localStorage);
    const profileKeys = keys.filter((key) => key.startsWith('profile_'));
    profileKeys.forEach((key) => localStorage.removeItem(key));
    console.debug('Removed profile keys:', profileKeys.length);
  };

  useEffect(() => {
    console.debug('Checking auth and privileges:', { authData, authLoading });
    if (authLoading) return;

    if (!authData?.access_token) {
      console.error('No access token found');
      setError(t('users.no_permission'));
      setLoading(false);
      return;
    }

    if (authData.privilege_ids?.includes(1001001)) {
      setHasPrivilege(true);
    } else {
      console.error('User lacks required privilege (ID: 1001001)');
      setError(t('users.no_permission'));
      setLoading(false);
    }
  }, [authData, authLoading]);

  const fetchOrganizations = async () => {
    console.debug('Fetching organizations');
    setLoading(true);
    try {
      const data = await orgService.getAllOrgs();
      const orgs = Array.isArray(data) ? data : [];
      console.debug('Organizations fetched:', orgs);
      setOrganizations(orgs);
      if (orgs.length > 0 && !selectedOrgId) {
        const defaultOrgId = orgs[0].org_id.toString();
        console.debug('Setting default org_id:', defaultOrgId);
        setSelectedOrgId(defaultOrgId);
        setFormOrgId(defaultOrgId);
      }
    } catch (err) {
      console.error('Error fetching organizations:', err);
      setError(t('orgs.fetch_error'));
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async (orgId) => {
    if (!orgId || !hasPrivilege) {
      console.debug('Skipping fetchUsers: No orgId or no privilege', { orgId, hasPrivilege });
      setUsers([]);
      setLoading(false);
      return;
    }

    console.debug('Fetching users for org_id:', orgId);
    setLoading(true);
    setUsers([]);
    try {
      cleanUpLocalStorage();
      const userData = await usersManagementService.getUsers(orgId);
      console.debug('Raw user data from API:', userData);
      const filteredUsers = userData.filter((user) => {
        const matchesOrg = user.org_id === orgId || user.org_id === parseInt(orgId);
        if (!matchesOrg) {
          console.warn(`User ${user._id} has org_id ${user.org_id}, expected ${orgId}`);
        }
        return matchesOrg;
      });
      console.debug('Filtered users for org_id:', orgId, filteredUsers);

      const usersWithProfiles = await Promise.all(
        filteredUsers.filter((user) => user._id).map(async (user) => {
          try {
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
            console.debug(`Profile for user ${user._id}:`, profile);
            return {
              ...user,
              profile_image: profile.user_image || null,
              image_mime_type: profile.image_mime_type || null,
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
      console.debug('Users with profiles for org_id:', orgId, usersWithProfiles);
      setUsers(usersWithProfiles);
      setError('');
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(t('users.fetch_error'));
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasPrivilege && !authLoading) {
      console.debug('Triggering fetchOrganizations');
      fetchOrganizations();
    }
  }, [hasPrivilege, authLoading]);

  useEffect(() => {
    console.debug('useEffect for fetchUsers triggered:', { hasPrivilege, selectedOrgId, currentView });
    if (hasPrivilege && selectedOrgId && currentView === 'manage-users') {
      fetchUsers(selectedOrgId);
    } else if (!selectedOrgId && currentView === 'manage-users') {
      console.debug('No selectedOrgId, clearing users');
      setUsers([]);
      setLoading(false);
    }
  }, [hasPrivilege, selectedOrgId, currentView]);

  const fetchUserUpdates = async (userId) => {
    console.debug('Fetching user updates for user_id:', userId);
    try {
      const updates = await usersManagementService.getUserUpdates(userId);
      console.debug('User updates fetched:', updates);
      setUserUpdates(updates);
    } catch (err) {
      console.error('Error fetching user updates:', err);
      setError(err.message || t('users.fetch_updates_error'));
    }
  };

  const handleViewChange = (view) => {
    console.debug('Changing view to:', view);
    setCurrentView(view);
    setError('');
    setSuccess('');
    setEditingUser(null);
    setEditUser(null);
    setNewUser({ first_name: '', last_name: '', email: '', password: '', user_image: null, phone: '' });
    setActivateUser({ email: '', otp: '' });
    setOtpDisplay('');
    setUserImagePreview('');
    setUserUpdates([]);
    setCurrentPage(1);
    setFormOrgId(selectedOrgId);
    setSearchQuery('');
    setResetPasswordUser(null);
    setNewPassword('');
  };

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

  const handleAddUser = async (e) => {
    e.preventDefault();
    console.debug('Adding new user:', { newUser, formOrgId });
    if (!hasPrivilege) {
      console.error('No privilege to add user');
      setError(t('users.no_permission'));
      return;
    }

    if (!formOrgId) {
      console.error('No organization selected for add user');
      setError(t('users.select_organization'));
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUser.email)) {
      console.error('Invalid email:', newUser.email);
      setError(t('users.invalid_email'));
      return;
    }

    if (!newUser.password || newUser.password.length < 8) {
      console.error('Invalid password:', newUser.password);
      setError(t('users.invalid_password'));
      return;
    }

    if (!newUser.phone || !/^\d{10,15}$/.test(newUser.phone)) {
      console.error('Invalid phone:', newUser.phone);
      setError(t('users.invalid_phone'));
      return;
    }

    if (!newUser.first_name || !newUser.last_name) {
      console.error('Missing name:', { first_name: newUser.first_name, last_name: newUser.last_name });
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
      userData.append('country_id', authData.country_id || '1');
      userData.append('org_id', formOrgId);
      if (newUser.user_image) {
        userData.append('user_image', newUser.user_image);
      }

      const formDataEntries = {};
      for (const [key, value] of userData.entries()) {
        formDataEntries[key] = value instanceof File ? value.name : value;
      }
      console.log('Registering user with FormData:', formDataEntries);

      const userId = await usersManagementService.registerUser(userData);

      if (newUser.user_image) {
        await usersManagementService.updateProfileImage(userId, newUser.user_image);
      }

      setSuccess(t('users.add_success'));
      setTimeout(() => {
        setSuccess('');
        setActivateUser({ ...activateUser, email: newUser.email });
        handleViewChange('activate-new-user');
      }, 3000);
      setSelectedOrgId(formOrgId);
      fetchUsers(formOrgId);
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

  const handleEditUser = async (user) => {
    console.debug('Editing user:', user);
    if (!hasPrivilege) {
      console.error('No privilege to edit user');
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
        usersManagementService.getUser(userId, selectedOrgId),
        (async () => {
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
          console.debug(`Profile for user ${userId}:`, profile);
          return { user_image: profile.user_image || null, image_mime_type: profile.image_mime_type || null };
        })(),
      ]);

      if (userResult.status === 'rejected') {
        console.error('Failed to fetch user data:', userResult.reason);
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
        console.error('User email is missing');
        throw new Error('User email is missing');
      }

      setEditingUser(user);
      setEditUser({
        first_name: user.first_name || derivedFirstName || '',
        last_name: user.last_name || derivedLastName || '',
        email,
        user_image: null,
        phone: user.phone || '',
      });
      setFormOrgId(selectedOrgId);
      setUserImagePreview(profile.user_image ? `data:${profile.image_mime_type || 'image/jpeg'};base64,${profile.user_image}` : '');
      fetchUserUpdates(userId);
      setCurrentView('edit-users');
    } catch (err) {
      console.error('Fetch user error:', err);
      setError(err.message || t('users.fetch_edit_error'));
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    console.debug('Updating user:', { editUser, formOrgId });
    if (!hasPrivilege) {
      console.error('No privilege to update user');
      setError(t('users.no_permission'));
      return;
    }

    const userId = editingUser?._id;
    if (!userId) {
      console.error('Invalid user ID');
      setError(t('users.invalid_user_id'));
      return;
    }

    if (!editUser) {
      console.error('Edit user form not loaded');
      setError(t('users.form_not_loaded'));
      return;
    }

    if (!formOrgId) {
      console.error('No organization selected for update user');
      setError(t('users.select_organization'));
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editUser.email)) {
      console.error('Invalid email:', editUser.email);
      setError(t('users.invalid_email'));
      return;
    }

    if (!editUser.first_name || !editUser.last_name) {
      console.error('Missing name:', { first_name: editUser.first_name, last_name: editUser.last_name });
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
      userData.append('org_id', formOrgId);

      const formDataEntries = {};
      for (const [key, value] of userData.entries()) {
        formDataEntries[key] = value instanceof File ? value.name : value;
      }
      console.log('Updating user with FormData:', formDataEntries);

      const fieldsChanged = (
        editUser.first_name !== editingUser.first_name ||
        editUser.last_name !== editingUser.last_name ||
        editUser.email !== editingUser.email ||
        editUser.phone !== editingUser.phone
      );

      if (fieldsChanged) {
        await usersManagementService.updateUser(userId, userData, formOrgId);
      }

      if (editUser.user_image) {
        await usersManagementService.updateProfileImage(userId, editUser.user_image);
      }

      setEditingUser(null);
      setEditUser(null);
      setUserImagePreview('');
      setUserUpdates([]);
      setSelectedOrgId(formOrgId);
      fetchUsers(formOrgId);
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

  const handleShowOtp = async () => {
    console.debug('Showing OTP for:', activateUser.email);
    if (!hasPrivilege) {
      console.error('No privilege to show OTP');
      setError(t('users.no_permission'));
      return;
    }

    if (!activateUser.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(activateUser.email)) {
      console.error('Invalid email for OTP:', activateUser.email);
      setError(t('users.invalid_email'));
      return;
    }

    if (!formOrgId) {
      console.error('No organization selected for OTP');
      setError(t('users.select_organization'));
      return;
    }

    try {
      const result = await usersManagementService.getOtp(activateUser.email, formOrgId);
      console.log('Fetched OTP:', result);
      setOtpDisplay(result.otp || '');
      if (!result.otp) {
        console.error('No OTP returned');
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
    console.debug('Activating user:', activateUser);
    if (!hasPrivilege) {
      console.error('No privilege to activate user');
      setError(t('users.no_permission'));
      return;
    }

    if (!activateUser.email || !activateUser.otp) {
      console.error('Missing email or OTP:', activateUser);
      setError(t('users.email_otp_required'));
      return;
    }

    if (!formOrgId) {
      console.error('No organization selected for activation');
      setError(t('users.select_organization'));
      return;
    }

    try {
      setLoading(true);
      await usersManagementService.activateUser(
        { email: activateUser.email, otp: activateUser.otp },
        formOrgId
      );
      setSuccess(t('users.activate_success'));
      setTimeout(() => {
        setSuccess('');
        handleViewChange('manage-users');
      }, 3000);
      setSelectedOrgId(formOrgId);
      fetchUsers(formOrgId);
    } catch (err) {
      console.error('Activate user error:', err);
      setError(err.message || t('users.activate_error'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    console.debug('Deleting user:', id);
    if (!hasPrivilege) {
      console.error('No privilege to delete user');
      setError(t('users.no_permission'));
      return;
    }

    if (!id) {
      console.error('Invalid user ID');
      setError(t('users.invalid_user_id'));
      return;
    }

    if (!selectedOrgId) {
      console.error('No organization selected for delete');
      setError(t('users.select_organization'));
      return;
    }

    if (window.confirm(t('users.delete_confirm'))) {
      try {
        await usersManagementService.deleteUser(id, selectedOrgId);
        fetchUsers(selectedOrgId);
        setSuccess(t('users.delete_success'));
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        console.error('Delete user error:', err);
        setError(err.message || t('users.delete_error'));
      }
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!hasPrivilege) {
      console.error('No privilege to reset password');
      setError(t('users.no_permission'));
      return;
    }

    if (!resetPasswordUser) {
      console.error('No user selected for password reset');
      setError(t('users.invalid_user_id'));
      return;
    }

    if (!newPassword || newPassword.length < 8) {
      console.error('Invalid new password:', newPassword);
      setError(t('users.invalid_password'));
      return;
    }

    try {
      setLoading(true);
      await usersManagementService.resetUserPassword({
        email: resetPasswordUser.email,
        new_password: newPassword,
      });
      setSuccess(t('users.reset_password_success'));
      setResetPasswordUser(null);
      setNewPassword('');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Reset password error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.phone?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const paginatedUsers = filteredUsers.slice(start, end);

  const handlePageChange = (page) => {
    console.debug('Changing page to:', page);
    setCurrentPage(page);
  };

  const toggleViewMode = () => {
    console.debug('Toggling view mode to:', viewMode === 'cards' ? 'table' : 'cards');
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
                  {t('users.global_title')}
                </h1>
                <div className="grid grid-flow-col sm:auto-cols-max justify-start gap-2 mt-4">
                  <div className="w-64">
                    <label
                      className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
                      htmlFor="organization"
                    >
                      {t('orgs.select_organization')}
                    </label>
                    <select
                      id="organization"
                      value={selectedOrgId}
                      onChange={(e) => {
                        const newOrgId = e.target.value;
                        console.debug('Organization changed to:', newOrgId);
                        setSelectedOrgId(newOrgId);
                        setFormOrgId(newOrgId);
                        if (newOrgId && currentView === 'manage-users') {
                          console.debug('Triggering fetchUsers for new org_id:', newOrgId);
                          fetchUsers(newOrgId);
                        }
                      }}
                      className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                    >
                      <option value="">{t('orgs.select_organization')}</option>
                      {organizations.map((org) => (
                        <option key={org.org_id} value={org.org_id}>
                          {language === 'en' ? org.org_name_en : org.org_name_ar}
                        </option>
                      ))}
                    </select>
                  </div>
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
                    <div className="mb-4">
                      <input
                        type="text"
                        placeholder={t('users.search_users')}
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full sm:w-64 py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                      />
                    </div>
                    {filteredUsers.length === 0 || !selectedOrgId ? (
                      <div className="text-gray-600 dark:text-gray-300">
                        {selectedOrgId ? t('users.no_users') : t('users.select_organization')}
                      </div>
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
                                </div>
                                {hasPrivilege && (
                                  <div className="flex justify-end gap-3 mt-4 flex-wrap">
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
                                    <button
                                      onClick={() => setResetPasswordUser(user)}
                                      className="flex items-center text-yellow-500 hover:text-yellow-600 text-sm font-medium transition-colors duration-200"
                                      aria-label={t('users.reset_password')}
                                    >
                                      <KeyIcon className="w-4 h-4 mr-1" />
                                      {t('users.reset_password')}
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
                                          className="text-red-500 hover:text-red-600 mr-4"
                                          aria-label={t('users.delete')}
                                        >
                                          <TrashIcon className="w-5 h-5" />
                                        </button>
                                        <button
                                          onClick={() => setResetPasswordUser(user)}
                                          className="text-yellow-500 hover:text-yellow-600"
                                          aria-label={t('users.reset_password')}
                                        >
                                          <KeyIcon className="w-5 h-5" />
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
                          <label
                            className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
                            htmlFor="form_organization"
                          >
                            {t('orgs.select_organization')}
                          </label>
                          <select
                            id="form_organization"
                            value={formOrgId}
                            onChange={(e) => setFormOrgId(e.target.value)}
                            className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                            required
                          >
                            <option value="">{t('orgs.select_organization')}</option>
                            {organizations.map((org) => (
                              <option key={org.org_id} value={org.org_id}>
                                {language === 'en' ? org.org_name_en : org.org_name_ar}
                              </option>
                            ))}
                          </select>
                        </div>
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
                          <label
                            className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
                            htmlFor="form_organization"
                          >
                            {t('orgs.select_organization')}
                          </label>
                          <select
                            id="form_organization"
                            value={formOrgId}
                            onChange={(e) => setFormOrgId(e.target.value)}
                            className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                            required
                          >
                            <option value="">{t('orgs.select_organization')}</option>
                            {organizations.map((org) => (
                              <option key={org.org_id} value={org.org_id}>
                                {language === 'en' ? org.org_name_en : org.org_name_ar}
                              </option>
                            ))}
                          </select>
                        </div>
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
                          <label
                            className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
                            htmlFor="form_organization"
                          >
                            {t('orgs.select_organization')}
                          </label>
                          <select
                            id="form_organization"
                            value={formOrgId}
                            onChange={(e) => setFormOrgId(e.target.value)}
                            className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                            required
                          >
                            <option value="">{t('orgs.select_organization')}</option>
                            {organizations.map((org) => (
                              <option key={org.org_id} value={org.org_id}>
                                {language === 'en' ? org.org_name_en : org.org_name_ar}
                              </option>
                            ))}
                          </select>
                        </div>
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

                {resetPasswordUser && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-900 rounded-lg p-8 w-full max-w-md shadow-2xl">
                      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                        {t('users.reset_password_title')}
                      </h2>
                      <form id="resetPasswordForm" onSubmit={handleResetPassword} className="space-y-6">
                        <div>
                          <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="email">
                            {t('users.email')}
                          </label>
                          <input
                            type="email"
                            id="email"
                            value={resetPasswordUser.email}
                            disabled
                            className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-500 dark:text-gray-400 dark:bg-gray-800 leading-tight"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="new_password">
                            {t('users.new_password')}
                          </label>
                          <input
                            type="password"
                            id="new_password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-800 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                            required
                            minLength={8}
                          />
                        </div>
                        <div className="flex justify-end gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              setResetPasswordUser(null);
                              setNewPassword('');
                            }}
                            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded transition duration-200"
                          >
                            {t('users.cancel')}
                          </button>
                          <button
                            type="submit"
                            className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded transition duration-200"
                          >
                            {t('users.reset_password')}
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

export default GlobalUserManagement;