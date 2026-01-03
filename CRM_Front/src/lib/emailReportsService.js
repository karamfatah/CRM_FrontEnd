import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5055';

const emailReportsService = {
  // Get all email reports for the organization
  async getEmailReports() {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_BASE_URL}/api/email-reports`, {
        headers: {
          'x-access-tokens': token,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching email reports:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch email reports');
    }
  },

  // Create a new email report
  async createEmailReport(data) {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.post(`${API_BASE_URL}/api/email-reports`, data, {
        headers: {
          'x-access-tokens': token,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error creating email report:', error);
      throw new Error(error.response?.data?.message || 'Failed to create email report');
    }
  },

  // Update an email report
  async updateEmailReport(id, data) {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.put(`${API_BASE_URL}/api/email-reports/${id}`, data, {
        headers: {
          'x-access-tokens': token,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error updating email report:', error);
      throw new Error(error.response?.data?.message || 'Failed to update email report');
    }
  },

  // Delete an email report
  async deleteEmailReport(id) {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.delete(`${API_BASE_URL}/api/email-reports/${id}`, {
        headers: {
          'x-access-tokens': token,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting email report:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete email report');
    }
  },
};

export { emailReportsService };
















