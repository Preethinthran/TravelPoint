import React from 'react';
import { Box, Typography, Button, Paper, Grid } from '@mui/material';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import ListAltIcon from '@mui/icons-material/ListAlt';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/common/Header';
import { useAuth } from '../../context/AuthProvider';


export const OperatorDashboard = () =>{
    const navigate = useNavigate();
    const {user} = useAuth();

    return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <Header />
      
      <Box sx={{ p: 4, maxWidth: '1200px', mx: 'auto', mt: 4 }}>
          {/* Welcome Section */}
          <Box sx={{ mb: 6 }}>
            <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
                Operator Portal
            </Typography>
            <Typography variant="h6" color="text.secondary">
                Welcome back, {user?.name || 'Partner'}.
            </Typography>
          </Box>
          
          <Grid container spacing={4}>
            
            {/* Card 1: My Buses */}
            <Grid item xs={12} md={6}>
                <Paper 
                    elevation={2} 
                    sx={{ 
                        p: 4, 
                        textAlign: 'center', 
                        cursor: 'pointer',
                        transition: '0.3s',
                        '&:hover': { transform: 'translateY(-5px)', elevation: 6 }
                    }}
                    onClick={() => navigate('/operator/buses')}
                >
                    <DirectionsBusIcon color="primary" sx={{ fontSize: 60, mb: 2 }} />
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                        My Buses
                    </Typography>
                    <Typography color="text.primary" sx={{ mb: 3 }}>
                        View and manage your fleet. Check seat availability and schedules.
                    </Typography>
                    <Button variant="outlined">Manage Fleet</Button>
                </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
                <Paper 
                    elevation={2} 
                    sx={{ 
                        p: 4, 
                        textAlign: 'center', 
                        cursor: 'pointer',
                        transition: '0.3s',
                        '&:hover': { transform: 'translateY(-5px)', elevation: 6 }
                    }}
                    onClick={() => navigate('/operator/booking-manager')}
                >
                    <ListAltIcon color="primary" sx={{ fontSize: 60, mb: 2 }} />
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                        Manage Booking
                    </Typography>
                    <Typography color="text.primary" sx={{ mb: 3 }}>
                        Manage your Bookings.
                    </Typography>
                    <Button variant="outlined" color="primary">Manage Booking </Button>
                </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
                <Paper 
                    elevation={2} 
                    sx={{ 
                        p: 4, 
                        textAlign: 'center', 
                        cursor: 'pointer',
                        transition: '0.3s',
                        '&:hover': { transform: 'translateY(-5px)', elevation: 6 }
                    }}
                    onClick={() => navigate('/operator/create-route')}
                >
                    <ListAltIcon color="primary" sx={{ fontSize: 60, mb: 2 }} />
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                        Manage Routes
                    </Typography>
                    <Typography color="text.primary" sx={{ mb: 3 }}>
                        Manage your routes and stops.
                    </Typography>
                    <Button variant="outlined" color="primary">Manage Routes </Button>
                </Paper>
            </Grid>

            {/* <Grid item xs={12} md={6}>
                <Paper 
                    elevation={2} 
                    sx={{ 
                        p: 4, 
                        textAlign: 'center', 
                        cursor: 'pointer',
                        transition: '0.3s',
                        '&:hover': { transform: 'translateY(-5px)', elevation: 6 }
                    }}
                    onClick={() => navigate('/operator/schedule-trip')}
                >
                    <ListAltIcon color="primary" sx={{ fontSize: 60, mb: 2 }} />
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                        Schedule Trips
                    </Typography>
                    <Typography color="text.primary" sx={{ mb: 3 }}>
                        Manage your Trips.
                    </Typography>
                    <Button variant="outlined" color="primary">Manage Trips </Button>
                </Paper>
            </Grid> */}
             <Grid item xs={12} md={6}>
                <Paper 
                    elevation={2} 
                    sx={{ 
                        p: 4, 
                        textAlign: 'center', 
                        cursor: 'pointer',
                        transition: '0.3s',
                        '&:hover': { transform: 'translateY(-5px)', elevation: 6 }
                    }}
                    onClick={() => navigate('/operator/trips')}
                >
                    <ListAltIcon color="primary" sx={{ fontSize: 60, mb: 2 }} />
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                        Trips
                    </Typography>
                    <Typography color="text.primary" sx={{ mb: 3 }}>
                        View your Trips.
                    </Typography>
                    <Button variant="outlined" color="primary">View Trips </Button>
                </Paper>
            </Grid>

            
          </Grid>
      </Box>
    </Box>
  );
};