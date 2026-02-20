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
import LockIcon from '@mui/icons-material/Lock';
import ReplyIcon from '@mui/icons-material/Reply';
import TuneIcon from '@mui/icons-material/Tune';
import TimerIcon from '@mui/icons-material/Timer';
import LinkIcon from '@mui/icons-material/Link';
import NotificationsIcon from '@mui/icons-material/Notifications';

function SectionHeader({ icon, title, subtitle }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5 }}>
      <Box
        sx={{
          width: 42,
          height: 42,
          borderRadius: 2.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(15, 118, 110, 0.08)',
          color: '#0f766e',
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

function Settings() {
  const [settings, setSettings] = useState(null);
  const [kamernet, setKamernet] = useState({ email: '', password: '' });
  const [autoReply, setAutoReply] = useState({ enabled: false, message: '' });
  const [filters, setFilters] = useState({ minPrice: 0, maxPrice: 2000, minSize: 0, maxSize: 200 });
  const [monitoring, setMonitoring] = useState({
    kamernet: { enabled: true, interval: 5 },

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

      await axios.put('/api/settings/sources', sources);

      // Update Kamernet credentials separately
      await axios.put('/api/settings/credentials/kamernet', kamernet);

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  if (!settings) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box sx={{ pb: 10 }}>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>

      <Grid container spacing={3}>
        {/* Row 1: Credentials + Auto-Reply */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <SectionHeader
              icon={<LockIcon />}
              title="Kamernet Credentials"
              subtitle="Required for automatic replies"
            />

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

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <SectionHeader
              icon={<ReplyIcon />}
              title="Automatic Reply"
              subtitle="Auto-respond to new Kamernet listings"
            />

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

        {/* Row 2: Filters + Notifications */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <SectionHeader
              icon={<TuneIcon />}
              title="Listing Filters"
              subtitle="Set your price and size preferences"
            />

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Min Price (€)"
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) => setFilters({ ...filters, minPrice: parseInt(e.target.value) || 0 })}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Max Price (€)"
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters({ ...filters, maxPrice: parseInt(e.target.value) || 0 })}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Min Size (m²)"
                  type="number"
                  value={filters.minSize}
                  onChange={(e) => setFilters({ ...filters, minSize: parseInt(e.target.value) || 0 })}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Max Size (m²)"
                  type="number"
                  value={filters.maxSize}
                  onChange={(e) => setFilters({ ...filters, maxSize: parseInt(e.target.value) || 0 })}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <SectionHeader
              icon={<NotificationsIcon />}
              title="Notifications"
              subtitle="Control how you get notified"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={notifications.enabled}
                  onChange={(e) => setNotifications({ ...notifications, enabled: e.target.checked })}
                />
              }
              label="Enable browser notifications"
              sx={{ display: 'block', mb: 1 }}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={notifications.mobile}
                  onChange={(e) => setNotifications({ ...notifications, mobile: e.target.checked })}
                />
              }
              label="Enable mobile notifications (PWA)"
              sx={{ display: 'block' }}
            />
          </Paper>
        </Grid>

        {/* Row 3: Monitoring (full width) */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <SectionHeader
              icon={<TimerIcon />}
              title="Monitoring Intervals"
              subtitle="How often to check for new listings (in minutes)"
            />

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1.5 }}>
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
                label="Interval (min)"
                type="number"
                value={monitoring.kamernet.interval}
                onChange={(e) => setMonitoring({
                  ...monitoring,
                  kamernet: { ...monitoring.kamernet, interval: parseInt(e.target.value) || 1 }
                })}
                size="small"
                sx={{ width: 130 }}
              />
            </Box>

            <Divider />

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1.5 }}>
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
                label="Interval (min)"
                type="number"
                value={monitoring.pararius.interval}
                onChange={(e) => setMonitoring({
                  ...monitoring,
                  pararius: { ...monitoring.pararius, interval: parseInt(e.target.value) || 1 }
                })}
                size="small"
                sx={{ width: 130 }}
              />
            </Box>

            <Divider />

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1.5 }}>
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
                label="Messages (Kamernet)"
              />
              <TextField
                label="Interval (min)"
                type="number"
                value={monitoring.messages.interval}
                onChange={(e) => setMonitoring({
                  ...monitoring,
                  messages: { ...monitoring.messages, interval: parseInt(e.target.value) || 1 }
                })}
                size="small"
                sx={{ width: 130 }}
              />
            </Box>
          </Paper>
        </Grid>

        {/* Row 4: Extra Sources (full width) */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <SectionHeader
              icon={<LinkIcon />}
              title="Extra Listing Sources"
              subtitle="Paste additional listing URLs (one per line)"
            />
            <TextField
              fullWidth
              multiline
              minRows={4}
              value={(sources.extraUrls || []).join('\n')}
              onChange={(e) => setSources({ extraUrls: e.target.value.split('\n').map(s => s.trim()).filter(Boolean) })}
              placeholder="https://www.pararius.com/apartments/amsterdam"
            />
          </Paper>
        </Grid>
      </Grid>

      {/* Sticky save bar */}
      <Paper
        elevation={4}
        sx={{
          position: 'sticky',
          bottom: 16,
          mt: 3,
          p: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          backgroundColor: '#fff',
        }}
      >
        <Button
          variant="contained"
          size="large"
          onClick={saveSettings}
          sx={{ minWidth: 160 }}
        >
          Save Settings
        </Button>
        {saved && (
          <Alert severity="success" sx={{ flex: 1, py: 0 }}>
            Settings saved successfully!
          </Alert>
        )}
      </Paper>
    </Box>
  );
}

export default Settings;
