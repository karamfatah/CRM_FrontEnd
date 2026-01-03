/* import { MongoClient } from 'mongodb';

const mongoUri = 'mongodb://admin:gd%5Eghdgd5ksau7399%23%23G5R5Td201251542@localhost/admin';
let client;

async function connectMongo() {
  if (!client) {
    try {
      client = new MongoClient(mongoUri);
      await client.connect();
      console.log('Connected to MongoDB');
    } catch (error) {
      console.error('MongoDB connection error:', error);
      throw error;
    }
  }
  return client.db('audit_app');
}

const templateService = {
  async createTemplate(template, orgId) {
    try {
      const db = await connectMongo();
      const result = await db.collection('templates').insertOne({ ...template, org_id: orgId });
      return result;
    } catch (error) {
      console.error('Error creating template:', error);
      throw error;
    }
  },
};

export default templateService; */

// const MONGO_API_URL = import.meta.env.VITE_MONGO_API_URL || 'http://192.168.100.25:5055';



////////////Working
// const MONGO_API_URL = import.meta.env.VITE_API_BASE_URL;

// const templateService = {
//   async createTemplate(template, orgId) {
//     try {
//       const response = await fetch(`${MONGO_API_URL}/api/templates`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ template, orgId }),
//       });

//       if (!response.ok) {
//         throw new Error(`Failed to create template: ${response.statusText}`);
//       }

//       return await response.json();
//     } catch (error) {
//       console.error('Error creating template:', error);
//       throw error;
//     }
//   },
// };

// export default templateService;


///working


const MONGO_API_URL = import.meta.env.VITE_API_BASE_URL;

const templateService = {
  async createTemplate(template, orgId, token) {
    try {
      const response = await fetch(`${MONGO_API_URL}/api/templates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-access-tokens': token,
        },
        body: JSON.stringify({ template, orgId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create template: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating template:', error);
      throw error;
    }
  },

  async fetchTemplateNames(token, orgId = null) {
    try {
      const url = new URL(`${MONGO_API_URL}/api/templates/names`);
      if (orgId) {
        url.searchParams.append('orgId', orgId);
      }
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-access-tokens': token,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch template names: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching template names:', error);
      throw error;
    }
  },

  async fetchTemplateById(id, token) {
    try {
      const response = await fetch(`${MONGO_API_URL}/api/templates/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-access-tokens': token,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch template: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching template:', error);
      throw error;
    }
  },

  async updateTemplate(id, template, orgId, token) {
    try {
      const response = await fetch(`${MONGO_API_URL}/api/templates/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-access-tokens': token,
        },
        body: JSON.stringify({ template, orgId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update template: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating template:', error);
      throw error;
    }
  },

  async deleteTemplate(id, token) {
    try {
      const response = await fetch(`${MONGO_API_URL}/api/templates/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-access-tokens': token,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete template: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting template:', error);
      throw error;
    }
  },

  async fetchReportNames(token) {
    try {
      const response = await fetch(`${MONGO_API_URL}/api/reports_names`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-access-tokens': token,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch report names: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching report names:', error);
      throw error;
    }
  },
};

export default templateService;