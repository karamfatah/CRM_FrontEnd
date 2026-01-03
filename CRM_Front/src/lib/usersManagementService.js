
// import { v4 as uuidv4 } from 'uuid';

// const USER_API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/users`;
// const AUTH_API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/auth`;
// const PRIVILEGE_API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/privileges`;
// const ROLE_API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/roles`;
// const PROFILE_API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/user_profiles`;
// const UPDATE_API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/user_info_updates`;

// async function refreshTokenAndRetry(url, options) {
//   const refreshToken = localStorage.getItem('refresh_token');
//   if (!refreshToken) {
//     console.error('No refresh token found');
//     throw new Error('No refresh token found');
//   }

//   console.debug('Attempting to refresh token for URL:', url.toString());
//   const refreshResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/refresh`, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ refresh_token: refreshToken }),
//   });

//   if (!refreshResponse.ok) {
//     console.error('Failed to refresh token:', refreshResponse.status);
//     throw new Error('Failed to refresh token');
//   }

//   const { access_token } = await refreshResponse.json();
//   localStorage.setItem('access_token', access_token);
//   options.headers['x-access-tokens'] = access_token;
//   console.debug('Token refreshed, retrying request:', url.toString());

//   return fetch(url, options);
// }

// const usersManagementService = {
//   async getUsers(orgId) {
//     const token = localStorage.getItem('access_token');
//     if (!token) {
//       console.error('No access token found for getUsers');
//       throw new Error('No access token found. Please log in.');
//     }

//     try {
//       const url = new URL(USER_API_URL);
//       url.searchParams.append('org_id', orgId);
//       url.searchParams.append('t', Date.now());

//       console.debug('Fetching users with URL:', url.toString());
//       const response = await fetch(url, {
//         method: 'GET',
//         headers: {
//           'Content-Type': 'application/json',
//           'x-access-tokens': token,
//         },
//       });

//       if (response.status === 401) {
//         console.debug('Received 401 for getUsers, attempting token refresh');
//         try {
//           const retryResponse = await refreshTokenAndRetry(url, {
//             method: 'GET',
//             headers: {
//               'Content-Type': 'application/json',
//               'x-access-tokens': token,
//             },
//           });
//           const data = await retryResponse.json();
//           console.debug('Users fetched after token refresh:', data);
//           return this.processUserData(data, orgId);
//         } catch (refreshError) {
//           console.error('Token refresh failed for getUsers:', refreshError);
//           localStorage.clear();
//           window.location.href = '/login';
//           throw refreshError;
//         }
//       }

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}));
//         console.error('Failed to fetch users:', { status: response.status, errorData });
//         throw new Error(`Failed to fetch users: ${errorData.message || response.statusText}`);
//       }

//       const data = await response.json();
//       console.debug('Raw API response for getUsers:', data);
//       return this.processUserData(data, orgId);
//     } catch (error) {
//       console.error('Error fetching users:', error);
//       throw error;
//     }
//   },

//   async processUserData(data, orgId) {
//     console.debug('Processing user data for org_id:', orgId, 'Data:', data);
//     const usersWithIds = await Promise.all(
//       data.map(async (user) => {
//         try {
//           const roles = await this.getRolesByUser(user.id, orgId);
//           return {
//             _id: user.id,
//             name: user.name,
//             email: user.email,
//             phone: user.phone,
//             first_name: user.first_name,
//             last_name: user.last_name,
//             org_id: user.org_id || orgId,
//             privilege_ids: roles.map((role) => role.privilege),
//           };
//         } catch (roleError) {
//           console.warn(`Failed to fetch roles for user ${user.id}:`, roleError);
//           return {
//             _id: user.id,
//             name: user.name,
//             email: user.email,
//             phone: user.phone,
//             first_name: user.first_name,
//             last_name: user.last_name,
//             org_id: user.org_id || orgId,
//             privilege_ids: [],
//           };
//         }
//       })
//     );
//     console.debug('Processed users:', usersWithIds);
//     return usersWithIds;
//   },

//   async getUser(id, orgId) {
//     const token = localStorage.getItem('access_token');
//     if (!token) {
//       console.error('No access token found for getUser');
//       throw new Error('No access token found. Please log in.');
//     }

//     try {
//       const url = new URL(`${USER_API_URL}/profile`);
//       url.searchParams.append('user_id', id);
//       url.searchParams.append('org_id', orgId);
//       url.searchParams.append('t', Date.now());

//       console.debug('Fetching user with URL:', url.toString());
//       const response = await fetch(url, {
//         method: 'GET',
//         headers: {
//           'Content-Type': 'application/json',
//           'x-access-tokens': token,
//         },
//       });

//       if (response.status === 401) {
//         console.debug('Received 401 for getUser, attempting token refresh');
//         try {
//           return await refreshTokenAndRetry(url, {
//             method: 'GET',
//             headers: {
//               'Content-Type': 'application/json',
//               'x-access-tokens': token,
//             },
//           }).then((res) => res.json());
//         } catch (refreshError) {
//           console.error('Token refresh failed for getUser:', refreshError);
//           localStorage.clear();
//           window.location.href = '/login';
//           throw refreshError;
//         }
//       }

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}));
//         console.error('Failed to fetch user:', { status: response.status, errorData });
//         throw new Error(`Failed to fetch user: ${errorData.message || response.statusText}`);
//       }

//       const data = await response.json();
//       console.debug('User fetched:', data);
//       return data;
//     } catch (error) {
//       console.error('Error fetching user:', error);
//       throw error;
//     }
//   },

//   async registerUser(userData) {
//     const token = localStorage.getItem('access_token');
//     if (!token) {
//       console.error('No access token found for registerUser');
//       throw new Error('No access token found. Please log in.');
//     }

//     if (
//       !userData.get('email') ||
//       !userData.get('first_name') ||
//       !userData.get('last_name') ||
//       !userData.get('password')
//     ) {
//       console.error('Missing required fields for registerUser:', userData);
//       throw new Error('Missing required fields: email, first_name, last_name, and password are required');
//     }

//     try {
//       const formDataEntries = {};
//       for (const [key, value] of userData.entries()) {
//         formDataEntries[key] = value instanceof File ? value.name : value;
//       }
//       console.log('FormData being sent for registration:', formDataEntries);

//       const url = new URL(`${AUTH_API_URL}/register`);
//       url.searchParams.append('t', Date.now());

//       const response = await fetch(url, {
//         method: 'POST',
//         headers: {
//           'x-access-tokens': token,
//         },
//         body: userData,
//       });

//       if (response.status === 401) {
//         console.debug('Received 401 for registerUser, attempting token refresh');
//         try {
//           return await refreshTokenAndRetry(url, {
//             method: 'POST',
//             headers: {
//               'x-access-tokens': token,
//             },
//             body: userData,
//           }).then((res) => res.json());
//         } catch (refreshError) {
//           console.error('Token refresh failed for registerUser:', refreshError);
//           localStorage.clear();
//           window.location.href = '/login';
//           throw refreshError;
//         }
//       }

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}));
//         console.error('Failed to register user:', { status: response.status, errorData });
//         throw new Error(`Failed to register user: ${errorData.message || response.statusText}`);
//       }

//       const data = await response.json();
//       console.debug('User registered:', data);
//       return data._id || data.id;
//     } catch (error) {
//       console.error('Error registering user:', error);
//       throw error;
//     }
//   },

//   async updateUser(id, userData, orgId) {
//     const token = localStorage.getItem('access_token');
//     if (!token) {
//       console.error('No access token found for updateUser');
//       throw new Error('No access token found. Please log in.');
//     }

//     if (
//       !userData.get('email') ||
//       !userData.get('first_name') ||
//       !userData.get('last_name')
//     ) {
//       console.error('Missing required fields for updateUser:', userData);
//       throw new Error('Missing required fields: email, first_name, and last_name are required');
//     }

//     try {
//       const formDataEntries = {};
//       for (const [key, value] of userData.entries()) {
//         formDataEntries[key] = value instanceof File ? value.name : value;
//       }
//       console.log('FormData being sent for update:', formDataEntries);

//       const url = new URL(`${USER_API_URL}/${id}`);
//       url.searchParams.append('org_id', orgId);
//       url.searchParams.append('t', Date.now());

//       const response = await fetch(url, {
//         method: 'PUT',
//         headers: {
//           'x-access-tokens': token,
//         },
//         body: userData,
//       });

//       if (response.status === 401) {
//         console.debug('Received 401 for updateUser, attempting token refresh');
//         try {
//           return await refreshTokenAndRetry(url, {
//             method: 'PUT',
//             headers: {
//               'x-access-tokens': token,
//             },
//             body: userData,
//           }).then((res) => res.json());
//         } catch (refreshError) {
//           console.error('Token refresh failed for updateUser:', refreshError);
//           localStorage.clear();
//           window.location.href = '/login';
//           throw refreshError;
//         }
//       }

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}));
//         console.error('Failed to update user:', { status: response.status, errorData });
//         throw new Error(`Failed to update user: ${errorData.message || response.statusText}`);
//       }

//       const data = await response.json();
//       console.debug('User updated:', data);
//       return data;
//     } catch (error) {
//       console.error('Error updating user:', error);
//       throw error;
//     }
//   },

