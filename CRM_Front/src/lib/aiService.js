const OPEN_AI_API_URL = 'https://api.openai.com/v1/chat/completions';

const aiService = {
  async generateTemplate(prompt) {
    try {
      const response = await fetch(OPEN_AI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_OPEN_AI_KEY}`,
        },
        //hi
        //hi
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          response_format: { type: 'json_object' },
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate template: ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Error generating template:', error);
      throw error;
    }
  },
};

export default aiService;