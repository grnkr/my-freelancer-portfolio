const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Define paths
const dataDir = path.join(__dirname, '..', 'data');
const contactsPath = path.join(dataDir, 'contacts.json');
const testimonialsPath = path.join(dataDir, 'testimonials.json');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

// Ensure files exist
if (!fs.existsSync(contactsPath)) fs.writeFileSync(contactsPath, JSON.stringify([]));
if (!fs.existsSync(testimonialsPath)) fs.writeFileSync(testimonialsPath, JSON.stringify([]));

// API to handle contact form submission
app.post('/api/contact', (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !message) return res.status(400).json({ success: false, message: 'Missing required fields' });

  try {
    const contacts = JSON.parse(fs.readFileSync(contactsPath));
    contacts.push({ id: Date.now().toString(), name, email, subject, message, timestamp: new Date().toISOString() });
    fs.writeFileSync(contactsPath, JSON.stringify(contacts, null, 2));
    res.json({ success: true, message: 'Contact saved' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error saving contact' });
  }
});

// API to fetch contacts
app.get('/api/contacts', (req, res) => {
  try {
    const contacts = JSON.parse(fs.readFileSync(contactsPath));
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving contacts' });
  }
});

// Export as Vercel Serverless Function
module.exports = app;