//   async deleteUser(id, orgId) {
//     const token = localStorage.getItem('access_token');
//     if (!token) {
//       console.error('No access token found for deleteUser');
//       throw new Error('No access token found. Please log in.');
//     }

//     try {
//       const url = new URL(`${USER_API_URL}/${id}`);
//       url.searchParams.append('org_id', orgId);
//       url.searchParams.append('t', Date.now());

//       console.debug('Deleting user with URL:', url.toString());
//       const response = await fetch(url, {
//         method: 'DELETE',
//         headers: {
//           'Content-Type': 'application/json',
//           'x-access-tokens': token,
//         },
//       });

//       if (response.status === 401) {
//         console.debug('Received 401 for deleteUser, attempting token refresh');
//         try {
//           await refreshTokenAndRetry(url, {
//             method: 'DELETE',
//             headers: {
//               'Content-Type': 'application/json',
//               'x-access-tokens': token,
//             },
//           });
//           console.debug('User deleted after token refresh');
//           return;
//         } catch (refreshError) {
//           console.error('Token refresh failed for deleteUser:', refreshError);
//           localStorage.clear();
//           window.location.href = '/login';
//           throw refreshError;
//         }
//       }

//       if (!response.ok && response.status !== 204) {
//         const errorData = await response.json().catch(() => ({}));
//         console.error('Failed to delete user:', { status: response.status, errorData });
//         throw new Error(`Failed to delete user: ${errorData.message || response.statusText}`);
//       }
//       console.debug('User deleted successfully');
//     } catch (error) {
//       console.error('Error deleting user:', error);
//       throw error;
//     }
//   },

//   async getOtp(email, orgId) {
//     const token = localStorage.getItem('access_token');
//     if (!token) {
//       console.error('No access token found for getOtp');
//       throw new Error('No access token found. Please log in.');
//     }

//     try {
//       const url = new URL(`${USER_API_URL}/get_otp`);
//       url.searchParams.append('org_id', orgId);
//       url.searchParams.append('t', Date.now());

//       console.debug('Fetching OTP with URL:', url.toString());
//       const response = await fetch(url, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'x-access-tokens': token,
//         },
//         body: JSON.stringify({ email }),
//       });

//       if (response.status === 401) {
//         console.debug('Received 401 for getOtp, attempting token refresh');
//         try {
//           return await refreshTokenAndRetry(url, {
//             method: 'POST',
//             headers: {
//               'Content-Type': 'application/json',
//               'x-access-tokens': token,
//             },
//             body: JSON.stringify({ email }),
//           }).then((res) => res.json());
//         } catch (refreshError) {
//           console.error('Token refresh failed for getOtp:', refreshError);
//           localStorage.clear();
//           window.location.href = '/login';
//           throw refreshError;
//         }
//       }

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}));
//         console.error('Failed to fetch OTP:', { status: response.status, errorData });
//         throw new Error(`Failed to fetch OTP: ${errorData.message || response.statusText}`);
//       }

//       const data = await response.json();
//       console.debug('OTP fetched:', data);
//       return data;
//     } catch (error) {
//       console.error('Error fetching OTP:', error);
//       throw error;
//     }
//   },

//   async activateUser({ email, otp }, orgId) {
//     const token = localStorage.getItem('access_token');
//     if (!token) {
//       console.error('No access token found for activateUser');
//       throw new Error('No access token found. Please log in.');
//     }

//     try {
//       const url = new URL(`${AUTH_API_URL}/activate_account`);
//       url.searchParams.append('org_id', orgId);
//       url.searchParams.append('t', Date.now());

//       console.debug('Activating user with URL:', url.toString());
//       const response = await fetch(url, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'x-access-tokens': token,
//         },
//         body: JSON.stringify({ email, otp }),
//       });

//       if (response.status === 401) {
//         console.debug('Received 401 for activateUser, attempting token refresh');
//         try {
//           return await refreshTokenAndRetry(url, {
//             method: 'POST',
//             headers: {
//               'Content-Type': 'application/json',
//               'x-access-tokens': token,
//             },
//             body: JSON.stringify({ email, otp }),
//           }).then((res) => res.json());
//         } catch (refreshError) {
//           console.error('Token refresh failed for activateUser:', refreshError);
//           localStorage.clear();
//           window.location.href = '/login';
//           throw refreshError;
//         }
//       }

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}));
//         console.error('Failed to activate user:', { status: response.status, errorData });
//         throw new Error(`Failed to activate user: ${errorData.message || response.statusText}`);
//       }

//       const data = await response.json();
//       console.debug('User activated:', data);
//       return data;
//     } catch (error) {
//       console.error('Error activating user:', error);
//       throw error;
//     }
//   },

//   async getPrivileges() {
//     const token = localStorage.getItem('access_token');
//     if (!token) {
//       console.error('No access token found for getPrivileges');
//       throw new Error('No access token found. Please log in.');
//     }

//     try {
//       const url = new URL(PRIVILEGE_API_URL);
//       url.searchParams.append('t', Date.now());

//       console.debug('Fetching privileges with URL:', url.toString());
//       const response = await fetch(url, {
//         method: 'GET',
//         headers: {
//           'Content-Type': 'application/json',
//           'x-access-tokens': token,
//         },
//       });

//       if (response.status === 401) {
//         console.debug('Received 401 for getPrivileges, attempting token refresh');
//         try {
//           return await refreshTokenAndRetry(url, {
//             method: 'GET',
//             headers: {
//               'Content-Type': 'application/json',
//               'x-access-tokens': token,
//             },
//           }).then((res) => res.json());
//         } catch (refreshError) {
//           console.error('Token refresh failed for getPrivileges:', refreshError);
//           localStorage.clear();
//           window.location.href = '/login';
//           throw refreshError;
//         }
//       }

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}));
//         console.error('Failed to fetch privileges:', { status: response.status, errorData });
//         throw new Error(`Failed to fetch privileges: ${errorData.message || response.statusText}`);
//       }

//       const data = await response.json();
//       console.debug('Privileges fetched:', data);
//       return data;
//     } catch (error) {
//       console.error('Error fetching privileges:', error);
//       throw error;
//     }
//   },

//   async getRolesByUser(userId, orgId) {
//     const token = localStorage.getItem('access_token');
//     if (!token) {
//       console.error('No access token found for getRolesByUser');
//       throw new Error('No access token found. Please log in.');
//     }

//     try {
//       const url = new URL(ROLE_API_URL);
//       url.searchParams.append('org_id', orgId);
//       url.searchParams.append('t', Date.now());

//       console.debug('Fetching roles with URL:', url.toString());
//       const response = await fetch(url, {
//         method: 'GET',
//         headers: {
//           'Content-Type': 'application/json',
//           'x-access-tokens': token,
//         },
//       });

//       if (response.status === 401) {
//         console.debug('Received 401 for getRolesByUser, attempting token refresh');
//         try {
//           return await refreshTokenAndRetry(url, {
//             method: 'GET',
//             headers: {
//               'Content-Type': 'application/json',
//               'x-access-tokens': token,
//             },
//           }).then((res) => res.json());
//         } catch (refreshError) {
//           console.error('Token refresh failed for getRolesByUser:', refreshError);
//           localStorage.clear();
//           window.location.href = '/login';
//           throw refreshError;
//         }
//       }

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}));
//         console.error('Failed to fetch roles:', { status: response.status, errorData });
//         throw new Error(`Failed to fetch roles: ${errorData.message || response.statusText}`);
//       }

//       const roles = await response.json();
//       console.debug('Roles fetched for user:', userId, roles);
//       return roles.filter((role) => role.user_id && role.user_id.toString() === userId);
//     } catch (error) {
//       console.error('Error fetching roles:', error);
//       throw error;
//     }
//   },

//   async createRole(roleData) {
//     const token = localStorage.getItem('access_token');
//     if (!token) {
//       console.error('No access token found for createRole');
//       throw new Error('No access token found. Please log in.');
//     }

//     try {
//       const url = new URL(ROLE_API_URL);
//       url.searchParams.append('t', Date.now());

//       console.debug('Creating role with data:', roleData);
//       const response = await fetch(url, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'x-access-tokens': token,
//         },
//         body: JSON.stringify({
//           role_id: Math.floor(Math.random() * 1000000),
//           user_id: roleData.user_id,
//           privilege: roleData.privilege,
//           org_id: roleData.org_id,
//           created_by_user: roleData.created_by_user || roleData.user_id,
//         }),
//       });

//       if (response.status === 401) {
//         console.debug('Received 401 for createRole, attempting token refresh');
//         try {
//           return await refreshTokenAndRetry(url, {
//             method: 'POST',
//             headers: {
//               'Content-Type': 'application/json',
//               'x-access-tokens': token,
//             },
//             body: JSON.stringify({
//               role_id: Math.floor(Math.random() * 1000000),
//               user_id: roleData.user_id,
//               privilege: roleData.privilege,
//               org_id: roleData.org_id,
//               created_by_user: roleData.created_by_user || roleData.user_id,
//             }),
//           }).then((res) => res.json());
//         } catch (refreshError) {
//           console.error('Token refresh failed for createRole:', refreshError);
//           localStorage.clear();
//           window.location.href = '/login';
//           throw refreshError;
//         }
//       }

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}));
//         console.error('Failed to create role:', { status: response.status, errorData });
//         throw new Error(`Failed to create role: ${errorData.message || response.statusText}`);
//       }

