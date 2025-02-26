const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise'); // or use `pg` for PostgreSQL
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Database Connection
const db = await mysql.createConnection(process.env.DATABASE_URL);

// API: Save Contact Data
app.post('/api/contact', async (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }
  try {
    await db.execute(
      'INSERT INTO contacts (name, email, subject, message, timestamp) VALUES (?, ?, ?, ?, NOW())',
      [name, email, subject, message]
    );
    res.json({ success: true, message: 'Contact saved' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

// API: Fetch Edge Config Value
import { getConfigValue } from './api/config.js';

app.get('/api/config/:key', async (req, res) => {
  try {
    const value = await getConfigValue(req.params.key);
    res.json({ key: req.params.key, value });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Edge Config error' });
  }
});

// Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
