// // const ROLE_API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/roles`;

// // // Helper function to check for access token
// // const checkToken = () => {
// //   const token = localStorage.getItem('access_token');
// //   if (!token) {
// //     throw new Error('No access token found. Please log in.');
// //   }
// //   return token;
// // };

// // // Helper function to handle HTTP response errors
// // const handleResponse = async (response) => {
// //   if (response.ok) {
// //     if (response.status === 204 || response.status === 201) {
// //       const text = await response.text();
// //       return text ? JSON.parse(text) : undefined;
// //     }
// //     return response.json();
// //   }

// //   const errorData = await response.json().catch(() => ({}));
// //   const errorMessage = errorData.message || errorData.error || 'No message';

// //   switch (response.status) {
// //     case 401:
// //       throw new Error('Unauthorized: Please log in again.');
// //     case 403:
// //       throw new Error('Forbidden: You lack the required permissions.');
// //     case 404:
// //       throw new Error(`Not Found: ${errorMessage}`);
// //     case 400:
// //       throw new Error(`Bad Request: ${errorMessage}`);
// //     default:
// //       throw new Error(`Failed: ${response.status} - ${errorMessage}`);
// //   }
// // };

// // // Helper function to handle token refresh
// // async function refreshTokenAndRetry(url, options) {
// //   const refreshToken = localStorage.getItem('refresh_token');
// //   if (!refreshToken) {
// //     throw new Error('No refresh token found');
// //   }

// //   const refreshResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/refresh`, {
// //     method: 'POST',
// //     headers: { 'Content-Type': 'application/json' },
// //     body: JSON.stringify({ refresh_token: refreshToken }),
// //   });

// //   if (!refreshResponse.ok) {
// //     throw new Error('Failed to refresh token');
// //   }

// //   const { access_token } = await refreshResponse.json();
// //   localStorage.setItem('access_token', access_token);
// //   options.headers['x-access-tokens'] = access_token;

// //   return fetch(url, options);
// // }

// // const roleService = {
// //   async getRoles(orgId) {
// //     const token = checkToken();

// //     try {
// //       const url = new URL(ROLE_API_URL);
// //       url.searchParams.append('org_id', orgId);

// //       const response = await fetch(url, {
// //         method: 'GET',
// //         headers: {
// //           'Content-Type': 'application/json',
// //           'x-access-tokens': token,
// //         },
// //       });

// //       if (response.status === 401) {
// //         try {
// //           return await refreshTokenAndRetry(url, {
// //             method: 'GET',
// //             headers: {
// //               'Content-Type': 'application/json',
// //               'x-access-tokens': token,
// //             },
// //           }).then((res) => res.json());
// //         } catch (refreshError) {
// //           localStorage.clear();
// //           window.location.href = '/login';
// //           throw refreshError;
// //         }
// //       }

// //       return await handleResponse(response);
// //     } catch (error) {
// //       console.error('Error fetching roles:', error);
// //       throw error;
// //     }
// //   },

// //   async getRole(id, orgId) {
// //     const token = checkToken();

// //     try {
// //       const url = new URL(`${ROLE_API_URL}/${id}`);
// //       url.searchParams.append('org_id', orgId);

// //       const response = await fetch(url, {
// //         method: 'GET',
// //         headers: {
// //           'Content-Type': 'application/json',
// //           'x-access-tokens': token,
// //         },
// //       });

// //       if (response.status === 401) {
// //         try {
// //           return await refreshTokenAndRetry(url, {
// //             method: 'GET',
// //             headers: {
// //               'Content-Type': 'application/json',
// //               'x-access-tokens': token,
// //             },
// //           }).then((res) => res.json());
// //         } catch (refreshError) {
// //           localStorage.clear();
// //           window.location.href = '/login';
// //           throw refreshError;
// //         }
// //       }

// //       return await handleResponse(response);
// //     } catch (error) {
// //       console.error('Error fetching role:', error);
// //       throw error;
// //     }
// //   },

