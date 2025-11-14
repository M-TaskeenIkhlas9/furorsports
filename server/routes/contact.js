const express = require('express');
const router = express.Router();
const { getDb } = require('../database/db');
const { sendContactEmail } = require('../utils/emailService');

// Submit contact form
router.post('/submit', async (req, res) => {
  const db = getDb();
  const { name, email, message } = req.body;
  
  if (!name || !email || !message) {
    res.status(400).json({ error: 'Name, email, and message are required' });
    return;
  }
  
  // Save to database
  db.run(
    'INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)',
    [name, email, message],
    async function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      // Send email notification (non-blocking)
      try {
        const emailResult = await sendContactEmail({ name, email, message });
        if (emailResult.success) {
          console.log('Contact form submitted and email sent successfully');
        } else {
          console.log('Contact form saved to database, but email failed:', emailResult.error);
        }
      } catch (emailError) {
        console.error('Error sending email notification:', emailError);
        // Don't fail the request if email fails - message is still saved to database
      }
      
      res.json({ message: 'Contact form submitted successfully' });
    }
  );
});

module.exports = router;

