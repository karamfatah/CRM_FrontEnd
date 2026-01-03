// // Path: src/lib/sectionQaService.js
// // Description: Service for SectionQa API calls, including token refresh logic.

// const API_URL = `${import.meta.env.VITE_API_BASE_URL}/section_qa`;
// Testr
// // Helper function to handle token refresh logic
// async function refreshTokenAndRetry(url, options) {
//     const refreshToken = localStorage.getItem('refresh_token');
//     const refreshResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/refresh`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ refresh_token: refreshToken }),
//     });

//     if (!refreshResponse.ok) {
//         throw new Error('Failed to refresh token');
//     }

//     const { access_token, refresh_token } = await refreshResponse.json();
//     localStorage.setItem('access_token', access_token);
//     localStorage.setItem('refresh_token', refresh_token);

//     // Update the headers with the new token and retry the request
//     options.headers['x-access-tokens'] = access_token;
//     return fetch(url, options);
// }

// const sectionQaService = {
//     async getSections(org_id, locations_qa_id = null) {
//         let token = localStorage.getItem('access_token');
//         console.log('Sending request with token:', token || 'No token');

//         // Validate org_id
//         if (!org_id) {
//             throw new Error('org_id is required');
//         }

//         const url = new URL(API_URL);
//         url.searchParams.append('org_id', org_id);

//         // Append locations_qa_id if provided
//         if (locations_qa_id !== null) {
//             if (!Number.isInteger(Number(locations_qa_id))) {
//                 throw new Error('locations_qa_id must be an integer');
//             }
//             url.searchParams.append('locations_qa_id', locations_qa_id);
//         }

//         const options = {
//             method: 'GET',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'x-access-tokens': token,
//             },
//         };

//         let response = await fetch(url, options);

//         if (response.status === 401) {
//             try {
//                 response = await refreshTokenAndRetry(url, options);
//             } catch (refreshError) {
//                 localStorage.clear();
//                 window.location.href = '/login';
//                 throw refreshError;
//             }
//         }

//         if (!response.ok) {
//             const errorData = await response.json().catch(() => ({}));
//             console.error('Fetch failed:', {
//                 status: response.status,
//                 statusText: response.statusText,
//                 body: await response.text().catch(() => 'No response body'),
//                 errorData,
//             });
//             throw new Error(
//                 `Failed to fetch sections: ${response.status} - ${errorData.message || errorData.error || response.statusText || 'Unknown error'}`
//             );
//         }

//         const data = await response.json();
//         console.log('Raw sections response:', data);
//         // Map backend fields to frontend expected fields
//         const mappedData = data.map(sec => ({
//             section_qa_id: sec.id || sec.section_qa_id,
//             section_ar: sec.name_ar || sec.section_ar,
//             section_en: sec.name_en || sec.section_en,
//             locations_qa_id: sec.locations_qa_id,
//             org_id: sec.org_id,
//         }));
//         console.log('Mapped sections:', mappedData);
//         return mappedData;
//     },

//     async getSection(id, org_id) {
//         let token = localStorage.getItem('access_token');
//         console.log('Sending request with token:', token || 'No token');

//         if (!org_id) {
//             throw new Error('org_id is required');
//         }
//         if (!id) {
//             throw new Error('id is required');
//         }

//         const url = new URL(`${API_URL}/${id}`);
//         url.searchParams.append('org_id', org_id);

//         const options = {
//             method: 'GET',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'x-access-tokens': token,
//             },
//         };

//         let response = await fetch(url, options);

//         if (response.status === 401) {
//             try {
//                 response = await refreshTokenAndRetry(url, options);
//             } catch (refreshError) {
//                 localStorage.clear();
//                 window.location.href = '/login';
//                 throw refreshError;
//             }
//         }

//         if (!response.ok) {
//             const errorData = await response.json().catch(() => ({}));
//             console.error('Fetch failed:', {
//                 status: response.status,
//                 statusText: response.statusText,
//                 body: await response.text().catch(() => 'No response body'),
//                 errorData,
//             });
//             throw new Error(
//                 `Failed to fetch section: ${response.status} - ${errorData.message || errorData.error || response.statusText || 'Unknown error'}`
//             );
//         }

//         const data = await response.json();
//         console.log('Raw section response:', data);
//         const mappedData = {
//             section_qa_id: data.id || data.section_qa_id,
//             section_ar: data.name_ar || data.section_ar,
//             section_en: data.name_en || data.section_en,
//             locations_qa_id: data.locations_qa_id,
//             org_id: data.org_id,
//         };
//         console.log('Mapped section:', mappedData);
//         return mappedData;
//     },