// //   async createRole(data) {
// //     const token = checkToken();

// //     try {
// //       const response = await fetch(ROLE_API_URL, {
// //         method: 'POST',
// //         headers: {
// //           'Content-Type': 'application/json',
// //           'x-access-tokens': token,
// //         },
// //         body: JSON.stringify({
// //           ...data,
// //           role_id: data.role_id || Math.floor(Math.random() * 1000000),
// //         }),
// //       });

// //       if (response.status === 401) {
// //         try {
// //           return await refreshTokenAndRetry(ROLE_API_URL, {
// //             method: 'POST',
// //             headers: {
// //               'Content-Type': 'application/json',
// //               'x-access-tokens': token,
// //             },
// //             body: JSON.stringify({
// //               ...data,
// //               role_id: data.role_id || Math.floor(Math.random() * 1000000),
// //             }),
// //           }).then((res) => res.json());
// //         } catch (refreshError) {
// //           localStorage.clear();
// //           window.location.href = '/login';
// //           throw refreshError;
// //         }
// //       }

// //       return await handleResponse(response);
// //     } catch (error) {
// //       console.error('Error creating role:', error);
// //       throw error;
// //     }
// //   },

// //   async createRolesBulk(data) {
// //     const token = checkToken();

// //     try {
// //       const { user_id, privilege_ids, org_id, created_by_user } = data;
// //       const rolePromises = privilege_ids.map((privilege_id) =>
// //         this.createRole({
// //           user_id,
// //           privilege: privilege_id,
// //           org_id,
// //           created_by_user,
// //         })
// //       );
// //       await Promise.all(rolePromises);
// //     } catch (error) {
// //       console.error('Error creating roles in bulk:', error);
// //       throw error;
// //     }
// //   },

// //   async updateRole(id, data, orgId) {
// //     const token = checkToken();

// //     try {
// //       const url = new URL(`${ROLE_API_URL}/${id}`);
// //       url.searchParams.append('org_id', orgId);

// //       const response = await fetch(url, {
// //         method: 'PUT',
// //         headers: {
// //           'Content-Type': 'application/json',
// //           'x-access-tokens': token,
// //         },
// //         body: JSON.stringify(data),
// //       });

// //       if (response.status === 401) {
// //         try {
// //           return await refreshTokenAndRetry(url, {
// //             method: 'PUT',
// //             headers: {
// //               'Content-Type': 'application/json',
// //               'x-access-tokens': token,
// //             },
// //             body: JSON.stringify(data),
// //           }).then((res) => res.json());
// //         } catch (refreshError) {
// //           localStorage.clear();
// //           window.location.href = '/login';
// //           throw refreshError;
// //         }
// //       }

// //       return await handleResponse(response);
// //     } catch (error) {
// //       console.error('Error updating role:', error);
// //       throw error;
// //     }
// //   },

// //   async updateUserRoles(userId, data) {
// //     const token = checkToken();

// //     try {
// //       const { user_id, privilege_ids, org_id } = data;
// //       // Fetch existing roles for the user
// //       const existingRoles = await this.getRoles(org_id);
// //       const userRoles = existingRoles.filter((role) => role.user_id === userId);

// //       // Delete roles that are no longer needed
// //       const deletePromises = userRoles
// //         .filter((role) => !privilege_ids.includes(role.privilege))
// //         .map((role) => this.deleteRole(role._id, org_id));
// //       await Promise.all(deletePromises);

// //       // Create new roles for new privileges
// //       const createPromises = privilege_ids
// //         .filter((privilege_id) => !userRoles.some((role) => role.privilege === privilege_id))
// //         .map((privilege_id) =>
// //           this.createRole({
// //             user_id,
// //             privilege: privilege_id,
// //             org_id,
// //             created_by_user: user_id,
// //           })
// //         );
// //       await Promise.all(createPromises);
// //     } catch (error) {
// //       console.error('Error updating user roles:', error);
// //       throw error;
// //     }
// //   },

