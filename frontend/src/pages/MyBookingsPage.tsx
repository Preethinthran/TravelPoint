import React, { useState, useEffect, useCallback } from 'react';
import { Box, Container, Typography, Paper, Grid, Tab, Tabs, CircularProgress, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';

import { useUI } from '../context/UIProvider';
import { useAuth } from '../context/AuthProvider';
import { BookingFlowService } from '../services/api/services/BookingFlowService';
import { UserService } from '../services/api/services/UserService';
import { Header } from '../components/common/Header';
import { BookingTicket } from '../components/booking/BookingTicket';
import { CancelBookingDialog, RateBookingDialog, ChatDialog } from '../components/booking/BookingDialogs';
// 1. IMPORT THE NEW DIALOG
import { TrackingDialog } from '../components/booking/TrackingDialog';

export const MyBookingsPage = () => {
    const { showToast } = useUI();
    const { user } = useAuth();
    const navigate = useNavigate();
    
    // --- State ---
    const [loading, setLoading] = useState(false);
    const [allBookings, setAllBookings] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState(0);

    // Modal States
    const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
    // 2. NEW STATE FOR TRIP ID
    const [selectedTripId, setSelectedTripId] = useState<number | null>(null); 
    
    // 3. ADD 'track' TO MODALS
    const [modals, setModals] = useState({ cancel: false, rate: false, chat: false, track: false });
    const [actionLoading, setActionLoading] = useState(false);

    // Rating Form Data
    const [ratingData, setRatingData] = useState({ stars: 0 as number | null, review: '' });

    // --- Helpers to manage modals ---
    const closeModals = () => {
        setModals({ cancel: false, rate: false, chat: false, track: false });
        setTimeout(() => {
            setSelectedBookingId(null);
            setSelectedTripId(null);
        }, 150);
        setRatingData({ stars: 0, review: '' });
    };

    // 4. UPDATE OPEN MODAL TO HANDLE TRIP ID
    const openModal = (type: 'cancel' | 'rate' | 'chat' | 'track', bookingId: number, tripId?: number) => {
        setSelectedBookingId(bookingId);
        if (tripId) setSelectedTripId(tripId); // Store trip ID for tracking
        setModals(prev => ({ ...prev, [type]: true }));
    };

    // --- Data Fetching ---
    const fetchBookings = useCallback(async () => {
        if (!user?.user_id) return navigate('/login');
        setLoading(true);
        try {
            const res = await BookingFlowService.getUserBookings(Number(user.user_id));

            console.log("Api response", res.data);
            
            const sorted = (res.data || []).sort((a: any, b: any) => 
                new Date(b.trip_date).getTime() - new Date(a.trip_date).getTime()
            );
            setAllBookings(sorted);
        } catch (err) {
            console.error(err);
            showToast("Error", "Failed to load bookings", "error");
        } finally {
            setLoading(false);
        }
    }, [user, navigate, showToast]);

    useEffect(() => { fetchBookings(); }, [fetchBookings]);

    // --- Handlers ---
    const handleConfirmCancel = async () => {
        if (!selectedBookingId) return;
        try {
            setActionLoading(true);
            await BookingFlowService.patchBookingsCancel(selectedBookingId);
            showToast("Success", "Booking cancelled", "success");
            fetchBookings();
            closeModals();
        } catch (error: any) {
            showToast("Error", error.body?.message || "Failed to cancel", "error");
        } finally {
            setActionLoading(false);
        }
    };

    const handleSubmitRating = async () => {
        if (!selectedBookingId || !ratingData.stars) return showToast("Required", "Rate at least 1 star", "warning");
        try {
            setActionLoading(true);
            await UserService.postBookingsRate(selectedBookingId, {
                stars: ratingData.stars, review_text: ratingData.review
            });
            showToast("Success", "Rating submitted", "success");
            closeModals();
        } catch (error: any) {
            showToast("Error", error.status === 409 ? "Already rated" : "Failed to rate", "error");
            closeModals();
        } finally {
            setActionLoading(false);
        }
    };

    const getFilteredBookings = () => {
        return allBookings.filter((b) => {
            const isCancelled = b.booking_status?.toLowerCase() === 'cancelled';
            const isCompleted = ['completed', 'cancelled'].includes(b.trip_status?.toLowerCase());
            return activeTab === 0 ? (!isCancelled && !isCompleted) : (isCancelled || isCompleted);
        });
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', pb: 8 }}>
            <Header />
            <Container maxWidth="md" sx={{ mt: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <IconButton onClick={() => navigate('/search')} sx={{ mr: 2 }}><ArrowBackIcon /></IconButton>
                    <Typography variant="h4" fontWeight="bold" color="primary">My Journeys</Typography>
                </Box>

                <Paper sx={{ mb: 3 }}>
                    <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} variant="fullWidth">
                        <Tab label="Upcoming Trips" />
                        <Tab label="Booking History" />
                    </Tabs>
                </Paper>

                {loading ? <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box> : (
                    <Grid container spacing={3}>
                        {getFilteredBookings().length === 0 && (
                            <Box width="100%" textAlign="center" py={5}>
                                <Typography variant='h6' color='text.secondary'>No trips found.</Typography>
                            </Box>
                        )}
                        {getFilteredBookings().map((booking) => (
                            <Grid item xs={12} key={booking.booking_id}>
                                <BookingTicket 
                                    booking={booking} 
                                    showCancelButton={activeTab === 0}
                                    showRateButton={activeTab === 1 && booking.booking_status === 'Confirmed'}
                                    showChatButton={activeTab === 0 && booking.booking_status === 'Confirmed'} 
                                    // 5. ENABLE TRACK BUTTON FOR UPCOMING TRIPS
                                    showTrackButton={activeTab === 0 && booking.booking_status === 'Confirmed'} 

                                    onCancel={() => openModal('cancel', booking.booking_id)}
                                    onRate={() => openModal('rate', booking.booking_id)}
                                    onChat={() => openModal('chat', booking.booking_id)}
                                    
                                    // 6. PASS THE TRIP ID HERE
                                    onTrack={() => openModal('track', booking.booking_id, booking.trip_id)}
                                />
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Container>

            {/* --- Modals --- */}
            <CancelBookingDialog 
                open={modals.cancel} loading={actionLoading} 
                onClose={closeModals} onConfirm={handleConfirmCancel} 
            />
            <RateBookingDialog 
                open={modals.rate} loading={actionLoading} 
                rating={ratingData.stars} review={ratingData.review}
                onClose={closeModals} onSubmit={handleSubmitRating}
                setRating={(val) => setRatingData(p => ({...p, stars: val}))}
                setReview={(val) => setRatingData(p => ({...p, review: val}))}
            />
            <ChatDialog 
                open={modals.chat} bookingId={selectedBookingId} 
                onClose={closeModals} 
            />
            
            {/* 7. ADD THE TRACKING DIALOG HERE */}
            <TrackingDialog 
                open={modals.track}
                tripId={selectedTripId}
                onClose={closeModals}
            />
        </Box>
    );
};