//       const data = await response.json();
//       console.debug('Role created:', data);
//       return data;
//     } catch (error) {
//       console.error('Error creating role:', error);
//       throw error;
//     }
//   },

//   async updateUserRoles(userId, privilegeIds, orgId) {
//     const token = localStorage.getItem('access_token');
//     if (!token) {
//       console.error('No access token found for updateUserRoles');
//       throw new Error('No access token found. Please log in.');
//     }

//     try {
//       const existingRoles = await this.getRolesByUser(userId, orgId);
//       const existingPrivilegeIds = existingRoles.map((role) => role.privilege);

//       for (const role of existingRoles) {
//         if (!privilegeIds.includes(role.privilege)) {
//           const url = new URL(`${ROLE_API_URL}/${role._id}`);
//           url.searchParams.append('org_id', orgId);
//           url.searchParams.append('t', Date.now());

//           console.debug('Deleting role with URL:', url.toString());
//           const response = await fetch(url, {
//             method: 'DELETE',
//             headers: {
//               'Content-Type': 'application/json',
//               'x-access-tokens': token,
//             },
//           });

//           if (response.status === 401) {
//             console.debug('Received 401 for role deletion, attempting token refresh');
//             await refreshTokenAndRetry(url, {
//               method: 'DELETE',
//               headers: {
//                 'Content-Type': 'application/json',
//                 'x-access-tokens': token,
//               },
//             });
//           }

//           if (!response.ok && response.status !== 204) {
//             const errorData = await response.json().catch(() => ({}));
//             console.error('Failed to delete role:', { status: response.status, errorData });
//             throw new Error(`Failed to delete role: ${errorData.message || response.statusText}`);
//           }
//         }
//       }

//       for (const privilegeId of privilegeIds) {
//         if (!existingPrivilegeIds.includes(privilegeId)) {
//           await this.createRole({
//             user_id: userId,
//             privilege: privilegeId,
//             org_id: orgId,
//           });
//         }
//       }
//       console.debug('User roles updated successfully for user:', userId);
//     } catch (error) {
//       console.error('Error updating user roles:', error);
//       throw error;
//     }
//   },

//   async getUserProfile(userId) {
//     const token = localStorage.getItem('access_token');
//     if (!token) {
//       console.error('No access token found for getUserProfile');
//       throw new Error('No access token found. Please log in.');
//     }

//     try {
//       const url = new URL(PROFILE_API_URL);
//       url.searchParams.append('user_id', userId);
//       url.searchParams.append('t', Date.now());

//       console.debug('Fetching user profile with URL:', url.toString());
//       const response = await fetch(url, {
//         method: 'GET',
//         headers: {
//           'Content-Type': 'application/json',
//           'x-access-tokens': token,
//         },
//       });

//       if (response.status === 401) {
//         console.debug('Received 401 for getUserProfile, attempting token refresh');
//         try {
//           return await refreshTokenAndRetry(url, {
//             method: 'GET',
//             headers: {
//               'Content-Type': 'application/json',
//               'x-access-tokens': token,
//             },
//           }).then((res) => res.json());
//         } catch (refreshError) {
//           console.error('Token refresh failed for getUserProfile:', refreshError);
//           localStorage.clear();
//           window.location.href = '/login';
//           throw refreshError;
//         }
//       }

//       if (response.status === 404) {
//         console.debug('User profile not found for user_id:', userId);
//         return { user_image: null };
//       }

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}));
//         console.error('Failed to fetch user profile:', { status: response.status, errorData });
//         throw new Error(`Failed to fetch user profile: ${errorData.message || response.statusText}`);
//       }

//       const data = await response.json();
//       console.debug('User profile fetched:', data);
//       return data;
//     } catch (error) {
//       console.error('Error fetching user profile:', error);
//       throw error;
//     }
//   },

//   async updateProfileImage(userId, imageFile) {
//     const token = localStorage.getItem('access_token');
//     if (!token) {
//       console.error('No access token found for updateProfileImage');
//       throw new Error('No access token found. Please log in.');
//     }

//     if (!imageFile) {
//       console.error('No image file provided for updateProfileImage');
//       throw new Error('No image file provided');
//     }

//     const formData = new FormData();
//     formData.append('user_image', imageFile);
//     formData.append('user_id', userId);

//     try {
//       const url = new URL(PROFILE_API_URL);
//       url.searchParams.append('t', Date.now());

//       console.debug('Updating profile image for user_id:', userId);
//       const response = await fetch(url, {
//         method: 'PATCH',
//         headers: {
//           'x-access-tokens': token,
//         },
//         body: formData,
//       });

//       if (response.status === 401) {
//         console.debug('Received 401 for updateProfileImage, attempting token refresh');
//         try {
//           return await refreshTokenAndRetry(url, {
//             method: 'PATCH',
//             headers: {
//               'x-access-tokens': token,
//             },
//             body: formData,
//           }).then((res) => res.json());
//         } catch (refreshError) {
//           console.error('Token refresh failed for updateProfileImage:', refreshError);
//           localStorage.clear();
//           window.location.href = '/login';
//           throw refreshError;
//         }
//       }

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}));
//         console.error('Failed to update profile image:', { status: response.status, errorData });
//         throw new Error(`Failed to update profile image: ${errorData.message || response.statusText}`);
//       }

//       const data = await response.json();
//       console.debug('Profile image updated:', data);
//       return data;
//     } catch (error) {
//       console.error('Error updating profile image:', error);
//       throw error;
//     }
//   },

//   async getUserUpdates(userId) {
//     const token = localStorage.getItem('access_token');
//     if (!token) {
//       console.error('No access token found for getUserUpdates');
//       throw new Error('No access token found. Please log in.');
//     }

//     try {
//       const url = new URL(`${UPDATE_API_URL}/user/${userId}`);
//       url.searchParams.append('t', Date.now());

//       console.debug('Fetching user updates with URL:', url.toString());
//       const response = await fetch(url, {
//         method: 'GET',
//         headers: {
//           'Content-Type': 'application/json',
//           'x-access-tokens': token,
//         },
//       });

//       if (response.status === 401) {
//         console.debug('Received 401 for getUserUpdates, attempting token refresh');
//         try {
//           return await refreshTokenAndRetry(url, {
//             method: 'GET',
//             headers: {
//               'Content-Type': 'application/json',
//               'x-access-tokens': token,
//             },
//           }).then((res) => res.json());
//         } catch (refreshError) {
//           console.error('Token refresh failed for getUserUpdates:', refreshError);
//           localStorage.clear();
//           window.location.href = '/login';
//           throw refreshError;
//         }
//       }

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}));
//         console.error('Failed to fetch user updates:', { status: response.status, errorData });
//         throw new Error(`Failed to fetch user updates: ${errorData.message || response.statusText}`);
//       }

//       const data = await response.json();
//       console.debug('User updates fetched:', data);
//       return data;
//     } catch (error) {
//       console.error('Error fetching user updates:', error);
//       throw error;
//     }
//   },
// };

// export { usersManagementService };

/// Working 
// import { v4 as uuidv4 } from 'uuid';

// const USER_API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/users`;
// const AUTH_API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/auth`;
// const PRIVILEGE_API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/privileges`;
// const ROLE_API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/roles`;
// const PROFILE_API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/user_profiles`;
// const UPDATE_API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/user_info_updates`;

// async function refreshTokenAndRetry(url, options) {
//   const refreshToken = localStorage.getItem('refresh_token');
//   if (!refreshToken) {
//     console.error('No refresh token found');
//     throw new Error('No refresh token found');
//   }

//   console.debug('Attempting to refresh token for URL:', url.toString());
//   const refreshResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/refresh`, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ refresh_token: refreshToken }),
//   });

//   if (!refreshResponse.ok) {
//     console.error('Failed to refresh token:', refreshResponse.status);
//     throw new Error('Failed to refresh token');
//   }

//   const { access_token } = await refreshResponse.json();
//   localStorage.setItem('access_token', access_token);
//   options.headers['x-access-tokens'] = access_token;
//   console.debug('Token refreshed, retrying request:', url.toString());

//   return fetch(url, options);
// }

// const usersManagementService = {
//   async getUsers(orgId) {
//     const token = localStorage.getItem('access_token');
//     if (!token) {
//       console.error('No access token found for getUsers');
//       throw new Error('No access token found. Please log in.');
//     }

//     try {
//       const url = new URL(USER_API_URL);
//       url.searchParams.append('org_id', orgId);
//       url.searchParams.append('t', Date.now());

//       console.debug('Fetching users with URL:', url.toString());
//       const response = await fetch(url, {
//         method: 'GET',
//         headers: {
//           'Content-Type': 'application/json',
//           'x-access-tokens': token,
//         },
//       });

