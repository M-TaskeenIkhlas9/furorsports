const express = require('express');
const router = express.Router();
const { pool, isReady } = require('../database/db');

// Middleware to check if database is ready
const checkDatabase = (req, res, next) => {
  if (!pool || !isReady()) {
    return res.status(503).json({ 
      error: 'Database is not ready yet. Please wait a moment and try again.',
      status: 'database_initializing'
    });
  }
  next();
};

router.use(checkDatabase);

// Subscribe to newsletter
router.post('/subscribe', async (req, res) => {
  try {
    const { email, name } = req.body;
    
    if (!email) {
      res.status(400).json({ error: 'Email is required' });
      return;
    }
    
    // MySQL doesn't have INSERT OR IGNORE, so we use INSERT IGNORE
    const [result] = await pool.query(
      'INSERT IGNORE INTO newsletter (email, name) VALUES (?, ?)',
      [email, name || null]
    );
    
    if (result.affectedRows === 0) {
      res.status(200).json({ message: 'Email already subscribed' });
    } else {
      res.json({ message: 'Successfully subscribed to newsletter' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
