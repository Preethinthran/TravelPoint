import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box } from '@mui/material';

interface EditStopDialogProps {
    open: boolean;
    handleClose: () => void;
    initialData: any;
    onSave: (data: any) => void;
}

export const EditStopDialog: React.FC<EditStopDialogProps> = ({ open, handleClose, initialData, onSave }) => {
    const [stopName, setStopName] = useState('');
    const [distance, setDistance] = useState('');
    const [price, setPrice] = useState('');
    const [estTime, setEstTime] = useState('');
    const [stopType, setStopType] = useState('Both');

    useEffect(() => {
        if (open) {
            setStopName(initialData?.label || '');
            setDistance(initialData?.distance || '');
            setPrice(initialData?.price || '');
            setEstTime(initialData?.estimated_time || '');
            setStopType(initialData?.stop_type || 'Both');
        }
    }, [open, initialData]);

    const handleSave = () => {
        onSave({ label: stopName, distance, price, estimated_time: estTime, stop_type: stopType });
        handleClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
             <DialogTitle>Edit Stop Details</DialogTitle>
             <DialogContent>
                <TextField autoFocus margin="dense" label="Stop Name" fullWidth value={stopName} onChange={(e) => setStopName(e.target.value)} sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <TextField label="Distance (km)" type="number" fullWidth size="small" value={distance} onChange={(e) => setDistance(e.target.value)} />
                    <TextField label="Price (₹)" type="number" fullWidth size="small" value={price} onChange={(e) => setPrice(e.target.value)} />
                </Box>
                <TextField margin="dense" label="Est. Time" fullWidth size="small" value={estTime} onChange={(e) => setEstTime(e.target.value)} sx={{ mb: 2 }} />
                <TextField select label="Stop Type" fullWidth value={stopType} onChange={(e) => setStopType(e.target.value)} SelectProps={{ native: true }}>
                    <option value="Both">Both</option><option value="Boarding">Boarding</option><option value="Dropping">Dropping</option>
                </TextField>
             </DialogContent>
             <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button onClick={handleSave} variant="contained">Update Node</Button>
             </DialogActions>
        </Dialog>
    );
};