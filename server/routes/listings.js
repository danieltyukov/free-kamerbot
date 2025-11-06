const express = require('express');
const router = express.Router();
const { getDb } = require('../utils/database');

// Get all listings
router.get('/', (req, res) => {
  const db = getDb();
  const listings = db.get('listings').value();
  res.json(listings);
});

// Get listing by ID
router.get('/:id', (req, res) => {
  const db = getDb();
  const listing = db.get('listings').find({ id: req.params.id }).value();
  
  if (!listing) {
    return res.status(404).json({ error: 'Listing not found' });
  }
  
  res.json(listing);
});

// Mark listing as read
router.put('/:id/read', (req, res) => {
  const db = getDb();
  db.get('listings')
    .find({ id: req.params.id })
    .assign({ read: true })
    .write();
  
  res.json({ success: true });
});

// Toggle favorite
router.put('/:id/favorite', (req, res) => {
  const db = getDb();
  const listing = db.get('listings').find({ id: req.params.id }).value();
  
  db.get('listings')
    .find({ id: req.params.id })
    .assign({ favorite: !listing.favorite })
    .write();
  
  res.json({ success: true, favorite: !listing.favorite });
});

// Delete listing
router.delete('/:id', (req, res) => {
  const db = getDb();
  db.get('listings')
    .remove({ id: req.params.id })
    .write();
  
  res.json({ success: true });
});

// Get statistics
router.get('/stats/summary', (req, res) => {
  const db = getDb();
  const listings = db.get('listings').value();
  
  const stats = {
    total: listings.length,
    unread: listings.filter(l => !l.read).length,
    favorites: listings.filter(l => l.favorite).length,
    byPlatform: {
      Kamernet: listings.filter(l => l.platform === 'Kamernet').length,
      Funda: listings.filter(l => l.platform === 'Funda').length,
      Pararius: listings.filter(l => l.platform === 'Pararius').length
    }
  };
  
  res.json(stats);
});

module.exports = router;
