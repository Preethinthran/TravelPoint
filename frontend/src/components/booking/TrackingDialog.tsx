import React from 'react';
import { Dialog, DialogContent, DialogTitle, IconButton, Box, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import BusMap from '../tracking/BusMap'; // Adjust path to where you saved BusMap.tsx

interface TrackingDialogProps {
    open: boolean;
    tripId: number | null;
    onClose: () => void;
}

export const TrackingDialog: React.FC<TrackingDialogProps> = ({ open, tripId, onClose }) => {
    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h6">Live Bus Tracking</Typography>
                    <Typography variant="caption" color="text.secondary">
                        Trip ID: #{tripId}
                    </Typography>
                </Box>
                <IconButton onClick={onClose}><CloseIcon /></IconButton>
            </DialogTitle>
            
            <DialogContent dividers sx={{ p: 0, height: '500px' }}>
                {tripId ? (
                    <BusMap tripId={tripId} />
                ) : (
                    <Box p={4} textAlign="center">No Trip ID provided</Box>
                )}
            </DialogContent>
        </Dialog>
    );
};