const express = require('express');
const router = express.Router();
const { getDb } = require('../utils/database');
const { startMonitoring, stopMonitoring } = require('../services/monitor');

// Get all settings
router.get('/', (req, res) => {
  try {
    const db = getDb();
    const settings = db.get('settings').value();

    // Don't expose password
    const safeSettings = {
      ...settings,
      credentials: {
        kamernet: {
          email: settings.credentials?.kamernet?.email || '',
          password: settings.credentials?.kamernet?.password ? '***' : ''
        }
      }
    };

    res.json(safeSettings);
  } catch (error) {
    console.error('Error getting settings:', error.message);
    res.status(500).json({ error: 'Failed to get settings' });
  }
});

// Update settings
router.put('/', (req, res) => {
  try {
    const db = getDb();
    const currentSettings = db.get('settings').value();

    const newSettings = {
      ...currentSettings,
      ...req.body
    };

    db.set('settings', newSettings).write();

    // Restart monitoring with new settings
    stopMonitoring();
    startMonitoring();

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating settings:', error.message);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// Update search areas
router.put('/search-areas', (req, res) => {
  try {
    const db = getDb();
    db.get('settings')
      .assign({ searchAreas: req.body.searchAreas })
      .write();

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating search areas:', error.message);
    res.status(500).json({ error: 'Failed to update search areas' });
  }
});

// Update filters
router.put('/filters', (req, res) => {
  try {
    const db = getDb();
    db.get('settings')
      .assign({ filters: req.body })
      .write();

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating filters:', error.message);
    res.status(500).json({ error: 'Failed to update filters' });
  }
});

// Update auto-reply settings
router.put('/auto-reply', (req, res) => {
  try {
    const db = getDb();
    db.get('settings')
      .assign({ autoReply: req.body })
      .write();

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating auto-reply settings:', error.message);
    res.status(500).json({ error: 'Failed to update auto-reply settings' });
  }
});

// Update Kamernet credentials
router.put('/credentials/kamernet', (req, res) => {
  try {
    const db = getDb();
    db.get('settings.credentials.kamernet')
      .assign({
        email: req.body.email,
        password: req.body.password
      })
      .write();

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating credentials:', error.message);
    res.status(500).json({ error: 'Failed to update credentials' });
  }
});

// Update extra sources (agency URLs)
router.put('/sources', (req, res) => {
  try {
    const db = getDb();
    db.get('settings')
      .assign({ sources: { extraUrls: req.body.extraUrls || [] } })
      .write();
    // Restart monitoring so new sources take effect immediately
    try {
      stopMonitoring();
      startMonitoring();
    } catch (e) {
      console.warn('Warning restarting monitoring after sources update:', e.message);
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating sources:', error.message);
    res.status(500).json({ error: 'Failed to update sources' });
  }
});

module.exports = router;
