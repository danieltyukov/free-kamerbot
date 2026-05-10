import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import HomeIcon from '@mui/icons-material/Home';
import MessageIcon from '@mui/icons-material/Message';
import SettingsIcon from '@mui/icons-material/Settings';
import MapIcon from '@mui/icons-material/Map';
import NotificationsIcon from '@mui/icons-material/Notifications';

import Dashboard from './pages/Dashboard';
import Listings from './pages/Listings';
import Messages from './pages/Messages';
import Settings from './pages/Settings';
import SearchArea from './pages/SearchArea';
import { requestNotificationPermission } from './utils/notifications';

const DRAWER_WIDTH = 260;

const theme = createTheme({
  palette: {
    primary: {
      main: '#0f766e',
    },
    secondary: {
      main: '#6366f1',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    h4: {
      fontWeight: 700,
    },
    button: {
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          transition: 'box-shadow 0.3s ease, transform 0.3s ease',
          '&:hover': {
            boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        contained: {
          background: 'linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)',
          boxShadow: '0 4px 14px rgba(15, 118, 110, 0.3)',
          '&:hover': {
            background: 'linear-gradient(135deg, #0d6560 0%, #0f9d8f 100%)',
            boxShadow: '0 6px 20px rgba(15, 118, 110, 0.4)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
          },
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          borderRadius: '12px !important',
          '&.Mui-selected': {
            backgroundColor: '#0f766e',
            color: '#fff',
            '&:hover': {
              backgroundColor: '#0d6560',
            },
          },
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          '&.Mui-selected': {
            backgroundColor: 'rgba(15, 118, 110, 0.12)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
        },
      },
    },
  },
});

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { text: 'Listings', icon: <HomeIcon />, path: '/listings', hasBadge: true },
  { text: 'Messages', icon: <MessageIcon />, path: '/messages' },
  { text: 'Search Area', icon: <MapIcon />, path: '/search-area' },
  { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
];

function AppContent() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  useEffect(() => {
    requestNotificationPermission();

    fetch('/api/listings')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setUnreadCount(data.filter(l => !l.read).length);
        }
      })
      .catch(console.error);
  }, []);

  const handleNavigation = (path) => {
    navigate(path);
    setDrawerOpen(false);
  };

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', py: 2 }}>
      <Box sx={{ px: 3, mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar
          sx={{
            width: 40,
            height: 40,
            background: 'linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)',
            fontSize: '1rem',
            fontWeight: 700,
          }}
        >
          FK
        </Avatar>
        <Box>
          <Typography variant="subtitle1" sx={{ color: '#f8fafc', fontWeight: 700, lineHeight: 1.2 }}>
            FreeKamerBot
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b' }}>
            Housing Monitor
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: 'rgba(148, 163, 184, 0.15)', mb: 1 }} />

      <List sx={{ px: 1.5, flex: 1 }}>
        {menuItems.map((item) => {
          const isActive = item.path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(item.path);

          return (
            <ListItemButton
              key={item.text}
              onClick={() => handleNavigation(item.path)}
              sx={{
                mb: 0.5,
                borderRadius: '10px',
                color: isActive ? '#14b8a6' : '#94a3b8',
                backgroundColor: isActive ? 'rgba(20, 184, 166, 0.1)' : 'transparent',
                '&:hover': {
                  backgroundColor: isActive ? 'rgba(20, 184, 166, 0.15)' : 'rgba(148, 163, 184, 0.08)',
                },
              }}
            >
              <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                {item.hasBadge && unreadCount > 0 ? (
                  <Badge badgeContent={unreadCount} color="error">
                    {item.icon}
                  </Badge>
                ) : (
                  item.icon
                )}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{ fontWeight: isActive ? 600 : 400, fontSize: '0.9rem' }}
              />
              {isActive && (
                <Box sx={{
                  width: 4,
                  height: 24,
                  borderRadius: 2,
                  backgroundColor: '#14b8a6',
                  ml: 1,
                }} />
              )}
            </ListItemButton>
          );
        })}
      </List>

      <Divider sx={{ borderColor: 'rgba(148, 163, 184, 0.15)', mt: 1 }} />

      <Box sx={{ px: 3, py: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon sx={{ color: '#64748b', fontSize: 20 }} />
        </Badge>
        <Typography variant="caption" sx={{ color: '#64748b' }}>
          {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {isDesktop ? (
        <Drawer
          variant="permanent"
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              backgroundColor: '#0f172a',
              border: 'none',
              borderRadius: 0,
            },
          }}
        >
          {drawerContent}
        </Drawer>
      ) : (
        <>
          <AppBar
            position="fixed"
            elevation={0}
            sx={{
              backgroundColor: '#ffffff',
              borderBottom: '1px solid #e2e8f0',
            }}
          >
            <Toolbar>
              <IconButton
                edge="start"
                onClick={() => setDrawerOpen(!drawerOpen)}
                sx={{ mr: 2, color: '#0f172a' }}
              >
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" sx={{ flexGrow: 1, color: '#0f172a', fontWeight: 700 }}>
                FreeKamerBot
              </Typography>
              <IconButton sx={{ color: '#0f172a' }}>
                <Badge badgeContent={unreadCount} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Toolbar>
          </AppBar>

          <Drawer
            anchor="left"
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            sx={{
              '& .MuiDrawer-paper': {
                width: DRAWER_WIDTH,
                backgroundColor: '#0f172a',
                borderRadius: 0,
              },
            }}
          >
            {drawerContent}
          </Drawer>
        </>
      )}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          minHeight: '100vh',
          mt: isDesktop ? 0 : 8,
          p: { xs: 2, sm: 3, md: 4 },
        }}
      >
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/listings" element={<Listings />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/search-area" element={<SearchArea />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Box>
    </Box>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}

export default App;
