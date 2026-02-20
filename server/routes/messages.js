const express = require('express');
const router = express.Router();
const { getDb } = require('../utils/database');
const { fetchKamernetMessages } = require('../services/messagesMonitor');

// Get all messages
router.get('/', (req, res) => {
  try {
    const db = getDb();
    const messages = db.get('messages').value();
    res.json(messages);
  } catch (error) {
    console.error('Error getting messages:', error.message);
    res.status(500).json({ error: 'Failed to get messages' });
  }
});

// Add a new message
router.post('/', (req, res) => {
  try {
    const db = getDb();
    const message = {
      id: `msg-${Date.now()}`,
      ...req.body,
      timestamp: new Date().toISOString(),
      read: false
    };

    db.get('messages').push(message).write();
    res.json(message);
  } catch (error) {
    console.error('Error adding message:', error.message);
    res.status(500).json({ error: 'Failed to add message' });
  }
});

// Sync messages from Kamernet
router.post('/sync', async (req, res) => {
  try {
    const newMessages = await fetchKamernetMessages();
    res.json({ success: true, added: newMessages.length, messages: newMessages });
  } catch (err) {
    console.error('Error syncing messages:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Mark message as read
router.put('/:id/read', (req, res) => {
  try {
    const db = getDb();
    const message = db.get('messages').find({ id: req.params.id }).value();
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }
    db.get('messages')
      .find({ id: req.params.id })
      .assign({ read: true })
      .write();

    res.json({ success: true });
  } catch (error) {
    console.error('Error marking message as read:', error.message);
    res.status(500).json({ error: 'Failed to mark message as read' });
  }
});

// Delete message
router.delete('/:id', (req, res) => {
  try {
    const db = getDb();
    const message = db.get('messages').find({ id: req.params.id }).value();
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }
    db.get('messages')
      .remove({ id: req.params.id })
      .write();

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting message:', error.message);
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

module.exports = router;
