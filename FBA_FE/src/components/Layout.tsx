/**
 * Layout Component with Navigation
 */

import React, { useMemo } from 'react';
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
  IconButton,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  Category as CategoryIcon,
  Receipt as TransactionIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { useProfile, useTransactions } from '../hooks';

const navItems = [
  { label: 'Dashboard', path: '/', icon: DashboardIcon },
  { label: 'Profile', path: '/profile', icon: PersonIcon },
  { label: 'Categories', path: '/categories', icon: CategoryIcon },
  { label: 'Transactions', path: '/transactions', icon: TransactionIcon },
];

function Layout({ mode, onToggleTheme }: { mode: 'light' | 'dark'; onToggleTheme: () => void }): React.ReactElement {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { profile } = useProfile();
  const { transactions } = useTransactions();

  // Calculate effective balance
  const effectiveBalance = useMemo(() => {
    if (!profile) return 0;
    
    if (profile.useCalculatedBalance) {
      const totalExpenses = transactions
        ?.filter(tx => tx.type === 'EXPENSE')
        .reduce((sum, tx) => sum + tx.amountCents, 0) || 0;
      return (profile.expectedSalaryCents || 0) - totalExpenses;
    }
    
    return profile.currentBalanceCents || 0;
  }, [profile, transactions]);

  // Get current tab value based on location
  const getCurrentTabValue = () => {
    const index = navItems.findIndex(item => item.path === location.pathname);
    return index >= 0 ? index : 0;
  };

  const drawer = (
    <Box sx={{ width: 250, p: 1.5 }}>
      <Toolbar>
        <Typography variant="h6" sx={{ fontWeight: 750, letterSpacing: '-0.03em' }}>Overview</Typography>
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
              borderRadius: 3,
              mb: 0.5,
              minHeight: 48,
              '&.Mui-selected': {
                backgroundColor: 'action.selected',
                '&:hover': {
                  backgroundColor: 'action.hover',
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
        <Toolbar sx={{ minHeight: { xs: 66, sm: 74 }, gap: 1.5, px: { xs: 2, sm: 3 } }}>
          <Typography 
            variant="h6" 
            sx={{ 
              flexGrow: 1,
              fontSize: { xs: '0.92rem', sm: '1.15rem' },
              fontWeight: 750,
              letterSpacing: '-0.035em',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            Financial Behavior Analysis (Aiman)
          </Typography>
          <Tooltip title={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
            <IconButton aria-label={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'} onClick={onToggleTheme} color="inherit" sx={{ bgcolor: 'action.hover', flexShrink: 0 }}>
              {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>
          {profile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ textAlign: 'right' }}>
                <Typography 
                  variant="caption"
                  sx={{
                    fontSize: { xs: '0.65rem', sm: '0.75rem' },
                    display: 'block',
                    color: 'text.secondary',
                  }}
                >
                  {profile.useCalculatedBalance ? 'Calculated Balance' : 'Current Balance'}
                </Typography>
                <Typography 
                  variant="body2"
                  sx={{
                    fontSize: { xs: '0.9rem', sm: '1rem' },
                    fontWeight: 600,
                  }}
                >
                  RM {(effectiveBalance / 100).toFixed(2)}
                </Typography>
              </Box>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Desktop Drawer */}
      <Box
        sx={{
          display: { xs: 'none', sm: 'block' },
          width: 250,
          flexShrink: 0,
          backgroundColor: theme.palette.mode === 'dark' ? 'rgba(22,36,58,.65)' : 'rgba(242,249,255,.48)',
          backdropFilter: 'blur(22px) saturate(145%)',
          WebkitBackdropFilter: 'blur(22px) saturate(145%)',
          boxShadow: 'inset 1px 0 0 rgba(255,255,255,.28), 8px 0 28px rgba(20,60,110,.04)',
          borderRight: '1px solid',
          borderColor: 'divider',
          position: 'fixed',
          left: 0,
          top: 74,
          bottom: 0,
          height: 'calc(100vh - 74px)',
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
          mt: { xs: '66px', sm: '74px' },
          mb: { xs: '90px', sm: 0 },
          backgroundColor: 'transparent',
          overflowY: 'auto',
          ml: { sm: '250px' },
          minWidth: 0,
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
          borderTop: '1px solid',
          borderColor: 'divider',
          backgroundColor: theme.palette.mode === 'dark' ? 'rgba(25,39,62,.70)' : 'rgba(243,250,255,.58)',
          backgroundImage: theme.palette.mode === 'dark' ? 'linear-gradient(145deg, rgba(230,240,255,.10), transparent 65%)' : 'linear-gradient(145deg, rgba(255,255,255,.88), rgba(255,255,255,.10) 65%)',
          boxShadow: '0 -8px 35px rgba(25,60,100,.10), inset 0 1px 0 rgba(255,255,255,.65)',
          backdropFilter: 'blur(22px) saturate(150%)',
          WebkitBackdropFilter: 'blur(22px) saturate(150%)',
          '@supports not (backdrop-filter: blur(1px))': { backgroundColor: 'background.paper' },
          '@media (prefers-reduced-transparency: reduce)': { backgroundColor: 'background.paper', backdropFilter: 'none', WebkitBackdropFilter: 'none' },
          minHeight: 70,
          pb: 'env(safe-area-inset-bottom)',
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
              '& .MuiBottomNavigationAction-label': { fontSize: '0.7rem', '&.Mui-selected': { fontSize: '0.72rem' } },
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
