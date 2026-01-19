import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
    Box, Container, Typography, Paper, Grid, InputAdornment, TextField, 
    Button, Divider, IconButton, CircularProgress, Menu, MenuItem, ListItemIcon
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search'; 
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PlayCircleFilledWhiteIcon from '@mui/icons-material/PlayCircleFilledWhite';
import ScheduleIcon from '@mui/icons-material/Schedule';

import { useUI } from '../../context/UIProvider';
import { useNavigate } from 'react-router-dom';
import { OperatorService } from '../../services/api/services/OperatorService';
import { SocketService } from '../../services/SocketService';
import { ManifestModal } from '../../components/booking/ManifestModal';
import { Header } from '../../components/common/Header';
import { TripCard } from '../../components/operator/TripCard';

interface Trip {
    trip_id: number;
    bus_id: number;
    bus_number: string;
    route_name: string;
    departure_time: string;
    arrival_time: string;
    trip_status: string;
}

export const MyTripsPage = () => {
    const { showToast } = useUI();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [trips, setTrips] = useState<Trip[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    
    // UI State
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedTripId, setSelectedTripId] = useState<number | null>(null);
    const [updating, setUpdating] = useState(false);
    const [openManifest, setOpenManifest] = useState(false);
    const [selectedTripDetails, setSelectedTripDetails] = useState<Trip | null>(null);
    const [tripPassengers, setTripPassengers] = useState<any[]>([]);
    
    // Tracking State
    const [trackingTripId, setTrackingTripId] = useState<number | null>(null);
    const watchIdRef = useRef<number | null>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // --- TRACKING HANDLERS ---
    const startTracking = (tripId: number) => {
        if (!navigator.geolocation) return showToast("Error", "Geolocation unsupported", "error");
        const socket = SocketService.getSocket();
        if (!socket) return showToast("Error", "Socket not connected", "error");

        setTrackingTripId(tripId);
        showToast("Info", "🔴 Live Tracking Started!", "info");

        watchIdRef.current = navigator.geolocation.watchPosition(
            (pos) => {
                const { latitude, longitude, heading, speed } = pos.coords;
                socket.emit('send_location', { tripId, lat: latitude, lng: longitude, heading, speed });
            },
            (err) => { console.error(err); setTrackingTripId(null); },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    const stopTracking = () => {
        if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }
        setTrackingTripId(null);
        showToast("Info", "Tracking Stopped.", "info");
    };

    // Clean up tracking on unmount
    useEffect(() => {
        return () => { if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current); };
    }, []);

    // --- DATA FETCHING ---
    const fetchTrips = useCallback(async () => {
        try {
            setLoading(true);
            const res = await OperatorService.getOperatorTrips();
            setTrips(res.data as Trip[] || []); 
        } catch (err) { showToast("Error", "Failed to load trips", "error"); } 
        finally { setLoading(false); }
    }, [showToast]);

    useEffect(() => { fetchTrips(); }, [fetchTrips]);

    const handleViewManifest = useCallback(async (trip: Trip) => {
        setSelectedTripDetails(trip);
        try {
            const res = await OperatorService.getOperatorTripsPassengers(trip.trip_id);
            setTripPassengers((res.data || []).map(p => ({ ...p, booking_status: p.status })));
            setOpenManifest(true);
        } catch (e) { showToast("Error", "Failed manifest load", "error"); }
    }, [showToast]);

    // Change 'string' to the specific Union Type
    const handleUpdateStatus = async (newStatus: 'Live' | 'Completed' | 'Cancelled' | 'Scheduled') => {
        if (!selectedTripId) return;
        try {
            setUpdating(true);
            // Now TypeScript knows newStatus is safe to pass here
            await OperatorService.patchOperatorTripsStatus(selectedTripId, { status: newStatus });
            showToast("Success", `Trip marked as ${newStatus}`, "success");
            
            // Stop tracking if trip ends
            if ((newStatus === 'Completed' || newStatus === 'Cancelled') && trackingTripId === selectedTripId) {
                stopTracking();
            }
            setTrips(prev => prev.map(t => t.trip_id === selectedTripId ? { ...t, trip_status: newStatus } : t));
        } catch (e) { showToast("Error", "Update failed", "error"); } 
        finally { setUpdating(false); setAnchorEl(null); }
    };

    // Filter Logic
    const filteredTrips = useMemo(() => {
        let data = [...trips];
        if(searchTerm) {
            const term = searchTerm.toLowerCase();
            data = data.filter(t => t.route_name?.toLowerCase().includes(term) || t.bus_number?.toLowerCase().includes(term));
        }
        return data.sort((a, b) => new Date(b.departure_time).getTime() - new Date(a.departure_time).getTime());
    }, [trips, searchTerm]);

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', pb: 8 }}>
            <Header />
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                    <IconButton onClick={() => navigate('/operator/dashboard')} sx={{ mr: 2 }}> <ArrowBackIcon /> </IconButton>
                    <Typography variant="h4" fontWeight="bold" color="primary">My Trips</Typography>
                    <Box sx={{ flexGrow: 1 }} />
                    <Button variant="contained" startIcon={<CalendarTodayIcon />} onClick={() => navigate('/operator/schedule-trip')}>
                        Schedule New Trip
                    </Button>
                </Box>

                <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
                    <TextField 
                        fullWidth placeholder="Search..." value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)} inputRef={searchInputRef}
                        InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon color="action" /></InputAdornment>) }}
                    />
                </Paper>

                {loading ? <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box> : 
                 filteredTrips.length === 0 ? <Paper sx={{ p: 5, textAlign: 'center' }}><Typography>No trips found.</Typography></Paper> : 
                 <Grid container spacing={3}>
                    {filteredTrips.map((trip) => (
                        <Grid item xs={12} md={6} key={trip.trip_id}>
                            {/* --- USING THE NEW COMPONENT --- */}
                            <TripCard 
                                trip={trip as any}
                                isTrackingThisTrip={trackingTripId === trip.trip_id}
                                isTrackingAnyTrip={trackingTripId !== null}
                                updating={updating}
                                onViewManifest={handleViewManifest}
                                onOpenStatusMenu={(e, id) => { setAnchorEl(e.currentTarget); setSelectedTripId(id); }}
                                onStartTracking={startTracking}
                                onStopTracking={stopTracking}
                            />
                        </Grid>
                    ))}
                 </Grid>
                }

                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
                    <MenuItem onClick={() => handleUpdateStatus('Live')}><ListItemIcon><PlayCircleFilledWhiteIcon color="success" fontSize="small"/></ListItemIcon>Live</MenuItem>
                    <MenuItem onClick={() => handleUpdateStatus('Completed')}><ListItemIcon><CheckCircleIcon color="action" fontSize="small"/></ListItemIcon>Completed</MenuItem>
                    <MenuItem onClick={() => handleUpdateStatus('Scheduled')}><ListItemIcon><ScheduleIcon color="primary" fontSize="small"/></ListItemIcon>Scheduled</MenuItem>
                    <Divider />
                    <MenuItem onClick={() => handleUpdateStatus('Cancelled')} sx={{ color: 'error.main' }}><ListItemIcon><CancelIcon color="error" fontSize="small"/></ListItemIcon>Cancel</MenuItem>
                </Menu>
            </Container>

            <ManifestModal open={openManifest} onClose={() => setOpenManifest(false)} tripDetails={selectedTripDetails} passengers={tripPassengers} />
        </Box>
    );
};