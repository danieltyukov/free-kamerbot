import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import { MapContainer, TileLayer, Circle, useMapEvents } from 'react-leaflet';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import DeleteIcon from '@mui/icons-material/Delete';
import AddLocationIcon from '@mui/icons-material/AddLocation';

function LocationMarker({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng);
    },
  });
  return null;
}

function SearchArea() {
  const [searchAreas, setSearchAreas] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [radius, setRadius] = useState(1000);
  const [locationName, setLocationName] = useState('');

  useEffect(() => {
    fetchSearchAreas();
  }, []);

  const fetchSearchAreas = async () => {
    try {
      const response = await axios.get('/api/settings');
      setSearchAreas(response.data.searchAreas || []);
    } catch (error) {
      console.error('Error fetching search areas:', error);
    }
  };

  const addSearchArea = async () => {
    if (!selectedLocation || !locationName) {
      alert('Please select a location on the map and enter a name');
      return;
    }

    const newArea = {
      id: Date.now().toString(),
      name: locationName,
      lat: selectedLocation.lat,
      lng: selectedLocation.lng,
      radius: radius
    };

    const updatedAreas = [...searchAreas, newArea];

    try {
      await axios.put('/api/settings/search-areas', {
        searchAreas: updatedAreas
      });
      setSearchAreas(updatedAreas);
      setSelectedLocation(null);
      setLocationName('');
      alert('Search area added!');
    } catch (error) {
      console.error('Error adding search area:', error);
    }
  };

  const deleteSearchArea = async (id) => {
    const updatedAreas = searchAreas.filter(area => area.id !== id);

    try {
      await axios.put('/api/settings/search-areas', {
        searchAreas: updatedAreas
      });
      setSearchAreas(updatedAreas);
    } catch (error) {
      console.error('Error deleting search area:', error);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Search Area
      </Typography>

      <Typography variant="body1" color="text.secondary" gutterBottom>
        Click on the map to select your preferred locations. Define search areas to filter listings.
      </Typography>

      <Box sx={{ position: 'relative', mb: 3 }}>
        {/* Full-width map */}
        <Box sx={{ height: { xs: 400, md: 600 }, borderRadius: 4, overflow: 'hidden' }}>
          <MapContainer
            center={[52.3676, 4.9041]} // Amsterdam
            zoom={11}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />

            <LocationMarker onLocationSelect={setSelectedLocation} />

            {selectedLocation && (
              <Circle
                center={[selectedLocation.lat, selectedLocation.lng]}
                radius={radius}
                pathOptions={{ color: '#0f766e', fillColor: '#0f766e', fillOpacity: 0.2 }}
              />
            )}

            {searchAreas.map(area => (
              <Circle
                key={area.id}
                center={[area.lat, area.lng]}
                radius={area.radius}
                pathOptions={{ color: '#6366f1', fillColor: '#6366f1', fillOpacity: 0.2 }}
              />
            ))}
          </MapContainer>
        </Box>

        {/* Floating overlay panel */}
        <Paper
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            width: 300,
            maxHeight: 'calc(100% - 32px)',
            overflow: 'auto',
            p: 2.5,
            backgroundColor: 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(8px)',
            zIndex: 1000,
            display: { xs: 'none', sm: 'block' },
          }}
        >
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Add Area
          </Typography>

          <TextField
            fullWidth
            label="Area Name"
            value={locationName}
            onChange={(e) => setLocationName(e.target.value)}
            size="small"
            sx={{ mb: 1.5 }}
          />
          <TextField
            fullWidth
            label="Radius (meters)"
            type="number"
            value={radius}
            onChange={(e) => setRadius(parseInt(e.target.value))}
            size="small"
            sx={{ mb: 1.5 }}
          />
          <Button
            fullWidth
            variant="contained"
            startIcon={<AddLocationIcon />}
            onClick={addSearchArea}
            disabled={!selectedLocation}
          >
            Add Area
          </Button>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            Saved Areas ({searchAreas.length})
          </Typography>

          <List dense disablePadding>
            {searchAreas.map(area => (
              <ListItem
                key={area.id}
                disableGutters
                secondaryAction={
                  <IconButton edge="end" size="small" onClick={() => deleteSearchArea(area.id)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                }
              >
                <ListItemText
                  primary={area.name}
                  secondary={`Radius: ${area.radius}m`}
                  primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                />
              </ListItem>
            ))}
          </List>

          {searchAreas.length === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Click on the map to add an area.
            </Typography>
          )}
        </Paper>
      </Box>

      {/* Mobile fallback: controls below map */}
      <Box sx={{ display: { xs: 'block', sm: 'none' }, mb: 3 }}>
        <Paper sx={{ p: 2.5 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Add Area
          </Typography>
          <TextField
            fullWidth
            label="Area Name"
            value={locationName}
            onChange={(e) => setLocationName(e.target.value)}
            size="small"
            sx={{ mb: 1.5 }}
          />
          <TextField
            fullWidth
            label="Radius (meters)"
            type="number"
            value={radius}
            onChange={(e) => setRadius(parseInt(e.target.value))}
            size="small"
            sx={{ mb: 1.5 }}
          />
          <Button
            fullWidth
            variant="contained"
            startIcon={<AddLocationIcon />}
            onClick={addSearchArea}
            disabled={!selectedLocation}
          >
            Add Area
          </Button>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            Saved Areas ({searchAreas.length})
          </Typography>

          <List dense disablePadding>
            {searchAreas.map(area => (
              <ListItem
                key={area.id}
                disableGutters
                secondaryAction={
                  <IconButton edge="end" size="small" onClick={() => deleteSearchArea(area.id)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                }
              >
                <ListItemText
                  primary={area.name}
                  secondary={`Radius: ${area.radius}m`}
                  primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                />
              </ListItem>
            ))}
          </List>

          {searchAreas.length === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Click on the map to add an area.
            </Typography>
          )}
        </Paper>
      </Box>
    </Box>
  );
}

export default SearchArea;
