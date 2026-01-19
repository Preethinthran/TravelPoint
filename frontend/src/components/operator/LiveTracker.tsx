// src/components/operator/LiveTracker.tsx
import React, { useState, useEffect, useRef } from 'react';
import { SocketService } from '../../services/SocketService';
import { Paper, Typography, Button, Box } from '@mui/material';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import GpsOffIcon from '@mui/icons-material/GpsOff';

interface LiveTrackerProps {
    tripId: string; // Changed to string to match URL params usually
}

export const LiveTracker: React.FC<LiveTrackerProps> = ({ tripId }) => {
    const [isTracking, setIsTracking] = useState(false);
    const [status, setStatus] = useState<string>("Ready to start");
    const watchIdRef = useRef<number | null>(null);

    const startTracking = () => {
        const socket = SocketService.getSocket();
        if (!socket) { alert("Socket disconnected"); return; }
        if (!navigator.geolocation) { alert("Geolocation not supported"); return; }

        setIsTracking(true);
        setStatus("Initializing GPS...");

        watchIdRef.current = navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude, heading, speed } = position.coords;
                setStatus(`Broadcasting: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);

                socket.emit('send_location', {
                    tripId,
                    lat: latitude,
                    lng: longitude,
                    heading: heading || 0,
                    speed: (speed || 0) * 3.6 
                });
            },
            (error) => {
                setStatus("GPS Error: " + error.message);
                setIsTracking(false);
            },
            { enableHighAccuracy: false, timeout: 30000, maximumAge: 0 }
        );
    };

    const stopTracking = () => {
        if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }
        setIsTracking(false);
        setStatus("Tracking Stopped");
    };

    useEffect(() => {
        return () => {
            if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
        };
    }, []);

    return (
        <Paper elevation={3} sx={{ p: 3, maxWidth: 400, mx: 'auto', textAlign: 'center', mt: 4 }}>
            <Typography variant="h6" gutterBottom>Trip #{tripId} Live Control</Typography>
            
            <Box sx={{ mb: 2, p: 1, bgcolor: isTracking ? 'success.light' : 'grey.200', borderRadius: 1 }}>
                <Typography variant="body2" color={isTracking ? 'success.contrastText' : 'text.secondary'}>
                    {status}
                </Typography>
            </Box>

            {!isTracking ? (
                <Button 
                    variant="contained" 
                    color="primary" 
                    fullWidth 
                    startIcon={<GpsFixedIcon />}
                    onClick={startTracking}
                >
                    Start Broadcasting
                </Button>
            ) : (
                <Button 
                    variant="contained" 
                    color="error" 
                    fullWidth 
                    startIcon={<GpsOffIcon />}
                    onClick={stopTracking}
                >
                    Stop Broadcasting
                </Button>
            )}
        </Paper>
    );
};