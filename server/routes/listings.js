const express = require('express');
const router = express.Router();
const { getDb } = require('../utils/database');

// Get statistics - MUST be before /:id to avoid "stats" matching as an id param
router.get('/stats/summary', (req, res) => {
  try {
    const db = getDb();
    const listings = db.get('listings').value();

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

    const stats = {
      total: listings.length,
      unread: listings.filter(l => !l.read).length,
      favorites: listings.filter(l => l.favorite).length,
      newToday: listings.filter(l => l.discovered >= todayStart).length,
      byPlatform: {
        Kamernet: listings.filter(l => l.platform === 'Kamernet').length,
        Funda: listings.filter(l => l.platform === 'Funda').length,
        Pararius: listings.filter(l => l.platform === 'Pararius').length
      }
    };

    res.json(stats);
  } catch (error) {
    console.error('Error getting stats:', error.message);
    res.status(500).json({ error: 'Failed to get statistics' });
  }
});

// Get all listings
router.get('/', (req, res) => {
  try {
    const db = getDb();
    const listings = db.get('listings').value();
    res.json(listings);
  } catch (error) {
    console.error('Error getting listings:', error.message);
    res.status(500).json({ error: 'Failed to get listings' });
  }
});

// Get listing by ID
router.get('/:id', (req, res) => {
  try {
    const db = getDb();
    const listing = db.get('listings').find({ id: req.params.id }).value();

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    res.json(listing);
  } catch (error) {
    console.error('Error getting listing:', error.message);
    res.status(500).json({ error: 'Failed to get listing' });
  }
});

// Mark listing as read
router.put('/:id/read', (req, res) => {
  try {
    const db = getDb();
    const listing = db.get('listings').find({ id: req.params.id }).value();
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }
    db.get('listings')
      .find({ id: req.params.id })
      .assign({ read: true })
      .write();

    res.json({ success: true });
  } catch (error) {
    console.error('Error marking listing as read:', error.message);
    res.status(500).json({ error: 'Failed to mark listing as read' });
  }
});

// Toggle favorite
router.put('/:id/favorite', (req, res) => {
  try {
    const db = getDb();
    const listing = db.get('listings').find({ id: req.params.id }).value();
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    db.get('listings')
      .find({ id: req.params.id })
      .assign({ favorite: !listing.favorite })
      .write();

    res.json({ success: true, favorite: !listing.favorite });
  } catch (error) {
    console.error('Error toggling favorite:', error.message);
    res.status(500).json({ error: 'Failed to toggle favorite' });
  }
});

// Delete listing
router.delete('/:id', (req, res) => {
  try {
    const db = getDb();
    const listing = db.get('listings').find({ id: req.params.id }).value();
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }
    db.get('listings')
      .remove({ id: req.params.id })
      .write();

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting listing:', error.message);
    res.status(500).json({ error: 'Failed to delete listing' });
  }
});

module.exports = router;
