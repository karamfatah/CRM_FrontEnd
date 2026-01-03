const MONGO_API_URL = import.meta.env.VITE_API_BASE_URL;

async function refreshTokenAndRetry(url, options) {
  const refreshToken = localStorage.getItem('refresh_token');
  const refreshResponse = await fetch(`${MONGO_API_URL}/api/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
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

const managementActionService = {
  async getReports(orgId, { page = 1, perPage = 10, reportType = '', sort = '-created_at', lang = 'en' }) {
    let token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('No access token found. Please log in.');
    }

    try {
      const url = new URL(`${MONGO_API_URL}/api/reports`);
      url.searchParams.append('org_id', orgId);
      url.searchParams.append('page', page);
      url.searchParams.append('per_page', perPage);
      url.searchParams.append('lang', ['en', 'ar'].includes(lang) ? lang : 'en');
      url.searchParams.append('status', 'Investigated');
      if (reportType) url.searchParams.append('report_type', reportType);
      if (sort) url.searchParams.append('sort', sort);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-access-tokens': token,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      });

      if (response.status === 401) {
        try {
          return await refreshTokenAndRetry(url, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'x-access-tokens': token,
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache',
              'Expires': '0',
            },
          }).then((res) => res.json());
        } catch (refreshError) {
          localStorage.clear();
          window.location.href = '/login';
          throw refreshError;
        }
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to fetch reports: ${response.statusText} (${response.status})`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching reports:', error);
      throw error;
    }
  },

  async fetchImage(filename, accessToken) {
    try {
      const url = new URL(`${MONGO_API_URL}/api/download`);
      url.searchParams.append('filename', filename);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'x-access-tokens': accessToken,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      });

      if (response.status === 401) {
        try {
          return await refreshTokenAndRetry(url, {
            method: 'GET',
            headers: {
              'x-access-tokens': accessToken,
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache',
              'Expires': '0',
            },
          }).then(async (res) => {
            if (!res.ok) {
              throw new Error(`Failed to fetch image: ${res.statusText} (${res.status})`);
            }
            const blob = await res.blob();
            return URL.createObjectURL(blob);
          });
        } catch (refreshError) {
          localStorage.clear();
          window.location.href = '/login';
          throw refreshError;
        }
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${res.statusText} (${res.status})`);
      }

      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Error fetching image:', error);
      throw error;
    }
  },

  async updateReportStatus({ id, orgId, newStatus, accessToken }) {
    try {
      const url = new URL(`${MONGO_API_URL}/api/reports/${id}/status`);
      url.searchParams.append('org_id', orgId);
      url.searchParams.append('new_status', newStatus);

      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-access-tokens': accessToken,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      });

      let responseData;
      try {
        responseData = await response.json();
      } catch (jsonError) {
        console.error('Error parsing response JSON:', jsonError);
        throw new Error(`Failed to update report status: Invalid response format (${response.status})`);
      }

      if (response.status === 401) {
        try {
          return await refreshTokenAndRetry(url, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'x-access-tokens': accessToken,
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache',
              'Expires': '0',
            },
          }).then((res) => res.json());
        } catch (refreshError) {
          localStorage.clear();
          window.location.href = '/login';
          throw refreshError;
        }
      }

      if (!response.ok) {
        console.error('Update report status failed:', {
          status: response.status,
          statusText: response.statusText,
          responseData,
          id,
          orgId
        });
        throw new Error(responseData.message || `Failed to update report status: ${response.statusText} (${response.status})`);
      }

      console.log('Update report status response:', responseData);
      return responseData;
    } catch (error) {
      console.error('Error updating report status:', error);
      throw error;
    }
  },

  async updateManagementNotes({ id, orgId, managementNotes, accessToken }) {
    try {
      const url = new URL(`${MONGO_API_URL}/api/reports/${id}/management-notes`);
      url.searchParams.append('org_id', orgId);

      const requestBody = { management_notes: managementNotes };
      console.log('Sending management notes update request:', { url: url.toString(), body: requestBody });

      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-access-tokens': accessToken,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
        body: JSON.stringify(requestBody),
      });

      let responseData;
      try {
        responseData = await response.json();
      } catch (jsonError) {
        console.error('Error parsing response JSON:', jsonError);
        throw new Error(`Failed to update management notes: Invalid response format (${response.status})`);
      }

      if (response.status === 401) {
        try {
          return await refreshTokenAndRetry(url, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'x-access-tokens': accessToken,
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache',
              'Expires': '0',
            },
            body: JSON.stringify(requestBody),
          }).then((res) => res.json());
        } catch (refreshError) {
          localStorage.clear();
          window.location.href = '/login';
          throw refreshError;
        }
      }

      if (!response.ok) {
        console.error('Management notes update failed:', {
          status: response.status,
          statusText: response.statusText,
          responseData,
          id,
          orgId,
          managementNotes
        });
        throw new Error(responseData.message || `Failed to update management notes: ${response.statusText} (${response.status})`);
      }

      console.log('Management notes update response:', responseData);
      return responseData;
    } catch (error) {
      console.error('Error updating management notes:', error);
      throw error;
    }
  },

  async getStatusHistory({ id, orgId, accessToken }) {
    try {
      const url = new URL(`${MONGO_API_URL}/api/reports/${id}/status-history`);
      url.searchParams.append('org_id', orgId);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-access-tokens': accessToken,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      });

      let responseData;
      try {
        responseData = await response.json();
      } catch (jsonError) {
        console.error('Error parsing response JSON:', jsonError);
        throw new Error(`Failed to fetch status history: Invalid response format (${response.status})`);
      }

      if (response.status === 401) {
        try {
          return await refreshTokenAndRetry(url, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'x-access-tokens': accessToken,
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache',
              'Expires': '0',
            },
          }).then((res) => res.json());
        } catch (refreshError) {
          localStorage.clear();
          window.location.href = '/login';
          throw refreshError;
        }
      }

      if (!response.ok) {
        console.error('Status history fetch failed:', {
          status: response.status,
          statusText: response.statusText,
          responseData,
          id,
          orgId
        });
        throw new Error(responseData.message || `Failed to fetch status history: ${response.statusText} (${response.status})`);
      }

      console.log('Status history fetch response:', responseData);
      return responseData;
    } catch (error) {
      console.error('Error fetching status history:', error);
      throw error;
    }
  },
};

export default managementActionService;