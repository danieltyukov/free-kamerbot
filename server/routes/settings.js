const express = require('express');
const router = express.Router();
const { getDb } = require('../utils/database');
const { startMonitoring, stopMonitoring } = require('../services/monitor');

// Get all settings
router.get('/', (req, res) => {
  const db = getDb();
  const settings = db.get('settings').value();
  
  // Don't expose password
  const safeSettings = {
    ...settings,
    credentials: {
      kamernet: {
        email: settings.credentials.kamernet.email,
        password: settings.credentials.kamernet.password ? '***' : ''
      }
    }
  };
  
  res.json(safeSettings);
});

// Update settings
router.put('/', (req, res) => {
  const db = getDb();
  const currentSettings = db.get('settings').value();
  
  // Merge settings
  const newSettings = {
    ...currentSettings,
    ...req.body
  };
  
  db.set('settings', newSettings).write();
  
  // Restart monitoring with new settings
  stopMonitoring();
  startMonitoring();
  
  res.json({ success: true });
});

// Update search areas
router.put('/search-areas', (req, res) => {
  const db = getDb();
  db.get('settings')
    .assign({ searchAreas: req.body.searchAreas })
    .write();
  
  res.json({ success: true });
});

// Update filters
router.put('/filters', (req, res) => {
  const db = getDb();
  db.get('settings')
    .assign({ filters: req.body })
    .write();
  
  res.json({ success: true });
});

// Update auto-reply settings
router.put('/auto-reply', (req, res) => {
  const db = getDb();
  db.get('settings')
    .assign({ autoReply: req.body })
    .write();
  
  res.json({ success: true });
});

// Update Kamernet credentials
router.put('/credentials/kamernet', (req, res) => {
  const db = getDb();
  db.get('settings.credentials.kamernet')
    .assign({
      email: req.body.email,
      password: req.body.password
    })
    .write();
  
  res.json({ success: true });
});

// Update extra sources (agency URLs)
router.put('/sources', (req, res) => {
  const db = getDb();
  db.get('settings')
    .assign({ sources: { extraUrls: req.body.extraUrls || [] } })
    .write();
  res.json({ success: true });
});

module.exports = router;
