const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api`;

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
 * @returns {Promise<object|Blob|undefined>} Parsed JSON, Blob, or undefined for no-content responses.
 * @throws {Error} Specific error based on status code or generic error.
 * @private
 */
const handleResponse = async (response) => {
  if (!response.ok) {
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
  }
  // Return Blob for file downloads, JSON for other responses, or undefined for 204
  const contentType = response.headers.get('Content-Type');
  if (contentType && contentType.includes('application/vnd.android.package-archive')) {
    return response.blob();
  }
  if (response.status === 204) {
    return undefined;
  }
  const text = await response.text();
  return text ? JSON.parse(text) : undefined;
};

const apkUploadService = {
  /**
   * Fetches all uploaded APKs for a given organization.
   * @param {number} org_id - The organization ID.
   * @returns {Promise<object[]>} Array of APKs.
   */
  async getApks(org_id) {
    const token = checkToken();
    const url = new URL(`${API_URL}/uploads/apk`);
    url.searchParams.append('org_id', org_id);
    if (process.env.NODE_ENV !== 'production') {
      console.debug('Fetching APKs for org_id:', org_id);
    }
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'x-access-tokens': token,
        },
      });
      const data = await handleResponse(response);
      if (process.env.NODE_ENV !== 'production') {
        console.debug('Backend response for getApks:', data);
      }
      // Map backend fields to frontend expected fields
      const mappedData = data ? data.map(apk => ({
        filename: apk.filename,
        url: apk.url,
      })) : [];
      if (process.env.NODE_ENV !== 'production') {
        console.debug('Mapped APKs:', mappedData);
      }
      return mappedData;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch APKs due to a network error.');
    }
  },

  /**
   * Uploads a new APK.
   * @param {FormData} formData - FormData containing the APK file.
   * @param {number} org_id - The organization ID.
   * @returns {Promise<object>} Uploaded APK details.
   */
  async uploadApk(formData, org_id) {
    const token = checkToken();
    const url = new URL(`${API_URL}/uploads/upload-apk`);
    url.searchParams.append('org_id', org_id);
    if (process.env.NODE_ENV !== 'production') {
      console.debug('Uploading APK for org_id:', org_id);
    }
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'x-access-tokens': token,
        },
        body: formData,
      });
      const data = await handleResponse(response);
      if (process.env.NODE_ENV !== 'production') {
        console.debug('Backend response for uploadApk:', data);
      }
      // Map backend fields to frontend expected fields
      return {
        filename: data.filename,
        url: data.url,
      };
    } catch (error) {
      throw new Error(error.message || 'Failed to upload APK due to a network error.');
    }
  },

  /**
   * Deletes an APK.
   * @param {string} filename - The filename of the APK to delete.
   * @param {number} org_id - The organization ID.
   * @returns {Promise<void>}
   */
  async deleteApk(filename, org_id) {
    const token = checkToken();
    const url = new URL(`${API_URL}/uploads/apk/${filename}`);
    url.searchParams.append('org_id', org_id);
    if (process.env.NODE_ENV !== 'production') {
      console.debug('Deleting APK:', filename, 'for org_id:', org_id);
    }
    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-access-tokens': token,
        },
      });
      const data = await handleResponse(response);
      if (process.env.NODE_ENV !== 'production') {
        console.debug('Backend response for deleteApk:', data);
      }
    } catch (error) {
      throw new Error(error.message || 'Failed to delete APK due to a network error.');
    }
  },

  /**
   * Downloads an APK file.
   * @param {string} filename - The filename of the APK to download.
   * @param {number} org_id - The organization ID.
   * @returns {Promise<Blob>} The APK file as a Blob.
   */
  async downloadApk(filename, org_id) {
    const token = checkToken();
    const url = new URL(`${API_URL}/uploads/download-apk`);
    url.searchParams.append('filename', filename);
    url.searchParams.append('org_id', org_id);
    if (process.env.NODE_ENV !== 'production') {
      console.debug('Downloading APK:', filename, 'for org_id:', org_id);
    }
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'x-access-tokens': token,
        },
      });
      const data = await handleResponse(response);
      if (process.env.NODE_ENV !== 'production') {
        console.debug('Backend response for downloadApk:', data ? 'Blob received' : 'No data');
      }
      return data;
    } catch (error) {
      throw new Error(error.message || 'Failed to download APK due to a network error.');
    }
  },

  /**
   * Fetches the version for a given organization.
   * @param {number} org_id - The organization ID.
   * @returns {Promise<object>} Version object with version_number, status, etc.
   */
  async getVersion(org_id) {
    const token = checkToken();
    const url = `${API_URL}/versions/${org_id}`;
    if (process.env.NODE_ENV !== 'production') {
      console.debug('Fetching version for org_id:', org_id);
    }
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'x-access-tokens': token,
        },
      });
      const data = await handleResponse(response);
      if (process.env.NODE_ENV !== 'production') {
        console.debug('Backend response for getVersion:', data);
      }
      return data;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch version due to a network error.');
    }
  },

  /**
   * Updates the version number for a given organization.
   * @param {number} org_id - The organization ID.
   * @param {string} version_number - The new version number.
   * @returns {Promise<object>} Updated version object.
   */
  async updateVersion(org_id, version_number) {
    const token = checkToken();
    const url = `${API_URL}/versions/${org_id}`;
    if (process.env.NODE_ENV !== 'production') {
      console.debug('Updating version for org_id:', org_id, 'to version_number:', version_number);
    }
    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-access-tokens': token,
        },
        body: JSON.stringify({ version_number }),
      });
      const data = await handleResponse(response);
      if (process.env.NODE_ENV !== 'production') {
        console.debug('Backend response for updateVersion:', data);
      }
      return data;
    } catch (error) {
      throw new Error(error.message || 'Failed to update version due to a network error.');
    }
  },
};

export { apkUploadService };

