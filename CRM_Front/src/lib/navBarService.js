const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/navigation_groups`;
const MONGO_API_URL = `${import.meta.env.VITE_API_BASE_URL}`;

/**
 * Checks if an access token is available in localStorage.
 * @throws {Error} If no token is found.
 * @private
 */
const checkToken = () => {
  const token = localStorage.getItem('access_token');
  if (!token) {
    throw new Error('No access token found. Please log in.');
  }
  return token;
};

/**
 * Handles HTTP response errors based on status codes.
 * @param {Response} response - The Fetch API response object.
 * @returns {Promise<object|undefined>} Parsed JSON response if successful, or undefined for no-content responses.
 * @throws {Error} Specific error based on status code or generic error.
 * @private
 */
const handleResponse = async (response) => {
  if (response.ok) {
    if (response.status === 204 || response.status === 201) {
      const text = await response.text();
      return text ? JSON.parse(text) : undefined;
    }
    return response.json();
  }

  const errorData = await response.json().catch(() => ({}));
  const errorMessage = errorData.error || 'No message';

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

/**
 * Retries a fetch request after refreshing the access token.
 * @param {string} url - The URL to retry.
 * @param {object} options - The fetch options.
 * @returns {Promise<Response>} The response from the retried request.
 * @throws {Error} If the retry fails.
 * @private
 */
const refreshTokenAndRetry = async (url, options) => {
  try {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token found.');
    }

    const refreshResponse = await fetch(`${MONGO_API_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!refreshResponse.ok) {
      throw new Error('Failed to refresh token.');
    }

    const { access_token } = await refreshResponse.json();
    localStorage.setItem('access_token', access_token);
    options.headers['x-access-tokens'] = access_token;

    return await fetch(url, options);
  } catch (error) {
    throw new Error('Token refresh failed: ' + error.message);
  }
};

const navBarService = {
  async getNavGroups(org_id) {
    const token = checkToken();
    const url = new URL(API_URL);
    url.searchParams.append('org_id', org_id);

    if (process.env.NODE_ENV !== 'production') {
      console.debug('Fetching navigation groups for org_id:', org_id);
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-access-tokens': token,
      },
    });

    const data = await handleResponse(response);
    if (process.env.NODE_ENV !== 'production') {
      console.debug('Backend response for getNavGroups:', data);
    }

    return data;
  },

  async getNavGroup(id, org_id) {
    const token = checkToken();
    const url = new URL(`${API_URL}/${id}`);
    url.searchParams.append('org_id', org_id);

    if (process.env.NODE_ENV !== 'production') {
      console.debug('Fetching navigation group:', id, 'for org_id:', org_id);
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-access-tokens': token,
      },
    });

    const data = await handleResponse(response);
    if (process.env.NODE_ENV !== 'production') {
      console.debug('Backend response for getNavGroup:', data);
    }

    return data;
  },

  async createNavGroup(data, org_id) {
    const token = checkToken();
    const url = new URL(API_URL);
    url.searchParams.append('org_id', org_id);

    if (process.env.NODE_ENV !== 'production') {
      console.debug('Creating navigation group for org_id:', org_id, 'with data:', data);
    }

    const payload = {
      key: data.key,
      name_en: data.name_en,
      name_ar: data.name_ar,
      main_sections: data.main_sections.map((section) => ({
        key: section.key,
        name_en: section.name_en,
        name_ar: section.name_ar,
        subsections: section.subsections.map((sub) => ({
          key: sub.key,
          title: sub.title,
          sub_page_variable: sub.sub_page_variable, // Already an _id
          route: sub.route,
        })),
      })),
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-access-tokens': token,
      },
      body: JSON.stringify(payload),
    });

    const createdData = await handleResponse(response);
    if (process.env.NODE_ENV !== 'production') {
      console.debug('Backend response for createNavGroup:', createdData);
    }

    return { id: createdData.id, ...data };
  },

  async updateNavGroup(id, data, org_id) {
    const token = checkToken();
    const url = new URL(`${API_URL}/${id}`);
    url.searchParams.append('org_id', org_id);

    if (process.env.NODE_ENV !== 'production') {
      console.debug('Updating navigation group:', id, 'for org_id:', org_id, 'with data:', data);
    }

    const payload = {
      key: data.key,
      name_en: data.name_en,
      name_ar: data.name_ar,
      main_sections: data.main_sections.map((section) => ({
        key: section.key,
        name_en: section.name_en,
        name_ar: section.name_ar,
        subsections: section.subsections.map((sub) => ({
          key: sub.key,
          title: sub.title,
          sub_page_variable: sub.sub_page_variable, // Already an _id
          route: sub.route,
        })),
      })),
    };

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-access-tokens': token,
      },
      body: JSON.stringify(payload),
    });

    const updatedData = await handleResponse(response);
    if (process.env.NODE_ENV !== 'production') {
      console.debug('Backend response for updateNavGroup:', updatedData);
    }

    return { id, ...data };
  },

  async deleteNavGroup(id, org_id) {
    const token = checkToken();
    const url = new URL(`${API_URL}/${id}`);
    url.searchParams.append('org_id', org_id);

    if (process.env.NODE_ENV !== 'production') {
      console.debug('Deleting navigation group:', id, 'for org_id:', org_id);
    }

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'x-access-tokens': token,
      },
    });

    const deleteData = await handleResponse(response);
    if (process.env.NODE_ENV !== 'production') {
      console.debug('Backend response for deleteNavGroup:', deleteData);
    }

    return;
  },

  async getTemplateNames(orgId = null) {
    let token = checkToken();
    try {
      const url = new URL(`${MONGO_API_URL}/api/templates/names`);
      if (orgId) {
        url.searchParams.append('orgId', orgId);
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
        throw new Error(`Failed to fetch template names: ${response.statusText} (${response.status}) - ${errorText}`);
      }

      const data = await response.json();
      if (process.env.NODE_ENV !== 'production') {
        console.debug('Fetched template names:', data);
      }
      return data;
    } catch (error) {
      console.error('Error fetching template names:', error);
      throw error;
    }
  },
};

export { navBarService };