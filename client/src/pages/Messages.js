import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import DeleteIcon from '@mui/icons-material/Delete';
import MailIcon from '@mui/icons-material/Mail';
import DraftsIcon from '@mui/icons-material/Drafts';
import SyncIcon from '@mui/icons-material/Sync';

function Messages() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    fetchMessages();
    const t = setInterval(fetchMessages, 30000);
    return () => clearInterval(t);
  }, []);

  const syncNow = async () => {
    try {
      await axios.post('/api/messages/sync');
      fetchMessages();
    } catch (e) {
      console.error('Error syncing messages:', e);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await axios.get('/api/messages');
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.put(`/api/messages/${id}/read`);
      fetchMessages();
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const deleteMessage = async (id) => {
    try {
      await axios.delete(`/api/messages/${id}`);
      fetchMessages();
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const unreadCount = messages.filter(m => !m.read).length;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ mb: 0 }}>
            Messages
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {messages.length} total &middot; {unreadCount} unread
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="small"
          startIcon={<SyncIcon />}
          onClick={syncNow}
        >
          Sync Now
        </Button>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {messages.map((message) => (
          <Paper
            key={message.id}
            sx={{
              p: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              transition: 'all 0.2s ease',
              ...(!message.read && {
                borderLeft: '3px solid #0f766e',
                backgroundColor: 'rgba(15, 118, 110, 0.04)',
              }),
              '&:hover': {
                boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
              },
            }}
          >
            <IconButton onClick={() => markAsRead(message.id)} sx={{ flexShrink: 0 }}>
              {message.read ? (
                <DraftsIcon sx={{ color: '#94a3b8' }} />
              ) : (
                <Badge color="error" variant="dot">
                  <MailIcon sx={{ color: '#0f766e' }} />
                </Badge>
              )}
            </IconButton>

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: message.read ? 400 : 600 }}>
                {message.from || 'Landlord'}
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                {message.subject || message.content}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date(message.timestamp).toLocaleString()}
              </Typography>
            </Box>

            <IconButton
              onClick={() => deleteMessage(message.id)}
              sx={{
                flexShrink: 0,
                '&:hover': { color: '#ef4444' },
              }}
            >
              <DeleteIcon />
            </IconButton>
          </Paper>
        ))}
      </Box>

      {messages.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <MailIcon sx={{ fontSize: 64, color: '#cbd5e1', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No messages yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Messages from landlords will appear here
          </Typography>
          <Button
            variant="contained"
            startIcon={<SyncIcon />}
            onClick={syncNow}
          >
            Sync Now
          </Button>
        </Box>
      )}
    </Box>
  );
}

export default Messages;
