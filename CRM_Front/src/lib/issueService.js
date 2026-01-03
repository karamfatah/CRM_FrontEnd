const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/issues`;

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

const issueService = {
  /**
   * Fetches all issues for a given organization.
   * @param {number} org_id - The organization ID.
   * @returns {Promise<object[]>} Array of issues.
   */
  async getIssues(org_id) {
    const token = checkToken();
    const url = new URL(API_URL);
    url.searchParams.append('org_id', org_id);

    if (process.env.NODE_ENV !== 'production') {
      console.debug('Fetching issues for org_id:', org_id);
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
    console.log('Raw issues response:', data);
    const mappedData = data.map(issue => ({
      id: issue.id,
      org_id: issue.org_id,
      classification_id: issue.classification_id,
      issue_text_en: issue.issue_text_en,
      issue_text_ar: issue.issue_text_ar,
    }));
    console.log('Mapped issues:', mappedData);
    return mappedData;
  },

  /**
   * Fetches a single issue by ID.
   * @param {number} id - The issue ID.
   * @param {number} org_id - The organization ID.
   * @returns {Promise<object>} Issue details.
   */
  async getIssue(id, org_id) {
    const token = checkToken();
    const url = new URL(`${API_URL}/${id}`);
    url.searchParams.append('org_id', org_id);

    if (process.env.NODE_ENV !== 'production') {
      console.debug('Fetching issue:', id, 'for org_id:', org_id);
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
    console.log('Raw issue response:', data);
    const mappedData = {
      id: data.id,
      org_id: data.org_id,
      classification_id: data.classification_id,
      issue_text_en: data.issue_text_en,
      issue_text_ar: data.issue_text_ar,
    };
    console.log('Mapped issue:', mappedData);
    return mappedData;
  },

  /**
   * Creates a new issue.
   * @param {object} data - Issue data (issue_text_en, issue_text_ar, classification_id).
   * @param {number} org_id - The organization ID.
   * @returns {Promise<object>} Created issue details.
   */
  async createIssue(data, org_id) {
    const token = checkToken();
    const url = new URL(API_URL);
    url.searchParams.append('org_id', org_id);

    if (process.env.NODE_ENV !== 'production') {
      console.debug('Creating issue for org_id:', org_id, 'with data:', data);
    }

    const requestBody = {
      issue_text_en: data.issue_text_en,
      issue_text_ar: data.issue_text_ar,
      classification_id: data.classification_id,
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
      classification_id: createdData.classification_id,
      issue_text_en: createdData.issue_text_en,
      issue_text_ar: createdData.issue_text_ar,
    };
  },

  /**
   * Creates multiple issues in bulk.
   * @param {object[]} dataArray - Array of issue data (issue_text_en, issue_text_ar).
   * @param {number} org_id - The organization ID.
   * @param {number} classification_id - The classification ID for all issues.
   * @returns {Promise<object[]>} Array of created issue details.
   */
  async bulkCreateIssues(dataArray, org_id, classification_id) {
    const token = checkToken();
    const url = new URL(`${API_URL}/bulk`);
    url.searchParams.append('org_id', org_id);

    if (process.env.NODE_ENV !== 'production') {
      console.debug('Bulk creating issues for org_id:', org_id, 'classification_id:', classification_id, 'with data:', dataArray);
    }

    if (!Array.isArray(dataArray) || dataArray.length === 0) {
      throw new Error('dataArray is required and must be a non-empty array');
    }

    const invalidEntries = dataArray.filter(
      data => !data.issue_text_en || !data.issue_text_ar
    );
    if (invalidEntries.length > 0) {
      throw new Error('All entries must have issue_text_en and issue_text_ar');
    }

    if (!classification_id) {
      throw new Error('classification_id is required');
    }

    const requestBody = {
      org_id: org_id,
      classification_id: classification_id,
      issues: dataArray.map(data => ({
        issue_text_en: data.issue_text_en,
        issue_text_ar: data.issue_text_ar,
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
    return createdData.map(issue => ({
      id: issue.id,
      org_id: issue.org_id,
      classification_id: issue.classification_id,
      issue_text_en: issue.issue_text_en,
      issue_text_ar: issue.issue_text_ar,
    }));
  },

  /**
   * Updates an existing issue.
   * @param {number} id - The issue ID.
   * @param {object} data - Updated issue data (issue_text_en, issue_text_ar, classification_id).
   * @param {number} org_id - The organization ID.
   * @returns {Promise<object>} Updated issue details.
   */
  async updateIssue(id, data, org_id) {
    const token = checkToken();
    const url = new URL(`${API_URL}/${id}`);
    url.searchParams.append('org_id', org_id);

    if (process.env.NODE_ENV !== 'production') {
      console.debug('Updating issue:', id, 'for org_id:', org_id, 'with data:', data);
    }

    const requestBody = {
      issue_text_en: data.issue_text_en,
      issue_text_ar: data.issue_text_ar,
      classification_id: data.classification_id,
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
      classification_id: updatedData.classification_id,
      issue_text_en: updatedData.issue_text_en,
      issue_text_ar: updatedData.issue_text_ar,
    };
  },

  /**
   * Deletes an issue.
   * @param {number} id - The issue ID.
   * @param {number} org_id - The organization ID.
   * @returns {Promise<void>}
   */
  async deleteIssue(id, org_id) {
    const token = checkToken();
    const url = new URL(`${API_URL}/${id}`);
    url.searchParams.append('org_id', org_id);

    if (process.env.NODE_ENV !== 'production') {
      console.debug('Deleting issue:', id, 'for org_id:', org_id);
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

export { issueService };