const express = require('express');
const router = express.Router();
const { getDb } = require('../utils/database');

// Get statistics - MUST be before /:id to avoid "stats" matching as an id param
router.get('/stats/summary', (req, res) => {
  try {
    const db = getDb();
    const allListings = db.get('listings').value();
    // Deduplicate by ID
    const seen = new Set();
    const listings = allListings.filter(l => {
      if (seen.has(l.id)) return false;
      seen.add(l.id);
      return true;
    });

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
    // Deduplicate by ID (keep first occurrence) to prevent React key collisions
    const seen = new Set();
    const unique = listings.filter(l => {
      if (seen.has(l.id)) return false;
      seen.add(l.id);
      return true;
    });
    res.json(unique);
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

// Bulk delete: ?onlyInvalid=true removes listings with implausibly low price
// (parse errors). Without the flag, deletes ALL listings.
router.delete('/', (req, res) => {
  try {
    const db = getDb();
    const onlyInvalid = req.query.onlyInvalid === 'true';
    const before = db.get('listings').size().value();

    if (onlyInvalid) {
      db.set('listings', db.get('listings').filter(l => (l.price || 0) >= 50).value()).write();
    } else {
      db.set('listings', []).write();
    }

    const after = db.get('listings').size().value();
    res.json({ success: true, removed: before - after, remaining: after });
  } catch (error) {
    console.error('Error bulk-deleting listings:', error.message);
    res.status(500).json({ error: 'Failed to bulk-delete listings' });
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
