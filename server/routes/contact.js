const express = require('express');
const router = express.Router();
const { getDb } = require('../database/db');

// Submit contact form
router.post('/submit', (req, res) => {
  const db = getDb();
  const { name, email, message } = req.body;
  
  if (!name || !email || !message) {
    res.status(400).json({ error: 'Name, email, and message are required' });
    return;
  }
  
  db.run(
    'INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)',
    [name, email, message],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ message: 'Contact form submitted successfully' });
    }
  );
});

module.exports = router;

