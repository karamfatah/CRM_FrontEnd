// Path: src/lib/shiftService.js
// Description: Shift Service for interacting with the backend API.
// Provides methods for CRUD operations on shifts.

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/shifts`;

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

const shiftService = {
  /**
   * Fetches all shifts for a given organization.
   * @param {number} org_id - The organization ID.
   * @returns {Promise<object[]>} Array of shifts.
   */
  async getShifts(org_id) {
    const token = checkToken();
    const url = new URL(API_URL);
    url.searchParams.append('org_id', org_id);

    if (process.env.NODE_ENV !== 'production') {
      console.debug('Fetching shifts for org_id:', org_id);
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
   * Fetches a specific shift by ID.
   * @param {number} id - The shift ID.
   * @param {number} org_id - The organization ID.
   * @returns {Promise<object>} Shift details.
   */
  async getShift(id, org_id) {
    const token = checkToken();
    const url = new URL(`${API_URL}/${id}`);
    url.searchParams.append('org_id', org_id);

    if (process.env.NODE_ENV !== 'production') {
      console.debug('Fetching shift:', id, 'for org_id:', org_id);
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
   * Creates a new shift.
   * @param {object} data - Shift data (shift_name_en, shift_name_ar).
   * @param {number} org_id - The organization ID.
   * @returns {Promise<object>} Created shift details.
   */
  async createShift(data, org_id) {
    const token = checkToken();
    const url = new URL(API_URL);
    url.searchParams.append('org_id', org_id);

    if (process.env.NODE_ENV !== 'production') {
      console.debug('Creating shift for org_id:', org_id, 'with data:', data);
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-access-tokens': token,
      },
      body: JSON.stringify(data),
    });

    return handleResponse(response);
  },

  /**
   * Updates an existing shift.
   * @param {number} id - The shift ID.
   * @param {object} data - Updated shift data (shift_name_en, shift_name_ar).
   * @param {number} org_id - The organization ID.
   * @returns {Promise<object>} Updated shift details.
   */
  async updateShift(id, data, org_id) {
    const token = checkToken();
    const url = new URL(`${API_URL}/${id}`);
    url.searchParams.append('org_id', org_id);

    if (process.env.NODE_ENV !== 'production') {
      console.debug('Updating shift:', id, 'for org_id:', org_id, 'with data:', data);
    }

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-access-tokens': token,
      },
      body: JSON.stringify(data),
    });

    return handleResponse(response);
  },

  /**
   * Deletes a shift.
   * @param {number} id - The shift ID.
   * @param {number} org_id - The organization ID.
   * @returns {Promise<void>}
   */
  async deleteShift(id, org_id) {
    const token = checkToken();
    const url = new URL(`${API_URL}/${id}`);
    url.searchParams.append('org_id', org_id);

    if (process.env.NODE_ENV !== 'production') {
      console.debug('Deleting shift:', id, 'for org_id:', org_id);
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
};

export { shiftService };