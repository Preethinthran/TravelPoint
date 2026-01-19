import React, { useState, useEffect } from 'react';
import { 
    Box, Container, Typography, Paper, Grid, 
    Button, Chip, IconButton, Card, CardContent, CardActions 
} from '@mui/material';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import EditIcon from '@mui/icons-material/Edit';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { useUI } from '../../context/UIProvider';
import { useNavigate } from 'react-router-dom';
import { OperatorService } from '../../services/api/services/OperatorService';
import { Header } from '../../components/common/Header';

export const MyBusesPage = () => {
    const { showToast } = useUI();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [buses, setBuses] = useState<any[]>([]);

    useEffect(() => {
        fetchMyBuses();
    }, []);

    const fetchMyBuses = async () => {
        try {
            setLoading(true);
            const response = await OperatorService.getOperatorBuses();
            // The API returns { success: true, message: "...", data: [...] }
            // So we need to access response.data
            setBuses(response.data || []);
        } catch (error) {
            console.error("Fetch Buses Error:", error);
            showToast("Error", "Failed to load your fleet", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', pb: 8 }}>
            <Header />
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                    <IconButton onClick={() => navigate('/operator/dashboard')} sx={{ mr: 2 }}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h4" fontWeight="bold" color="primary">
                        My Fleet
                    </Typography>
                </Box>

                {loading && <Typography>Loading buses...</Typography>}

                {!loading && buses.length === 0 && (
                    <Paper sx={{ p: 4, textAlign: 'center' }}>
                        <Typography variant="h6" color="text.secondary">No buses found.</Typography>
                    </Paper>
                )}

                <Grid container spacing={3}>
                    {buses.map((bus) => (
                        <Grid item xs={12} sm={6} md={4} key={bus.bus_id}>
                            <Card elevation={3} sx={{ borderRadius: 2 }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                        <DirectionsBusIcon color="primary" fontSize="large" />
                                        <Typography variant="h6" fontWeight="bold">
                                            {bus.bus_number}
                                        </Typography>
                                    </Box>
                                    
                                    <Chip label={bus.bus_type} size="small" color="info" variant="outlined" sx={{ mb: 2 }} />
                                    
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                                        <EventSeatIcon fontSize="small" />
                                        <Typography variant="body2">{bus.total_seats} Seats</Typography>
                                    </Box>
                                </CardContent>
                                
                                <CardActions sx={{ p: 2, pt: 0 }}>
                                    {/* THIS BUTTON LINKS TO THE SEAT PAGE */}
                                    <Button 
                                        variant="contained" 
                                        fullWidth 
                                        startIcon={<EditIcon />}
                                        onClick={() => navigate(`/operator/bus/${bus.bus_id}/seats`)}
                                    >
                                        Edit Layout
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

            </Container>
        </Box>
    );
};