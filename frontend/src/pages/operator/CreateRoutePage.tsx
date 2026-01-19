import React, { useState } from 'react';
import {
    Box, Container, Typography, Paper,
    TextField, Button, Grid, IconButton,
    MenuItem, Divider, Stack, ToggleButton, ToggleButtonGroup
} from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import MapIcon from '@mui/icons-material/Map';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ViewListIcon from '@mui/icons-material/ViewList'; 
import AccountTreeIcon from '@mui/icons-material/AccountTree'; 

import { useUI } from '../../context/UIProvider';
import { useNavigate } from 'react-router-dom';
import { OperatorService } from '../../services/api/services/OperatorService';
import type { RouteRequest } from '../../services/api/models/RouteRequest';
import type { RouteStopRequest } from '../../services/api/models/RouteStopRequest';
import { Header } from '../../components/common/Header';

// Import the Visual Tool
import { RouteCreator } from './RouteCreator'; 

export const CreateRoutePage = () => {
    const { showToast } = useUI();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState<'form' | 'visual'>('form');

    const handleModeChange = (
        event: React.MouseEvent<HTMLElement>,
        newMode: 'form' | 'visual' | null,
    ) => {
        if (newMode !== null) {
            setViewMode(newMode);
        }
    };

    // --- FORM STATE ---
    const [routeInfo, setRouteInfo] = useState({
        name: '',
        distance: '',
        duration: ''
    });

    const [stops, setStops] = useState<Partial<RouteStopRequest>[]>([
        {
            stop_name: '',
            order_id: 0,
            distance: 0,
            price: 0,
            estimated_time: '0 hrs',
            stop_type: 'Boarding'
        }
    ]);

    // --- HANDLERS (Same as before) ---
    const handleRouteChange = (field: string, value: string) => {
        setRouteInfo(prev => ({ ...prev, [field]: value }))
    };

    const handleStopChange = (index: number, field: keyof RouteStopRequest, value: any) => {
        const updatedStops = [...stops];
        updatedStops[index] = { ...updatedStops[index], [field]: value };
        setStops(updatedStops);
    };
    
    const addStopRow = () => {
        setStops([...stops, {
            stop_name: '', distance: 0, price: 0, estimated_time: '', stop_type: 'Both'
        }]);
    };
    
    const removeStopRow = (index: number) => {
        if (stops.length === 1) return showToast("Warning", "Route must have at least one stop", "warning");
        const updated = stops.filter((_, i) => i !== index);
        setStops(updated);
    };

    const handleSubmit = async () => {
        if (!routeInfo.name || !routeInfo.distance || !routeInfo.duration) {
            return showToast("Missing Details", "Please fill in Route Name, Distance and Duration", "warning");
        }
        for (let i = 0; i < stops.length; i++) {
            if (!stops[i].stop_name) {
                return showToast("Invalid Stop", `Stop #${i + 1} is missing a name`, "error");
            }
        }

        try {
            setLoading(true);
            const payload: RouteRequest = {
                route_name: routeInfo.name,
                total_distance: Number(routeInfo.distance),
                estimated_time: routeInfo.duration,
                stops: stops.map((stop, index) => ({
                    stop_name: stop.stop_name!,
                    order_id: index + 1,
                    distance: Number(stop.distance) || 0,
                    price: Number(stop.price) || 0,
                    estimated_time: stop.estimated_time || '',
                    stop_type: stop.stop_type as 'Boarding' | 'Dropping' | 'Both'
                }))
            };

            await OperatorService.createRoute(payload);
            showToast("Success", "Route Created Successfully!", "success");
            navigate('/operator/dashboard');

        } catch (error: any) {
            console.error("Create Route Error:", error);
            showToast("Error", error.body?.message || "Failed to create route", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#f5f5f5' }}>
            
            {/* 1. HEADER IS NOW ALWAYS VISIBLE */}
            <Header />

            <Container maxWidth={viewMode === 'visual' ? false : "lg"} sx={{ mt: 4, px: viewMode === 'visual' ? 2 : 3, flexGrow: 1 }}>

                {/* 2. TOGGLE NAVIGATION BAR */}
                <Paper square elevation={1} sx={{ p: 2, mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: 2 }}>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton onClick={() => navigate('/operator/dashboard')} sx={{ mr: 2 }}>
                            <ArrowBackIcon />
                        </IconButton>
                        <Box>
                            <Typography variant="h5" fontWeight="bold" color="text.primary">
                                Create New Route
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {viewMode === 'form' ? 'Standard Form Mode' : 'Interactive Map Mode'}
                            </Typography>
                        </Box>
                    </Box>

                    <ToggleButtonGroup
                        value={viewMode}
                        exclusive
                        onChange={handleModeChange}
                        aria-label="view mode"
                        color="primary"
                        size="small"
                    >
                        <ToggleButton value="form" sx={{ px: 3, fontWeight: 'bold' }}>
                            <ViewListIcon sx={{ mr: 1 }} />
                            Form
                        </ToggleButton>
                        <ToggleButton value="visual" sx={{ px: 3, fontWeight: 'bold' }}>
                            <AccountTreeIcon sx={{ mr: 1 }} />
                            Visual Builder
                        </ToggleButton>
                    </ToggleButtonGroup>
                </Paper>

                {/* 3. CONDITIONAL CONTENT */}
                
                {viewMode === 'visual' ? (
                    // VISUAL BUILDER
                    // Adjusted height: 100vh - (Header ~64px + ToggleBar ~90px + Margins)
                    // We use 'calc(100vh - 200px)' to prevent double scrollbars
                    <Box sx={{ height: 'calc(100vh - 220px)', border: '1px solid #ddd', borderRadius: 2, overflow: 'hidden', bgcolor: 'white' }}>
                        <RouteCreator />
                    </Box>
                ) : (
                    // STANDARD FORM
                    <Box sx={{ pb: 8 }}>
                        <Grid container spacing={4}>
                            <Grid item xs={12} md={4}>
                                <Paper sx={{ p: 3, position: 'sticky', top: 20 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                                        <MapIcon color="primary" />
                                        <Typography variant="h6" fontWeight="bold">Route Overview</Typography>
                                    </Box>
                                    <Stack spacing={3}>
                                        <TextField
                                            label="Route Name"
                                            placeholder="e.g. Chennai - Bangalore"
                                            fullWidth
                                            value={routeInfo.name}
                                            onChange={(e) => handleRouteChange('name', e.target.value)}
                                        />
                                        <TextField
                                            label="Total Distance (km)"
                                            type="number"
                                            fullWidth
                                            value={routeInfo.distance}
                                            onChange={(e) => handleRouteChange('distance', e.target.value)}
                                        />
                                        <TextField
                                            label="Total Est. Duration"
                                            placeholder="e.g. 6 hrs 30 mins"
                                            fullWidth
                                            value={routeInfo.duration}
                                            onChange={(e) => handleRouteChange('duration', e.target.value)}
                                        />
                                        <Divider />
                                        <Button
                                            variant="contained"
                                            size="large"
                                            startIcon={<SaveIcon />}
                                            onClick={handleSubmit}
                                            disabled={loading}
                                        >
                                            {loading ? "Saving..." : "Save Route"}
                                        </Button>
                                    </Stack>
                                </Paper>
                            </Grid>

                            <Grid item xs={12} md={8}>
                                <Paper sx={{ p: 3 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                        <Typography variant="h6" fontWeight="bold">Stops & Points</Typography>
                                        <Button startIcon={<AddCircleIcon />} variant="outlined" onClick={addStopRow}>
                                            Add Stop
                                        </Button>
                                    </Box>

                                    {stops.map((stop, index) => (
                                        <Box key={index} sx={{ mb: 3, p: 2, border: '1px solid #eee', borderRadius: 2, bgcolor: '#fafafa' }}>
                                            {/* Stop Item Content (Same as before) */}
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                <Typography variant="subtitle2" color="primary" fontWeight="bold">
                                                    Stop #{index + 1}
                                                </Typography>
                                                {stops.length > 1 && (
                                                    <IconButton size="small" color="error" onClick={() => removeStopRow(index)}>
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                )}
                                            </Box>

                                            <Grid container spacing={2}>
                                                <Grid item xs={12} sm={6}>
                                                    <TextField
                                                        label="Stop Name" size="small" fullWidth
                                                        value={stop.stop_name}
                                                        onChange={(e) => handleStopChange(index, 'stop_name', e.target.value)}
                                                    />
                                                </Grid>
                                                <Grid item xs={12} sm={6}>
                                                    <TextField
                                                        select label="Stop Type" size="small" fullWidth
                                                        value={stop.stop_type}
                                                        onChange={(e) => handleStopChange(index, 'stop_type', e.target.value)}
                                                    >
                                                        <MenuItem value="Boarding">Boarding Point</MenuItem>
                                                        <MenuItem value="Dropping">Dropping Point</MenuItem>
                                                        <MenuItem value="Both">Both</MenuItem>
                                                    </TextField>
                                                </Grid>
                                                <Grid item xs={4}>
                                                    <TextField
                                                        label="Dist. (km)" type="number" size="small" fullWidth
                                                        value={stop.distance}
                                                        onChange={(e) => handleStopChange(index, 'distance', e.target.value)}
                                                    />
                                                </Grid>
                                                <Grid item xs={4}>
                                                    <TextField
                                                        label="Time" size="small" fullWidth
                                                        value={stop.estimated_time}
                                                        onChange={(e) => handleStopChange(index, 'estimated_time', e.target.value)}
                                                    />
                                                </Grid>
                                                <Grid item xs={4}>
                                                    <TextField
                                                        label="Price (₹)" type="number" size="small" fullWidth
                                                        value={stop.price}
                                                        onChange={(e) => handleStopChange(index, 'price', e.target.value)}
                                                    />
                                                </Grid>
                                            </Grid>
                                        </Box>
                                    ))}
                                </Paper>
                            </Grid>
                        </Grid>
                    </Box>
                )}
            </Container>
        </Box>
    );
};