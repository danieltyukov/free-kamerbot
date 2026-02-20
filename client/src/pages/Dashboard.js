import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import HomeIcon from '@mui/icons-material/Home';
import MessageIcon from '@mui/icons-material/Message';
import StarIcon from '@mui/icons-material/Star';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = ['#0f766e', '#6366f1'];

const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const GRADIENTS = [
  'linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)',
  'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
  'linear-gradient(135deg, #d97706 0%, #fbbf24 100%)',
  'linear-gradient(135deg, #16a34a 0%, #4ade80 100%)',
];

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
      const sorted = [...(listingsRes.data || [])].sort(
        (a, b) => new Date(b.discovered) - new Date(a.discovered)
      );
      setRecentListings(sorted.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  if (!stats) {
    return (
      <Box>
        <Skeleton variant="text" width={200} height={48} sx={{ mb: 1 }} />
        <Skeleton variant="text" width={280} height={24} sx={{ mb: 3 }} />
        <Grid container spacing={3}>
          {[0, 1, 2, 3].map((i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Skeleton variant="rounded" height={160} sx={{ borderRadius: 4 }} />
            </Grid>
          ))}
          <Grid item xs={12} md={6}>
            <Skeleton variant="rounded" height={400} sx={{ borderRadius: 4 }} />
          </Grid>
          <Grid item xs={12} md={6}>
            <Skeleton variant="rounded" height={400} sx={{ borderRadius: 4 }} />
          </Grid>
        </Grid>
      </Box>
    );
  }

  const platformData = [
    { name: 'Kamernet', value: stats.byPlatform.Kamernet },
    { name: 'Pararius', value: stats.byPlatform.Pararius },
  ];

  const statCards = [
    { title: 'Total Listings', value: stats.total, icon: <HomeIcon sx={{ fontSize: 28 }} /> },
    { title: 'Unread', value: stats.unread, icon: <MessageIcon sx={{ fontSize: 28 }} /> },
    { title: 'Favorites', value: stats.favorites, icon: <StarIcon sx={{ fontSize: 28 }} /> },
    { title: 'New Today', value: stats.newToday || 0, icon: <TrendingUpIcon sx={{ fontSize: 28 }} /> },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Your housing search at a glance
      </Typography>

      <Grid container spacing={3}>
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                background: GRADIENTS[index],
                color: '#fff',
                position: 'relative',
                overflow: 'hidden',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 36px rgba(0,0,0,0.15)',
                },
              }}
            >
              {/* Decorative circle overlay */}
              <Box
                sx={{
                  position: 'absolute',
                  top: -20,
                  right: -20,
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255,255,255,0.15)',
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  bottom: -30,
                  right: 30,
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255,255,255,0.08)',
                }}
              />
              <CardContent sx={{ position: 'relative', zIndex: 1, p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>
                    {card.title}
                  </Typography>
                  <Box sx={{ opacity: 0.85 }}>
                    {card.icon}
                  </Box>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 700 }}>
                  {card.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Listings by Platform
            </Typography>
            <ResponsiveContainer width="100%" height="80%">
              <PieChart>
                <Pie
                  data={platformData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={95}
                  paddingAngle={4}
                  fill="#8884d8"
                  dataKey="value"
                  label={renderLabel}
                  labelLine={false}
                >
                  {platformData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value} listings`, name]} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value, entry) => {
                    const total = platformData.reduce((s, d) => s + d.value, 0);
                    const item = platformData.find(d => d.name === value);
                    const pct = total > 0 ? ((item.value / total) * 100).toFixed(0) : 0;
                    return `${value} (${pct}%)`;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: 400, overflow: 'auto' }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Recent Listings
            </Typography>
            {recentListings.map((listing) => (
              <Box
                key={listing.id}
                component="a"
                href={listing.url}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  mb: 1,
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: '#f8fafc',
                  textDecoration: 'none',
                  color: 'inherit',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: '#f1f5f9',
                    transform: 'translateX(4px)',
                  },
                }}
              >
                {/* Read indicator dot */}
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: listing.read ? 'transparent' : '#0f766e',
                    flexShrink: 0,
                  }}
                />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }} noWrap>
                    {listing.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {listing.platform} &middot; &euro;{listing.price} &middot; {listing.location}
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
                  {new Date(listing.discovered).toLocaleDateString()}
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
