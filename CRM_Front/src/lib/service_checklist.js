const API_URL = `${import.meta.env.VITE_API_BASE_URL}/checklist_get`;

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

const checklistService = {
  /**
   * Fetches all checklists for a given organization.
   * @param {number} org_id - The organization ID.
   * @param {string} lang - The language ('en' or 'ar').
   * @returns {Promise<object[]>} Array of checklists.
   */
  async getChecklists(org_id, lang) {
    const token = checkToken();
    const url = new URL(API_URL);
    url.searchParams.append('org_id', org_id);
    url.searchParams.append('lang', lang);
    url.searchParams.append('report_type', 'checklist_report');

    if (process.env.NODE_ENV !== 'production') {
      console.debug('Fetching checklists for org_id:', org_id, 'with lang:', lang);
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-access-tokens': token,
      },
    });

    const data = await handleResponse(response);
    return data.data || [];
  },
};

export { checklistService };