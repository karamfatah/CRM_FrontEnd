
const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/main_locations_admin`;
const COUNTRIES_API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/allowed_countries`;

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
    // Handle 204 No Content or responses with no body
    if (response.status === 204 || response.status === 200) {
      const text = await response.text();
      return text ? JSON.parse(text) : undefined;
    }
    return response.json();
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

const mainLocationService = {
  async getMainLocations(org_id) {
    const token = checkToken();
    const url = new URL(API_URL);
    url.searchParams.append('org_id', org_id);

    if (process.env.NODE_ENV !== 'production') {
      console.debug('Fetching main locations for org_id:', org_id);
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
      console.debug('Backend response for getMainLocations:', data);
    }

    // Map backend fields to frontend expected fields
    const mappedData = data.map(loc => ({
      id: loc.id, // Backend returns id as stringified _id
      country_id: loc.country_id,
      main_location_name_en: loc.main_location_name_en,
      main_location_ar: loc.main_location_ar
    }));

    console.log('Mapped main locations:', mappedData);
    return mappedData;
  },

  async getMainLocation(id, org_id) {
    const token = checkToken();
    const url = new URL(`${API_URL}/${id}`);
    url.searchParams.append('org_id', org_id);

    if (process.env.NODE_ENV !== 'production') {
      console.debug('Fetching main location:', id, 'for org_id:', org_id);
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
      console.debug('Backend response for getMainLocation:', data);
    }

    // Map backend fields to frontend expected fields
    return {
      id: data.id,
      country_id: data.country_id,
      main_location_name_en: data.main_location_name_en,
      main_location_ar: data.main_location_ar
    };
  },

  async createMainLocation(data, org_id) {
    const token = checkToken();
    const url = new URL(API_URL);
    url.searchParams.append('org_id', org_id);

    if (process.env.NODE_ENV !== 'production') {
      console.debug('Creating main location for org_id:', org_id, 'with data:', data);
    }

    // Map frontend data to backend expected fields and ensure country_id is a number
    const payload = {
      country_id: Number(data.country_id), // Convert to number
      main_location_name_en: data.main_location_name_en,
      main_location_ar: data.main_location_ar
    };

    console.log('Payload sent to backend:', payload); // Debug payload

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
      console.debug('Backend response for createMainLocation:', createdData);
    }

    // Return the created location data from the backend
    return {
      id: createdData.location?.id || null, // Use backend ID if available
      country_id: createdData.location?.country_id || data.country_id,
      main_location_name_en: createdData.location?.main_location_name_en || data.main_location_name_en,
      main_location_ar: createdData.location?.main_location_ar || data.main_location_ar
    };
  },

  async updateMainLocation(id, data, org_id) {
    const token = checkToken();
    const url = new URL(`${API_URL}/${id}`);
    url.searchParams.append('org_id', org_id);

    if (process.env.NODE_ENV !== 'production') {
      console.debug('Updating main location:', id, 'for org_id:', org_id, 'with data:', data);
    }

    // Map frontend data to backend expected fields (partial update) and ensure country_id is a number
    const payload = {};
    if (data.country_id !== undefined) payload.country_id = Number(data.country_id);
    if (data.main_location_name_en !== undefined) payload.main_location_name_en = data.main_location_name_en;
    if (data.main_location_ar !== undefined) payload.main_location_ar = data.main_location_ar;

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
      console.debug('Backend response for updateMainLocation:', updatedData);
    }

    // Backend returns { message: 'MainLocation updated' }, so return input data
    return {
      id,
      country_id: data.country_id,
      main_location_name_en: data.main_location_name_en,
      main_location_ar: data.main_location_ar
    };
  },

  async deleteMainLocation(id, org_id) {
    const token = checkToken();
    const url = new URL(`${API_URL}/${id}`);
    url.searchParams.append('org_id', org_id);

    if (process.env.NODE_ENV !== 'production') {
      console.debug('Deleting main location:', id, 'for org_id:', org_id);
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
      console.debug('Backend response for deleteMainLocation:', deleteData);
    }

    return;
  },

  async getCountryById(country_id) {
    const token = checkToken();
    const url = new URL(COUNTRIES_API_URL);
    url.searchParams.append('country_id', country_id);

    if (process.env.NODE_ENV !== 'production') {
      console.debug('Fetching country by ID:', country_id);
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-access-tokens': token,
      },
    });

    const countryData = await handleResponse(response);
    if (process.env.NODE_ENV !== 'production') {
      console.debug('Backend response for getCountryById:', countryData);
    }

    return countryData;
  },
};

export { mainLocationService };