//     async createSection(data, org_id) {
//         let token = localStorage.getItem('access_token');
//         console.log('Sending request with token:', token || 'No token');

//         if (!org_id) {
//             throw new Error('org_id is required');
//         }
//         if (!data || typeof data !== 'object') {
//             throw new Error('data is required and must be an object');
//         }

//         const url = new URL(API_URL);
//         url.searchParams.append('org_id', org_id);

//         const options = {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'x-access-tokens': token,
//             },
//             body: JSON.stringify(data),
//         };

//         let response = await fetch(url, options);

//         if (response.status === 401) {
//             try {
//                 response = await refreshTokenAndRetry(url, options);
//             } catch (refreshError) {
//                 localStorage.clear();
//                 window.location.href = '/login';
//                 throw refreshError;
//             }
//         }

//         if (!response.ok) {
//             const errorData = await response.json().catch(() => ({}));
//             console.error('Fetch failed:', {
//                 status: response.status,
//                 statusText: response.statusText,
//                 body: await response.text().catch(() => 'No response body'),
//                 errorData,
//             });
//             throw new Error(
//                 `Failed to create section: ${response.status} - ${errorData.message || errorData.error || response.statusText || 'Unknown error'}`
//             );
//         }

//         const createdData = await response.json();
//         return {
//             section_qa_id: createdData.id || createdData.section_qa_id,
//             section_ar: createdData.name_ar || createdData.section_ar,
//             section_en: createdData.name_en || createdData.section_en,
//             locations_qa_id: createdData.locations_qa_id,
//             org_id: createdData.org_id,
//         };
//     },

//     async updateSection(id, data, org_id) {
//         let token = localStorage.getItem('access_token');
//         console.log('Sending request with token:', token || 'No token');

//         if (!org_id) {
//             throw new Error('org_id is required');
//         }
//         if (!id) {
//             throw new Error('id is required');
//         }
//         if (!data || typeof data !== 'object') {
//             throw new Error('data is required and must be an object');
//         }

//         const url = new URL(`${API_URL}/${id}`);
//         url.searchParams.append('org_id', org_id);

//         const options = {
//             method: 'PUT',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'x-access-tokens': token,
//             },
//             body: JSON.stringify(data),
//         };

//         let response = await fetch(url, options);

//         if (response.status === 401) {
//             try {
//                 response = await refreshTokenAndRetry(url, options);
//             } catch (refreshError) {
//                 localStorage.clear();
//                 window.location.href = '/login';
//                 throw refreshError;
//             }
//         }

//         if (!response.ok) {
//             const errorData = await response.json().catch(() => ({}));
//             console.error('Fetch failed:', {
//                 status: response.status,
//                 statusText: response.statusText,
//                 body: await response.text().catch(() => 'No response body'),
//                 errorData,
//             });
//             throw new Error(
//                 `Failed to update section: ${response.status} - ${errorData.message || errorData.error || response.statusText || 'Unknown error'}`
//             );
//         }

//         const updatedData = await response.json();
//         return {
//             section_qa_id: updatedData.id || updatedData.section_qa_id,
//             section_ar: updatedData.name_ar || updatedData.section_ar,
//             section_en: updatedData.name_en || updatedData.section_en,
//             locations_qa_id: updatedData.locations_qa_id,
//             org_id: updatedData.org_id,
//         };
//     },

//     async deleteSection(id, org_id) {
//         let token = localStorage.getItem('access_token');
//         console.log('Sending request with token:', token || 'No token');

//         if (!org_id) {
//             throw new Error('org_id is required');
//         }
//         if (!id) {
//             throw new Error('id is required');
//         }

//         const url = new URL(`${API_URL}/${id}`);
//         url.searchParams.append('org_id', org_id);

//         const options = {
//             method: 'DELETE',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'x-access-tokens': token,
//             },
//         };

//         let response = await fetch(url, options);

//         if (response.status === 401) {
//             try {
//                 response = await refreshTokenAndRetry(url, options);
//             } catch (refreshError) {
//                 localStorage.clear();
//                 window.location.href = '/login';
//                 throw refreshError;
//             }
//         }

//         if (!response.ok) {
//             const errorData = await response.json().catch(() => ({}));
//             console.error('Fetch failed:', {
//                 status: response.status,
//                 statusText: response.statusText,
//                 body: await response.text().catch(() => 'No response body'),
//                 errorData,
//             });
//             throw new Error(
//                 `Failed to delete section: ${response.status} - ${errorData.message || errorData.error || response.statusText || 'Unknown error'}`
//             );
//         }

//         return response.json();
//     },
// };

