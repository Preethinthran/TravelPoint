import React, {useState, useEffect} from 'react';
import {
    Box, Container, Grid, TextField, Button,
    Typography,Paper, MenuItem, IconButton
} from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import AltRouteIcon from '@mui/icons-material/Altroute';
import InfoIcon from '@mui/icons-material/Info';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import dayjs, { Dayjs } from 'dayjs';

import {useUI} from '../../context/UIProvider';
import {useNavigate} from 'react-router-dom';
import { OperatorService } from '../../services/api/services/OperatorService';
import { Header } from '../../components/common/Header';

export const ScheduleTripPage = ()=>{
    const {showToast} = useUI();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [buses, setBuses] = useState<any[]>([]);
    const [routes, setRoutes] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        bus_id: '',
        route_id: '',
        departure_time: '',
        arrival_time: '',
        status: 'Scheduled',
    });

    useEffect (()=>{
        loadData();
    },[])
    const loadData = async() => {
        try{
            const [busesRes, routesRes] = await Promise.all([
                OperatorService.getOperatorBuses(),
                OperatorService.getMyRoutes()
            ]);
            setBuses(busesRes.data || []);
            setRoutes(routesRes.data || []);
        }catch(error){
            console.log(error);
            showToast('Error !','Error loading data', 'error');
        }
    }
    const handleChangeDate = (name: string, value: Dayjs | null) => {
        setFormData({
            ...formData,
            // Convert the Date object to ISO string for your backend
            [name]: value ? value.format('YYYY-MM-DD HH:mm:ss') : '' 
        });
    };
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({...formData, [e.target.name]: e.target.value})
    };

    const handleSubmit = async(event: React.FormEvent) => {
        event.preventDefault();

        // 1. Validation (Check if fields are empty)
        if(!formData.bus_id || !formData.route_id || !formData.departure_time || !formData.arrival_time){
            showToast('Missing fields','All fields are required', 'warning');
            return;
        }

        try{
            setLoading(true);

            // 2. Validate Time Order
            // Since our strings are "YYYY-MM-DD HH:mm:ss", standard string comparison works perfectly!
            if(formData.departure_time >= formData.arrival_time){
                showToast('Invalid time','Departure time must be before arrival time', 'warning');
                setLoading(false);
                return;
            }

            // 3. Send Data DIRECTLY (No conversion!)
            await OperatorService.postOperatorTrips({
                bus_id: Number(formData.bus_id),
                path_id: Number(formData.route_id),
                departure_time: formData.departure_time, // ✅ Sends "2025-12-30 12:00:00"
                arrival_time: formData.arrival_time,     // ✅ Sends "2025-12-30 16:00:00"
                status: formData.status as 'Scheduled' | 'Cancelled' | 'Completed' | 'Live'
            });

            showToast('Success !','Trip scheduled successfully', 'success');
            navigate('/operator/dashboard');
        }catch(error: any){
            console.log("Schedule Error:",error);
            showToast('Error',error?.message||'Failed to schedule trip', 'error');
        }finally{
            setLoading(false);
        }
    };
    console.log("My Routes Data:", routes);
    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', pb: 8 }}>
            <Header />
            <Container maxWidth="md" sx={{ mt: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                    <IconButton onClick={() => navigate('/operator/dashboard')} sx={{ mr: 2 }}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h4" fontWeight="bold" color="primary">
                        Schedule New Trip
                    </Typography>
                </Box>

                <Paper sx={{ p: 4, borderRadius: 2 }}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        
                        {/* Bus Selection */}
                        <Grid item xs={12} md={6}>
                            <TextField
                                select
                                fullWidth
                                label="Select Bus"
                                name="bus_id"
                                value={formData.bus_id}
                                onChange={handleChange}
                                InputProps={{
                                    startAdornment: <DirectionsBusIcon color="action" sx={{ mr: 1 }} />
                                }}
                            >
                                {buses.map((bus) => (
                                    <MenuItem key={bus.bus_id} value={bus.bus_id}>
                                        {bus.bus_number} ({bus.bus_type})
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        {/* Route Selection */}
                        <Grid item xs={12} md={6}>
                            <TextField
                                select
                                fullWidth
                                label="Select Route"
                                name="route_id"
                                value={formData.route_id}
                                onChange={handleChange}
                                InputProps={{
                                    startAdornment: <AltRouteIcon color="action" sx={{ mr: 1 }} />
                                }}
                            >
                                {routes.map((route) => (
                                    <MenuItem key={route.path_id} value={route.path_id}>
                                        {route.route_name || `${route.source} - ${route.destination}`}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        {/* Departure Time */}
                        <Grid item xs={12} md={6}>
                            <DateTimePicker
                                label="Departure Time"
                                // Parse the string back to a Dayjs object for the component
                                value={formData.departure_time ? dayjs(formData.departure_time) : null}
                                onChange={(newValue) => handleChangeDate('departure_time', newValue)}
                                disablePast // Industry Standard: Blocks selecting past dates
                                slotProps={{ textField: { fullWidth: true } }} // Makes it look like a TextField
                            />
                        </Grid>

                        {/* Arrival Time */}
                        <Grid item xs={12} md={6}>
                            <DateTimePicker
                                label="Arrival Time"
                                value={formData.arrival_time ? dayjs(formData.arrival_time) : null}
                                onChange={(newValue) => handleChangeDate('arrival_time', newValue)}
                                disablePast
                                minDateTime={formData.departure_time ? dayjs(formData.departure_time) : undefined}
                                slotProps={{ textField: { fullWidth: true } }}
                            />
                        </Grid>

                        {/* --- FIX: Added Status Dropdown --- */}
                        <Grid item xs={12}>
                            <TextField
                                select
                                fullWidth
                                label="Trip Status"
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                InputProps={{
                                    startAdornment: <InfoIcon color="action" sx={{ mr: 1 }} />
                                }}
                            >
                                <MenuItem value="Scheduled">Scheduled</MenuItem>
                                <MenuItem value="Live">Live</MenuItem>
                                <MenuItem value="Cancelled">Cancelled</MenuItem>
                                <MenuItem value="Completed">Completed</MenuItem>
                            </TextField>
                        </Grid>

                        <Grid item xs={12}>
                            <Button 
                                type="submit"
                                variant="contained" 
                                size="large" 
                                fullWidth 
                                startIcon={<EventIcon />}
                                disabled={loading}
                                sx={{ height: 50, mt: 2 }}
                            >
                                {loading ? "Scheduling..." : "Publish Trip"}
                            </Button>
                        </Grid>
                    </Grid>
                    </form>
                </LocalizationProvider>
                </Paper>
            </Container>
        </Box>
    );
};