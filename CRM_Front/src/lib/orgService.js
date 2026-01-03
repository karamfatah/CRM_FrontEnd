

// Path: src/lib/orgService.js
// Description: Organization Service for interacting with the backend API.
// Provides methods for CRUD operations on organizations, logo retrieval, and country fetching.

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/orgs`;
const COUNTRY_API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/allowed_countries`;

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
 * @returns {Promise<object>} Parsed JSON response if successful.
 * @throws {Error} Specific error based on status code or generic error.
 * @private
 */
const handleResponse = async (response) => {
  if (response.ok) {
    return response.status === 204 ? undefined : response.json();
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

const orgService = {
  /**
   * Fetches all organizations (admin only).
   * @returns {Promise<object[]>} Array of organizations.
   */
  async getAllOrgs() {
    const token = checkToken();
    const url = new URL(`${API_URL}/fetch_all_orgs`);

    if (process.env.NODE_ENV !== 'production') {
      console.debug('Fetching all orgs', 'URL:', url.toString());
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-access-tokens': token,
      },
    });

    return handleResponse(response);
  },

  /**
   * Fetches a specific organization by ID.
   * @param {number} id - The organization ID.
   * @returns {Promise<object>} Organization details.
   */
  async getOrg(id) {
    const token = checkToken();
    const url = new URL(`${API_URL}/${id}`);

    if (process.env.NODE_ENV !== 'production') {
      console.debug('Fetching org:', id, 'URL:', url.toString());
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-access-tokens': token,
      },
    });

    return handleResponse(response);
  },

  /**
   * Creates a new organization.
   * @param {FormData} data - Organization data including logo file.
   * @returns {Promise<object>} Created organization details.
   */
  async createOrg(data) {
    const token = checkToken();
    const url = new URL(API_URL);

    if (process.env.NODE_ENV !== 'production') {
      console.debug('Creating org', 'URL:', url.toString());
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'x-access-tokens': token,
      },
      body: data,
    });

    return handleResponse(response);
  },

  /**
   * Updates an existing organization.
   * @param {number} id - The organization ID.
   * @param {FormData} data - Updated organization data including logo file.
   * @returns {Promise<object>} Updated organization details.
   */
  async updateOrg(id, data) {
    const token = checkToken();
    const url = new URL(`${API_URL}/${id}`);

    if (process.env.NODE_ENV !== 'production') {
      console.debug('Updating org:', id, 'URL:', url.toString());
    }

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'x-access-tokens': token,
      },
      body: data,
    });

    return handleResponse(response);
  },

  /**
   * Deletes an organization.
   * @param {number} id - The organization ID.
   * @returns {Promise<void>}
   */
  async deleteOrg(id) {
    const token = checkToken();
    const url = new URL(`${API_URL}/${id}`);

    if (process.env.NODE_ENV !== 'production') {
      console.debug('Deleting org:', id, 'URL:', url.toString());
    }

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'x-access-tokens': token,
      },
    });

    return handleResponse(response);
  },

  /**
   * Fetches the next available org_id.
   * @returns {Promise<number>} The next org_id.
   */
  async getNextOrgId() {
    const token = checkToken();
    const url = new URL(`${API_URL}/next-id`);

    if (process.env.NODE_ENV !== 'production') {
      console.debug('Fetching next org_id', 'URL:', url.toString());
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-access-tokens': token,
      },
    });

    const data = await handleResponse(response);
    return data.next_id;
  },

  /**
   * Fetches all active countries.
   * @returns {Promise<object[]>} Array of countries.
   */
  async getCountries() {
    const token = checkToken();
    const url = new URL(`${COUNTRY_API_URL}/all`);

    if (process.env.NODE_ENV !== 'production') {
      console.debug('Fetching all countries', 'URL:', url.toString());
    }

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-access-tokens': token,
        },
      });

      return await handleResponse(response);
    } catch (err) {
      console.warn('Failed to fetch all countries, falling back to single country');
      const fallbackUrl = new URL(COUNTRY_API_URL);
      fallbackUrl.searchParams.append('country_id', '1');
      const response = await fetch(fallbackUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-access-tokens': token,
        },
      });
      const country = await handleResponse(response);
      return [country].filter(Boolean);
    }
  },
};

export { orgService };