// //   async deleteRole(id, orgId) {
// //     const token = checkToken();

// //     try {
// //       const url = new URL(`${ROLE_API_URL}/${id}`);
// //       url.searchParams.append('org_id', orgId);

// //       const response = await fetch(url, {
// //         method: 'DELETE',
// //         headers: {
// //           'Content-Type': 'application/json',
// //           'x-access-tokens': token,
// //         },
// //       });

// //       if (response.status === 401) {
// //         try {
// //           await refreshTokenAndRetry(url, {
// //             method: 'DELETE',
// //             headers: {
// //               'Content-Type': 'application/json',
// //               'x-access-tokens': token,
// //             },
// //           });
// //           return;
// //         } catch (refreshError) {
// //           localStorage.clear();
// //           window.location.href = '/login';
// //           throw refreshError;
// //         }
// //       }

// //       await handleResponse(response);
// //     } catch (error) {
// //       console.error('Error deleting role:', error);
// //       throw error;
// //     }
// //   },

// //   async deleteRolesByUser(userId, orgId) {
// //     const token = checkToken();

// //     try {
// //       const roles = await this.getRoles(orgId);
// //       const userRoles = roles.filter((role) => role.user_id === userId);
// //       const deletePromises = userRoles.map((role) => this.deleteRole(role._id, orgId));
// //       await Promise.all(deletePromises);
// //     } catch (error) {
// //       console.error('Error deleting roles for user:', error);
// //       throw error;
// //     }
// //   },
// // };

// // export { roleService };


// const ROLE_API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/roles`;

// // Helper function to check for access token
// const checkToken = () => {
//   const token = localStorage.getItem('access_token');
//   if (!token) {
//     throw new Error('No access token found. Please log in.');
//   }
//   return token;
// };

// // Helper function to handle HTTP response errors
// const handleResponse = async (response) => {
//   if (response.ok) {
//     if (response.status === 204 || response.status === 201) {
//       const text = await response.text();
//       return text ? JSON.parse(text) : undefined;
//     }
//     return response.json();
//   }

//   const errorData = await response.json().catch(() => ({}));
//   const errorMessage = errorData.message || errorData.error || 'No message';

//   switch (response.status) {
//     case 401:
//       throw new Error('Unauthorized: Please log in again.');
//     case 403:
//       throw new Error('Forbidden: You lack the required permissions.');
//     case 404:
//       throw new Error(`Not Found: ${errorMessage}`);
//     case 400:
//       throw new Error(`Bad Request: ${errorMessage}`);
//     default:
//       throw new Error(`Failed: ${response.status} - ${errorMessage}`);
//   }
// };

// // Helper function to handle token refresh
// async function refreshTokenAndRetry(url, options) {
//   const refreshToken = localStorage.getItem('refresh_token');
//   if (!refreshToken) {
//     throw new Error('No refresh token found');
//   }

//   const refreshResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/refresh`, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ refresh_token: refreshToken }),
//   });

//   if (!refreshResponse.ok) {
//     throw new Error('Failed to refresh token');
//   }

//   const { access_token } = await refreshResponse.json();
//   localStorage.setItem('access_token', access_token);
//   options.headers['x-access-tokens'] = access_token;

//   return fetch(url, options);
// }

// const roleService = {
//   async getRoles(orgId) {
//     const token = checkToken();

//     try {
//       const url = new URL(ROLE_API_URL);
//       url.searchParams.append('org_id', orgId);

//       const response = await fetch(url, {
//         method: 'GET',
//         headers: {
//           'Content-Type': 'application/json',
//           'x-access-tokens': token,
//         },
//       });