//       if (response.status === 401) {
//         console.debug('Received 401 for getUsers, attempting token refresh');
//         try {
//           const retryResponse = await refreshTokenAndRetry(url, {
//             method: 'GET',
//             headers: {
//               'Content-Type': 'application/json',
//               'x-access-tokens': token,
//             },
//           });
//           const data = await retryResponse.json();
//           console.debug('Users fetched after token refresh:', data);
//           return this.processUserData(data, orgId);
//         } catch (refreshError) {
//           console.error('Token refresh failed for getUsers:', refreshError);
//           localStorage.clear();
//           window.location.href = '/login';
//           throw refreshError;
//         }
//       }

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}));
//         console.error('Failed to fetch users:', { status: response.status, errorData });
//         throw new Error(`Failed to fetch users: ${errorData.message || response.statusText}`);
//       }

//       const data = await response.json();
//       console.debug('Raw API response for getUsers:', data);
//       return this.processUserData(data, orgId);
//     } catch (error) {
//       console.error('Error fetching users:', error);
//       throw error;
//     }
//   },

//   async processUserData(data, orgId) {
//     console.debug('Processing user data for org_id:', orgId, 'Data:', data);
//     const usersWithIds = await Promise.all(
//       data.map(async (user) => {
//         try {
//           const roles = await this.getRolesByUser(user.id, orgId);
//           return {
//             _id: user.id,
//             name: user.name,
//             email: user.email,
//             phone: user.phone,
//             first_name: user.first_name,
//             last_name: user.last_name,
//             org_id: user.org_id || orgId,
//             privilege_ids: roles.map((role) => role.privilege),
//           };
//         } catch (roleError) {
//           console.warn(`Failed to fetch roles for user ${user.id}:`, roleError);
//           return {
//             _id: user.id,
//             name: user.name,
//             email: user.email,
//             phone: user.phone,
//             first_name: user.first_name,
//             last_name: user.last_name,
//             org_id: user.org_id || orgId,
//             privilege_ids: [],
//           };
//         }
//       })
//     );
//     console.debug('Processed users:', usersWithIds);
//     return usersWithIds;
//   },

//   async getUser(id, orgId) {
//     const token = localStorage.getItem('access_token');
//     if (!token) {
//       console.error('No access token found for getUser');
//       throw new Error('No access token found. Please log in.');
//     }

//     try {
//       const url = new URL(`${USER_API_URL}/profile`);
//       url.searchParams.append('user_id', id);
//       url.searchParams.append('org_id', orgId);
//       url.searchParams.append('t', Date.now());

//       console.debug('Fetching user with URL:', url.toString());
//       const response = await fetch(url, {
//         method: 'GET',
//         headers: {
//           'Content-Type': 'application/json',
//           'x-access-tokens': token,
//         },
//       });

//       if (response.status === 401) {
//         console.debug('Received 401 for getUser, attempting token refresh');
//         try {
//           return await refreshTokenAndRetry(url, {
//             method: 'GET',
//             headers: {
//               'Content-Type': 'application/json',
//               'x-access-tokens': token,
//             },
//           }).then((res) => res.json());
//         } catch (refreshError) {
//           console.error('Token refresh failed for getUser:', refreshError);
//           localStorage.clear();
//           window.location.href = '/login';
//           throw refreshError;
//         }
//       }

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}));
//         console.error('Failed to fetch user:', { status: response.status, errorData });
//         throw new Error(`Failed to fetch user: ${errorData.message || response.statusText}`);
//       }

//       const data = await response.json();
//       console.debug('User fetched:', data);
//       return data;
//     } catch (error) {
//       console.error('Error fetching user:', error);
//       throw error;
//     }
//   },

//   async registerUser(userData) {
//     const token = localStorage.getItem('access_token');
//     if (!token) {
//       console.error('No access token found for registerUser');
//       throw new Error('No access token found. Please log in.');
//     }

//     if (
//       !userData.get('email') ||
//       !userData.get('first_name') ||
//       !userData.get('last_name') ||
//       !userData.get('password')
//     ) {
//       console.error('Missing required fields for registerUser:', userData);
//       throw new Error('Missing required fields: email, first_name, last_name, and password are required');
//     }

//     try {
//       const formDataEntries = {};
//       for (const [key, value] of userData.entries()) {
//         formDataEntries[key] = value instanceof File ? value.name : value;
//       }
//       console.log('FormData being sent for registration:', formDataEntries);

//       const url = new URL(`${AUTH_API_URL}/register`);
//       url.searchParams.append('t', Date.now());

//       const response = await fetch(url, {
//         method: 'POST',
//         headers: {
//           'x-access-tokens': token,
//         },
//         body: userData,
//       });

//       if (response.status === 401) {
//         console.debug('Received 401 for registerUser, attempting token refresh');
//         try {
//           return await refreshTokenAndRetry(url, {
//             method: 'POST',
//             headers: {
//               'x-access-tokens': token,
//             },
//             body: userData,
//           }).then((res) => res.json());
//         } catch (refreshError) {
//           console.error('Token refresh failed for registerUser:', refreshError);
//           localStorage.clear();
//           window.location.href = '/login';
//           throw refreshError;
//         }
//       }

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}));
//         console.error('Failed to register user:', { status: response.status, errorData });
//         throw new Error(`Failed to register user: ${errorData.message || response.statusText}`);
//       }

//       const data = await response.json();
//       console.debug('User registered:', data);
//       return data._id || data.id;
//     } catch (error) {
//       console.error('Error registering user:', error);
//       throw error;
//     }
//   },

//   async updateUser(id, userData, orgId) {
//     const token = localStorage.getItem('access_token');
//     if (!token) {
//       console.error('No access token found for updateUser');
//       throw new Error('No access token found. Please log in.');
//     }

//     if (
//       !userData.get('email') ||
//       !userData.get('first_name') ||
//       !userData.get('last_name')
//     ) {
//       console.error('Missing required fields for updateUser:', userData);
//       throw new Error('Missing required fields: email, first_name, and last_name are required');
//     }

//     try {
//       const formDataEntries = {};
//       for (const [key, value] of userData.entries()) {
//         formDataEntries[key] = value instanceof File ? value.name : value;
//       }
//       console.log('FormData being sent for update:', formDataEntries);

//       const url = new URL(`${USER_API_URL}/${id}`);
//       url.searchParams.append('org_id', orgId);
//       url.searchParams.append('t', Date.now());

//       const response = await fetch(url, {
//         method: 'PUT',
//         headers: {
//           'x-access-tokens': token,
//         },
//         body: userData,
//       });

//       if (response.status === 401) {
//         console.debug('Received 401 for updateUser, attempting token refresh');
//         try {
//           return await refreshTokenAndRetry(url, {
//             method: 'PUT',
//             headers: {
//               'x-access-tokens': token,
//             },
//             body: userData,
//           }).then((res) => res.json());
//         } catch (refreshError) {
//           console.error('Token refresh failed for updateUser:', refreshError);
//           localStorage.clear();
//           window.location.href = '/login';
//           throw refreshError;
//         }
//       }

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}));
//         console.error('Failed to update user:', { status: response.status, errorData });
//         throw new Error(`Failed to update user: ${errorData.message || response.statusText}`);
//       }

//       const data = await response.json();
//       console.debug('User updated:', data);
//       return data;
//     } catch (error) {
//       console.error('Error updating user:', error);
//       throw error;
//     }
//   },

//   async deleteUser(id, orgId) {
//     const token = localStorage.getItem('access_token');
//     if (!token) {
//       console.error('No access token found for deleteUser');
//       throw new Error('No access token found. Please log in.');
//     }

//     try {
//       const url = new URL(`${USER_API_URL}/${id}`);
//       url.searchParams.append('org_id', orgId);
//       url.searchParams.append('t', Date.now());

//       console.debug('Deleting user with URL:', url.toString());
//       const response = await fetch(url, {
//         method: 'DELETE',
//         headers: {
//           'Content-Type': 'application/json',
//           'x-access-tokens': token,
//         },
//       });

//       if (response.status === 401) {
//         console.debug('Received 401 for deleteUser, attempting token refresh');
//         try {
//           await refreshTokenAndRetry(url, {
//             method: 'DELETE',
//             headers: {
//               'Content-Type': 'application/json',
//               'x-access-tokens': token,
//             },
//           });
//           console.debug('User deleted after token refresh');
//           return;
//         } catch (refreshError) {
//           console.error('Token refresh failed for deleteUser:', refreshError);
//           localStorage.clear();
//           window.location.href = '/login';
//           throw refreshError;
//         }
//       }

//       if (!response.ok && response.status !== 204) {
//         const errorData = await response.json().catch(() => ({}));
//         console.error('Failed to delete user:', { status: response.status, errorData });
//         throw new Error(`Failed to delete user: ${errorData.message || response.statusText}`);
//       }
//       console.debug('User deleted successfully');
//     } catch (error) {
//       console.error('Error deleting user:', error);
//       throw error;
//     }
//   },

//   async getOtp(email, orgId) {
//     const token = localStorage.getItem('access_token');
//     if (!token) {
//       console.error('No access token found for getOtp');
//       throw new Error('No access token found. Please log in.');
//     }

//     try {
//       const url = new URL(`${USER_API_URL}/get_otp`);
//       url.searchParams.append('org_id', orgId);
//       url.searchParams.append('t', Date.now());

