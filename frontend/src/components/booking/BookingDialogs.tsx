import React from 'react';
import { 
    Dialog, DialogTitle, DialogContent, DialogContentText, 
    DialogActions, Button, Box, Typography, Rating, TextField, IconButton 
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { ChatWindow } from '../chat/ChatWindow'; // Import your ChatWindow

// --- 1. Cancel Dialog ---
interface CancelDialogProps {
    open: boolean;
    loading: boolean;
    onClose: () => void;
    onConfirm: () => void;
}
export const CancelBookingDialog = ({ open, loading, onClose, onConfirm }: CancelDialogProps) => (
    <Dialog open={open} onClose={onClose}>
        <DialogTitle>Cancel this Booking?</DialogTitle>
        <DialogContent>
            <DialogContentText>
                Are you sure? This action cannot be undone. Refunds processed per policy.
            </DialogContentText>
        </DialogContent>
        <DialogActions>
            <Button onClick={onClose}>No, Keep Ticket</Button>
            <Button onClick={onConfirm} color="error" disabled={loading}>
                {loading ? 'Canceling...' : 'Yes, Cancel Ticket'}
            </Button>
        </DialogActions>
    </Dialog>
);

// --- 2. Rate Dialog ---
interface RateDialogProps {
    open: boolean;
    loading: boolean;
    rating: number | null;
    review: string;
    onClose: () => void;
    onSubmit: () => void;
    setRating: (val: number | null) => void;
    setReview: (val: string) => void;
}
export const RateBookingDialog = ({ 
    open, loading, rating, review, onClose, onSubmit, setRating, setReview 
}: RateDialogProps) => (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
        <DialogTitle>Rate your Journey</DialogTitle>
        <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2, gap: 2 }}>
                <Rating value={rating} onChange={(_, val) => setRating(val)} size="large" />
                <TextField
                    fullWidth multiline rows={3} label="Write a review (Optional)" variant="outlined"
                    value={review} onChange={(e) => setReview(e.target.value)}
                />
            </Box>
        </DialogContent>
        <DialogActions>
            <Button onClick={onClose}>Later</Button>
            <Button onClick={onSubmit} variant="contained" disabled={loading}>
                {loading ? "Submitting..." : "Submit"}
            </Button>
        </DialogActions>
    </Dialog>
);

// --- 3. Chat Modal Wrapper ---
interface ChatDialogProps {
    open: boolean;
    bookingId: number | null;
    onClose: () => void;
}
export const ChatDialog = ({ open, bookingId, onClose }: ChatDialogProps) => (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
            <IconButton onClick={onClose}><CloseIcon /></IconButton>
        </Box>
        <DialogContent sx={{ p: 0, pb: 2 }}>
            {bookingId && <ChatWindow bookingId={bookingId} />}
        </DialogContent>
    </Dialog>
);