// export { sectionQaService };
// Path: src/lib/sectionQaService.js
// Description: Service for SectionQa API calls, including token refresh logic.

// const API_URL = `${import.meta.env.VITE_API_BASE_URL}/section_qa`;

// // Helper function to handle token refresh logic
// async function refreshTokenAndRetry(url, options) {
//     const refreshToken = localStorage.getItem('refresh_token');
//     const refreshResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/refresh`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ refresh_token: refreshToken }),
//     });

//     if (!refreshResponse.ok) {
//         throw new Error('Failed to refresh token');
//     }

//     const { access_token, refresh_token } = await refreshResponse.json();
//     localStorage.setItem('access_token', access_token);
//     localStorage.setItem('refresh_token', refresh_token);

//     // Update the headers with the new token and retry the request
//     options.headers['x-access-tokens'] = access_token;
//     return fetch(url, options);
// }

// const sectionQaService = {
//     async getSections(org_id, locations_qa_id = null) {
//         let token = localStorage.getItem('access_token');
//         console.log('Sending request with token:', token || 'No token');

//         // Validate org_id
//         if (!org_id) {
//             throw new Error('org_id is required');
//         }

//         const url = new URL(API_URL);
//         url.searchParams.append('org_id', org_id);

//         // Append locations_qa_id if provided
//         if (locations_qa_id !== null) {
//             if (!Number.isInteger(Number(locations_qa_id))) {
//                 throw new Error('locations_qa_id must be an integer');
//             }
//             url.searchParams.append('locations_qa_id', locations_qa_id);
//         }

//         const options = {
//             method: 'GET',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'x-access-tokens': token,
//             },
//         };

//         let response = await fetch(url, options);

//         if (response.status === 401) {
//             try {
//                 response = await refreshTokenAndRetry(url, options);
//             } catch (refreshError) {
//                 localStorage.clear();
//                 window.location.href = '/login';
//                 throw refreshError;
//             }
//         }

//         if (!response.ok) {
//             const errorData = await response.json().catch(() => ({}));
//             console.error('Fetch failed:', {
//                 status: response.status,
//                 statusText: response.statusText,
//                 body: await response.text().catch(() => 'No response body'),
//                 errorData,
//             });
//             throw new Error(
//                 `Failed to fetch sections: ${response.status} - ${errorData.message || errorData.error || response.statusText || 'Unknown error'}`
//             );
//         }

//         const data = await response.json();
//         console.log('Raw sections response:', data);
//         // Map backend fields to frontend expected fields
//         const mappedData = data.map(sec => ({
//             section_qa_id: sec.id || sec.section_qa_id,
//             section_ar: sec.name_ar || sec.section_ar,
//             section_en: sec.name_en || sec.section_en,
//             locations_qa_id: sec.locations_qa_id || locations_qa_id, // Use the passed locations_qa_id if not in response
//             org_id: sec.org_id || org_id, // Use the passed org_id if not in response
//         }));
//         console.log('Mapped sections:', mappedData);
//         return mappedData;
//     },

//     async getSection(id, org_id) {
//         let token = localStorage.getItem('access_token');
//         console.log('Sending request with token:', token || 'No token');

//         if (!org_id) {
//             throw new Error('org_id is required');
//         }
//         if (!id) {
//             throw new Error('id is required');
//         }

//         const url = new URL(`${API_URL}/${id}`);
//         url.searchParams.append('org_id', org_id);

//         const options = {
//             method: 'GET',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'x-access-tokens': token,
//             },
//         };

//         let response = await fetch(url, options);

//         if (response.status === 401) {
//             try {
//                 response = await refreshTokenAndRetry(url, options);
//             } catch (refreshError) {
//                 localStorage.clear();
//                 window.location.href = '/login';
//                 throw refreshError;
//             }
//         }

//         if (!response.ok) {
//             const errorData = await response.json().catch(() => ({}));
//             console.error('Fetch failed:', {
//                 status: response.status,
//                 statusText: response.statusText,
//                 body: await response.text().catch(() => 'No response body'),
//                 errorData,
//             });
//             throw new Error(
//                 `Failed to fetch section: ${response.status} - ${errorData.message || errorData.error || response.statusText || 'Unknown error'}`
//             );
//         }

//         const data = await response.json();
//         console.log('Raw section response:', data);
//         const mappedData = {
//             section_qa_id: data.id || data.section_qa_id,
//             section_ar: data.name_ar || data.section_ar,
//             section_en: data.name_en || data.section_en,
//             locations_qa_id: data.locations_qa_id,
//             org_id: data.org_id || org_id, // Use the passed org_id if not in response
//         };
//         console.log('Mapped section:', mappedData);
//         return mappedData;
//     },

