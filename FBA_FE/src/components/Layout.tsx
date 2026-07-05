/**
 * Layout Component with Navigation
 */

import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Divider,
  Container,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  Category as CategoryIcon,
  Receipt as TransactionIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { useProfile } from '../hooks';

const navItems = [
  { label: 'Dashboard', path: '/', icon: DashboardIcon },
  { label: 'Profile', path: '/profile', icon: PersonIcon },
  { label: 'Categories', path: '/categories', icon: CategoryIcon },
  { label: 'Transactions', path: '/transactions', icon: TransactionIcon },
];

function Layout(): React.ReactElement {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();
  const { profile } = useProfile();

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const drawer = (
    <Box sx={{ width: 250 }}>
      <Toolbar>
        <Typography variant="h6">FBA</Typography>
      </Toolbar>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem
            key={item.path}
            component={RouterLink}
            to={item.path}
            selected={location.pathname === item.path}
            onClick={() => setDrawerOpen(false)}
            sx={{
              '&.Mui-selected': {
                backgroundColor: 'primary.light',
                '&:hover': {
                  backgroundColor: 'primary.light',
                },
              },
            }}
          >
            <ListItemIcon>
              <item.icon />
            </ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar position="fixed" sx={{ zIndex: 1300 }}>
        <Toolbar sx={{ '@media (max-width:600px)': { minHeight: 56 } }}>
          <MenuIcon
            onClick={handleDrawerToggle}
            sx={{ mr: 2, cursor: 'pointer', display: { sm: 'none' } }}
          />
          <Typography 
            variant="h6" 
            sx={{ 
              flexGrow: 1,
              fontSize: { xs: '1rem', sm: '1.25rem' },
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            Financial Behavior Analysis
          </Typography>
          {profile && (
            <Typography 
              variant="body2"
              sx={{
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                ml: 1,
                whiteSpace: 'nowrap',
              }}
            >
              RM {(profile.currentBalanceCents / 100).toFixed(2)}
            </Typography>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        open={drawerOpen}
        onClose={handleDrawerToggle}
        sx={{
          display: { xs: 'block', sm: 'none' },
        }}
      >
        {drawer}
      </Drawer>

      {/* Desktop Drawer */}
      <Box
        sx={{
          display: { xs: 'none', sm: 'block' },
          width: 250,
          flexShrink: 0,
          backgroundColor: '#f5f5f5',
          borderRight: '1px solid #e0e0e0',
        }}
      >
        {drawer}
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 1.5, sm: 3 },
          mt: 8,
          backgroundColor: '#f5f5f5',
          overflowY: 'auto',
        }}
      >
        <Container maxWidth="lg" sx={{ 
          '@media (max-width:600px)': {
            maxWidth: '100%',
            px: 0,
          }
        }}>
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
}

export default Layout;
