import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';

function Settings() {
  const [settings, setSettings] = useState(null);
  const [kamernet, setKamernet] = useState({ email: '', password: '' });
  const [autoReply, setAutoReply] = useState({ enabled: false, message: '' });
  const [filters, setFilters] = useState({ minPrice: 0, maxPrice: 2000, minSize: 0, maxSize: 200 });
  const [monitoring, setMonitoring] = useState({
    kamernet: { enabled: true, interval: 5 },
    funda: { enabled: true, interval: 10 },
    pararius: { enabled: true, interval: 10 },
    messages: { enabled: true, interval: 5 }
  });
  const [sources, setSources] = useState({ extraUrls: [] });
  const [notifications, setNotifications] = useState({ enabled: true, mobile: false });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get('/api/settings');
      const data = response.data;
      setSettings(data);
      setKamernet(data.credentials.kamernet);
      setAutoReply(data.autoReply);
      setFilters(data.filters);
      setMonitoring({
        kamernet: data.monitoring?.kamernet || { enabled: true, interval: 3 },
        funda: data.monitoring?.funda || { enabled: true, interval: 3 },
        pararius: data.monitoring?.pararius || { enabled: true, interval: 3 },
        messages: data.monitoring?.messages || { enabled: true, interval: 5 }
      });
      setSources(data.sources || { extraUrls: [] });
      setNotifications(data.notifications);
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const saveSettings = async () => {
    try {
      await axios.put('/api/settings', {
        ...settings,
        autoReply,
        filters,
        monitoring,
        notifications
      });
  // Update extra sources
  await axios.put('/api/settings/sources', sources);

      // Update Kamernet credentials separately
      await axios.put('/api/settings/credentials/kamernet', kamernet);

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      alert('Settings saved! Monitoring will restart with new settings.');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings');
    }
  };

  if (!settings) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>

      {saved && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Settings saved successfully!
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Kamernet Credentials */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Kamernet Credentials
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Required for automatic replies to Kamernet listings
            </Typography>
            
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={kamernet.email}
              onChange={(e) => setKamernet({ ...kamernet, email: e.target.value })}
              margin="normal"
            />
            
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={kamernet.password}
              onChange={(e) => setKamernet({ ...kamernet, password: e.target.value })}
              margin="normal"
              helperText="Your password is stored locally and never shared"
            />
          </Paper>
        </Grid>

        {/* Auto-Reply */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Automatic Reply
            </Typography>
            
            <FormControlLabel
              control={
                <Switch
                  checked={autoReply.enabled}
                  onChange={(e) => setAutoReply({ ...autoReply, enabled: e.target.checked })}
                />
              }
              label="Enable automatic replies on Kamernet"
            />
            
            <TextField
              fullWidth
              label="Reply Message Template"
              multiline
              rows={4}
              value={autoReply.message}
              onChange={(e) => setAutoReply({ ...autoReply, message: e.target.value })}
              margin="normal"
              helperText="This message will be sent automatically to new Kamernet listings"
            />
          </Paper>
        </Grid>

        {/* Filters */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Listing Filters
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Min Price (€)"
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) => setFilters({ ...filters, minPrice: parseInt(e.target.value) })}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Max Price (€)"
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters({ ...filters, maxPrice: parseInt(e.target.value) })}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Min Size (m²)"
                  type="number"
                  value={filters.minSize}
                  onChange={(e) => setFilters({ ...filters, minSize: parseInt(e.target.value) })}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Max Size (m²)"
                  type="number"
                  value={filters.maxSize}
                  onChange={(e) => setFilters({ ...filters, maxSize: parseInt(e.target.value) })}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Monitoring */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Monitoring Intervals
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              How often to check for new listings (in minutes)
            </Typography>
            
            <Box sx={{ mt: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={monitoring.kamernet.enabled}
                    onChange={(e) => setMonitoring({
                      ...monitoring,
                      kamernet: { ...monitoring.kamernet, enabled: e.target.checked }
                    })}
                  />
                }
                label="Kamernet"
              />
              <TextField
                label="Interval (minutes)"
                type="number"
                value={monitoring.kamernet.interval}
                onChange={(e) => setMonitoring({
                  ...monitoring,
                  kamernet: { ...monitoring.kamernet, interval: parseInt(e.target.value) }
                })}
                size="small"
                sx={{ ml: 2, width: 150 }}
              />
            </Box>

            <Box sx={{ mt: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={monitoring.funda.enabled}
                    onChange={(e) => setMonitoring({
                      ...monitoring,
                      funda: { ...monitoring.funda, enabled: e.target.checked }
                    })}
                  />
                }
                label="Funda"
              />
              <TextField
                label="Interval (minutes)"
                type="number"
                value={monitoring.funda.interval}
                onChange={(e) => setMonitoring({
                  ...monitoring,
                  funda: { ...monitoring.funda, interval: parseInt(e.target.value) }
                })}
                size="small"
                sx={{ ml: 2, width: 150 }}
              />
            </Box>

            <Box sx={{ mt: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={monitoring.pararius.enabled}
                    onChange={(e) => setMonitoring({
                      ...monitoring,
                      pararius: { ...monitoring.pararius, enabled: e.target.checked }
                    })}
                  />
                }
                label="Pararius"
              />
              <TextField
                label="Interval (minutes)"
                type="number"
                value={monitoring.pararius.interval}
                onChange={(e) => setMonitoring({
                  ...monitoring,
                  pararius: { ...monitoring.pararius, interval: parseInt(e.target.value) }
                })}
                size="small"
                sx={{ ml: 2, width: 150 }}
              />
            </Box>

            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" gutterBottom>
              Messages (Kamernet)
            </Typography>
            <Box sx={{ mt: 1 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={monitoring.messages.enabled}
                    onChange={(e) => setMonitoring({
                      ...monitoring,
                      messages: { ...monitoring.messages, enabled: e.target.checked }
                    })}
                  />
                }
                label="Monitor new messages"
              />
              <TextField
                label="Interval (minutes)"
                type="number"
                value={monitoring.messages.interval}
                onChange={(e) => setMonitoring({
                  ...monitoring,
                  messages: { ...monitoring.messages, interval: parseInt(e.target.value) }
                })}
                size="small"
                sx={{ ml: 2, width: 150 }}
              />
            </Box>
          </Paper>
        </Grid>

        {/* Extra agency/sources URLs */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Extra Listing Sources (Agencies)
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Paste additional listing URLs (one per line). We'll try to monitor these too.
            </Typography>
            <TextField
              fullWidth
              multiline
              minRows={4}
              value={(sources.extraUrls || []).join('\n')}
              onChange={(e) => setSources({ extraUrls: e.target.value.split('\n').map(s => s.trim()).filter(Boolean) })}
              placeholder="https://www.pararius.com/apartments/amsterdam\nhttps://www.funda.nl/en/huur/amsterdam/"
            />
          </Paper>
        </Grid>

        {/* Notifications */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Notifications
            </Typography>
            
            <FormControlLabel
              control={
                <Switch
                  checked={notifications.enabled}
                  onChange={(e) => setNotifications({ ...notifications, enabled: e.target.checked })}
                />
              }
              label="Enable browser notifications"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={notifications.mobile}
                  onChange={(e) => setNotifications({ ...notifications, mobile: e.target.checked })}
                />
              }
              label="Enable mobile notifications (PWA)"
            />
          </Paper>
        </Grid>

        {/* Save Button */}
        <Grid item xs={12}>
          <Button
            variant="contained"
            size="large"
            onClick={saveSettings}
            fullWidth
          >
            Save Settings
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Settings;
