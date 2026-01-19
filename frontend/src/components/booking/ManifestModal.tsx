import React from 'react';
import { 
    Box, Typography, Button, Chip, IconButton, 
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Dialog, DialogTitle, DialogContent, DialogActions 
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PeopleIcon from '@mui/icons-material/People';
import PrintIcon from '@mui/icons-material/Print';

interface ManifestModalProps {
    open: boolean;
    onClose: () => void;
    tripDetails: {
        route_name?: string;
        bus_number?: string;
    } | null;
    passengers: any[]; // The list of passenger objects
}

export const ManifestModal: React.FC<ManifestModalProps> = ({ 
    open, onClose, tripDetails, passengers 
}) => {
    
    const handlePrint = () => {
        window.print();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    Passenger List
                    <Typography variant="caption" display="block" color="text.secondary">
                        {tripDetails?.route_name || 'Trip Details'} | {tripDetails?.bus_number || ''}
                    </Typography>
                </Box>
                <IconButton onClick={onClose}><CloseIcon /></IconButton>
            </DialogTitle>
            
            <DialogContent dividers>
                {passengers.length === 0 ? (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                        <Typography color="text.secondary">No passengers found.</Typography>
                    </Box>
                ) : (
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ bgcolor: '#fafafa' }}>
                                    <TableCell><strong>Seat</strong></TableCell>
                                    <TableCell><strong>Passenger Name</strong></TableCell>
                                    <TableCell><strong>Gender</strong></TableCell>
                                    <TableCell><strong>Contact</strong></TableCell>
                                    <TableCell><strong>Boarding</strong></TableCell>
                                    <TableCell><strong>Status</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {passengers.map((pax: any, index: number) => (
                                    <TableRow key={index}>
                                        <TableCell>
                                            <Chip label={pax.seat_number} size="small" color="secondary" />
                                        </TableCell>
                                        <TableCell>{pax.passenger_name}</TableCell>
                                        <TableCell>{pax.gender || '-'}</TableCell>
                                        <TableCell>{pax.contact_number}</TableCell>
                                        <TableCell>{pax.pickup_point}</TableCell>
                                        <TableCell>
                                            <Chip 
                                                label={pax.booking_status || 'Booked'} 
                                                size="small" 
                                                color={pax.booking_status === 'Cancelled' ? 'error' : 'success'} 
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </DialogContent>
            
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
                <Button variant="contained" startIcon={<PrintIcon />} onClick={handlePrint}>
                    Print Manifest
                </Button>
            </DialogActions>
        </Dialog>
    );
};