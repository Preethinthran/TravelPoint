import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Typography } from '@mui/material';

interface EditEdgeDialogProps {
    open: boolean;
    handleClose: () => void;
    initialLabel: string;
    onSave: (newLabel: string) => void;
}

export const EditEdgeDialog: React.FC<EditEdgeDialogProps> = ({ open, handleClose, initialLabel, onSave }) => {
    const [label, setLabel] = useState('');

    useEffect(() => {
        if (open) {
            setLabel(initialLabel);
        }
    }, [open, initialLabel]);

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
            <DialogTitle>Edit Distance</DialogTitle>
            <DialogContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Enter the distance for this segment.
                </Typography>
                <TextField 
                    autoFocus 
                    margin="dense" 
                    label="Distance (e.g., 140 km)" 
                    fullWidth 
                    value={label} 
                    onChange={(e) => setLabel(e.target.value)} 
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button onClick={() => onSave(label)} variant="contained">Save Distance</Button>
            </DialogActions>
        </Dialog>
    );
};