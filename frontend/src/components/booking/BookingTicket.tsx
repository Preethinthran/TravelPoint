import React from 'react';
import { 
    Box, Typography, Grid, Button, Chip, Divider, Card, CardContent 
} from '@mui/material';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import EventIcon from '@mui/icons-material/Event';
import PlaceIcon from '@mui/icons-material/Place';
import DownloadIcon from '@mui/icons-material/Download';
import CancelIcon from '@mui/icons-material/Cancel';
import StarIcon from '@mui/icons-material/Star';
import ChatIcon from '@mui/icons-material/Chat';
import GpsFixedIcon from '@mui/icons-material/GpsFixed'; // <--- 1. Import Added

interface BookingTicketProps {
    booking: any; 
    onCancel?: (id: number) => void; 
    showCancelButton?: boolean;
    showChatButton?: boolean; 
    onRate?: (id: number) => void;
    showRateButton?: boolean;
    onChat?: () => void;
    // --- 2. New Tracking Props ---
    showTrackButton?: boolean;
    onTrack?: () => void;
}

export const BookingTicket: React.FC<BookingTicketProps> = ({ 
    booking, 
    onCancel, 
    showCancelButton, 
    onRate, 
    showRateButton, 
    showChatButton, 
    onChat,
    // --- 3. Destructure New Props ---
    showTrackButton,
    onTrack
}) => {
    
    // Helper for Status Colors
    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'confirmed': return 'success';
            case 'booked': return 'success';
            case 'cancelled': return 'error';
            case 'completed': return 'default';
            default: return 'primary';
        }
    };

    const isCancelled = booking.booking_status === 'Cancelled';

    return (
        <Card elevation={3} sx={{ borderRadius: 2, borderLeft: `6px solid ${isCancelled ? '#d32f2f' : '#1976d2'}` }}>
            <CardContent>
                {/* --- HEADER --- */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Box>
                        <Typography variant="h6" fontWeight="bold">
                            {booking.route_name || "Bus Trip"}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', mt: 0.5 }}>
                            <DirectionsBusIcon fontSize="small" />
                            <Typography variant="body2">{booking.bus_name}</Typography>
                        </Box>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                        <Chip 
                            label={booking.booking_status || 'Booked'} 
                            color={getStatusColor(booking.booking_status) as any} 
                            size="small" 
                        />
                        <Typography variant="subtitle2" sx={{ mt: 1, fontWeight: 'bold' }}>
                            PNR: {booking.ticket_id}
                        </Typography>
                    </Box>
                </Box>

                <Divider sx={{ my: 2, borderStyle: 'dashed' }} />

                {/* --- TRIP DETAILS --- */}
                <Grid container spacing={2}>
                    <Grid item xs={6} sm={3}>
                        <Typography variant="caption" color="text.secondary">Travel Date</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <EventIcon fontSize="small" color="action" />
                            <Typography fontWeight="500">
                                {new Date(booking.trip_date).toLocaleDateString()}
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <Typography variant="caption" color="text.secondary">Total Fare</Typography>
                        <Typography fontWeight="bold" color="success.main">
                            ₹{booking.total_amount}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary">Boarding & Dropping</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <PlaceIcon fontSize="small" color="action" />
                            <Typography variant="body2">
                                {booking.pickup_stop} <span style={{color:'#ccc'}}>➔</span> {booking.drop_stop}
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>

                {/* --- PASSENGER LIST --- */}
                <Box sx={{ mt: 2, bgcolor: '#f9f9f9', p: 1.5, borderRadius: 1 }}>
                    <Typography variant="caption" fontWeight="bold" color="text.secondary">
                        PASSENGERS
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 0.5 }}>
                        {booking.passengers?.map((p: any, idx: number) => (
                            <Chip 
                                key={idx}
                                label={`${p.name} (Seat ${p.seat_number})`}
                                size="small"
                                variant="outlined"
                                icon={<ConfirmationNumberIcon />}
                                sx={{ bgcolor: 'white' }}
                            />
                        ))}
                    </Box>
                </Box>

                {/* --- ACTIONS --- */}
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2, flexWrap: 'wrap' }}>
                    
                    {/* --- 4. TRACK BUS BUTTON --- */}
                    {showTrackButton && !isCancelled && onTrack && (
                        <Button
                            size="small"
                            variant="outlined" // Using outlined to match Chat
                            color="info"       // Info color to signify information/status
                            startIcon={<GpsFixedIcon />}
                            onClick={onTrack}
                            sx={{ fontWeight: 'bold' }}
                        >
                            Track Bus
                        </Button>
                    )}

                    {showChatButton && !isCancelled && onChat && (
                        <Button
                            size="small"
                            variant="outlined"
                            startIcon={<ChatIcon />}
                            onClick={onChat}
                        >
                            Chat Support
                        </Button>
                    )}

                    {showRateButton && !isCancelled && onRate && (
                        <Button
                            size="small"
                            color="warning" 
                            variant="outlined"
                            startIcon={<StarIcon />}
                            onClick={() => onRate(booking.booking_id)}
                        >
                            Rate Trip
                        </Button>
                    )}

                    {showCancelButton && !isCancelled && onCancel && (
                        <Button 
                            size="small" 
                            color="error" 
                            startIcon={<CancelIcon />}
                            onClick={() => onCancel(booking.booking_id)}
                        >
                            Cancel Booking
                        </Button>
                    )}
                    
                    {!isCancelled && (
                        <Button 
                            size="small" 
                            variant="contained" 
                            startIcon={<DownloadIcon />}
                        >
                            Download Ticket
                        </Button>
                    )}
                </Box>

            </CardContent>
        </Card>
    );
};