//     async createSection(data, org_id) {
//         let token = localStorage.getItem('access_token');
//         console.log('Sending request with token:', token || 'No token');

//         if (!org_id) {
//             throw new Error('org_id is required');
//         }
//         if (!data || typeof data !== 'object') {
//             throw new Error('data is required and must be an object');
//         }

//         const url = new URL(API_URL);
//         url.searchParams.append('org_id', org_id);

//         // Include org_id in the request body as required by the backend
//         const requestBody = {
//             ...data,
//             org_id: org_id
//         };

//         const options = {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'x-access-tokens': token,
//             },
//             body: JSON.stringify(requestBody),
//         };

//         let response = await fetch(url, options);

//         if (response.status === 401) {
//             try {
//                 response = await refreshTokenAndRetry(url, options);
//             } catch (refreshError) {
//                 localStorage.clear();
//                 window.location.href = '/login';
//                 throw refreshError;
//             }
//         }

//         if (!response.ok) {
//             const errorData = await response.json().catch(() => ({}));
//             console.error('Fetch failed:', {
//                 status: response.status,
//                 statusText: response.statusText,
//                 body: await response.text().catch(() => 'No response body'),
//                 errorData,
//             });
//             throw new Error(
//                 `Failed to create section: ${response.status} - ${errorData.message || errorData.error || response.statusText || 'Unknown error'}`
//             );
//         }

//         const createdData = await response.json();
//         return {
//             section_qa_id: createdData.id || createdData.section_qa_id,
//             section_ar: createdData.name_ar || createdData.section_ar,
//             section_en: createdData.name_en || createdData.section_en,
//             locations_qa_id: createdData.locations_qa_id || data.locations_qa_id,
//             org_id: createdData.org_id || org_id,
//         };
//     },

//     async updateSection(id, data, org_id) {
//         let token = localStorage.getItem('access_token');
//         console.log('Sending request with token:', token || 'No token');

//         if (!org_id) {
//             throw new Error('org_id is required');
//         }
//         if (!id) {
//             throw new Error('id is required');
//         }
//         if (!data || typeof data !== 'object') {
//             throw new Error('data is required and must be an object');
//         }

//         const url = new URL(`${API_URL}/${id}`);
//         url.searchParams.append('org_id', org_id);

//         // Include org_id in the request body as required by the backend
//         const requestBody = {
//             ...data,
//             org_id: org_id
//         };

//         const options = {
//             method: 'PUT',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'x-access-tokens': token,
//             },
//             body: JSON.stringify(requestBody),
//         };

//         let response = await fetch(url, options);

//         if (response.status === 401) {
//             try {
//                 response = await refreshTokenAndRetry(url, options);
//             } catch (refreshError) {
//                 localStorage.clear();
//                 window.location.href = '/login';
//                 throw refreshError;
//             }
//         }

//         if (!response.ok) {
//             const errorData = await response.json().catch(() => ({}));
//             console.error('Fetch failed:', {
//                 status: response.status,
//                 statusText: response.statusText,
//                 body: await response.text().catch(() => 'No response body'),
//                 errorData,
//             });
//             throw new Error(
//                 `Failed to update section: ${response.status} - ${errorData.message || errorData.error || response.statusText || 'Unknown error'}`
//             );
//         }

//         const updatedData = await response.json();
//         return {
//             section_qa_id: updatedData.id || updatedData.section_qa_id,
//             section_ar: updatedData.name_ar || updatedData.section_ar,
//             section_en: updatedData.name_en || updatedData.section_en,
//             locations_qa_id: updatedData.locations_qa_id || data.locations_qa_id,
//             org_id: updatedData.org_id || org_id,
//         };
//     },

//     async deleteSection(id, org_id) {
//         let token = localStorage.getItem('access_token');
//         console.log('Sending request with token:', token || 'No token');

//         if (!org_id) {
//             throw new Error('org_id is required');
//         }
//         if (!id) {
//             throw new Error('id is required');
//         }

//         const url = new URL(`${API_URL}/${id}`);
//         url.searchParams.append('org_id', org_id);

//         const options = {
//             method: 'DELETE',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'x-access-tokens': token,
//             },
//         };

//         let response = await fetch(url, options);

//         if (response.status === 401) {
//             try {
//                 response = await refreshTokenAndRetry(url, options);
//             } catch (refreshError) {
//                 localStorage.clear();
//                 window.location.href = '/login';
//                 throw refreshError;
//             }
//         }

