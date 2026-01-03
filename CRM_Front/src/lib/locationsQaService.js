const API_URL = `${import.meta.env.VITE_API_BASE_URL}/locations_qa`;

const locationsQaService = {
  async getLocations(org_id, mainLocationId = null) {
    let token = localStorage.getItem('access_token');
    console.log('Sending request with token:', token || 'No token');
    const url = new URL(API_URL);
    url.searchParams.append('org_id', org_id);
    if (mainLocationId !== null) {
      url.searchParams.append('main_location_id', mainLocationId); // Add main_location_id filter if provided
    }
    let response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-access-tokens': token,
      },
    });
    if (response.status === 401) {
      try {
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
        token = access_token;
        response = await fetch(url, {
          method: 'GET',
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
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Error response:', errorData);
      throw new Error(
        `Failed to fetch locations: ${response.status} - ${errorData.message || errorData.error || response.statusText || 'Unknown error'}`
      );
    }
    const data = await response.json();
    console.log('Raw locations response:', data);
    // Map backend fields to frontend expected fields
    const mappedData = data.map(loc => ({
      locations_qa_id: loc.id || loc.locations_qa_id,
      location_ar: loc.name_ar || loc.location_ar,
      location_en: loc.name_en || loc.location_en,
      main_location_id: loc.main_location_id || null,
      org_id: loc.org_id,
      location_email: loc.location_email || '',
      location_manager_emails: Array.isArray(loc.location_manager_emails) ? loc.location_manager_emails : [],
      location_phone: loc.location_phone || '',
      location_manager_phones: Array.isArray(loc.location_manager_phones) ? loc.location_manager_phones : []
    }));
    console.log('Mapped locations:', mappedData);
    return mappedData;
  },

  async getLocation(id, org_id) {
    let token = localStorage.getItem('access_token');
    const url = new URL(`${API_URL}/${id}`);
    url.searchParams.append('org_id', org_id);
    let response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-access-tokens': token,
      },
    });
    if (response.status === 401) {
      try {
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
        token = access_token;
        response = await fetch(url, {
          method: 'GET',
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
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Failed to fetch location: ${response.status} - ${errorData.message || errorData.error || response.statusText || 'Unknown error'}`
      );
    }
    const data = await response.json();
    console.log('Raw location response:', data);
    const mappedData = {
      locations_qa_id: data.id || data.locations_qa_id,
      location_ar: data.name_ar || data.location_ar,
      location_en: data.name_en || data.location_en,
      main_location_id: data.main_location_id || null,
      org_id: data.org_id,
      location_email: data.location_email || '',
      location_manager_emails: Array.isArray(data.location_manager_emails) ? data.location_manager_emails : [],
      location_phone: data.location_phone || '',
      location_manager_phones: Array.isArray(data.location_manager_phones) ? data.location_manager_phones : []
    };
    console.log('Mapped location:', mappedData);
    return mappedData;
  },

  async createLocation(data, org_id) {
    let token = localStorage.getItem('access_token');
    const url = new URL(API_URL);
    url.searchParams.append('org_id', org_id);
    let response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-access-tokens': token,
      },
      body: JSON.stringify(data),
    });
    if (response.status === 401) {
      try {
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
        token = access_token;
        response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-access-tokens': token,
          },
          body: JSON.stringify(data),
        });
      } catch (refreshError) {
        localStorage.clear();
        window.location.href = '/login';
        throw refreshError;
      }
    }
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Failed to create location: ${response.status} - ${errorData.message || errorData.error || response.statusText || 'Unknown error'}`
      );
    }
    const createdData = await response.json();
    return {
      locations_qa_id: createdData.id || createdData.locations_qa_id,
      location_ar: createdData.name_ar || createdData.location_ar,
      location_en: createdData.name_en || createdData.location_en,
      main_location_id: createdData.main_location_id || null,
      org_id: createdData.org_id
    };
  },

  async updateLocation(id, data, org_id) {
    let token = localStorage.getItem('access_token');
    const url = new URL(`${API_URL}/${id}`);
    url.searchParams.append('org_id', org_id);
    let response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-access-tokens': token,
      },
      body: JSON.stringify(data),
    });
    if (response.status === 401) {
      try {
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
        token = access_token;
        response = await fetch(url, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-access-tokens': token,
          },
          body: JSON.stringify(data),
        });
      } catch (refreshError) {
        localStorage.clear();
        window.location.href = '/login';
        throw refreshError;
      }
    }
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Failed to update location: ${response.status} - ${errorData.message || errorData.error || response.statusText || 'Unknown error'}`
      );
    }
    const updatedData = await response.json();
    return {
      locations_qa_id: updatedData.id || updatedData.locations_qa_id,
      location_ar: updatedData.name_ar || updatedData.location_ar,
      location_en: updatedData.name_en || updatedData.location_en,
      main_location_id: updatedData.main_location_id || null,
      org_id: updatedData.org_id
    };
  },

  async deleteLocation(id, org_id) {
    let token = localStorage.getItem('access_token');
    const url = new URL(`${API_URL}/${id}`);
    url.searchParams.append('org_id', org_id);
    let response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'x-access-tokens': token,
      },
    });
    if (response.status === 401) {
      try {
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
        token = access_token;
        response = await fetch(url, {
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
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Failed to delete location: ${response.status} - ${errorData.message || errorData.error || response.statusText || 'Unknown error'}`
      );
    }
    return response.json();
  },
};

export { locationsQaService };