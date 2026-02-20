const express = require('express');
const router = express.Router();
const { autoReply } = require('../services/autoReply');
const { getDb } = require('../utils/database');

// Get replied listings - MUST be before /:listingId to avoid matching "replied" as a param
router.get('/replied', (req, res) => {
  try {
    const db = getDb();
    const repliedListings = db.get('repliedListings').value();
    res.json(repliedListings);
  } catch (error) {
    console.error('Error getting replied listings:', error.message);
    res.status(500).json({ error: 'Failed to get replied listings' });
  }
});

// Manually trigger auto-reply for a listing
router.post('/:listingId', async (req, res) => {
  try {
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
  } catch (error) {
    console.error('Error triggering auto-reply:', error.message);
    res.status(500).json({ error: 'Failed to send auto-reply' });
  }
});

module.exports = router;
