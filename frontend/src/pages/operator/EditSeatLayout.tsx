import React, { useState, useEffect } from 'react';
import { 
    Box, Container, Typography, Paper, TextField, 
    Button, Grid, MenuItem, Divider, IconButton, Chip, Stack
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import { useUI } from '../../context/UIProvider';
import { useParams, useNavigate } from 'react-router-dom';
import { OperatorService } from '../../services/api/services/OperatorService';
import { Header } from '../../components/common/Header';
import { SeatIcon } from '../../components/booking/SeatIcon'; // <--- REUSING YOUR COMPONENT

// Constants
const SEAT_TYPES = ['Seater', 'Sleeper_Upper', 'Sleeper_Lower'];
const SEAT_STATUSES = ['good', 'repair', 'maintenance', 'damaged'];

interface SeatData {
    seat_id: number;
    seat_number: string;
    seat_type: string;
    price: number;
    status: string;
}

export const EditSeatLayoutPage = () => {
    const { bus_id } = useParams();
    const { showToast } = useUI();
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(false);
    const [seats, setSeats] = useState<SeatData[]>([]);
    
    // Selection State
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    // Form State (For the Editor Panel)
    const [editForm, setEditForm] = useState({
        price: '',
        status: '',
        type: ''
    });

    // 1. Fetch Seats
    useEffect(() => {
        if (bus_id) loadSeats();
    }, [bus_id]);

    const loadSeats = async () => {
        if (!bus_id) return;
        try {
            setLoading(true);
            const response = await OperatorService.getBusLayout(Number(bus_id));
            const list = response.data || [];
            
            // Map API response to our SeatData shape
            const cleanList = list.map((s: any) => ({
                seat_id: s.seat_id,
                seat_number: s.seat_number,
                seat_type: s.seat_type || 'Seater',
                price: Number(s.price) || 0,
                status: s.status || 'good'
            }));
            setSeats(cleanList);
        } catch (error) {
            console.error("Load Seats Error:", error);
            showToast("Error", "Failed to load layout", "error");
        } finally {
            setLoading(false);
        }
    };

    // 2. Handle Clicking a Seat (Toggle Selection)
    const handleSeatClick = (seatId: number) => {
        if (selectedIds.includes(seatId)) {
            setSelectedIds(prev => prev.filter(id => id !== seatId)); // Unselect
        } else {
            setSelectedIds(prev => [...prev, seatId]); // Select
        }
    };

    // 3. Select All / Clear Selection
    const handleSelectAll = () => setSelectedIds(seats.map(s => s.seat_id));
    const handleClearSelection = () => setSelectedIds([]);

    // 4. Apply Changes to SELECTED seats only (Local State Update)
    const applyChanges = () => {
        if (selectedIds.length === 0) return showToast("No Selection", "Select seats first", "warning");

        const updatedSeats = seats.map(seat => {
            if (selectedIds.includes(seat.seat_id)) {
                return {
                    ...seat,
                    // Only update if the user typed something in the form
                    price: editForm.price ? Number(editForm.price) : seat.price,
                    status: editForm.status ? editForm.status : seat.status,
                    seat_type: editForm.type ? editForm.type : seat.seat_type,
                };
            }
            return seat;
        });

        setSeats(updatedSeats);
        showToast("Updated", `Applied changes to ${selectedIds.length} seats`, "success");
        // Optional: Clear selection after apply? No, let them keep selecting if they want to verify.
    };

    // 5. Save to Backend
    const handleSaveToBackend = async () => {
        if (!bus_id) return;
        try {
            setLoading(true);
            const updates = seats.map(s => ({
                seat_numbers: [s.seat_number],
                price: Number(s.price),
                status: s.status,
                seat_type: s.seat_type
            }));

            await OperatorService.updateBusLayout(Number(bus_id), { updates: updates as any });
            showToast("Success", "Layout Saved Successfully!", "success");
            navigate('/operator/dashboard');
        } catch (error: any) {
            showToast("Error", "Failed to save layout", "error");
        } finally {
            setLoading(false);
        }
    };

    // Helper: Split seats into Lower and Upper decks
    const lowerDeck = seats.filter(s => !s.seat_type.toLowerCase().includes('upper'));
    const upperDeck = seats.filter(s => s.seat_type.toLowerCase().includes('upper'));

    // Helper: Render a Deck
    const renderDeck = (title: string, deckSeats: SeatData[]) => (
        <Box sx={{ mb: 4, p: 2, border: '1px solid #ddd', borderRadius: 2, bgcolor: '#fff' }}>
            <Typography variant="subtitle1" fontWeight="bold" align="center" gutterBottom>{title}</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center', minHeight: '100px' }}>
                {deckSeats.map(seat => {
                    const isSelected = selectedIds.includes(seat.seat_id);
                    return (
                        <SeatIcon 
                            key={seat.seat_id}
                            seatNumber={seat.seat_number}
                            price={seat.price}
                            status={isSelected ? 'SELECTED' : seat.status === 'good' ? 'AVAILABLE' : 'BOOKED'} 
                            // We use 'BOOKED' style for maintenance/damaged to show red
                            // We use 'SELECTED' style (green) when clicked
                            
                            type={seat.seat_type.toLowerCase().includes('sleeper') ? 'sleeper' : 'seater'}
                            onClick={() => handleSeatClick(seat.seat_id)}
                        />
                    );
                })}
            </Box>
        </Box>
    );

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', pb: 8 }}>
            <Header />
            <Container maxWidth="xl" sx={{ mt: 4 }}>
                
                {/* Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <IconButton onClick={() => navigate(-1)}><ArrowBackIcon /></IconButton>
                    <Typography variant="h5" fontWeight="bold" ml={1}>Visual Seat Editor</Typography>
                </Box>

                <Grid container spacing={3}>
                    
                    {/* LEFT COLUMN: Visual Bus Layout */}
                    <Grid item xs={12} md={8}>
                        {seats.length === 0 ? (
                            <Paper sx={{ p: 4, textAlign: 'center' }}>Loading or No Seats...</Paper>
                        ) : (
                            <>
                                {renderDeck("Lower Deck", lowerDeck)}
                                {upperDeck.length > 0 && renderDeck("Upper Deck (Sleeper)", upperDeck)}
                            </>
                        )}
                    </Grid>

                    {/* RIGHT COLUMN: Editor Panel (Sticky) */}
                    <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 3, position: 'sticky', top: 20 }}>
                            <Typography variant="h6" gutterBottom>
                                Edit Selected ({selectedIds.length})
                            </Typography>
                            
                            <Stack direction="row" spacing={1} mb={2}>
                                <Button size="small" onClick={handleSelectAll}>Select All</Button>
                                <Button size="small" color="error" onClick={handleClearSelection}>Clear</Button>
                            </Stack>

                            <Divider sx={{ mb: 2 }} />

                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField 
                                        label="Price (₹)" 
                                        type="number" 
                                        fullWidth 
                                        size="small" 
                                        value={editForm.price}
                                        onChange={(e) => setEditForm({...editForm, price: e.target.value})}
                                        helperText="Leave empty to keep current price"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField 
                                        select 
                                        label="Seat Type" 
                                        fullWidth 
                                        size="small"
                                        value={editForm.type}
                                        onChange={(e) => setEditForm({...editForm, type: e.target.value})}
                                    >
                                        <MenuItem value=""><em>No Change</em></MenuItem>
                                        {SEAT_TYPES.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                                    </TextField>
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField 
                                        select 
                                        label="Status" 
                                        fullWidth 
                                        size="small"
                                        value={editForm.status}
                                        onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                                    >
                                        <MenuItem value=""><em>No Change</em></MenuItem>
                                        {SEAT_STATUSES.map(s => <MenuItem key={s} value={s}>{s.toUpperCase()}</MenuItem>)}
                                    </TextField>
                                </Grid>
                                
                                <Grid item xs={12}>
                                    <Button 
                                        variant="contained" 
                                        fullWidth 
                                        onClick={applyChanges}
                                        disabled={selectedIds.length === 0}
                                        startIcon={<CheckCircleIcon />}
                                    >
                                        Apply Changes
                                    </Button>
                                    <Typography variant="caption" color="text.secondary" display="block" textAlign="center" mt={1}>
                                        (Updates local preview only)
                                    </Typography>
                                </Grid>
                            </Grid>

                            <Divider sx={{ my: 3 }} />

                            <Button 
                                variant="contained" 
                                color="success" 
                                size="large" 
                                fullWidth
                                startIcon={<SaveIcon />}
                                onClick={handleSaveToBackend}
                                disabled={loading}
                                sx={{ py: 1.5 }}
                            >
                                {loading ? "Saving..." : "Save All to Database"}
                            </Button>
                        </Paper>
                    </Grid>

                </Grid>
            </Container>
        </Box>
    );
};