//       if (response.status === 401) {
//         try {
//           return await refreshTokenAndRetry(url, {
//             method: 'GET',
//             headers: {
//               'Content-Type': 'application/json',
//               'x-access-tokens': token,
//             },
//           }).then((res) => res.json());
//         } catch (refreshError) {
//           localStorage.clear();
//           window.location.href = '/login';
//           throw refreshError;
//         }
//       }

//       return await handleResponse(response);
//     } catch (error) {
//       console.error('Error fetching roles:', error);
//       throw error;
//     }
//   },

//   async getAdminRoles(orgId) {
//     const token = checkToken();

//     try {
//       const url = new URL(`${ROLE_API_URL}/admin`);
//       url.searchParams.append('org_id', orgId);

//       const response = await fetch(url, {
//         method: 'GET',
//         headers: {
//           'Content-Type': 'application/json',
//           'x-access-tokens': token,
//         },
//       });

//       if (response.status === 401) {
//         try {
//           return await refreshTokenAndRetry(url, {
//             method: 'GET',
//             headers: {
//               'Content-Type': 'application/json',
//               'x-access-tokens': token,
//             },
//           }).then((res) => res.json());
//         } catch (refreshError) {
//           localStorage.clear();
//           window.location.href = '/login';
//           throw refreshError;
//         }
//       }

//       return await handleResponse(response);
//     } catch (error) {
//       console.error('Error fetching admin roles:', error);
//       throw error;
//     }
//   },

//   async getRole(id, orgId) {
//     const token = checkToken();

//     try {
//       const url = new URL(`${ROLE_API_URL}/${id}`);
//       url.searchParams.append('org_id', orgId);

//       const response = await fetch(url, {
//         method: 'GET',
//         headers: {
//           'Content-Type': 'application/json',
//           'x-access-tokens': token,
//         },
//       });

//       if (response.status === 401) {
//         try {
//           return await refreshTokenAndRetry(url, {
//             method: 'GET',
//             headers: {
//               'Content-Type': 'application/json',
//               'x-access-tokens': token,
//             },
//           }).then((res) => res.json());
//         } catch (refreshError) {
//           localStorage.clear();
//           window.location.href = '/login';
//           throw refreshError;
//         }
//       }

//       return await handleResponse(response);
//     } catch (error) {
//       console.error('Error fetching role:', error);
//       throw error;
//     }
//   },

//   async createRole(data) {
//     const token = checkToken();

//     try {
//       const response = await fetch(ROLE_API_URL, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'x-access-tokens': token,
//         },
//         body: JSON.stringify({
//           ...data,
//           role_id: data.role_id || Math.floor(Math.random() * 1000000),
//         }),
//       });

//       if (response.status === 401) {
//         try {
//           return await refreshTokenAndRetry(ROLE_API_URL, {
//             method: 'POST',
//             headers: {
//               'Content-Type': 'application/json',
//               'x-access-tokens': token,
//             },
//             body: JSON.stringify({
//               ...data,
//               role_id: data.role_id || Math.floor(Math.random() * 1000000),
//             }),
//           }).then((res) => res.json());
//         } catch (refreshError) {
//           localStorage.clear();
//           window.location.href = '/login';
//           throw refreshError;
//         }
//       }

//       return await handleResponse(response);
//     } catch (error) {
//       console.error('Error creating role:', error);
//       throw error;
//     }
//   },

//   async createRolesBulk(data) {
//     const token = checkToken();

//     try {
//       const { user_id, privilege_ids, org_id, created_by_user } = data;
//       const rolePromises = privilege_ids.map((privilege_id) =>
//         this.createRole({
//           user_id,
//           privilege: privilege_id,
//           org_id,
//           created_by_user,
//         })
//       );
//       await Promise.all(rolePromises);
//     } catch (error) {
//       console.error('Error creating roles in bulk:', error);
//       throw error;
//     }
//   },

//   async updateRole(id, data, orgId) {
//     const token = checkToken();

//     try {
//       const url = new URL(`${ROLE_API_URL}/${id}`);
//       url.searchParams.append('org_id', orgId);

