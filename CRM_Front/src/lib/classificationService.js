import { useNavigate } from 'react-router-dom';
const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/classifications`;

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
 * Handles token refresh logic.
 * @param {string} url - The original request URL.
 * @param {object} options - The original request options.
 * @returns {Promise<Response>} The response after refreshing the token.
 * @throws {Error} If token refresh fails.
 * @private
 */
const refreshTokenAndRetry = async (url, options) => {
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

const classificationService = {
  /**
   * Fetches all classifications for a given organization.
   * @param {number} org_id - The organization ID.
   * @returns {Promise<object[]>} Array of classifications.
   */
  async getClassifications(org_id) {
    const token = checkToken();
    const url = new URL(API_URL);
    url.searchParams.append('org_id', org_id);

    if (process.env.NODE_ENV !== 'production') {
      console.debug('Fetching classifications for org_id:', org_id);
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
        response = await refreshTokenAndRetry(url, {
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

    const data = await handleResponse(response);
    console.log('Raw classifications response:', data);
    const mappedData = data.map(cls => ({
      id: cls.id,
      org_id: cls.org_id,
      classification_en: cls.classification_en,
      classification_ar: cls.classification_ar,
    }));
    console.log('Mapped classifications:', mappedData);
    return mappedData;
  },

  /**
   * Creates a new classification.
   * @param {object} data - Classification data (classification_en, classification_ar).
   * @param {number} org_id - The organization ID.
   * @returns {Promise<object>} Created classification details.
   */
  async createClassification(data, org_id) {
    const token = checkToken();
    const url = new URL(API_URL);
    url.searchParams.append('org_id', org_id);

    if (process.env.NODE_ENV !== 'production') {
      console.debug('Creating classification for org_id:', org_id, 'with data:', data);
    }

    const requestBody = {
      classification_en: data.classification_en,
      classification_ar: data.classification_ar,
      org_id: org_id,
    };

    let response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-access-tokens': token,
      },
      body: JSON.stringify(requestBody),
    });

    if (response.status === 401) {
      try {
        response = await refreshTokenAndRetry(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-access-tokens': token,
          },
          body: JSON.stringify(requestBody),
        });
      } catch (refreshError) {
        localStorage.clear();
        window.location.href = '/login';
        throw refreshError;
      }
    }

    const createdData = await handleResponse(response);
    return {
      id: createdData.id,
      org_id: createdData.org_id,
      classification_en: createdData.classification_en,
      classification_ar: createdData.classification_ar,
    };
  },

  /**
   * Creates multiple classifications in bulk.
   * @param {object[]} dataArray - Array of classification data (classification_en, classification_ar).
   * @param {number} org_id - The organization ID.
   * @returns {Promise<object[]>} Array of created classification details.
   */
  async bulkCreateClassifications(dataArray, org_id) {
    const token = checkToken();
    const url = new URL(`${API_URL}/bulk`);
    url.searchParams.append('org_id', org_id);

    if (process.env.NODE_ENV !== 'production') {
      console.debug('Bulk creating classifications for org_id:', org_id, 'with data:', dataArray);
    }

    if (!Array.isArray(dataArray) || dataArray.length === 0) {
      throw new Error('dataArray is required and must be a non-empty array');
    }

    const invalidEntries = dataArray.filter(
      data => !data.classification_en || !data.classification_ar
    );
    if (invalidEntries.length > 0) {
      throw new Error('All entries must have classification_en and classification_ar');
    }

    const requestBody = {
      org_id: org_id,
      classifications: dataArray.map(data => ({
        classification_en: data.classification_en,
        classification_ar: data.classification_ar,
      })),
    };

    let response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-access-tokens': token,
      },
      body: JSON.stringify(requestBody),
    });

    if (response.status === 401) {
      try {
        response = await refreshTokenAndRetry(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-access-tokens': token,
          },
          body: JSON.stringify(requestBody),
        });
      } catch (refreshError) {
        localStorage.clear();
        window.location.href = '/login';
        throw refreshError;
      }
    }

    const createdData = await handleResponse(response);
    console.log('Bulk POST response:', createdData);
    return createdData.map(cls => ({
      id: cls.id,
      org_id: cls.org_id,
      classification_en: cls.classification_en,
      classification_ar: cls.classification_ar,
    }));
  },

  /**
   * Updates an existing classification.
   * @param {number} id - The classification ID.
   * @param {object} data - Updated classification data (classification_en, classification_ar).
   * @param {number} org_id - The organization ID.
   * @returns {Promise<object>} Updated classification details.
   */
  async updateClassification(id, data, org_id) {
    const token = checkToken();
    const url = new URL(`${API_URL}/${id}`);
    url.searchParams.append('org_id', org_id);

    if (process.env.NODE_ENV !== 'production') {
      console.debug('Updating classification:', id, 'for org_id:', org_id, 'with data:', data);
    }

    const requestBody = {
      classification_en: data.classification_en,
      classification_ar: data.classification_ar,
      org_id: org_id,
    };

    let response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-access-tokens': token,
      },
      body: JSON.stringify(requestBody),
    });

    if (response.status === 401) {
      try {
        response = await refreshTokenAndRetry(url, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-access-tokens': token,
          },
          body: JSON.stringify(requestBody),
        });
      } catch (refreshError) {
        localStorage.clear();
        window.location.href = '/login';
        throw refreshError;
      }
    }

    const updatedData = await handleResponse(response);
    return {
      id: updatedData.id,
      org_id: updatedData.org_id,
      classification_en: updatedData.classification_en,
      classification_ar: updatedData.classification_ar,
    };
  },

  /**
   * Deletes a classification.
   * @param {number} id - The classification ID.
   * @param {number} org_id - The organization ID.
   * @returns {Promise<void>}
   */
  async deleteClassification(id, org_id) {
    const token = checkToken();
    const url = new URL(`${API_URL}/${id}`);
    url.searchParams.append('org_id', org_id);

    if (process.env.NODE_ENV !== 'production') {
      console.debug('Deleting classification:', id, 'for org_id:', org_id);
    }

    let response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'x-access-tokens': token,
      },
    });

    if (response.status === 401) {
      try {
        response = await refreshTokenAndRetry(url, {
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

    return handleResponse(response);
  },
};

export { classificationService };