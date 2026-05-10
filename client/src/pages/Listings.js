import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Paper from '@mui/material/Paper';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import DeleteIcon from '@mui/icons-material/Delete';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import SearchIcon from '@mui/icons-material/Search';
import ReplyIcon from '@mui/icons-material/Reply';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';

function Listings() {
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const notify = (message, severity = 'success') =>
    setSnackbar({ open: true, message, severity });

  useEffect(() => {
    fetchListings();
    const t = setInterval(fetchListings, 30000);
    return () => clearInterval(t);
  }, []);

  const filterListings = useCallback(() => {
    let filtered = listings;

    if (platformFilter !== 'all') {
      filtered = filtered.filter(l => l.platform === platformFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(l =>
        l.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredListings(filtered);
  }, [listings, platformFilter, searchTerm]);

  useEffect(() => {
    filterListings();
  }, [filterListings]);

  const fetchListings = async () => {
    try {
      const response = await axios.get('/api/listings');
      setListings(response.data);
    } catch (error) {
      console.error('Error fetching listings:', error);
    }
  };



  const toggleFavorite = async (id) => {
    try {
      await axios.put(`/api/listings/${id}/favorite`);
      fetchListings();
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const deleteListing = async (id) => {
    try {
      await axios.delete(`/api/listings/${id}`);
      fetchListings();
    } catch (error) {
      console.error('Error deleting listing:', error);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.put(`/api/listings/${id}/read`);
      fetchListings();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const triggerAutoReply = async (id) => {
    try {
      const response = await axios.post(`/api/auto-reply/${id}`);
      if (response.data.success) {
        notify('Auto-reply sent successfully', 'success');
      } else {
        notify('Failed to send auto-reply: ' + response.data.message, 'error');
      }
    } catch (error) {
      notify('Error sending auto-reply: ' + error.message, 'error');
    }
  };

  const cleanInvalid = async () => {
    try {
      const res = await axios.delete('/api/listings?onlyInvalid=true');
      notify(`Removed ${res.data.removed} suspicious listing(s)`, 'success');
      fetchListings();
    } catch (error) {
      notify('Cleanup failed: ' + error.message, 'error');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4">
          Listings ({filteredListings.length})
        </Typography>
        <Button
          variant="outlined"
          color="secondary"
          startIcon={<CleaningServicesIcon />}
          onClick={cleanInvalid}
          size="small"
        >
          Clean up bad data
        </Button>
      </Box>

      <Paper sx={{ p: 2.5, mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search listings..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />

        <ToggleButtonGroup
          value={platformFilter}
          exclusive
          onChange={(e, value) => value && setPlatformFilter(value)}
          size="small"
        >
          <ToggleButton value="all">All</ToggleButton>
          <ToggleButton value="Kamernet">Kamernet</ToggleButton>
          <ToggleButton value="Pararius">Pararius</ToggleButton>
        </ToggleButtonGroup>
      </Paper>

      <Grid container spacing={2}>
        {filteredListings.map((listing) => (
          <Grid item xs={12} md={6} lg={4} key={listing.id}>
            <Card
              sx={{
                position: 'relative',
                cursor: 'pointer',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 36px rgba(0,0,0,0.12)',
                },
                // Unread indicator dot
                ...(!listing.read && {
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 12,
                    left: 12,
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    backgroundColor: '#0f766e',
                    zIndex: 2,
                    boxShadow: '0 0 0 3px rgba(15, 118, 110, 0.2)',
                  },
                }),
              }}
              onClick={() => markAsRead(listing.id)}
            >
              {listing.imageUrl && (
                <Box
                  sx={{
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover img': {
                      transform: 'scale(1.05)',
                    },
                  }}
                >
                  <Box
                    component="img"
                    src={listing.imageUrl}
                    alt={listing.title}
                    sx={{
                      width: '100%',
                      height: 200,
                      objectFit: 'cover',
                      transition: 'transform 0.4s ease',
                    }}
                  />
                  {/* Bottom gradient overlay */}
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: 60,
                      background: 'linear-gradient(transparent, rgba(0,0,0,0.3))',
                    }}
                  />
                </Box>
              )}

              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Chip
                    label={listing.platform}
                    size="small"
                    sx={{
                      backgroundColor: listing.platform === 'Kamernet' ? '#0f766e' : '#6366f1',
                      color: '#fff',
                    }}
                  />
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(listing.id);
                    }}
                  >
                    {listing.favorite ? <StarIcon color="warning" /> : <StarBorderIcon />}
                  </IconButton>
                </Box>

                <Typography variant="h6" gutterBottom>
                  {listing.title}
                </Typography>

                <Typography variant="body2" color="text.secondary" gutterBottom>
                  📍 {listing.location}
                </Typography>

                <Typography variant="body2" color="text.secondary" gutterBottom>
                  📏 {listing.size}
                </Typography>

                <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
                  &euro;{listing.price}/month
                </Typography>

                <Typography variant="caption" color="text.secondary">
                  Added: {new Date(listing.discovered).toLocaleString()}
                </Typography>
              </CardContent>

              <CardActions>
                <Button
                  size="small"
                  startIcon={<OpenInNewIcon />}
                  href={listing.url}
                  target="_blank"
                  onClick={(e) => e.stopPropagation()}
                >
                  View
                </Button>

                {listing.platform === 'Kamernet' && (
                  <Button
                    size="small"
                    startIcon={<ReplyIcon />}
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerAutoReply(listing.id);
                    }}
                  >
                    Reply
                  </Button>
                )}

                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteListing(listing.id);
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredListings.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <SearchOffIcon sx={{ fontSize: 64, color: '#cbd5e1', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No listings found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search or filters
          </Typography>
        </Box>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          onClose={() => setSnackbar(s => ({ ...s, open: false }))}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Listings;