//       const response = await fetch(url, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//           'x-access-tokens': token,
//         },
//         body: JSON.stringify(data),
//       });

//       if (response.status === 401) {
//         try {
//           return await refreshTokenAndRetry(url, {
//             method: 'PUT',
//             headers: {
//               'Content-Type': 'application/json',
//               'x-access-tokens': token,
//             },
//             body: JSON.stringify(data),
//           }).then((res) => res.json());
//         } catch (refreshError) {
//           localStorage.clear();
//           window.location.href = '/login';
//           throw refreshError;
//         }
//       }

//       return await handleResponse(response);
//     } catch (error) {
//       console.error('Error updating role:', error);
//       throw error;
//     }
//   },

//   async updateUserRoles(userId, data) {
//     const token = checkToken();

//     try {
//       const { user_id, privilege_ids, org_id } = data;
//       // Fetch existing roles for the user
//       const existingRoles = await this.getRoles(org_id);
//       const userRoles = existingRoles.filter((role) => role.user_id === userId);

//       // Delete roles that are no longer needed
//       const deletePromises = userRoles
//         .filter((role) => !privilege_ids.includes(role.privilege))
//         .map((role) => this.deleteRole(role._id, org_id));
//       await Promise.all(deletePromises);

//       // Create new roles for new privileges
//       const createPromises = privilege_ids
//         .filter((privilege_id) => !userRoles.some((role) => role.privilege === privilege_id))
//         .map((privilege_id) =>
//           this.createRole({
//             user_id,
//             privilege: privilege_id,
//             org_id,
//             created_by_user: user_id,
//           })
//         );
//       await Promise.all(createPromises);
//     } catch (error) {
//       console.error('Error updating user roles:', error);
//       throw error;
//     }
//   },

//   async deleteRole(id, orgId) {
//     const token = checkToken();

//     try {
//       const url = new URL(`${ROLE_API_URL}/${id}`);
//       url.searchParams.append('org_id', orgId);

//       const response = await fetch(url, {
//         method: 'DELETE',
//         headers: {
//           'Content-Type': 'application/json',
//           'x-access-tokens': token,
//         },
//       });

//       if (response.status === 401) {
//         try {
//           await refreshTokenAndRetry(url, {
//             method: 'DELETE',
//             headers: {
//               'Content-Type': 'application/json',
//               'x-access-tokens': token,
//             },
//           });
//           return;
//         } catch (refreshError) {
//           localStorage.clear();
//           window.location.href = '/login';
//           throw refreshError;
//         }
//       }

//       await handleResponse(response);
//     } catch (error) {
//       console.error('Error deleting role:', error);
//       throw error;
//     }
//   },

//   async deleteRolesByUser(userId, orgId) {
//     const token = checkToken();

//     try {
//       const roles = await this.getRoles(orgId);
//       const userRoles = roles.filter((role) => role.user_id === userId);
//       const deletePromises = userRoles.map((role) => this.deleteRole(role._id, orgId));
//       await Promise.all(deletePromises);
//     } catch (error) {
//       console.error('Error deleting roles for user:', error);
//       throw error;
//     }
//   },
// };

// export { roleService };


// Working Friday 