//         if (!response.ok) {
//             const errorData = await response.json().catch(() => ({}));
//             console.error('Fetch failed:', {
//                 status: response.status,
//                 statusText: response.statusText,
//                 body: await response.text().catch(() => 'No response body'),
//                 errorData,
//             });
//             throw new Error(
//                 `Failed to delete section: ${response.status} - ${errorData.message || errorData.error || response.statusText || 'Unknown error'}`
//             );
//         }

//         return response.json();
//     },
// };

// export { sectionQaService };

// const API_URL = `${import.meta.env.VITE_API_BASE_URL}/section_qa`;

// // Helper function to handle token refresh logic
// async function refreshTokenAndRetry(url, options) {
//   const refreshToken = localStorage.getItem('refresh_token');
//   const refreshResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/refresh`, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ refresh_token: refreshToken }),
//   });

//   if (!refreshResponse.ok) {
//     throw new Error('Failed to refresh token');
//   }

//   const { access_token, refresh_token } = await refreshResponse.json();
//   localStorage.setItem('access_token', access_token);
//   localStorage.setItem('refresh_token', refresh_token);

//   options.headers['x-access-tokens'] = access_token;
//   return fetch(url, options);
// }

// const sectionQaService = {
//   async getSections(org_id, locations_qa_id = null) {
//     let token = localStorage.getItem('access_token');
//     console.log('Sending request with token:', token || 'No token');

//     if (!org_id) {
//       throw new Error('org_id is required');
//     }

//     const url = new URL(API_URL);
//     url.searchParams.append('org_id', org_id);

//     if (locations_qa_id !== null) {
//       url.searchParams.append('locations_qa_id', locations_qa_id);
//     }

//     const options = {
//       method: 'GET',
//       headers: {
//         'Content-Type': 'application/json',
//         'x-access-tokens': token,
//       },
//     };

//     let response = await fetch(url, options);

//     if (response.status === 401) {
//       try {
//         response = await refreshTokenAndRetry(url, options);
//       } catch (refreshError) {
//         localStorage.clear();
//         window.location.href = '/login';
//         throw refreshError;
//       }
//     }

//     if (!response.ok) {
//       const errorData = await response.json().catch(() => ({}));
//       console.error('Fetch failed:', {
//         status: response.status,
//         statusText: response.statusText,
//         body: await response.text().catch(() => 'No response body'),
//         errorData,
//       });
//       throw new Error(
//         `Failed to fetch sections: ${response.status} - ${errorData.message || errorData.error || response.statusText || 'Unknown error'}`
//       );
//     }

//     const data = await response.json();
//     console.log('Raw sections response:', data);
//     const mappedData = data.map(sec => ({
//       section_qa_id: sec.section_qa_id,
//       section_en: sec.section_en,
//       section_ar: sec.section_ar,
//       locations_qa_id: sec.locations_qa_id,
//       org_id: sec.org_id
//     }));
//     console.log('Mapped sections:', mappedData);
//     return mappedData;
//   },

//   async getSection(id, org_id) {
//     let token = localStorage.getItem('access_token');
//     console.log('Sending request with token:', token || 'No token');

//     if (!org_id) {
//       throw new Error('org_id is required');
//     }
//     if (!id) {
//       throw new Error('id is required');
//     }

//     const url = new URL(`${API_URL}/${id}`);
//     url.searchParams.append('org_id', org_id);

//     const options = {
//       method: 'GET',
//       headers: {
//         'Content-Type': 'application/json',
//         'x-access-tokens': token,
//       },
//     };

//     let response = await fetch(url, options);

//     if (response.status === 401) {
//       try {
//         response = await refreshTokenAndRetry(url, options);
//       } catch (refreshError) {
//         localStorage.clear();
//         window.location.href = '/login';
//         throw refreshError;
//       }
//     }

//     if (!response.ok) {
//       const errorData = await response.json().catch(() => ({}));
//       console.error('Fetch failed:', {
//         status: response.status,
//         statusText: response.statusText,
//         body: await response.text().catch(() => 'No response body'),
//         errorData,
//       });
//       throw new Error(
//         `Failed to fetch section: ${response.status} - ${errorData.message || errorData.error || response.statusText || 'Unknown error'}`
//       );
//     }

//     const data = await response.json();
//     console.log('Raw section response:', data);
//     const mappedData = {
//       section_qa_id: data.section_qa_id,
//       section_en: data.section_en,
//       section_ar: data.section_ar,
//       locations_qa_id: data.locations_qa_id,
//       org_id: data.org_id
//     };
//     console.log('Mapped section:', mappedData);
//     return mappedData;
//   },

//   async createSection(data, org_id) {
//     let token = localStorage.getItem('access_token');
//     console.log('Sending request with token:', token || 'No token');

