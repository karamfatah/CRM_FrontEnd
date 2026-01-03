const MONGO_API_URL = import.meta.env.VITE_MONGO_API_URL || 'https://tqmapp.allfoods.tech';

const schemaCreatorService = {
  async createSchema(schema, orgId) {
    try {
      const response = await fetch(`${MONGO_API_URL}/api/schemas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ schema, orgId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create schema: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating schema:', error);
      throw error;
    }
  },
};

export default schemaCreatorService;