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

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          label="Area Name"
          value={locationName}
          onChange={(e) => setLocationName(e.target.value)}
          size="small"
        />
        <TextField
          label="Radius (meters)"
          type="number"
          value={radius}
          onChange={(e) => setRadius(parseInt(e.target.value))}
          size="small"
        />
        <Button
          variant="contained"
          startIcon={<AddLocationIcon />}
          onClick={addSearchArea}
          disabled={!selectedLocation}
        >
          Add Area
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Paper sx={{ flex: 1, height: 500 }}>
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
                pathOptions={{ color: 'blue', fillOpacity: 0.2 }}
              />
            )}
            
            {searchAreas.map(area => (
              <Circle
                key={area.id}
                center={[area.lat, area.lng]}
                radius={area.radius}
                pathOptions={{ color: 'green', fillOpacity: 0.2 }}
              />
            ))}
          </MapContainer>
        </Paper>

        <Paper sx={{ width: 300, p: 2, overflow: 'auto' }}>
          <Typography variant="h6" gutterBottom>
            Search Areas ({searchAreas.length})
          </Typography>
          
          <List>
            {searchAreas.map(area => (
              <ListItem
                key={area.id}
                secondaryAction={
                  <IconButton edge="end" onClick={() => deleteSearchArea(area.id)}>
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemText
                  primary={area.name}
                  secondary={`Radius: ${area.radius}m`}
                />
              </ListItem>
            ))}
          </List>

          {searchAreas.length === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              No search areas defined. Click on the map to add one.
            </Typography>
          )}
        </Paper>
      </Box>
    </Box>
  );
}

export default SearchArea;
