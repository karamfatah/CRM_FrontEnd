const API_URL = `${import.meta.env.VITE_API_BASE_URL}/categories`;

const categoryService = {
  async getCategories() {
    const token = localStorage.getItem('token');
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-access-tokens': token,
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.status}`);
    }
    return response.json();
  },

  async updateCategory(id, data) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-access-tokens': token,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Failed to update category: ${response.status}`);
    }
    return response.json();
  },
};

export { categoryService };