//       console.debug('Fetching OTP with URL:', url.toString());
//       const response = await fetch(url, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'x-access-tokens': token,
//         },
//         body: JSON.stringify({ email }),
//       });

//       if (response.status === 401) {
//         console.debug('Received 401 for getOtp, attempting token refresh');
//         try {
//           return await refreshTokenAndRetry(url, {
//             method: 'POST',
//             headers: {
//               'Content-Type': 'application/json',
//               'x-access-tokens': token,
//             },
//             body: JSON.stringify({ email }),
//           }).then((res) => res.json());
//         } catch (refreshError) {
//           console.error('Token refresh failed for getOtp:', refreshError);
//           localStorage.clear();
//           window.location.href = '/login';
//           throw refreshError;
//         }
//       }

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}));
//         console.error('Failed to fetch OTP:', { status: response.status, errorData });
//         throw new Error(`Failed to fetch OTP: ${errorData.message || response.statusText}`);
//       }

//       const data = await response.json();
//       console.debug('OTP fetched:', data);
//       return data;
//     } catch (error) {
//       console.error('Error fetching OTP:', error);
//       throw error;
//     }
//   },

//   async activateUser({ email, otp }, orgId) {
//     const token = localStorage.getItem('access_token');
//     if (!token) {
//       console.error('No access token found for activateUser');
//       throw new Error('No access token found. Please log in.');
//     }

//     try {
//       const url = new URL(`${AUTH_API_URL}/activate_account`);
//       url.searchParams.append('org_id', orgId);
//       url.searchParams.append('t', Date.now());

//       console.debug('Activating user with URL:', url.toString());
//       const response = await fetch(url, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'x-access-tokens': token,
//         },
//         body: JSON.stringify({ email, otp }),
//       });

//       if (response.status === 401) {
//         console.debug('Received 401 for activateUser, attempting token refresh');
//         try {
//           return await refreshTokenAndRetry(url, {
//             method: 'POST',
//             headers: {
//               'Content-Type': 'application/json',
//               'x-access-tokens': token,
//             },
//             body: JSON.stringify({ email, otp }),
//           }).then((res) => res.json());
//         } catch (refreshError) {
//           console.error('Token refresh failed for activateUser:', refreshError);
//           localStorage.clear();
//           window.location.href = '/login';
//           throw refreshError;
//         }
//       }

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}));
//         console.error('Failed to activate user:', { status: response.status, errorData });
//         throw new Error(`Failed to activate user: ${errorData.message || response.statusText}`);
//       }

//       const data = await response.json();
//       console.debug('User activated:', data);
//       return data;
//     } catch (error) {
//       console.error('Error activating user:', error);
//       throw error;
//     }
//   },

//   async getPrivileges() {
//     const token = localStorage.getItem('access_token');
//     if (!token) {
//       console.error('No access token found for getPrivileges');
//       throw new Error('No access token found. Please log in.');
//     }

//     try {
//       const url = new URL(PRIVILEGE_API_URL);
//       url.searchParams.append('t', Date.now());

//       console.debug('Fetching privileges with URL:', url.toString());
//       const response = await fetch(url, {
//         method: 'GET',
//         headers: {
//           'Content-Type': 'application/json',
//           'x-access-tokens': token,
//         },
//       });

//       if (response.status === 401) {
//         console.debug('Received 401 for getPrivileges, attempting token refresh');
//         try {
//           return await refreshTokenAndRetry(url, {
//             method: 'GET',
//             headers: {
//               'Content-Type': 'application/json',
//               'x-access-tokens': token,
//             },
//           }).then((res) => res.json());
//         } catch (refreshError) {
//           console.error('Token refresh failed for getPrivileges:', refreshError);
//           localStorage.clear();
//           window.location.href = '/login';
//           throw refreshError;
//         }
//       }

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}));
//         console.error('Failed to fetch privileges:', { status: response.status, errorData });
//         throw new Error(`Failed to fetch privileges: ${errorData.message || response.statusText}`);
//       }

//       const data = await response.json();
//       console.debug('Privileges fetched:', data);
//       return data;
//     } catch (error) {
//       console.error('Error fetching privileges:', error);
//       throw error;
//     }
//   },

//   async getRolesByUser(userId, orgId) {
//     const token = localStorage.getItem('access_token');
//     if (!token) {
//       console.error('No access token found for getRolesByUser');
//       throw new Error('No access token found. Please log in.');
//     }

//     try {
//       const url = new URL(ROLE_API_URL);
//       url.searchParams.append('org_id', orgId);
//       url.searchParams.append('t', Date.now());

//       console.debug('Fetching roles with URL:', url.toString());
//       const response = await fetch(url, {
//         method: 'GET',
//         headers: {
//           'Content-Type': 'application/json',
//           'x-access-tokens': token,
//         },
//       });

//       if (response.status === 401) {
//         console.debug('Received 401 for getRolesByUser, attempting token refresh');
//         try {
//           return await refreshTokenAndRetry(url, {
//             method: 'GET',
//             headers: {
//               'Content-Type': 'application/json',
//               'x-access-tokens': token,
//             },
//           }).then((res) => res.json());
//         } catch (refreshError) {
//           console.error('Token refresh failed for getRolesByUser:', refreshError);
//           localStorage.clear();
//           window.location.href = '/login';
//           throw refreshError;
//         }
//       }

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}));
//         console.error('Failed to fetch roles:', { status: response.status, errorData });
//         throw new Error(`Failed to fetch roles: ${errorData.message || response.statusText}`);
//       }

//       const roles = await response.json();
//       console.debug('Roles fetched for user:', userId, roles);
//       return roles.filter((role) => role.user_id && role.user_id.toString() === userId);
//     } catch (error) {
//       console.error('Error fetching roles:', error);
//       throw error;
//     }
//   },

//   async createRole(roleData) {
//     const token = localStorage.getItem('access_token');
//     if (!token) {
//       console.error('No access token found for createRole');
//       throw new Error('No access token found. Please log in.');
//     }

//     try {
//       const url = new URL(ROLE_API_URL);
//       url.searchParams.append('t', Date.now());

//       console.debug('Creating role with data:', roleData);
//       const response = await fetch(url, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'x-access-tokens': token,
//         },
//         body: JSON.stringify({
//           role_id: Math.floor(Math.random() * 1000000),
//           user_id: roleData.user_id,
//           privilege: roleData.privilege,
//           org_id: roleData.org_id,
//           created_by_user: roleData.created_by_user || roleData.user_id,
//         }),
//       });

//       if (response.status === 401) {
//         console.debug('Received 401 for createRole, attempting token refresh');
//         try {
//           return await refreshTokenAndRetry(url, {
//             method: 'POST',
//             headers: {
//               'Content-Type': 'application/json',
//               'x-access-tokens': token,
//             },
//             body: JSON.stringify({
//               role_id: Math.floor(Math.random() * 1000000),
//               user_id: roleData.user_id,
//               privilege: roleData.privilege,
//               org_id: roleData.org_id,
//               created_by_user: roleData.created_by_user || roleData.user_id,
//             }),
//           }).then((res) => res.json());
//         } catch (refreshError) {
//           console.error('Token refresh failed for createRole:', refreshError);
//           localStorage.clear();
//           window.location.href = '/login';
//           throw refreshError;
//         }
//       }

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}));
//         console.error('Failed to create role:', { status: response.status, errorData });
//         throw new Error(`Failed to create role: ${errorData.message || response.statusText}`);
//       }

//       const data = await response.json();
//       console.debug('Role created:', data);
//       return data;
//     } catch (error) {
//       console.error('Error creating role:', error);
//       throw error;
//     }
//   },

//   async updateUserRoles(userId, privilegeIds, orgId) {
//     const token = localStorage.getItem('access_token');
//     if (!token) {
//       console.error('No access token found for updateUserRoles');
//       throw new Error('No access token found. Please log in.');
//     }

//     try {
//       const existingRoles = await this.getRolesByUser(userId, orgId);
//       const existingPrivilegeIds = existingRoles.map((role) => role.privilege);

//       for (const role of existingRoles) {
//         if (!privilegeIds.includes(role.privilege)) {
//           const url = new URL(`${ROLE_API_URL}/${role._id}`);
//           url.searchParams.append('org_id', orgId);
//           url.searchParams.append('t', Date.now());

//           console.debug('Deleting role with URL:', url.toString());
//           const response = await fetch(url, {
//             method: 'DELETE',
//             headers: {
//               'Content-Type': 'application/json',
//               'x-access-tokens': token,
//             },
//           });

//           if (response.status === 401) {
//             console.debug('Received 401 for role deletion, attempting token refresh');
//             await refreshTokenAndRetry(url, {
//               method: 'DELETE',
//               headers: {
//                 'Content-Type': 'application/json',
//                 'x-access-tokens': token,
//               },
//             });
//           }

//           if (!response.ok && response.status !== 204) {
//             const errorData = await response.json().catch(() => ({}));
//             console.error('Failed to delete role:', { status: response.status, errorData });
//             throw new Error(`Failed to delete role: ${errorData.message || response.statusText}`);
//           }
//         }
//       }

