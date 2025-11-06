import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import HomeIcon from '@mui/icons-material/Home';
import MessageIcon from '@mui/icons-material/Message';
import StarIcon from '@mui/icons-material/Star';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentListings, setRecentListings] = useState([]);

  useEffect(() => {
    fetchData();

    // Auto-refresh dashboard stats periodically
    const t = setInterval(fetchData, 30000);
    return () => clearInterval(t);
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, listingsRes] = await Promise.all([
        axios.get('/api/listings/stats/summary'),
        axios.get('/api/listings')
      ]);
      
      setStats(statsRes.data);
      setRecentListings(listingsRes.data.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  if (!stats) {
    return <Typography>Loading...</Typography>;
  }

  const platformData = [
    { name: 'Kamernet', value: stats.byPlatform.Kamernet },
    { name: 'Funda', value: stats.byPlatform.Funda },
    { name: 'Pararius', value: stats.byPlatform.Pararius },
  ];

  const statCards = [
    { title: 'Total Listings', value: stats.total, icon: <HomeIcon />, color: '#1976d2' },
    { title: 'Unread', value: stats.unread, icon: <MessageIcon />, color: '#dc004e' },
    { title: 'Favorites', value: stats.favorites, icon: <StarIcon />, color: '#ffa726' },
    { title: 'New Today', value: stats.unread, icon: <TrendingUpIcon />, color: '#66bb6a' },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ color: card.color, mr: 2 }}>
                    {card.icon}
                  </Box>
                  <Typography variant="h6">{card.title}</Typography>
                </Box>
                <Typography variant="h3" sx={{ color: card.color }}>
                  {card.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Listings by Platform
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie
                  data={platformData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {platformData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: 400, overflow: 'auto' }}>
            <Typography variant="h6" gutterBottom>
              Recent Listings
            </Typography>
            {recentListings.map((listing) => (
              <Box
                key={listing.id}
                sx={{
                  mb: 2,
                  p: 2,
                  border: '1px solid #e0e0e0',
                  borderRadius: 1,
                  '&:hover': { bgcolor: '#f5f5f5' }
                }}
              >
                <Typography variant="subtitle1" fontWeight="bold">
                  {listing.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {listing.platform} • €{listing.price} • {listing.location}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(listing.discovered).toLocaleString()}
                </Typography>
              </Box>
            ))}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;
