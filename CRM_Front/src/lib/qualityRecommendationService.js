const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/quality_recommendations`;

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

const qualityRecommendationService = {
  /**
   * Fetches all quality recommendations for a given organization.
   * @param {number} org_id - The organization ID.
   * @returns {Promise<object[]>} Array of quality recommendations.
   */
  async getQualityRecommendations(org_id) {
    const token = checkToken();
    const url = new URL(API_URL);
    url.searchParams.append('org_id', org_id);

    if (process.env.NODE_ENV !== 'production') {
      console.debug('Fetching quality recommendations for org_id:', org_id);
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
    console.log('Raw quality recommendations response:', data);
    const mappedData = data.map(rec => ({
      id: rec.id,
      org_id: rec.org_id,
      name_en: rec.name_en,
      name_ar: rec.name_ar,
    }));
    console.log('Mapped quality recommendations:', mappedData);
    return mappedData;
  },

  /**
   * Fetches a quality recommendation by ID.
   * @param {number} id - The quality recommendation ID.
   * @param {number} org_id - The organization ID.
   * @returns {Promise<object>} Quality recommendation details.
   */
  async getQualityRecommendationById(id, org_id) {
    const token = checkToken();
    const url = new URL(`${API_URL}/${id}`);
    url.searchParams.append('org_id', org_id);

    if (process.env.NODE_ENV !== 'production') {
      console.debug('Fetching quality recommendation:', id, 'for org_id:', org_id);
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
    console.log('Raw quality recommendation response:', data);
    const mappedData = {
      id: data.id,
      org_id: data.org_id,
      name_en: data.name_en,
      name_ar: data.name_ar,
    };
    console.log('Mapped quality recommendation:', mappedData);
    return mappedData;
  },

  /**
   * Creates a new quality recommendation.
   * @param {object} data - Quality recommendation data (name_en, name_ar).
   * @param {number} org_id - The organization ID.
   * @returns {Promise<object>} Created quality recommendation details.
   */
  async createQualityRecommendation(data, org_id) {
    const token = checkToken();
    const url = new URL(API_URL);
    url.searchParams.append('org_id', org_id);

    if (process.env.NODE_ENV !== 'production') {
      console.debug('Creating quality recommendation for org_id:', org_id, 'with data:', data);
    }

    const requestBody = {
      name_en: data.name_en,
      name_ar: data.name_ar,
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
      name_en: createdData.name_en,
      name_ar: createdData.name_ar,
    };
  },

  /**
   * Creates multiple quality recommendations in bulk.
   * @param {object[]} dataArray - Array of quality recommendation data (name_en, name_ar).
   * @param {number} org_id - The organization ID.
   * @returns {Promise<object[]>} Array of created quality recommendation details.
   */
  async bulkCreateQualityRecommendations(dataArray, org_id) {
    const token = checkToken();
    const url = new URL(`${API_URL}/bulk`);
    url.searchParams.append('org_id', org_id);

    if (process.env.NODE_ENV !== 'production') {
      console.debug('Bulk creating quality recommendations for org_id:', org_id, 'with data:', dataArray);
    }

    if (!Array.isArray(dataArray) || dataArray.length === 0) {
      throw new Error('dataArray is required and must be a non-empty array');
    }

    const invalidEntries = dataArray.filter(
      data => !data.name_en || !data.name_ar
    );
    if (invalidEntries.length > 0) {
      throw new Error('All entries must have name_en and name_ar');
    }

    const requestBody = {
      org_id: org_id,
      recommendations: dataArray.map(data => ({
        name_en: data.name_en,
        name_ar: data.name_ar,
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
    return createdData.map(rec => ({
      id: rec.id,
      org_id: rec.org_id,
      name_en: rec.name_en,
      name_ar: rec.name_ar,
    }));
  },

  /**
   * Updates an existing quality recommendation.
   * @param {number} id - The quality recommendation ID.
   * @param {object} data - Updated quality recommendation data (name_en, name_ar).
   * @param {number} org_id - The organization ID.
   * @returns {Promise<object>} Updated quality recommendation details.
   */
  async updateQualityRecommendation(id, data, org_id) {
    const token = checkToken();
    const url = new URL(`${API_URL}/${id}`);
    url.searchParams.append('org_id', org_id);

    if (process.env.NODE_ENV !== 'production') {
      console.debug('Updating quality recommendation:', id, 'for org_id:', org_id, 'with data:', data);
    }

    const requestBody = {
      name_en: data.name_en,
      name_ar: data.name_ar,
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
      name_en: updatedData.name_en,
      name_ar: updatedData.name_ar,
    };
  },

  /**
   * Deletes a quality recommendation.
   * @param {number} id - The quality recommendation ID.
   * @param {number} org_id - The organization ID.
   * @returns {Promise<void>}
   */
  async deleteQualityRecommendation(id, org_id) {
    const token = checkToken();
    const url = new URL(`${API_URL}/${id}`);
    url.searchParams.append('org_id', org_id);

    if (process.env.NODE_ENV !== 'production') {
      console.debug('Deleting quality recommendation:', id, 'for org_id:', org_id);
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

export { qualityRecommendationService };