//       for (const privilegeId of privilegeIds) {
//         if (!existingPrivilegeIds.includes(privilegeId)) {
//           await this.createRole({
//             user_id: userId,
//             privilege: privilegeId,
//             org_id: orgId,
//           });
//         }
//       }
//       console.debug('User roles updated successfully for user:', userId);
//     } catch (error) {
//       console.error('Error updating user roles:', error);
//       throw error;
//     }
//   },

//   async getUserProfile(userId) {
//     const token = localStorage.getItem('access_token');
//     if (!token) {
//       console.error('No access token found for getUserProfile');
//       throw new Error('No access token found. Please log in.');
//     }

//     try {
//       const url = new URL(PROFILE_API_URL);
//       url.searchParams.append('user_id', userId);
//       url.searchParams.append('t', Date.now());

//       console.debug('Fetching user profile with URL:', url.toString());
//       const response = await fetch(url, {
//         method: 'GET',
//         headers: {
//           'Content-Type': 'application/json',
//           'x-access-tokens': token,
//         },
//       });

//       if (response.status === 401) {
//         console.debug('Received 401 for getUserProfile, attempting token refresh');
//         try {
//           return await refreshTokenAndRetry(url, {
//             method: 'GET',
//             headers: {
//               'Content-Type': 'application/json',
//               'x-access-tokens': token,
//             },
//           }).then((res) => res.json());
//         } catch (refreshError) {
//           console.error('Token refresh failed for getUserProfile:', refreshError);
//           localStorage.clear();
//           window.location.href = '/login';
//           throw refreshError;
//         }
//       }

//       if (response.status === 404) {
//         console.debug('User profile not found for user_id:', userId);
//         return { user_image: null };
//       }

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}));
//         console.error('Failed to fetch user profile:', { status: response.status, errorData });
//         throw new Error(`Failed to fetch user profile: ${errorData.message || response.statusText}`);
//       }

//       const data = await response.json();
//       console.debug('User profile fetched:', data);
//       return data;
//     } catch (error) {
//       console.error('Error fetching user profile:', error);
//       throw error;
//     }
//   },

//   async updateProfileImage(userId, imageFile) {
//     const token = localStorage.getItem('access_token');
//     if (!token) {
//       console.error('No access token found for updateProfileImage');
//       throw new Error('No access token found. Please log in.');
//     }

//     if (!imageFile) {
//       console.error('No image file provided for updateProfileImage');
//       throw new Error('No image file provided');
//     }

//     const formData = new FormData();
//     formData.append('user_image', imageFile);
//     formData.append('user_id', userId);

//     try {
//       const url = new URL(PROFILE_API_URL);
//       url.searchParams.append('t', Date.now());

//       console.debug('Updating profile image for user_id:', userId);
//       const response = await fetch(url, {
//         method: 'PATCH',
//         headers: {
//           'x-access-tokens': token,
//         },
//         body: formData,
//       });

//       if (response.status === 401) {
//         console.debug('Received 401 for updateProfileImage, attempting token refresh');
//         try {
//           return await refreshTokenAndRetry(url, {
//             method: 'PATCH',
//             headers: {
//               'x-access-tokens': token,
//             },
//             body: formData,
//           }).then((res) => res.json());
//         } catch (refreshError) {
//           console.error('Token refresh failed for updateProfileImage:', refreshError);
//           localStorage.clear();
//           window.location.href = '/login';
//           throw refreshError;
//         }
//       }

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}));
//         console.error('Failed to update profile image:', { status: response.status, errorData });
//         throw new Error(`Failed to update profile image: ${errorData.message || response.statusText}`);
//       }

//       const data = await response.json();
//       console.debug('Profile image updated:', data);
//       return data;
//     } catch (error) {
//       console.error('Error updating profile image:', error);
//       throw error;
//     }
//   },

//   async getUserUpdates(userId) {
//     const token = localStorage.getItem('access_token');
//     if (!token) {
//       console.error('No access token found for getUserUpdates');
//       throw new Error('No access token found. Please log in.');
//     }

//     try {
//       const url = new URL(`${UPDATE_API_URL}/user/${userId}`);
//       url.searchParams.append('t', Date.now());

//       console.debug('Fetching user updates with URL:', url.toString());
//       const response = await fetch(url, {
//         method: 'GET',
//         headers: {
//           'Content-Type': 'application/json',
//           'x-access-tokens': token,
//         },
//       });

//       if (response.status === 401) {
//         console.debug('Received 401 for getUserUpdates, attempting token refresh');
//         try {
//           return await refreshTokenAndRetry(url, {
//             method: 'GET',
//             headers: {
//               'Content-Type': 'application/json',
//               'x-access-tokens': token,
//             },
//           }).then((res) => res.json());
//         } catch (refreshError) {
//           console.error('Token refresh failed for getUserUpdates:', refreshError);
//           localStorage.clear();
//           window.location.href = '/login';
//           throw refreshError;
//         }
//       }

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}));
//         console.error('Failed to fetch user updates:', { status: response.status, errorData });
//         throw new Error(`Failed to fetch user updates: ${errorData.message || response.statusText}`);
//       }

//       const data = await response.json();
//       console.debug('User updates fetched:', data);
//       return data;
//     } catch (error) {
//       console.error('Error fetching user updates:', error);
//       throw error;
//     }
//   },

//   async resetUserPassword({ email, new_password }) {
//     const token = localStorage.getItem('access_token');
//     if (!token) {
//       console.error('No access token found for resetUserPassword');
//       throw new Error('No access token found. Please log in.');
//     }

//     if (!email || !new_password) {
//       console.error('Missing required fields for resetUserPassword:', { email, new_password });
//       throw new Error('Email and new password are required');
//     }

//     try {
//       const url = new URL(`${AUTH_API_URL}/reset_admin`);
//       url.searchParams.append('t', Date.now());

//       console.debug('Resetting user password with URL:', url.toString());
//       const response = await fetch(url, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'x-access-tokens': token,
//         },
//         body: JSON.stringify({ email, new_password }),
//       });

//       if (response.status === 401) {
//         console.debug('Received 401 for resetUserPassword, attempting token refresh');
//         try {
//           return await refreshTokenAndRetry(url, {
//             method: 'POST',
//             headers: {
//               'Content-Type': 'application/json',
//               'x-access-tokens': token,
//             },
//             body: JSON.stringify({ email, new_password }),
//           }).then((res) => res.json());
//         } catch (refreshError) {
//           console.error('Token refresh failed for resetUserPassword:', refreshError);
//           localStorage.clear();
//           window.location.href = '/login';
//           throw refreshError;
//         }
//       }

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}));
//         console.error('Failed to reset user password:', { status: response.status, errorData });
//         if (response.status === 403) {
//           throw new Error('Unauthorized: Admin access required');
//         } else if (response.status === 400) {
//           throw new Error('New password must be at least 8 characters long');
//         } else if (response.status === 404) {
//           throw new Error('User with this email does not exist');
//         } else {
//           throw new Error(`Failed to reset user password: ${errorData.message || response.statusText}`);
//         }
//       }

//       const data = await response.json();
//       console.debug('User password reset:', data);
//       return data;
//     } catch (error) {
//       console.error('Error resetting user password:', error);
//       throw error;
//     }
//   },
// };

// export { usersManagementService };

// Working Firday 2


import { v4 as uuidv4 } from 'uuid';

const USER_API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/users`;
const AUTH_API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/auth`;
const PRIVILEGE_API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/privileges`;
const ROLE_API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/roles`;
const PROFILE_API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/user_profiles`;
const UPDATE_API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/user_info_updates`;

async function refreshTokenAndRetry(url, options) {
  const refreshToken = localStorage.getItem('refresh_token');
  if (!refreshToken) {
    console.error('No refresh token found');
    throw new Error('No refresh token found');
  }

  console.debug('Attempting to refresh token for URL:', url.toString());
  const refreshResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!refreshResponse.ok) {
    console.error('Failed to refresh token:', refreshResponse.status);
    throw new Error('Failed to refresh token');
  }

  const { access_token } = await refreshResponse.json();
  localStorage.setItem('access_token', access_token);
  options.headers['x-access-tokens'] = access_token;
  console.debug('Token refreshed, retrying request:', url.toString());

  return fetch(url, options);
}

