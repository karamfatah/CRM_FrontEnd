const API_URL = `${import.meta.env.VITE_API_BASE_URL}/sub_section_qa`;

// Helper function to handle token refresh logic
async function refreshTokenAndRetry(url, options) {
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
}

const subSectionQaService = {
  async getSubSections(org_id, section_qa_id) {
    let token = localStorage.getItem('access_token');
    console.log('Sending GET request with token:', token || 'No token');

    if (!org_id) {
      throw new Error('org_id is required');
    }
    if (!section_qa_id) {
      throw new Error('section_qa_id is required');
    }

    const url = new URL(API_URL);
    url.searchParams.append('org_id', org_id);
    url.searchParams.append('section_qa_id', section_qa_id);

    const options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-access-tokens': token,
      },
    };

    let response = await fetch(url, options);

    if (response.status === 401) {
      try {
        response = await refreshTokenAndRetry(url, options);
      } catch (refreshError) {
        localStorage.clear();
        window.location.href = '/login';
        throw refreshError;
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Fetch failed:', {
        status: response.status,
        statusText: response.statusText,
        body: await response.text().catch(() => 'No response body'),
        errorData,
      });
      throw new Error(
        `Failed to fetch sub-sections: ${response.status} - ${errorData.message || errorData.error || response.statusText || 'Unknown error'}`
      );
    }

    const data = await response.json();
    console.log('Raw sub-sections response:', data);
    const mappedData = data.map(sub => ({
      sub_section_qa_id: sub.id,
      section_qa_id: sub.section_qa_id,
      sub_section_en: sub.name_en,
      sub_section_ar: sub.name_ar,
      org_id: sub.org_id
    }));
    console.log('Mapped sub-sections:', mappedData);
    return mappedData;
  },

  async getSubSection(id, org_id, section_qa_id) {
    let token = localStorage.getItem('access_token');
    console.log('Sending GET request with token:', token || 'No token');

    if (!org_id) {
      throw new Error('org_id is required');
    }
    if (!id) {
      throw new Error('id is required');
    }
    if (!section_qa_id) {
      throw new Error('section_qa_id is required');
    }

    const url = new URL(`${API_URL}/${id}`);
    url.searchParams.append('org_id', org_id);
    url.searchParams.append('section_qa_id', section_qa_id);

    const options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-access-tokens': token,
      },
    };

    let response = await fetch(url, options);

    if (response.status === 401) {
      try {
        response = await refreshTokenAndRetry(url, options);
      } catch (refreshError) {
        localStorage.clear();
        window.location.href = '/login';
        throw refreshError;
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Fetch failed:', {
        status: response.status,
        statusText: response.statusText,
        body: await response.text().catch(() => 'No response body'),
        errorData,
      });
      throw new Error(
        `Failed to fetch sub-section: ${response.status} - ${errorData.message || errorData.error || response.statusText || 'Unknown error'}`
      );
    }

    const data = await response.json();
    console.log('Raw sub-section response:', data);
    const mappedData = {
      sub_section_qa_id: data.id,
      section_qa_id: data.section_qa_id,
      sub_section_en: data.name_en,
      sub_section_ar: data.name_ar,
      org_id: data.org_id
    };
    console.log('Mapped sub-section:', mappedData);
    return mappedData;
  },

  async createSubSection(data, org_id) {
    let token = localStorage.getItem('access_token');
    console.log('Sending POST request with token:', token || 'No token', 'data:', data, 'org_id:', org_id);

    if (!org_id) {
      throw new Error('org_id is required');
    }
    if (!data || typeof data !== 'object') {
      throw new Error('data is required and must be an object');
    }
    if (!data.section_qa_id || !data.sub_section_en || !data.sub_section_ar) {
      throw new Error('section_qa_id, sub_section_en, and sub_section_ar are required');
    }

    const url = new URL(API_URL);
    url.searchParams.append('org_id', org_id);

    const requestBody = {
      section_qa_id: data.section_qa_id,
      sub_section_en: data.sub_section_en,
      sub_section_ar: data.sub_section_ar,
      org_id: org_id,
    };

    console.log('POST request body:', requestBody);

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-access-tokens': token,
      },
      body: JSON.stringify(requestBody),
    };

    let response = await fetch(url, options);

    if (response.status === 401) {
      try {
        console.log('Received 401, attempting token refresh');
        response = await refreshTokenAndRetry(url, options);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError.message);
        localStorage.clear();
        window.location.href = '/login';
        throw refreshError;
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('POST request failed:', {
        status: response.status,
        statusText: response.statusText,
        body: await response.text().catch(() => 'No response body'),
        errorData,
      });
      throw new Error(
        `Failed to create sub-section: ${response.status} - ${errorData.message || errorData.error || response.statusText || 'Unknown error'}`
      );
    }

    const createdData = await response.json();
    console.log('POST response:', createdData);
    return {
      sub_section_qa_id: createdData.id,
      section_qa_id: createdData.section_qa_id,
      sub_section_en: createdData.name_en,
      sub_section_ar: createdData.name_ar,
      org_id: createdData.org_id,
    };
  },

  async bulkCreateSubSections(dataArray, org_id) {
    let token = localStorage.getItem('access_token');
    console.log('Sending bulk POST request with token:', token || 'No token', 'dataArray:', dataArray, 'org_id:', org_id);

    if (!org_id) {
      throw new Error('org_id is required');
    }
    if (!Array.isArray(dataArray) || dataArray.length === 0) {
      throw new Error('dataArray is required and must be a non-empty array');
    }

    const invalidEntries = dataArray.filter(
      data => !data.section_qa_id || !data.sub_section_en || !data.sub_section_ar
    );
    if (invalidEntries.length > 0) {
      throw new Error('All entries must have section_qa_id, sub_section_en, and sub_section_ar');
    }

    const url = new URL(`${API_URL}/bulk`);
    url.searchParams.append('org_id', org_id);

    const requestBody = {
      org_id: org_id,
      section_qa_id: dataArray[0].section_qa_id,
      sub_sections: dataArray.map(data => ({
        sub_section_en: data.sub_section_en,
        sub_section_ar: data.sub_section_ar,
      })),
    };

    console.log('Bulk POST request body:', requestBody);

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-access-tokens': token,
      },
      body: JSON.stringify(requestBody),
    };

    let response = await fetch(url, options);

    if (response.status === 401) {
      try {
        console.log('Received 401, attempting token refresh');
        response = await refreshTokenAndRetry(url, options);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError.message);
        localStorage.clear();
        window.location.href = '/login';
        throw refreshError;
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Bulk POST request failed:', {
        status: response.status,
        statusText: response.statusText,
        body: await response.text().catch(() => 'No response body'),
        errorData,
      });
      throw new Error(
        `Failed to bulk create sub-sections: ${response.status} - ${errorData.message || errorData.error || response.statusText || 'Unknown error'}`
      );
    }

    const createdData = await response.json();
    console.log('Bulk POST response:', createdData);
    return createdData;
  },

  async updateSubSection(id, data, org_id) {
    let token = localStorage.getItem('access_token');
    console.log('Sending PUT request with token:', token || 'No token');

    if (!org_id) {
      throw new Error('org_id is required');
    }
    if (!id) {
      throw new Error('id is required');
    }
    if (!data || typeof data !== 'object') {
      throw new Error('data is required and must be an object');
    }

    const url = new URL(API_URL);
    url.searchParams.append('org_id', org_id);
    url.searchParams.append('sub_section_qa_id', id);

    const requestBody = {
      sub_section_en: data.sub_section_en,
      sub_section_ar: data.sub_section_ar,
    };

    console.log('PUT request body:', requestBody);

    const options = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-access-tokens': token,
      },
      body: JSON.stringify(requestBody),
    };

    let response = await fetch(url, options);

    if (response.status === 401) {
      try {
        console.log('Received 401, attempting token refresh');
        response = await refreshTokenAndRetry(url, options);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError.message);
        localStorage.clear();
        window.location.href = '/login';
        throw refreshError;
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('PUT request failed:', {
        status: response.status,
        statusText: response.statusText,
        body: await response.text().catch(() => 'No response body'),
        errorData,
      });
      throw new Error(
        `Failed to update sub-section: ${response.status} - ${errorData.message || errorData.error || response.statusText || 'Unknown error'}`
      );
    }

    const updatedData = await response.json();
    console.log('PUT response:', updatedData);
    return {
      sub_section_qa_id: updatedData.id,
      section_qa_id: updatedData.section_qa_id,
      sub_section_en: updatedData.name_en,
      sub_section_ar: updatedData.name_ar,
      org_id: updatedData.org_id,
    };
  },

  async deleteSubSection(id, org_id) {
    let token = localStorage.getItem('access_token');
    console.log('Sending DELETE request with token:', token || 'No token');

    if (!org_id) {
      throw new Error('org_id is required');
    }
    if (!id) {
      throw new Error('id is required');
    }

    const url = new URL(API_URL);
    url.searchParams.append('org_id', org_id);
    url.searchParams.append('sub_section_qa_id', id);

    const options = {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'x-access-tokens': token,
      },
    };

    let response = await fetch(url, options);

    if (response.status === 401) {
      try {
        console.log('Received 401, attempting token refresh');
        response = await refreshTokenAndRetry(url, options);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError.message);
        localStorage.clear();
        window.location.href = '/login';
        throw refreshError;
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('DELETE request failed:', {
        status: response.status,
        statusText: response.statusText,
        body: await response.text().catch(() => 'No response body'),
        errorData,
      });
      throw new Error(
        `Failed to delete sub-section: ${response.status} - ${errorData.message || errorData.error || response.statusText || 'Unknown error'}`
      );
    }

    const responseData = await response.json();
    console.log('DELETE response:', responseData);
    return responseData;
  },
};

export { subSectionQaService };