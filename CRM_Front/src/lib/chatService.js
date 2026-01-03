const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/chats`;
const USERS_API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/users`;

const checkToken = () => {
  const token = localStorage.getItem('access_token');
  if (!token) throw new Error('No access token found. Please log in.');
  return token;
};

const handleResponse = async (response) => {
  if (response.ok) {
    if (response.status === 204) return {};
    const text = await response.text();
    return text ? JSON.parse(text) : {};
  }
  const errorData = await response.json().catch(() => ({}));
  const errorMessage = errorData.message || 'Request failed';
  switch (response.status) {
    case 401: throw new Error('Unauthorized: Please log in again.');
    case 403: throw new Error('Forbidden: You lack the required permissions.');
    case 404: throw new Error(`Not Found: ${errorMessage}`);
    case 400: throw new Error(`Bad Request: ${errorMessage}`);
    default: throw new Error(`Failed: ${response.status} - ${errorMessage}`);
  }
};

const chatService = {
  async getChats(org_id) {
    const token = checkToken();
    const url = new URL(API_URL);
    url.searchParams.append('org_id', org_id);
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'x-access-tokens': token,
      },
    });
    return handleResponse(response);
  },

  async getUsers(org_id) {
    const token = checkToken();
    const url = new URL(USERS_API_URL);
    url.searchParams.append('org_id', org_id);
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'x-access-tokens': token,
      },
    });
    const userData = await handleResponse(response);

    // Fetch full profile for each user to get base64 image data
    const detailedUsers = await Promise.all(
      userData.map(async (user) => {
        try {
          const userProfile = await this.getUserProfile(user._id);
          return { ...user, user_image: userProfile.user_image };
        } catch (err) {
          console.error(`Error fetching profile for user ${user._id}:`, err);
          return user; // Fallback to original user data if profile fetch fails
        }
      })
    );

    return detailedUsers;
  },

  async getUserProfile(user_id) {
    const token = checkToken();
    const url = new URL(`${USERS_API_URL}/get_profile`);
    url.searchParams.append('user_id', user_id);
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'x-access-tokens': token,
      },
    });
    return handleResponse(response);
  },

  async createIndividualChat(user_id, org_id) {
    const token = checkToken();
    const response = await fetch(`${API_URL}/individual`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-access-tokens': token,
      },
      body: JSON.stringify({ user_id, org_id }),
    });
    return handleResponse(response);
  },

  async createGroupChat(name, user_ids, org_id) {
    const token = checkToken();
    const response = await fetch(`${API_URL}/group`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-access-tokens': token,
      },
      body: JSON.stringify({ name, user_ids, org_id }),
    });
    return handleResponse(response);
  },

  async getMessages(chatId) {
    const token = checkToken();
    const response = await fetch(`${API_URL}/${chatId}/messages`, {
      headers: {
        'Content-Type': 'application/json',
        'x-access-tokens': token,
      },
    });
    return handleResponse(response);
  },

  async sendMessage(chatId, content) {
    const token = checkToken();
    const response = await fetch(`${API_URL}/${chatId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-access-tokens': token,
      },
      body: JSON.stringify({ content }),
    });
    return handleResponse(response);
  },

  async uploadMedia(chatId, file) {
    const token = checkToken();
    const formData = new FormData();
    formData.append('media', file);
    const response = await fetch(`${API_URL}/${chatId}/media`, {
      method: 'POST',
      headers: { 'x-access-tokens': token },
      body: formData,
    });
    return handleResponse(response);
  },
};

export { chatService };