const usersManagementService = {
  async getUsers(orgId) {
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.error('No access token found for getUsers');
      throw new Error('No access token found. Please log in.');
    }

    try {
      const url = new URL(USER_API_URL);
      url.searchParams.append('org_id', orgId);
      url.searchParams.append('t', Date.now());

      console.debug('Fetching users with URL:', url.toString());
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-access-tokens': token,
        },
      });

      if (response.status === 401) {
        console.debug('Received 401 for getUsers, attempting token refresh');
        try {
          const retryResponse = await refreshTokenAndRetry(url, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'x-access-tokens': token,
            },
          });
          const data = await retryResponse.json();
          console.debug('Users fetched after token refresh:', data);
          return this.processUserData(data, orgId);
        } catch (refreshError) {
          console.error('Token refresh failed for getUsers:', refreshError);
          localStorage.clear();
          window.location.href = '/login';
          throw refreshError;
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to fetch users:', { status: response.status, errorData });
        throw new Error(`Failed to fetch users: ${errorData.message || response.statusText}`);
      }

      const data = await response.json();
      console.debug('Raw API response for getUsers:', data);
      return this.processUserData(data, orgId);
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  async processUserData(data, orgId) {
    console.debug('Processing user data for org_id:', orgId, 'Data:', data);
    const usersWithIds = data.map((user) => ({
      _id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      first_name: user.first_name,
      last_name: user.last_name,
      org_id: user.org_id || orgId,
      branch: user.branch || null,
    }));
    console.debug('Processed users:', usersWithIds);
    return usersWithIds;
  },

  async getUser(id, orgId) {
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.error('No access token found for getUser');
      throw new Error('No access token found. Please log in.');
    }

    try {
      const url = new URL(`${USER_API_URL}/profile`);
      url.searchParams.append('user_id', id);
      url.searchParams.append('org_id', orgId);
      url.searchParams.append('t', Date.now());

      console.debug('Fetching user with URL:', url.toString());
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-access-tokens': token,
        },
      });

      if (response.status === 401) {
        console.debug('Received 401 for getUser, attempting token refresh');
        try {
          return await refreshTokenAndRetry(url, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'x-access-tokens': token,
            },
          }).then((res) => res.json());
        } catch (refreshError) {
          console.error('Token refresh failed for getUser:', refreshError);
          localStorage.clear();
          window.location.href = '/login';
          throw refreshError;
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to fetch user:', { status: response.status, errorData });
        throw new Error(`Failed to fetch user: ${errorData.message || response.statusText}`);
      }

      const data = await response.json();
      console.debug('User fetched:', data);
      return data;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  },

  async registerUser(userData) {
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.error('No access token found for registerUser');
      throw new Error('No access token found. Please log in.');
    }

    if (
      !userData.get('email') ||
      !userData.get('first_name') ||
      !userData.get('last_name') ||
      !userData.get('password')
    ) {
      console.error('Missing required fields for registerUser:', userData);
      throw new Error('Missing required fields: email, first_name, last_name, and password are required');
    }

    try {
      const formDataEntries = {};
      for (const [key, value] of userData.entries()) {
        formDataEntries[key] = value instanceof File ? value.name : value;
      }
      console.log('FormData being sent for registration:', formDataEntries);

      const url = new URL(`${AUTH_API_URL}/register`);
      url.searchParams.append('t', Date.now());

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'x-access-tokens': token,
        },
        body: userData,
      });

      if (response.status === 401) {
        console.debug('Received 401 for registerUser, attempting token refresh');
        try {
          return await refreshTokenAndRetry(url, {
            method: 'POST',
            headers: {
              'x-access-tokens': token,
            },
            body: userData,
          }).then((res) => res.json());
        } catch (refreshError) {
          console.error('Token refresh failed for registerUser:', refreshError);
          localStorage.clear();
          window.location.href = '/login';
          throw refreshError;
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to register user:', { status: response.status, errorData });
        throw new Error(`Failed to register user: ${errorData.message || response.statusText}`);
      }

      const data = await response.json();
      console.debug('User registered:', data);
      return data._id || data.id;
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  },

  async updateUser(id, userData, orgId) {
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.error('No access token found for updateUser');
      throw new Error('No access token found. Please log in.');
    }

    if (
      !userData.get('email') ||
      !userData.get('first_name') ||
      !userData.get('last_name')
    ) {
      console.error('Missing required fields for updateUser:', userData);
      throw new Error('Missing required fields: email, first_name, and last_name are required');
    }

    try {
      const formDataEntries = {};
      for (const [key, value] of userData.entries()) {
        formDataEntries[key] = value instanceof File ? value.name : value;
      }
      console.log('FormData being sent for update:', formDataEntries);

      const url = new URL(`${USER_API_URL}/${id}`);
      url.searchParams.append('org_id', orgId);
      url.searchParams.append('t', Date.now());

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'x-access-tokens': token,
        },
        body: userData,
      });

      if (response.status === 401) {
        console.debug('Received 401 for updateUser, attempting token refresh');
        try {
          return await refreshTokenAndRetry(url, {
            method: 'PUT',
            headers: {
              'x-access-tokens': token,
            },
            body: userData,
          }).then((res) => res.json());
        } catch (refreshError) {
          console.error('Token refresh failed for updateUser:', refreshError);
          localStorage.clear();
          window.location.href = '/login';
          throw refreshError;
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to update user:', { status: response.status, errorData });
        throw new Error(`Failed to update user: ${errorData.message || response.statusText}`);
      }

      const data = await response.json();
      console.debug('User updated:', data);
      return data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  async deleteUser(id, orgId) {
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.error('No access token found for deleteUser');
      throw new Error('No access token found. Please log in.');
    }

    try {
      const url = new URL(`${USER_API_URL}/${id}`);
      url.searchParams.append('org_id', orgId);
      url.searchParams.append('t', Date.now());

      console.debug('Deleting user with URL:', url.toString());
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-access-tokens': token,
        },
      });

      if (response.status === 401) {
        console.debug('Received 401 for deleteUser, attempting token refresh');
        try {
          await refreshTokenAndRetry(url, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'x-access-tokens': token,
            },
          });
          console.debug('User deleted after token refresh');
          return;
        } catch (refreshError) {
          console.error('Token refresh failed for deleteUser:', refreshError);
          localStorage.clear();
          window.location.href = '/login';
          throw refreshError;
        }
      }

      if (!response.ok && response.status !== 204) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to delete user:', { status: response.status, errorData });
        throw new Error(`Failed to delete user: ${errorData.message || response.statusText}`);
      }
      console.debug('User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  async getOtp(email, orgId) {
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.error('No access token found for getOtp');
      throw new Error('No access token found. Please log in.');
    }

    try {
      const url = new URL(`${USER_API_URL}/get_otp`);
      url.searchParams.append('org_id', orgId);
      url.searchParams.append('t', Date.now());

      console.debug('Fetching OTP with URL:', url.toString());
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-access-tokens': token,
        },
        body: JSON.stringify({ email }),
      });

      if (response.status === 401) {
        console.debug('Received 401 for getOtp, attempting token refresh');
        try {
          return await refreshTokenAndRetry(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-access-tokens': token,
            },
            body: JSON.stringify({ email }),
          }).then((res) => res.json());
        } catch (refreshError) {
          console.error('Token refresh failed for getOtp:', refreshError);
          localStorage.clear();
          window.location.href = '/login';
          throw refreshError;
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to fetch OTP:', { status: response.status, errorData });
        throw new Error(`Failed to fetch OTP: ${errorData.message || response.statusText}`);
      }

      const data = await response.json();
      console.debug('OTP fetched:', data);
      return data;
    } catch (error) {
      console.error('Error fetching OTP:', error);
      throw error;
    }
  },

  async activateUser({ email, otp }, orgId) {
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.error('No access token found for activateUser');
      throw new Error('No access token found. Please log in.');
    }

    try {
      const url = new URL(`${AUTH_API_URL}/activate_account`);
      url.searchParams.append('org_id', orgId);
      url.searchParams.append('t', Date.now());

      console.debug('Activating user with URL:', url.toString());
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-access-tokens': token,
        },
        body: JSON.stringify({ email, otp }),
      });

      if (response.status === 401) {
        console.debug('Received 401 for activateUser, attempting token refresh');
        try {
          return await refreshTokenAndRetry(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-access-tokens': token,
            },
            body: JSON.stringify({ email, otp }),
          }).then((res) => res.json());
        } catch (refreshError) {
          console.error('Token refresh failed for activateUser:', refreshError);
          localStorage.clear();
          window.location.href = '/login';
          throw refreshError;
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to activate user:', { status: response.status, errorData });
        throw new Error(`Failed to activate user: ${errorData.message || response.statusText}`);
      }

      const data = await response.json();
      console.debug('User activated:', data);
      return data;
    } catch (error) {
      console.error('Error activating user:', error);
      throw error;
    }
  },

  async getPrivileges() {
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.error('No access token found for getPrivileges');
      throw new Error('No access token found. Please log in.');
    }

    try {
      const url = new URL(PRIVILEGE_API_URL);
      url.searchParams.append('t', Date.now());

      console.debug('Fetching privileges with URL:', url.toString());
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-access-tokens': token,
        },
      });

      if (response.status === 401) {
        console.debug('Received 401 for getPrivileges, attempting token refresh');
        try {
          return await refreshTokenAndRetry(url, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'x-access-tokens': token,
            },
          }).then((res) => res.json());
        } catch (refreshError) {
          console.error('Token refresh failed for getPrivileges:', refreshError);
          localStorage.clear();
          window.location.href = '/login';
          throw refreshError;
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to fetch privileges:', { status: response.status, errorData });
        throw new Error(`Failed to fetch privileges: ${errorData.message || response.statusText}`);
      }

      const data = await response.json();
      console.debug('Privileges fetched:', data);
      return data;
    } catch (error) {
      console.error('Error fetching privileges:', error);
      throw error;
    }
  },

  async getRolesByUser(userId, orgId) {
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.error('No access token found for getRolesByUser');
      throw new Error('No access token found. Please log in.');
    }

    try {
      const url = new URL(ROLE_API_URL);
      url.searchParams.append('org_id', orgId);
      url.searchParams.append('t', Date.now());

      console.debug('Fetching roles with URL:', url.toString());
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-access-tokens': token,
        },
      });

      if (response.status === 401) {
        console.debug('Received 401 for getRolesByUser, attempting token refresh');
        try {
          return await refreshTokenAndRetry(url, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'x-access-tokens': token,
            },
          }).then((res) => res.json());
        } catch (refreshError) {
          console.error('Token refresh failed for getRolesByUser:', refreshError);
          localStorage.clear();
          window.location.href = '/login';
          throw refreshError;
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to fetch roles:', { status: response.status, errorData });
        throw new Error(`Failed to fetch roles: ${errorData.message || response.statusText}`);
      }

      const roles = await response.json();
      console.debug('Roles fetched for user:', userId, roles);
      return roles.filter((role) => role.user_id && role.user_id.toString() === userId);
    } catch (error) {
      console.error('Error fetching roles:', error);
      throw error;
    }
  },

  async createRole(roleData) {
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.error('No access token found for createRole');
      throw new Error('No access token found. Please log in.');
    }

    try {
      const url = new URL(ROLE_API_URL);
      url.searchParams.append('t', Date.now());

      console.debug('Creating role with data:', roleData);
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-access-tokens': token,
        },
        body: JSON.stringify({
          role_id: Math.floor(Math.random() * 1000000),
          user_id: roleData.user_id,
          privilege: roleData.privilege,
          org_id: roleData.org_id,
          created_by_user: roleData.created_by_user || roleData.user_id,
        }),
      });

      if (response.status === 401) {
        console.debug('Received 401 for createRole, attempting token refresh');
        try {
          return await refreshTokenAndRetry(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-access-tokens': token,
            },
            body: JSON.stringify({
              role_id: Math.floor(Math.random() * 1000000),
              user_id: roleData.user_id,
              privilege: roleData.privilege,
              org_id: roleData.org_id,
              created_by_user: roleData.created_by_user || roleData.user_id,
            }),
          }).then((res) => res.json());
        } catch (refreshError) {
          console.error('Token refresh failed for createRole:', refreshError);
          localStorage.clear();
          window.location.href = '/login';
          throw refreshError;
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to create role:', { status: response.status, errorData });
        throw new Error(`Failed to create role: ${errorData.message || response.statusText}`);
      }

      const data = await response.json();
      console.debug('Role created:', data);
      return data;
    } catch (error) {
      console.error('Error creating role:', error);
      throw error;
    }
  },

  async updateUserRoles(userId, privilegeIds, orgId) {
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.error('No access token found for updateUserRoles');
      throw new Error('No access token found. Please log in.');
    }

    try {
      const existingRoles = await this.getRolesByUser(userId, orgId);
      const existingPrivilegeIds = existingRoles.map((role) => role.privilege);

      for (const role of existingRoles) {
        if (!privilegeIds.includes(role.privilege)) {
          const url = new URL(`${ROLE_API_URL}/${role._id}`);
          url.searchParams.append('org_id', orgId);
          url.searchParams.append('t', Date.now());

          console.debug('Deleting role with URL:', url.toString());
          const response = await fetch(url, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'x-access-tokens': token,
            },
          });

          if (response.status === 401) {
            console.debug('Received 401 for role deletion, attempting token refresh');
            await refreshTokenAndRetry(url, {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json',
                'x-access-tokens': token,
              },
            });
          }

          if (!response.ok && response.status !== 204) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Failed to delete role:', { status: response.status, errorData });
            throw new Error(`Failed to delete role: ${errorData.message || response.statusText}`);
          }
        }
      }

      for (const privilegeId of privilegeIds) {
        if (!existingPrivilegeIds.includes(privilegeId)) {
          await this.createRole({
            user_id: userId,
            privilege: privilegeId,
            org_id: orgId,
          });
        }
      }
      console.debug('User roles updated successfully for user:', userId);
    } catch (error) {
      console.error('Error updating user roles:', error);
      throw error;
    }
  },

  async getUserProfile(userId) {
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.error('No access token found for getUserProfile');
      throw new Error('No access token found. Please log in.');
    }

    try {
      const url = new URL(PROFILE_API_URL);
      url.searchParams.append('user_id', userId);
      url.searchParams.append('t', Date.now());

      console.debug('Fetching user profile with URL:', url.toString());
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-access-tokens': token,
        },
      });

      if (response.status === 401) {
        console.debug('Received 401 for getUserProfile, attempting token refresh');
        try {
          return await refreshTokenAndRetry(url, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'x-access-tokens': token,
            },
          }).then((res) => res.json());
        } catch (refreshError) {
          console.error('Token refresh failed for getUserProfile:', refreshError);
          localStorage.clear();
          window.location.href = '/login';
          throw refreshError;
        }
      }

      if (response.status === 404) {
        console.debug('User profile not found for user_id:', userId);
        return { user_image: null };
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to fetch user profile:', { status: response.status, errorData });
        throw new Error(`Failed to fetch user profile: ${errorData.message || response.statusText}`);
      }

      const data = await response.json();
      console.debug('User profile fetched:', data);
      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  },

  async updateProfileImage(userId, imageFile) {
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.error('No access token found for updateProfileImage');
      throw new Error('No access token found. Please log in.');
    }

    if (!imageFile) {
      console.error('No image file provided for updateProfileImage');
      throw new Error('No image file provided');
    }

    const formData = new FormData();
    formData.append('user_image', imageFile);
    formData.append('user_id', userId);

    try {
      const url = new URL(PROFILE_API_URL);
      url.searchParams.append('t', Date.now());

      console.debug('Updating profile image for user_id:', userId);
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'x-access-tokens': token,
        },
        body: formData,
      });

      if (response.status === 401) {
        console.debug('Received 401 for updateProfileImage, attempting token refresh');
        try {
          return await refreshTokenAndRetry(url, {
            method: 'PATCH',
            headers: {
              'x-access-tokens': token,
            },
            body: formData,
          }).then((res) => res.json());
        } catch (refreshError) {
          console.error('Token refresh failed for updateProfileImage:', refreshError);
          localStorage.clear();
          window.location.href = '/login';
          throw refreshError;
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to update profile image:', { status: response.status, errorData });
        throw new Error(`Failed to update profile image: ${errorData.message || response.statusText}`);
      }

      const data = await response.json();
      console.debug('Profile image updated:', data);
      return data;
    } catch (error) {
      console.error('Error updating profile image:', error);
      throw error;
    }
  },

  async getUserUpdates(userId) {
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.error('No access token found for getUserUpdates');
      throw new Error('No access token found. Please log in.');
    }

    try {
      const url = new URL(`${UPDATE_API_URL}/user/${userId}`);
      url.searchParams.append('t', Date.now());

      console.debug('Fetching user updates with URL:', url.toString());
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-access-tokens': token,
        },
      });

      if (response.status === 401) {
        console.debug('Received 401 for getUserUpdates, attempting token refresh');
        try {
          return await refreshTokenAndRetry(url, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'x-access-tokens': token,
            },
          }).then((res) => res.json());
        } catch (refreshError) {
          console.error('Token refresh failed for getUserUpdates:', refreshError);
          localStorage.clear();
          window.location.href = '/login';
          throw refreshError;
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to fetch user updates:', { status: response.status, errorData });
        throw new Error(`Failed to fetch user updates: ${errorData.message || response.statusText}`);
      }

      const data = await response.json();
      console.debug('User updates fetched:', data);
      return data;
    } catch (error) {
      console.error('Error fetching user updates:', error);
      throw error;
    }
  },

  async resetUserPassword({ email, new_password }) {
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.error('No access token found for resetUserPassword');
      throw new Error('No access token found. Please log in.');
    }

    if (!email || !new_password) {
      console.error('Missing required fields for resetUserPassword:', { email, new_password });
      throw new Error('Email and new password are required');
    }

    try {
      const url = new URL(`${AUTH_API_URL}/reset_admin`);
      url.searchParams.append('t', Date.now());

      console.debug('Resetting user password with URL:', url.toString());
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-access-tokens': token,
        },
        body: JSON.stringify({ email, new_password }),
      });

      if (response.status === 401) {
        console.debug('Received 401 for resetUserPassword, attempting token refresh');
        try {
          return await refreshTokenAndRetry(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-access-tokens': token,
            },
            body: JSON.stringify({ email, new_password }),
          }).then((res) => res.json());
        } catch (refreshError) {
          console.error('Token refresh failed for resetUserPassword:', refreshError);
          localStorage.clear();
          window.location.href = '/login';
          throw refreshError;
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to reset user password:', { status: response.status, errorData });
        if (response.status === 403) {
          throw new Error('Unauthorized: Admin access required');
        } else if (response.status === 400) {
          throw new Error('New password must be at least 8 characters long');
        } else if (response.status === 404) {
          throw new Error('User with this email does not exist');
        } else {
          throw new Error(`Failed to reset user password: ${errorData.message || response.statusText}`);
        }
      }

      const data = await response.json();
      console.debug('User password reset:', data);
      return data;
    } catch (error) {
      console.error('Error resetting user password:', error);
      throw error;
    }
  },
};

export { usersManagementService };