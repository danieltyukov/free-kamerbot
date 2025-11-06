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
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import DeleteIcon from '@mui/icons-material/Delete';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import SearchIcon from '@mui/icons-material/Search';
import ReplyIcon from '@mui/icons-material/Reply';

function Listings() {
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [platformFilter, setPlatformFilter] = useState('all');

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
        alert('Auto-reply sent successfully!');
      } else {
        alert('Failed to send auto-reply: ' + response.data.message);
      }
    } catch (error) {
      alert('Error sending auto-reply: ' + error.message);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Listings ({filteredListings.length})
      </Typography>

      <Box sx={{ mb: 3 }}>
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
          <ToggleButton value="Funda">Funda</ToggleButton>
          <ToggleButton value="Pararius">Pararius</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Grid container spacing={2}>
        {filteredListings.map((listing) => (
          <Grid item xs={12} md={6} lg={4} key={listing.id}>
            <Card
              sx={{
                position: 'relative',
                border: !listing.read ? '2px solid #1976d2' : '1px solid #e0e0e0'
              }}
              onClick={() => markAsRead(listing.id)}
            >
              {listing.imageUrl && (
                <Box
                  component="img"
                  src={listing.imageUrl}
                  alt={listing.title}
                  sx={{ width: '100%', height: 200, objectFit: 'cover' }}
                />
              )}
              
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Chip
                    label={listing.platform}
                    size="small"
                    color={
                      listing.platform === 'Kamernet' ? 'primary' :
                      listing.platform === 'Funda' ? 'secondary' : 'default'
                    }
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

                <Typography variant="h6" color="primary">
                  €{listing.price}/month
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
        <Box sx={{ textAlign: 'center', py: 5 }}>
          <Typography variant="h6" color="text.secondary">
            No listings found
          </Typography>
        </Box>
      )}
    </Box>
  );
}

export default Listings;
