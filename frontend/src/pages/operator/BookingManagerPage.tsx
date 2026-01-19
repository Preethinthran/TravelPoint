import React, { useState, useEffect } from 'react';
import { 
    Box, Container, Typography, Paper, Grid, 
    Button, Chip, IconButton, Table, TableBody, 
    TableCell, TableContainer, TableHead, TableRow,
    Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PeopleIcon from '@mui/icons-material/People';
import MapIcon from '@mui/icons-material/Map';
import CloseIcon from '@mui/icons-material/Close';

import { useUI } from '../../context/UIProvider';
import { useNavigate } from 'react-router-dom';
import { OperatorInfoService } from '../../services/api/services/OperatorInfoService';
import { Header } from '../../components/common/Header';
import { useAuth } from '../../context/AuthProvider';

type GroupedTrip = {
    trip_id: number;
    bus_number: string;
    route_name: string;
    departure_time: string;
    total_passengers: number;
    passengers: any[]; // The list of passenger objects
};

export const BookingManagerPage = () => {
    const { showToast } = useUI();
    const {user} = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    
    // This holds our organized list of trips
    const [trips, setTrips] = useState<GroupedTrip[]>([]);
    
    // Modal State
    const [selectedTrip, setSelectedTrip] = useState<GroupedTrip | null>(null);
    const [openModal, setOpenModal] = useState(false);

    useEffect(() => {
        fetchManifest();
    }, []);

   const fetchManifest = async () => {
        try {
            setLoading(true);
            
            const operatorId = user?.user_id;

            if (!operatorId) {
                showToast("Error", "Operator ID not found.", "error");
                return;
            }

            const response: any = await OperatorInfoService.getBookingsInfo(operatorId);
            
            console.log("Full API Response:", response); 

            // --- THE FIX ---
            // 1. Handle if the response is an Array (e.g. [{ result: ... }])
            const rootData = Array.isArray(response) ? response[0] : response;

            // 2. Now look for the 'bus' list inside the unwrapped object
            const busList = rootData.bus || rootData.result?.bus || rootData.data?.bus || [];

            console.log("Extracted Bus List:", busList); // Check your console for this!

            if (busList.length > 0) {
                const groupedTrips: Record<number, GroupedTrip> = {};

                busList.forEach((busItem: any) => {
                    busItem.passengers_list?.forEach((pax: any) => {
                        if (!pax.trip_id) return;

                        if (!groupedTrips[pax.trip_id]) {
                            groupedTrips[pax.trip_id] = {
                                trip_id: pax.trip_id,
                                bus_number: busItem.bus_number || 'Unknown Bus',
                                route_name: pax.route_name || 'Unknown Route',
                                departure_time: pax.departure_time || '',
                                total_passengers: 0,
                                passengers: []
                            };
                        }
                        console.log("Passenger:", pax);

                        groupedTrips[pax.trip_id].passengers.push(pax);
                        groupedTrips[pax.trip_id].total_passengers++;
                    });
                });

                setTrips(Object.values(groupedTrips));
            } else {
                setTrips([]); 
            }

        } catch (error) {
            console.error("Fetch Manifest Error:", error);
            showToast("Error", "Failed to load bookings", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleViewPassengers = (trip: GroupedTrip) => {
        setSelectedTrip(trip);
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setSelectedTrip(null);
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
                        Trip Manifests
                    </Typography>
                </Box>

                {loading && <Typography>Loading schedules...</Typography>}
                
                {!loading && trips.length === 0 && (
                    <Paper sx={{ p: 4, textAlign: 'center' }}>
                        <Typography color="text.secondary">No bookings found for your fleet yet.</Typography>
                    </Paper>
                )}

                {/* --- TRIP LIST VIEW --- */}
                <Grid container spacing={3}>
                    {trips.map((trip) => (
                        <Grid item xs={12} key={trip.trip_id}>
                            <Paper sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                                        <Typography variant="h6" fontWeight="bold">
                                            {trip.route_name}
                                        </Typography>
                                        <Chip label={trip.bus_number} size="small" color="primary" variant="outlined" />
                                    </Box>
                                    <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <MapIcon fontSize="small" /> 
                                        Departs: {new Date(trip.departure_time).toLocaleString()}
                                    </Typography>
                                </Box>

                                <Box sx={{ textAlign: 'right' }}>
                                    <Typography variant="h4" color="primary" fontWeight="bold">
                                        {trip.total_passengers}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">Passengers</Typography>
                                    <Box mt={1}>
                                        <Button variant="contained" size="small" onClick={() => handleViewPassengers(trip)}>
                                            View List
                                        </Button>
                                    </Box>
                                </Box>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>

                {/* --- PASSENGER DETAILS MODAL --- */}
                <Dialog open={openModal} onClose={handleCloseModal} maxWidth="md" fullWidth>
                    <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                            Passenger List
                            <Typography variant="caption" display="block" color="text.secondary">
                                {selectedTrip?.route_name} | {selectedTrip?.bus_number}
                            </Typography>
                        </Box>
                        <IconButton onClick={handleCloseModal}><CloseIcon /></IconButton>
                    </DialogTitle>
                    
                    <DialogContent dividers>
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ bgcolor: '#fafafa' }}>
                                        <TableCell><strong>Seat</strong></TableCell>
                                        <TableCell><strong>Passenger Name</strong></TableCell>
                                        <TableCell><strong>Gender</strong></TableCell>
                                        <TableCell><strong>Contact</strong></TableCell>
                                        <TableCell><strong>Boarding</strong></TableCell>
                                        <TableCell><strong>Status</strong></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {selectedTrip?.passengers.map((pax: any, index: number) => (
                                        <TableRow key={index}>
                                            <TableCell>
                                                <Chip label={pax.seat_number} size="small" color="secondary" />
                                            </TableCell>
                                            <TableCell>{pax.passenger_name}</TableCell>
                                            <TableCell>{pax.gender}</TableCell> {/* Gender is missing in API model, using '-' */}
                                            <TableCell>{pax.contact_number}</TableCell>
                                            <TableCell>{pax.pickup_point}</TableCell>
                                            <TableCell>
                                                <Chip 
                                                    label={pax.booking_status || 'Booked'} 
                                                    size="small" 
                                                    color={pax.booking_status === 'Cancelled' ? 'error' : 'success'} 
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </DialogContent>
                    
                    <DialogActions>
                        <Button onClick={handleCloseModal}>Close</Button>
                        <Button variant="contained" startIcon={<PeopleIcon />}>
                            Print Manifest
                        </Button>
                    </DialogActions>
                </Dialog>

            </Container>
        </Box>
    );
};