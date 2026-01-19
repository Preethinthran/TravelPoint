import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Box, Typography, Button, Chip, Divider, 
    Card, CardContent, CardActions 
} from '@mui/material';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import GroupsIcon from '@mui/icons-material/Groups';
import EditIcon from '@mui/icons-material/Edit';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

// --- FIX: Add the missing fields (bus_id, arrival_time) to match MyTripsPage ---
interface Trip {
    trip_id: number;
    bus_id: number;          // <--- Added this
    bus_number: string;
    route_name: string;
    departure_time: string;
    arrival_time: string;    // <--- Added this
    trip_status: string;
}

interface TripCardProps {
    trip: Trip;
    isTrackingThisTrip: boolean;
    isTrackingAnyTrip: boolean;
    updating: boolean;
    onViewManifest: (trip: Trip) => void;
    onOpenStatusMenu: (event: React.MouseEvent<HTMLButtonElement>, tripId: number) => void;
    onStartTracking: (tripId: number) => void;
    onStopTracking: () => void;
}

export const TripCard = ({ 
    trip, isTrackingThisTrip, isTrackingAnyTrip, updating,
    onViewManifest, onOpenStatusMenu, onStartTracking, onStopTracking 
}: TripCardProps) => {

    const navigate = useNavigate();

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'scheduled': return 'primary';
            case 'live': return 'success';
            case 'completed': return 'default';
            case 'cancelled': return 'error';
            default: return 'default';
        }
    };

    return (
        <Card elevation={3} sx={{ borderRadius: 2 }}>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6" fontWeight="bold">
                        {trip.route_name || "Unknown Route"}
                    </Typography>
                    <Chip 
                        label={trip.trip_status} 
                        color={getStatusColor(trip.trip_status) as any} 
                        size="small" 
                    />
                </Box>
                
                <Divider sx={{ mb: 2 }} />

                <Box sx={{ display: 'flex', gap: 3, mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                        <DirectionsBusIcon fontSize="small" />
                        <Typography variant="body2">{trip.bus_number}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                        <AccessTimeIcon fontSize="small" />
                        <Typography variant="body2">
                            {dayjs(trip.departure_time).utc().format('DD/MM/YYYY, h:mm A')}
                        </Typography>
                    </Box>
                </Box>
            </CardContent>

            <CardActions sx={{ px: 2, pb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                <Button 
                    size="small" 
                    variant="outlined" 
                    startIcon={<GroupsIcon />}
                    onClick={() => onViewManifest(trip)}
                >
                    Manifest
                </Button>
                <Button 
                variant="contained" 
                onClick={() => navigate(`/operator/track/${trip.trip_id}`)}
                >
                Start Trip
                </Button>

                <Button 
                    size="small" 
                    variant="contained"
                    color="secondary"
                    startIcon={<EditIcon />}
                    onClick={(e) => onOpenStatusMenu(e, trip.trip_id)}
                    disabled={updating}
                >
                    Update Status
                </Button>
                
                <Box sx={{ flexGrow: 1 }} />

                {/* TRACKING BUTTON LOGIC */}
                {trip.trip_status === 'Live' && (
                    isTrackingThisTrip ? (
                        <Button
                            size="small"
                            variant="contained"
                            color="error"
                            startIcon={<StopCircleIcon />}
                            onClick={onStopTracking}
                            sx={{ animation: 'pulse 1.5s infinite' }}
                        >
                            Stop Tracking
                        </Button>
                    ) : (
                        <Button
                            size="small"
                            variant="contained"
                            color="success"
                            startIcon={<LocationOnIcon />}
                            onClick={() => onStartTracking(trip.trip_id)}
                            disabled={isTrackingAnyTrip} 
                        >
                            Start Tracking
                        </Button>
                    )
                )}
            </CardActions>
        </Card>
    );
};