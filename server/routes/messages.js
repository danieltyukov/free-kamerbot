const express = require('express');
const router = express.Router();
const { getDb } = require('../utils/database');
const { fetchKamernetMessages } = require('../services/messagesMonitor');

// Get all messages
router.get('/', (req, res) => {
  const db = getDb();
  const messages = db.get('messages').value();
  res.json(messages);
});

// Add a new message (mock - in real app would sync from platforms)
router.post('/', (req, res) => {
  const db = getDb();
  const message = {
    id: `msg-${Date.now()}`,
    ...req.body,
    timestamp: new Date().toISOString(),
    read: false
  };
  
  db.get('messages').push(message).write();
  res.json(message);
});

// Sync messages from Kamernet
router.post('/sync', async (req, res) => {
  try {
    const newMessages = await fetchKamernetMessages();
    res.json({ success: true, added: newMessages.length, messages: newMessages });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Mark message as read
router.put('/:id/read', (req, res) => {
  const db = getDb();
  db.get('messages')
    .find({ id: req.params.id })
    .assign({ read: true })
    .write();
  
  res.json({ success: true });
});

// Delete message
router.delete('/:id', (req, res) => {
  const db = getDb();
  db.get('messages')
    .remove({ id: req.params.id })
    .write();
  
  res.json({ success: true });
});

module.exports = router;
