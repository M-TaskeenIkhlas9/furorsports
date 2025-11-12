const express = require('express');
const router = express.Router();
const { getDb } = require('../database/db');

// Subscribe to newsletter
router.post('/subscribe', (req, res) => {
  const db = getDb();
  const { email, name } = req.body;
  
  if (!email) {
    res.status(400).json({ error: 'Email is required' });
    return;
  }
  
  db.run(
    'INSERT OR IGNORE INTO newsletter (email, name) VALUES (?, ?)',
    [email, name || null],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        res.status(200).json({ message: 'Email already subscribed' });
      } else {
        res.json({ message: 'Successfully subscribed to newsletter' });
      }
    }
  );
});

module.exports = router;