const ROLE_API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/roles`;
const USER_API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/users`;
const PRIVILEGE_API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/privileges`;

// Helper function to check for access token
const checkToken = () => {
  const token = localStorage.getItem('access_token');
  if (!token) {
    throw new Error('No access token found. Please log in.');
  }
  return token;
};

// Helper function to handle HTTP response errors
const handleResponse = async (response) => {
  if (response.ok) {
    if (response.status === 204 || response.status === 201) {
      const text = await response.text();
      return text ? JSON.parse(text) : undefined;
    }
    return response.json();
  }

  const errorData = await response.json().catch(() => ({}));
  const errorMessage = errorData.message || errorData.error || 'No message';

  switch (response.status) {
    case 401:
      throw new Error('Unauthorized: Please log in again.');
    case 403:
      throw new Error('Forbidden: You lack the required permissions.');
    case 404:
      throw new Error(`Not Found: ${errorMessage}`);
    case 400:
      throw new Error(`Bad Request: ${errorMessage}`);
    default:
      throw new Error(`Failed: ${response.status} - ${errorMessage}`);
  }
};

// Helper function to handle token refresh
async function refreshTokenAndRetry(url, options) {
  const refreshToken = localStorage.getItem('refresh_token');
  if (!refreshToken) {
    throw new Error('No refresh token found');
  }

  const refreshResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!refreshResponse.ok) {
    throw new Error('Failed to refresh token');
  }

  const { access_token } = await refreshResponse.json();
  localStorage.setItem('access_token', access_token);
  options.headers['x-access-tokens'] = access_token;

  return fetch(url, options);
}

const roleService = {
  async getRoles(orgId) {
    const token = checkToken();

    try {
      const url = new URL(ROLE_API_URL);
      url.searchParams.append('org_id', orgId);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-access-tokens': token,
        },
      });

      if (response.status === 401) {
        try {
          return await refreshTokenAndRetry(url, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'x-access-tokens': token,
            },
          }).then((res) => res.json());
        } catch (refreshError) {
          localStorage.clear();
          window.location.href = '/login';
          throw refreshError;
        }
      }

      return await handleResponse(response);
    } catch (error) {
      console.error('Error fetching roles:', error);
      throw error;
    }
  },

  async getAdminRoles(orgId) {
    const token = checkToken();

    try {
      const url = new URL(`${ROLE_API_URL}/admin`);
      url.searchParams.append('org_id', orgId);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-access-tokens': token,
        },
      });

      if (response.status === 401) {
        try {
          return await refreshTokenAndRetry(url, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'x-access-tokens': token,
            },
          }).then((res) => res.json());
        } catch (refreshError) {
          localStorage.clear();
          window.location.href = '/login';
          throw refreshError;
        }
      }

      return await handleResponse(response);
    } catch (error) {
      console.error('Error fetching admin roles:', error);
      throw error;
    }
  },

  async createRolesBulk(data) {
    const token = checkToken();

    try {
      const { user_id, privilege_ids, org_id, created_by_user } = data;
      const rolePromises = privilege_ids.map((privilege_id) =>
        fetch(ROLE_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-access-tokens': token,
          },
          body: JSON.stringify({
            user_id,
            privilege: privilege_id,
            org_id,
            created_by_user,
            role_id: Math.floor(Math.random() * 1000000),
          }),
        }).then(async (response) => {
          if (response.status === 401) {
            try {
              return await refreshTokenAndRetry(ROLE_API_URL, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'x-access-tokens': token,
                },
                body: JSON.stringify({
                  user_id,
                  privilege: privilege_id,
                  org_id,
                  created_by_user,
                  role_id: Math.floor(Math.random() * 1000000),
                }),
              }).then((res) => res.json());
            } catch (refreshError) {
              localStorage.clear();
              window.location.href = '/login';
              throw refreshError;
            }
          }
          return await handleResponse(response);
        })
      );
      await Promise.all(rolePromises);
    } catch (error) {
      console.error('Error creating roles in bulk:', error);
      throw error;
    }
  },

  async updateUserRoles(userId, data) {
    const token = checkToken();

    try {
      const { user_id, privilege_ids, org_id } = data;
      // Fetch existing roles for the user
      const existingRoles = await this.getRoles(org_id);
      const userRoles = existingRoles.filter((role) => role.user_id === userId);

      // Delete roles that are no longer needed
      const deletePromises = userRoles
        .filter((role) => !privilege_ids.includes(role.privilege))
        .map((role) => {
          const url = new URL(`${ROLE_API_URL}/${role._id}`);
          url.searchParams.append('org_id', org_id);
          return fetch(url, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'x-access-tokens': token,
            },
          }).then(async (response) => {
            if (response.status === 401) {
              try {
                await refreshTokenAndRetry(url, {
                  method: 'DELETE',
                  headers: {
                    'Content-Type': 'application/json',
                    'x-access-tokens': token,
                  },
                });
              } catch (refreshError) {
                localStorage.clear();
                window.location.href = '/login';
                throw refreshError;
              }
            }
            await handleResponse(response);
          });
        });
      await Promise.all(deletePromises);

      // Create new roles for new privileges
      const createPromises = privilege_ids
        .filter((privilege_id) => !userRoles.some((role) => role.privilege === privilege_id))
        .map((privilege_id) =>
          fetch(ROLE_API_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-access-tokens': token,
            },
            body: JSON.stringify({
              user_id,
              privilege: privilege_id,
              org_id,
              created_by_user: user_id,
              role_id: Math.floor(Math.random() * 1000000),
            }),
          }).then(async (response) => {
            if (response.status === 401) {
              try {
                return await refreshTokenAndRetry(ROLE_API_URL, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'x-access-tokens': token,
                  },
                  body: JSON.stringify({
                    user_id,
                    privilege: privilege_id,
                    org_id,
                    created_by_user: user_id,
                    role_id: Math.floor(Math.random() * 1000000),
                  }),
                }).then((res) => res.json());
              } catch (refreshError) {
                localStorage.clear();
                window.location.href = '/login';
                throw refreshError;
              }
            }
            return await handleResponse(response);
          })
        );
      await Promise.all(createPromises);
    } catch (error) {
      console.error('Error updating user roles:', error);
      throw error;
    }
  },

  async deleteRolesByUser(userId, orgId) {
    const token = checkToken();

    try {
      const roles = await this.getRoles(orgId);
      const userRoles = roles.filter((role) => role.user_id === userId);
      const deletePromises = userRoles.map((role) => {
        const url = new URL(`${ROLE_API_URL}/${role._id}`);
        url.searchParams.append('org_id', orgId);
        return fetch(url, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'x-access-tokens': token,
          },
        }).then(async (response) => {
          if (response.status === 401) {
            try {
              await refreshTokenAndRetry(url, {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json',
                  'x-access-tokens': token,
                },
              });
            } catch (refreshError) {
              localStorage.clear();
              window.location.href = '/login';
              throw refreshError;
            }
          }
          await handleResponse(response);
        });
      });
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Error deleting roles for user:', error);
      throw error;
    }
  },

  async getUsers(orgId) {
    const token = checkToken();

    try {
      const url = new URL(USER_API_URL);
      url.searchParams.append('org_id', orgId);
      url.searchParams.append('t', Date.now());

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-access-tokens': token,
        },
      });

      if (response.status === 401) {
        try {
          return await refreshTokenAndRetry(url, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'x-access-tokens': token,
            },
          }).then((res) => res.json());
        } catch (refreshError) {
          localStorage.clear();
          window.location.href = '/login';
          throw refreshError;
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to fetch users: ${errorData.message || response.statusText}`);
      }

      const data = await response.json();
      return data.map((user) => ({
        _id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        first_name: user.first_name,
        last_name: user.last_name,
        org_id: user.org_id || orgId,
      }));
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  async getPrivileges() {
    const token = checkToken();

    try {
      const url = new URL(PRIVILEGE_API_URL);
      url.searchParams.append('t', Date.now());

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-access-tokens': token,
        },
      });

      if (response.status === 401) {
        try {
          return await refreshTokenAndRetry(url, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'x-access-tokens': token,
            },
          }).then((res) => res.json());
        } catch (refreshError) {
          localStorage.clear();
          window.location.href = '/login';
          throw refreshError;
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to fetch privileges: ${errorData.message || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching privileges:', error);
      throw error;
    }
  },
};

export { roleService };