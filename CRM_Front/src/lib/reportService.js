const MONGO_API_URL = import.meta.env.VITE_API_BASE_URL;

async function refreshTokenAndRetry(url, options) {
  const refreshToken = localStorage.getItem('refresh_token');
  if (!refreshToken) {
    throw new Error('No refresh token found');
  }

  const refreshResponse = await fetch(`${MONGO_API_URL}/api/auth/refresh`, {
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

const reportService = {
  async uploadLogo(file, orgId) {
    let token = localStorage.getItem('access_token');
    if (!token) throw new Error('No access token found. Please log in.');
    const formData = new FormData();
    formData.append('logo', file);
    formData.append('org_id', orgId);
    try {
      const response = await fetch(`${MONGO_API_URL}/api/upload_logo`, {
        method: 'POST',
        headers: { 'x-access-tokens': token },
        body: formData,
      });
      if (response.status === 401) {
        const retryResponse = await refreshTokenAndRetry(`${MONGO_API_URL}/api/upload_logo`, {
          method: 'POST',
          headers: { 'x-access-tokens': token },
          body: formData,
        });
        return (await retryResponse.json()).url;
      }
      if (!response.ok) throw new Error('Failed to upload logo');
      return (await response.json()).url;
    } catch (error) {
      console.error('Error uploading logo:', error);
      throw error;
    }
  },

  async fetchTemplate(templateId) {
    let token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('No access token found. Please log in.');
    }

    try {
      const response = await fetch(`${MONGO_API_URL}/api/templates/${templateId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-access-tokens': token,
        },
      });

      if (response.status === 401) {
        try {
          const retryResponse = await refreshTokenAndRetry(
            `${MONGO_API_URL}/api/templates/${templateId}`,
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'x-access-tokens': token,
              },
            }
          );
          return await retryResponse.json();
        } catch (refreshError) {
          localStorage.clear();
          window.location.href = '/login';
          throw refreshError;
        }
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch template: ${response.statusText} (${response.status}) - ${errorText}`);
      }

      const data = await response.json();
      console.log('Fetched template:', data);
      return data;
    } catch (error) {
      console.error('Error fetching template:', error);
      throw error;
    }
  },

  async createReport(report, orgId) {
    let token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('No access token found. Please log in.');
    }

    try {
      const response = await fetch(`${MONGO_API_URL}/api/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-access-tokens': token,
        },
        body: JSON.stringify({ report, orgId }),
      });

      if (response.status === 401) {
        try {
          const retryResponse = await refreshTokenAndRetry(`${MONGO_API_URL}/api/reports`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-access-tokens': token,
            },
            body: JSON.stringify({ report, orgId }),
          });
          return await retryResponse.json();
        } catch (refreshError) {
          localStorage.clear();
          window.location.href = '/login';
          throw refreshError;
        }
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create report: ${response.statusText} (${response.status}) - ${errorText}`);
      }

      const data = await response.json();
      console.log('Report created:', data);
      return data;
    } catch (error) {
      console.error('Error creating report:', error);
      throw error;
    }
  },

  async getMainLocations(orgId) {
    let token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('No access token found. Please log in.');
    }

    try {
      const url = new URL(`${MONGO_API_URL}/api/main_locations_admin`);
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
          const retryResponse = await refreshTokenAndRetry(url, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'x-access-tokens': token,
            },
          });
          return await retryResponse.json();
        } catch (refreshError) {
          localStorage.clear();
          window.location.href = '/login';
          throw refreshError;
        }
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch main locations: ${response.statusText} (${response.status}) - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching main locations:', error);
      throw error;
    }
  },

  async getLocationsQa({ orgId, mainLocationId }) {
    let token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('No access token found. Please log in.');
    }

    try {
      const url = new URL(`${MONGO_API_URL}/locations_qa`);
      url.searchParams.append('org_id', orgId);
      url.searchParams.append('main_location_id', mainLocationId);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-access-tokens': token,
        },
      });

      if (response.status === 401) {
        try {
          const retryResponse = await refreshTokenAndRetry(url, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'x-access-tokens': token,
            },
          });
          return await retryResponse.json();
        } catch (refreshError) {
          localStorage.clear();
          window.location.href = '/login';
          throw refreshError;
        }
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch locations QA: ${response.statusText} (${response.status}) - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching locations QA:', error);
      throw error;
    }
  },

  async getSectionsQa({ orgId, locationsQaId }) {
    let token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('No access token found. Please log in.');
    }

    try {
      const url = new URL(`${MONGO_API_URL}/section_qa`);
      url.searchParams.append('org_id', orgId);
      url.searchParams.append('locations_qa_id', locationsQaId);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-access-tokens': token,
        },
      });

      if (response.status === 401) {
        try {
          const retryResponse = await refreshTokenAndRetry(url, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'x-access-tokens': token,
            },
          });
          return await retryResponse.json();
        } catch (refreshError) {
          localStorage.clear();
          window.location.href = '/login';
          throw refreshError;
        }
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch sections QA: ${response.statusText} (${response.status}) - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching sections QA:', error);
      throw error;
    }
  },

  async getSubSectionsQa({ orgId, sectionQaId }) {
    let token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('No access token found. Please log in.');
    }

    try {
      const url = new URL(`${MONGO_API_URL}/sub_section_qa`);
      url.searchParams.append('org_id', orgId);
      url.searchParams.append('section_qa_id', sectionQaId);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-access-tokens': token,
        },
      });

      if (response.status === 401) {
        try {
          const retryResponse = await refreshTokenAndRetry(url, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'x-access-tokens': token,
            },
          });
          return await retryResponse.json();
        } catch (refreshError) {
          localStorage.clear();
          window.location.href = '/login';
          throw refreshError;
        }
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch sub-sections QA: ${response.statusText} (${response.status}) - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching sub-sections QA:', error);
      throw error;
    }
  },

  async getTemplateNames() {
    let token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('No access token found. Please log in.');
    }

    try {
      const response = await fetch(`${MONGO_API_URL}/api/templates/names`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-access-tokens': token,
        },
      });

      if (response.status === 401) {
        try {
          const retryResponse = await refreshTokenAndRetry(`${MONGO_API_URL}/api/templates/names`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'x-access-tokens': token,
            },
          });
          return await retryResponse.json();
        } catch (refreshError) {
          localStorage.clear();
          window.location.href = '/login';
          throw refreshError;
        }
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch template names: ${response.statusText} (${response.status}) - ${errorText}`);
      }

      const data = await response.json();
      console.log('Fetched template names:', data);
      return data;
    } catch (error) {
      console.error('Error fetching template names:', error);
      throw error;
    }
  },

  async saveLayout(layout) {
    let token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('No access token found. Please log in.');
    }

    try {
      const response = await fetch(`${MONGO_API_URL}/api/report_layouts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-access-tokens': token,
        },
        body: JSON.stringify(layout),
      });

      if (response.status === 401) {
        try {
          const retryResponse = await refreshTokenAndRetry(`${MONGO_API_URL}/api/report_layouts`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-access-tokens': token,
            },
            body: JSON.stringify(layout),
          });
          return await retryResponse.json();
        } catch (refreshError) {
          localStorage.clear();
          window.location.href = '/login';
          throw refreshError;
        }
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to save layout: ${response.statusText} (${response.status}) - ${errorText}`);
      }

      const data = await response.json();
      console.log('Layout saved:', data);
      return data;
    } catch (error) {
      console.error('Error saving layout:', error);
      throw error;
    }
  },

  async fetchLayouts(orgId) {
    let token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('No access token found. Please log in.');
    }

    try {
      const url = new URL(`${MONGO_API_URL}/api/report_layouts`);
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
          const retryResponse = await refreshTokenAndRetry(url, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'x-access-tokens': token,
            },
          });
          return await retryResponse.json();
        } catch (refreshError) {
          localStorage.clear();
          window.location.href = '/login';
          throw refreshError;
        }
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch layouts: ${response.statusText} (${response.status}) - ${errorText}`);
      }

      const data = await response.json();
      console.log('Fetched layouts:', data);
      return data;
    } catch (error) {
      console.error('Error fetching layouts:', error);
      throw error;
    }
  },
};

export default reportService;