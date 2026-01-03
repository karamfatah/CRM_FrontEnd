const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
require('dotenv').config();

const app = express();
const mongoUri = process.env.MONGO_URI || 'mongodb://admin:gd%5Eghdgd5ksau7399%23%23G5R5Td201251542@localhost:27017/admin';
let client;

async function connectMongo() {
  if (!client) {
    client = new MongoClient(mongoUri);
    await client.connect();
    console.log('Connected to MongoDB');
  }
  return client.db('audit_app');
}

app.use(cors({ origin: 'http://localhost:5175' })); // Match your Vite dev server
app.use(express.json());

app.post('/api/templates', async (req, res) => {
  try {
    const { template, orgId } = req.body;
    const db = await connectMongo();
    const result = await db.collection('templates').insertOne({ ...template, org_id: orgId });
    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating template:', error);
    res.status(500).json({ error: 'Failed to create template' });
  }
});

const PORT = process.env.PORT || 4323;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`MongoDB server running on http://0.0.0.0:${PORT}`);
});