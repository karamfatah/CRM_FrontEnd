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

const privilegeService = {
  async getPrivileges(orgId) {
    const token = checkToken();

    try {
      const url = new URL(PRIVILEGE_API_URL);
      if (orgId) {
        url.searchParams.append('org_id', orgId);
      }

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
      console.error('Error fetching privileges:', error);
      throw error;
    }
  },

  async getPrivilege(id, orgId) {
    const token = checkToken();

    try {
      const url = new URL(`${PRIVILEGE_API_URL}/${id}`);
      if (orgId) {
        url.searchParams.append('org_id', orgId);
      }

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
      console.error('Error fetching privilege:', error);
      throw error;
    }
  },

  async createPrivilege(data, orgId) {
    const token = checkToken();

    try {
      const url = new URL(PRIVILEGE_API_URL);
      if (orgId) {
        url.searchParams.append('org_id', orgId);
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-access-tokens': token,
        },
        body: JSON.stringify(data),
      });

      if (response.status === 401) {
        try {
          return await refreshTokenAndRetry(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-access-tokens': token,
            },
            body: JSON.stringify(data),
          }).then((res) => res.json());
        } catch (refreshError) {
          localStorage.clear();
          window.location.href = '/login';
          throw refreshError;
        }
      }

      return await handleResponse(response);
    } catch (error) {
      console.error('Error creating privilege:', error);
      throw error;
    }
  },

  async updatePrivilege(id, data, orgId) {
    const token = checkToken();

    try {
      const url = new URL(`${PRIVILEGE_API_URL}/${id}`);
      if (orgId) {
        url.searchParams.append('org_id', orgId);
      }

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-access-tokens': token,
        },
        body: JSON.stringify(data),
      });

      if (response.status === 401) {
        try {
          return await refreshTokenAndRetry(url, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'x-access-tokens': token,
            },
            body: JSON.stringify(data),
          }).then((res) => res.json());
        } catch (refreshError) {
          localStorage.clear();
          window.location.href = '/login';
          throw refreshError;
        }
      }

      return await handleResponse(response);
    } catch (error) {
      console.error('Error updating privilege:', error);
      throw error;
    }
  },

  async deletePrivilege(id, orgId) {
    const token = checkToken();

    try {
      const url = new URL(`${PRIVILEGE_API_URL}/${id}`);
      if (orgId) {
        url.searchParams.append('org_id', orgId);
      }

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-access-tokens': token,
        },
      });

      if (response.status === 401) {
        try {
          await refreshTokenAndRetry(url, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'x-access-tokens': token,
            },
          });
          return;
        } catch (refreshError) {
          localStorage.clear();
          window.location.href = '/login';
          throw refreshError;
        }
      }

      await handleResponse(response);
    } catch (error) {
      console.error('Error deleting privilege:', error);
      throw error;
    }
  },
};

export { privilegeService };