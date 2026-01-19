import React, { useEffect, useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Container, 
  Stack, 
  Typography, 
  Button, 
  Avatar,
  Menu,
  MenuItem,
  Badge,
  Divider, // Added
  Box      // Added
} from '@mui/material';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import MailIcon from '@mui/icons-material/Mail'; 
import CodeIcon from '@mui/icons-material/Code'; // Already imported
import { useNavigate } from 'react-router-dom';
import { ApiKeyDialog } from './ApiKeyDialog'; // Already imported

interface UserData {
  user_id: number;
  name: string;
  email: string;
  role: string;
}

export const Header = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserData | null>(null);
  
  // Menu State
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  // 1. New State for API Dialog
  const [openApiDialog, setOpenApiDialog] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user_data');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse user data", e);
      }
    }
  }, []);

  const getInitials = (name: string) => {
    if (!name) return 'G'; 
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  
  // 2. Handler to Open API Dialog (closes menu first)
  const handleOpenApiKey = () => {
    setAnchorEl(null);
    setOpenApiDialog(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_data');
    navigate('/login');
    window.location.reload(); 
  };

  // Helper Logic
  const isPassenger = user && user.role !== 'admin' && user.role !== 'operator';
  const isOperator = user && user.role === 'operator';

  return (
    <>
      <AppBar position="sticky" elevation={0} sx={{ borderBottom: 1, borderColor: 'primary.dark', zIndex: 1100 }}>
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ justifyContent: 'space-between', minHeight: '64px' }}>
            
            {/* Logo Section */}
            <Stack direction="row" alignItems="center" gap={1} sx={{ cursor: 'pointer' }} onClick={() => navigate(isOperator ? '/operator/dashboard' : '/search')}>
              <DirectionsBusIcon sx={{ fontSize: 32 }} />
              <Typography variant="h5" noWrap component="div" sx={{ letterSpacing: '.1rem', color: 'inherit', textDecoration: 'none' }}>
                TRAVEL POINT
              </Typography>
            </Stack>

            <Stack direction="row" spacing={2} alignItems="center">
              
              {/* --- PASSENGER BUTTONS --- */}
              {isPassenger && (
                <>
                  <Button sx={{ color: 'inherit' }} onClick={() => navigate('/search')}>Search</Button>
                  <Button sx={{ color: 'inherit' }} onClick={() => navigate('/my-bookings')}>My Bookings</Button>
                </>
              )}

              {/* --- OPERATOR BUTTONS --- */}
              {isOperator && (
                <>
                  <Button sx={{ color: 'inherit' }} onClick={() => navigate('/operator/dashboard')}>
                    Dashboard
                  </Button>
                  <Button 
                    sx={{ color: 'inherit' }} 
                    startIcon={<MailIcon />} 
                    onClick={() => navigate('/operator/inbox')}
                  >
                    Inbox
                  </Button>
                </>
              )}

              <Button sx={{ color: 'inherit' }}>Help</Button>
              
              {/* User Profile */}
              <Stack 
                direction="row" alignItems="center" spacing={1} onClick={handleMenu} 
                sx={{ cursor: 'pointer', p: 0.5, borderRadius: 1, '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
              >
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'background.paper', color: 'primary.main', fontSize: '0.9rem', fontWeight: 'bold' }}>
                  {user ? getInitials(user.name) : 'G'}
                </Avatar>
                <Typography variant="subtitle2" fontWeight="bold" color="inherit">
                  {user ? user.name : 'Guest'}
                </Typography>
              </Stack>

              {/* Dropdown Menu */}
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                <MenuItem onClick={handleClose}>My Profile</MenuItem>
                
                {isPassenger && (
                    <MenuItem onClick={() => { handleClose(); navigate('/my-bookings'); }}>My Bookings</MenuItem>
                )}
                
                {isOperator && (
                    <MenuItem onClick={() => { handleClose(); navigate('/operator/inbox'); }}>Inbox</MenuItem>
                )}

                <Divider /> {/* Separation Line */}

                {/* 3. NEW DEVELOPER MENU ITEM */}
                <MenuItem onClick={handleOpenApiKey}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <CodeIcon fontSize="small" color="action" />
                        <Typography variant="inherit">Developer API Key</Typography>
                    </Box>
                </MenuItem>

                <Divider />

                <MenuItem onClick={handleLogout}>
                    <Typography color="error">Logout</Typography>
                </MenuItem>
              </Menu>

            </Stack>

          </Toolbar>
        </Container>
      </AppBar>

      {/* 4. RENDER THE DIALOG COMPONENT */}
      <ApiKeyDialog 
        open={openApiDialog} 
        onClose={() => setOpenApiDialog(false)} 
      />
    </>
  );
};