//     if (!org_id) {
//       throw new Error('org_id is required');
//     }
//     if (!data || typeof data !== 'object') {
//       throw new Error('data is required and must be an object');
//     }

//     const url = new URL(API_URL);
//     url.searchParams.append('org_id', org_id);

//     const requestBody = {
//       name_en: data.name_en,
//       name_ar: data.name_ar,
//       locations_qa_id: data.locations_qa_id,
//       org_id: org_id
//     };

//     const options = {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'x-access-tokens': token,
//       },
//       body: JSON.stringify(requestBody),
//     };

//     let response = await fetch(url, options);

//     if (response.status === 401) {
//       try {
//         response = await refreshTokenAndRetry(url, options);
//       } catch (refreshError) {
//         localStorage.clear();
//         window.location.href = '/login';
//         throw refreshError;
//       }
//     }

//     if (!response.ok) {
//       const errorData = await response.json().catch(() => ({}));
//       console.error('Fetch failed:', {
//         status: response.status,
//         statusText: response.statusText,
//         body: await response.text().catch(() => 'No response body'),
//         errorData,
//       });
//       throw new Error(
//         `Failed to create section: ${response.status} - ${errorData.message || errorData.error || response.statusText || 'Unknown error'}`
//       );
//     }

//     const createdData = await response.json();
//     return {
//       section_qa_id: createdData.section_qa_id,
//       section_en: createdData.section_en,
//       section_ar: createdData.section_ar,
//       locations_qa_id: createdData.locations_qa_id,
//       org_id: createdData.org_id
//     };
//   },

//   async updateSection(id, data, org_id) {
//     let token = localStorage.getItem('access_token');
//     console.log('Sending request with token:', token || 'No token');

//     if (!org_id) {
//       throw new Error('org_id is required');
//     }
//     if (!id) {
//       throw new Error('id is required');
//     }
//     if (!data || typeof data !== 'object') {
//       throw new Error('data is required and must be an object');
//     }

//     const url = new URL(`${API_URL}/${id}`);
//     url.searchParams.append('org_id', org_id);

//     const requestBody = {
//       name_en: data.name_en,
//       name_ar: data.name_ar,
//       locations_qa_id: data.locations_qa_id,
//       org_id: org_id
//     };

//     const options = {
//       method: 'PUT',
//       headers: {
//         'Content-Type': 'application/json',
//         'x-access-tokens': token,
//       },
//       body: JSON.stringify(requestBody),
//     };

//     let response = await fetch(url, options);

//     if (response.status === 401) {
//       try {
//         response = await refreshTokenAndRetry(url, options);
//       } catch (refreshError) {
//         localStorage.clear();
//         window.location.href = '/login';
//         throw refreshError;
//       }
//     }

//     if (!response.ok) {
//       const errorData = await response.json().catch(() => ({}));
//       console.error('Fetch failed:', {
//         status: response.status,
//         statusText: response.statusText,
//         body: await response.text().catch(() => 'No response body'),
//         errorData,
//       });
//       throw new Error(
//         `Failed to update section: ${response.status} - ${errorData.message || errorData.error || response.statusText || 'Unknown error'}`
//       );
//     }

//     const updatedData = await response.json();
//     return {
//       section_qa_id: updatedData.section_qa_id,
//       section_en: updatedData.section_en,
//       section_ar: updatedData.section_ar,
//       locations_qa_id: updatedData.locations_qa_id,
//       org_id: updatedData.org_id
//     };
//   },

//   async deleteSection(id, org_id) {
//     let token = localStorage.getItem('access_token');
//     console.log('Sending request with token:', token || 'No token');

//     if (!org_id) {
//       throw new Error('org_id is required');
//     }
//     if (!id) {
//       throw new Error('id is required');
//     }

//     const url = new URL(`${API_URL}/${id}`);
//     url.searchParams.append('org_id', org_id);

//     const options = {
//       method: 'DELETE',
//       headers: {
//         'Content-Type': 'application/json',
//         'x-access-tokens': token,
//       },
//     };

//     let response = await fetch(url, options);

//     if (response.status === 401) {
//       try {
//         response = await refreshTokenAndRetry(url, options);
//       } catch (refreshError) {
//         localStorage.clear();
//         window.location.href = '/login';
//         throw refreshError;
//       }
//     }

//     if (!response.ok) {
//       const errorData = await response.json().catch(() => ({}));
//       console.error('Fetch failed:', {
//         status: response.status,
//         statusText: response.statusText,
//         body: await response.text().catch(() => 'No response body'),
//         errorData,
//       });
//       throw new Error(
//         `Failed to delete section: ${response.status} - ${errorData.message || errorData.error || response.statusText || 'Unknown error'}`
//       );
//     }

