import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import DeleteIcon from '@mui/icons-material/Delete';
import MailIcon from '@mui/icons-material/Mail';
import DraftsIcon from '@mui/icons-material/Drafts';

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

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h4" gutterBottom>
          Messages ({messages.length})
        </Typography>
        <Button variant="outlined" size="small" onClick={syncNow}>Sync Now</Button>
      </Box>

      <Paper>
        <List>
          {messages.map((message) => (
            <ListItem
              key={message.id}
              sx={{
                borderBottom: '1px solid #e0e0e0',
                bgcolor: message.read ? 'transparent' : '#e3f2fd'
              }}
              secondaryAction={
                <IconButton edge="end" onClick={() => deleteMessage(message.id)}>
                  <DeleteIcon />
                </IconButton>
              }
            >
              <IconButton onClick={() => markAsRead(message.id)} sx={{ mr: 2 }}>
                {message.read ? <DraftsIcon /> : <Badge color="error" variant="dot"><MailIcon /></Badge>}
              </IconButton>
              
              <ListItemText
                primary={message.from || 'Landlord'}
                secondary={
                  <>
                    <Typography variant="body2" component="span">
                      {message.subject || message.content}
                    </Typography>
                    <br />
                    <Typography variant="caption" color="text.secondary">
                      {new Date(message.timestamp).toLocaleString()}
                    </Typography>
                  </>
                }
              />
            </ListItem>
          ))}
        </List>

        {messages.length === 0 && (
          <Box sx={{ p: 5, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              No messages yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Messages from landlords will appear here
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
}

export default Messages;
