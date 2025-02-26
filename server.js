// server.js
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); // Serve static files from 'public' directory

// Create data directory if it doesn't exist
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

// Initialize data files if they don't exist
const contactsPath = path.join(dataDir, 'contacts.json');
const testimonialsPath = path.join(dataDir, 'testimonials.json');

if (!fs.existsSync(contactsPath)) {
  fs.writeFileSync(contactsPath, JSON.stringify([]));
}

if (!fs.existsSync(testimonialsPath)) {
  fs.writeFileSync(testimonialsPath, JSON.stringify([]));
}

// API endpoint to save contact form data
app.post('/api/contact', (req, res) => {
  const { name, email, subject, message } = req.body;
  
  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }
  
  try {
    // Read existing contacts
    const contacts = JSON.parse(fs.readFileSync(contactsPath));
    
    // Add new contact with timestamp
    contacts.push({
      id: Date.now().toString(),
      name,
      email,
      subject,
      message,
      timestamp: new Date().toISOString(),
      status: 'new'
    });
    
    // Save updated contacts
    fs.writeFileSync(contactsPath, JSON.stringify(contacts, null, 2));
    
    res.json({ success: true, message: 'Contact form submitted successfully' });
  } catch (error) {
    console.error('Error saving contact:', error);
    res.status(500).json({ success: false, message: 'Error saving contact information' });
  }
});

// API endpoint to save testimonials (admin only, would need authentication in production)
app.post('/api/testimonials', (req, res) => {
  const { name, company, rating, comment, photoUrl } = req.body;
  
  if (!name || !company || !rating || !comment) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }
  
  try {
    // Read existing testimonials
    const testimonials = JSON.parse(fs.readFileSync(testimonialsPath));
    
    // Add new testimonial
    testimonials.push({
      id: Date.now().toString(),
      name,
      company,
      rating: parseInt(rating),
      comment,
      photoUrl: photoUrl || '',
      timestamp: new Date().toISOString()
    });
    
    // Save updated testimonials
    fs.writeFileSync(testimonialsPath, JSON.stringify(testimonials, null, 2));
    
    res.json({ success: true, message: 'Testimonial added successfully' });
  } catch (error) {
    console.error('Error saving testimonial:', error);
    res.status(500).json({ success: false, message: 'Error saving testimonial' });
  }
});

// API endpoints to get data (would need authentication for production)
app.get('/api/contacts', (req, res) => {
  try {
    const contacts = JSON.parse(fs.readFileSync(contactsPath));
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving contacts' });
  }
});

app.get('/api/testimonials', (req, res) => {
  try {
    const testimonials = JSON.parse(fs.readFileSync(testimonialsPath));
    res.json(testimonials);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving testimonials' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});