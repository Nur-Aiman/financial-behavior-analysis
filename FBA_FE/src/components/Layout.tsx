/**
 * Layout Component with Navigation
 */

import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
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
  BottomNavigation,
  BottomNavigationAction,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  Category as CategoryIcon,
  Receipt as TransactionIcon,
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
  const location = useLocation();
  const navigate = useNavigate();
  const { profile } = useProfile();

  // Get current tab value based on location
  const getCurrentTabValue = () => {
    const index = navItems.findIndex(item => item.path === location.pathname);
    return index >= 0 ? index : 0;
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
    <Box sx={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
      <AppBar position="fixed" sx={{ zIndex: 1300 }}>
        <Toolbar sx={{ '@media (max-width:600px)': { minHeight: 56 } }}>
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

      {/* Desktop Drawer */}
      <Box
        sx={{
          display: { xs: 'none', sm: 'block' },
          width: 250,
          flexShrink: 0,
          backgroundColor: '#f5f5f5',
          borderRight: '1px solid #e0e0e0',
          position: 'fixed',
          left: 0,
          top: 64,
          bottom: 0,
          height: 'calc(100vh - 64px)',
          overflowY: 'auto',
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
          mb: { xs: 7, sm: 0 },
          backgroundColor: '#f5f5f5',
          overflowY: 'auto',
          ml: { sm: '250px' },
          '@media (max-width:600px)': {
            maxWidth: '100%',
          }
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

      {/* Mobile Bottom Navigation */}
      <BottomNavigation
        value={getCurrentTabValue()}
        onChange={(event, newValue) => {
          navigate(navItems[newValue].path);
        }}
        sx={{
          display: { xs: 'flex', sm: 'none' },
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1200,
          borderTop: '1px solid #e0e0e0',
          backgroundColor: '#fff',
        }}
      >
        {navItems.map((item) => (
          <BottomNavigationAction
            key={item.path}
            label={item.label}
            icon={<item.icon />}
            sx={{
              fontSize: { xs: '0.625rem', sm: '0.75rem' },
              minWidth: 'auto',
              '&.Mui-selected': {
                color: 'primary.main',
              },
            }}
          />
        ))}
      </BottomNavigation>
    </Box>
  );
}

export default Layout;
