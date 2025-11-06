const express = require('express');
const router = express.Router();
const { autoReply } = require('../services/autoReply');
const { getDb } = require('../utils/database');

// Manually trigger auto-reply for a listing
router.post('/:listingId', async (req, res) => {
  const db = getDb();
  const listing = db.get('listings').find({ id: req.params.listingId }).value();
  
  if (!listing) {
    return res.status(404).json({ error: 'Listing not found' });
  }
  
  if (listing.platform !== 'Kamernet') {
    return res.status(400).json({ error: 'Auto-reply only available for Kamernet' });
  }
  
  const result = await autoReply(listing);
  res.json(result);
});

// Get replied listings
router.get('/replied', (req, res) => {
  const db = getDb();
  const repliedListings = db.get('repliedListings').value();
  res.json(repliedListings);
});

module.exports = router;
