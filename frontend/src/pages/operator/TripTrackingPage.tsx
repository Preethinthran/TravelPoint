import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { LiveTracker } from '../../components/operator/LiveTracker'; // Import component from Step 1
import { Header } from '../../components/common/Header';

export const TripTrackingPage = () => {
    const { tripId } = useParams(); // Get ID from URL (e.g., /operator/track/123)
    const navigate = useNavigate();

    if (!tripId) return <div>Error: No Trip ID found</div>;

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
            <Header />
            <Box sx={{ p: 4 }}>
                <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/operator/trips')}>
                    Back to Trips
                </Button>
                
                {/* Embed the Tracker Component here */}
                <LiveTracker tripId={tripId} />
            </Box>
        </Box>
    );
};