//     return response.json();
//   },
// };

// export { sectionQaService };

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/section_qa`;

// Helper function to handle token refresh logic
async function refreshTokenAndRetry(url, options) {
  const refreshToken = localStorage.getItem('refresh_token');
  const refreshResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!refreshResponse.ok) {
    throw new Error('Failed to refresh token');
  }

  const { access_token, refresh_token } = await refreshResponse.json();
  localStorage.setItem('access_token', access_token);
  localStorage.setItem('refresh_token', refresh_token);

  options.headers['x-access-tokens'] = access_token;
  return fetch(url, options);
}

const sectionQaService = {
  async getSections(org_id, locations_qa_id = null) {
    let token = localStorage.getItem('access_token');
    console.log('Sending request with token:', token || 'No token');

    if (!org_id) {
      throw new Error('org_id is required');
    }

    const url = new URL(API_URL);
    url.searchParams.append('org_id', org_id);

    if (locations_qa_id !== null) {
      url.searchParams.append('locations_qa_id', locations_qa_id);
    }

    const options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-access-tokens': token,
      },
    };

    let response = await fetch(url, options);

    if (response.status === 401) {
      try {
        response = await refreshTokenAndRetry(url, options);
      } catch (refreshError) {
        localStorage.clear();
        window.location.href = '/login';
        throw refreshError;
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Fetch failed:', {
        status: response.status,
        statusText: response.statusText,
        body: await response.text().catch(() => 'No response body'),
        errorData,
      });
      throw new Error(
        `Failed to fetch sections: ${response.status} - ${errorData.message || errorData.error || response.statusText || 'Unknown error'}`
      );
    }

    const data = await response.json();
    console.log('Raw sections response:', data);
    const mappedData = data.map(sec => ({
      section_qa_id: sec.section_qa_id,
      section_en: sec.section_en,
      section_ar: sec.section_ar,
      locations_qa_id: sec.locations_qa_id,
      org_id: sec.org_id
    }));
    console.log('Mapped sections:', mappedData);
    return mappedData;
  },

  async getSection(id, org_id) {
    let token = localStorage.getItem('access_token');
    console.log('Sending request with token:', token || 'No token');

    if (!org_id) {
      throw new Error('org_id is required');
    }
    if (!id) {
      throw new Error('id is required');
    }

    const url = new URL(`${API_URL}/${id}`);
    url.searchParams.append('org_id', org_id);

    const options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-access-tokens': token,
      },
    };

    let response = await fetch(url, options);

    if (response.status === 401) {
      try {
        response = await refreshTokenAndRetry(url, options);
      } catch (refreshError) {
        localStorage.clear();
        window.location.href = '/login';
        throw refreshError;
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Fetch failed:', {
        status: response.status,
        statusText: response.statusText,
        body: await response.text().catch(() => 'No response body'),
        errorData,
      });
      throw new Error(
        `Failed to fetch section: ${response.status} - ${errorData.message || errorData.error || response.statusText || 'Unknown error'}`
      );
    }

    const data = await response.json();
    console.log('Raw section response:', data);
    const mappedData = {
      section_qa_id: data.section_qa_id,
      section_en: data.section_en,
      section_ar: data.section_ar,
      locations_qa_id: data.locations_qa_id,
      org_id: data.org_id
    };
    console.log('Mapped section:', mappedData);
    return mappedData;
  },

  async createSection(data, org_id) {
    let token = localStorage.getItem('access_token');
    console.log('Sending request with token:', token || 'No token');

    if (!org_id) {
      throw new Error('org_id is required');
    }
    if (!data || typeof data !== 'object') {
      throw new Error('data is required and must be an object');
    }

    const url = new URL(API_URL);
    url.searchParams.append('org_id', org_id);

    const requestBody = {
      name_en: data.name_en,
      name_ar: data.name_ar,
      locations_qa_id: data.locations_qa_id,
      org_id: org_id
    };

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-access-tokens': token,
      },
      body: JSON.stringify(requestBody),
    };

    let response = await fetch(url, options);

    if (response.status === 401) {
      try {
        response = await refreshTokenAndRetry(url, options);
      } catch (refreshError) {
        localStorage.clear();
        window.location.href = '/login';
        throw refreshError;
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Fetch failed:', {
        status: response.status,
        statusText: response.statusText,
        body: await response.text().catch(() => 'No response body'),
        errorData,
      });
      throw new Error(
        `Failed to create section: ${response.status} - ${errorData.message || errorData.error || response.statusText || 'Unknown error'}`
      );
    }

    const createdData = await response.json();
    return {
      section_qa_id: createdData.section_qa_id,
      section_en: createdData.section_en,
      section_ar: createdData.section_ar,
      locations_qa_id: createdData.locations_qa_id,
      org_id: createdData.org_id
    };
  },

  async bulkCreateSections(dataArray, org_id) {
    let token = localStorage.getItem('access_token');
    console.log('Sending bulk POST request with token:', token || 'No token', 'dataArray:', dataArray, 'org_id:', org_id);

    if (!org_id) {
      throw new Error('org_id is required');
    }
    if (!Array.isArray(dataArray) || dataArray.length === 0) {
      throw new Error('dataArray is required and must be a non-empty array');
    }

    const invalidEntries = dataArray.filter(
      data => !data.locations_qa_id || !data.name_en || !data.name_ar
    );
    if (invalidEntries.length > 0) {
      throw new Error('All entries must have locations_qa_id, name_en, and name_ar');
    }

    const url = new URL(`${API_URL}/bulk`);
    url.searchParams.append('org_id', org_id);

    const requestBody = {
      org_id: org_id,
      locations_qa_id: dataArray[0].locations_qa_id,
      sections: dataArray.map(data => ({
        name_en: data.name_en,
        name_ar: data.name_ar,
      })),
    };

    console.log('Bulk POST request body:', requestBody);

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-access-tokens': token,
      },
      body: JSON.stringify(requestBody),
    };

    let response = await fetch(url, options);

    if (response.status === 401) {
      try {
        console.log('Received 401, attempting token refresh');
        response = await refreshTokenAndRetry(url, options);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError.message);
        localStorage.clear();
        window.location.href = '/login';
        throw refreshError;
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Bulk POST request failed:', {
        status: response.status,
        statusText: response.statusText,
        body: await response.text().catch(() => 'No response body'),
        errorData,
      });
      throw new Error(
        `Failed to bulk create sections: ${response.status} - ${errorData.message || errorData.error || response.statusText || 'Unknown error'}`
      );
    }

    const createdData = await response.json();
    console.log('Bulk POST response:', createdData);
    return createdData;
  },

  async updateSection(id, data, org_id) {
    let token = localStorage.getItem('access_token');
    console.log('Sending request with token:', token || 'No token');

    if (!org_id) {
      throw new Error('org_id is required');
    }
    if (!id) {
      throw new Error('id is required');
    }
    if (!data || typeof data !== 'object') {
      throw new Error('data is required and must be an object');
    }

    const url = new URL(`${API_URL}/${id}`);
    url.searchParams.append('org_id', org_id);

    const requestBody = {
      name_en: data.name_en,
      name_ar: data.name_ar,
      locations_qa_id: data.locations_qa_id,
      org_id: org_id
    };

    const options = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-access-tokens': token,
      },
      body: JSON.stringify(requestBody),
    };

    let response = await fetch(url, options);

    if (response.status === 401) {
      try {
        response = await refreshTokenAndRetry(url, options);
      } catch (refreshError) {
        localStorage.clear();
        window.location.href = '/login';
        throw refreshError;
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Fetch failed:', {
        status: response.status,
        statusText: response.statusText,
        body: await response.text().catch(() => 'No response body'),
        errorData,
      });
      throw new Error(
        `Failed to update section: ${response.status} - ${errorData.message || errorData.error || response.statusText || 'Unknown error'}`
      );
    }

    const updatedData = await response.json();
    return {
      section_qa_id: updatedData.section_qa_id,
      section_en: updatedData.section_en,
      section_ar: updatedData.section_ar,
      locations_qa_id: updatedData.locations_qa_id,
      org_id: updatedData.org_id
    };
  },

  async deleteSection(id, org_id) {
    let token = localStorage.getItem('access_token');
    console.log('Sending request with token:', token || 'No token');

    if (!org_id) {
      throw new Error('org_id is required');
    }
    if (!id) {
      throw new Error('id is required');
    }

    const url = new URL(`${API_URL}/${id}`);
    url.searchParams.append('org_id', org_id);

    const options = {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'x-access-tokens': token,
      },
    };

    let response = await fetch(url, options);

    if (response.status === 401) {
      try {
        response = await refreshTokenAndRetry(url, options);
      } catch (refreshError) {
        localStorage.clear();
        window.location.href = '/login';
        throw refreshError;
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Fetch failed:', {
        status: response.status,
        statusText: response.statusText,
        body: await response.text().catch(() => 'No response body'),
        errorData,
      });
      throw new Error(
        `Failed to delete section: ${response.status} - ${errorData.message || errorData.error || response.statusText || 'Unknown error'}`
      );
    }

    return response.json();
  },
};

export { sectionQaService };