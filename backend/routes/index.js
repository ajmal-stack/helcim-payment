const express = require('express');
const router = express.Router();
const helcimRoutes = require('./helcim');

router.get('/status', (req, res) => {
  res.json({ status: 'API is running' });
});

// Mount Helcim routes
router.use('/helcim', helcimRoutes);

module.exports = router;
