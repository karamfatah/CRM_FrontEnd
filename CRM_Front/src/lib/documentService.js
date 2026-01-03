import { v4 as uuidv4 } from 'uuid';

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/documents`;

// Helper function to handle token refresh logic
async function refreshTokenAndRetry(url, options) {
  const refreshToken = localStorage.getItem('refresh_token');
  const refreshResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/refresh`, {
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

const documentService = {
  async getDocuments(search = '') {
    let token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('No access token found. Please log in.');
    }

    try {
      const url = new URL(API_URL);
      url.searchParams.append('search', search);

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
          }).then(res => res.json());
        } catch (refreshError) {
          localStorage.clear();
          window.location.href = '/login';
          throw refreshError;
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Failed to fetch documents: ${response.status} - ${errorData.message || errorData.error || response.statusText || 'Unknown error'}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching documents:', error);
      throw error;
    }
  },

  async getDocument(docId) {
    let token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('No access token found. Please log in.');
    }

    try {
      const url = new URL(`${API_URL}/${docId}`);

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
          }).then(res => res.json());
        } catch (refreshError) {
          localStorage.clear();
          window.location.href = '/login';
          throw refreshError;
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Failed to fetch document: ${response.status} - ${errorData.message || errorData.error || response.statusText || 'Unknown error'}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching document:', error);
      throw error;
    }
  },

  async createDocument(documentData) {
    let token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('No access token found. Please log in.');
    }

    try {
      const url = new URL(API_URL);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-access-tokens': token,
        },
        body: JSON.stringify(documentData),
      });

      if (response.status === 401) {
        try {
          return await refreshTokenAndRetry(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-access-tokens': token,
            },
            body: JSON.stringify(documentData),
          }).then(res => res.json());
        } catch (refreshError) {
          localStorage.clear();
          window.location.href = '/login';
          throw refreshError;
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Failed to create document: ${response.status} - ${errorData.message || errorData.error || response.statusText || 'Unknown error'}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating document:', error);
      throw error;
    }
  },

  async uploadMedia(docId, formData) {
    let token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('No access token found. Please log in.');
    }

    try {
      const url = new URL(`${API_URL}/${docId}/media`);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'x-access-tokens': token,
        },
        body: formData,
      });

      if (response.status === 401) {
        try {
          return await refreshTokenAndRetry(url, {
            method: 'POST',
            headers: {
              'x-access-tokens': token,
            },
            body: formData,
          }).then(res => res.json());
        } catch (refreshError) {
          localStorage.clear();
          window.location.href = '/login';
          throw refreshError;
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Failed to upload media: ${response.status} - ${errorData.message || errorData.error || response.statusText || 'Unknown error'}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error('Error uploading media:', error);
      throw error;
    }
  },

  async deleteMedia(mediaId) {
    let token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('No access token found. Please log in.');
    }

    try {
      const url = new URL(`${API_URL}/media/${mediaId}`);

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-access-tokens': token,
        },
      });

      if (response.status === 401) {
        try {
          return await refreshTokenAndRetry(url, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'x-access-tokens': token,
            },
          }).then(res => res.json());
        } catch (refreshError) {
          localStorage.clear();
          window.location.href = '/login';
          throw refreshError;
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Failed to delete media: ${response.status} - ${errorData.message || errorData.error || response.statusText || 'Unknown error'}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting media:', error);
      throw error;
    }
  },

  async downloadMedia(mediaId) {
    let token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('No access token found. Please log in.');
    }

    try {
      const url = new URL(`${API_URL}/media/${mediaId}/download`);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'x-access-tokens': token,
        },
      });

      if (response.status === 401) {
        try {
          return await refreshTokenAndRetry(url, {
            method: 'GET',
            headers: {
              'x-access-tokens': token,
            },
          });
        } catch (refreshError) {
          localStorage.clear();
          window.location.href = '/login';
          throw refreshError;
        }
      }

      if (!response.ok) {
        const errorData = await response.text().catch(() => ({}));
        throw new Error(
          `Failed to download media: ${response.status} - ${errorData || response.statusText || 'Unknown error'}`
        );
      }

      return response;
    } catch (error) {
      console.error('Error downloading media:', error);
      throw error;
    }
  },

  async viewMedia(mediaId) {
    let token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('No access token found. Please log in.');
    }

    try {
      const url = new URL(`${API_URL}/media/${mediaId}/view`);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'x-access-tokens': token,
        },
      });

      if (response.status === 401) {
        try {
          return await refreshTokenAndRetry(url, {
            method: 'GET',
            headers: {
              'x-access-tokens': token,
            },
          }).then(res => res.blob());
        } catch (refreshError) {
          localStorage.clear();
          window.location.href = '/login';
          throw refreshError;
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Failed to view media: ${response.status} - ${errorData.message || errorData.error || response.statusText || 'Unknown error'}`
        );
      }

      return await response.blob();
    } catch (error) {
      console.error('Error viewing media:', error);
      throw error;
    }
  },
};

export default documentService;