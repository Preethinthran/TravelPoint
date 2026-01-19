import {useState, useEffect} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {
    Box, Container, Typography,
    Paper, TextField, Button,
    Grid, MenuItem,Divider, Stack,
    Chip, Checkbox, FormControlLabel
}from '@mui/material';
import {
    Person as PersonIcon,
    Payment as PaymentIcon,
    ContentPaste as ContentPasteIcon
} from '@mui/icons-material';

import {Header} from '../components/common/Header';
import {useUI} from '../context/UIProvider';
import {useAuth} from '../context/AuthProvider';
import { BookingFlowService } from '../services/api/services/BookingFlowService';
import type { BookingRequest } from '../services/api/models/BookingRequest';
import {UserProfileService} from '../services/api/services/UserProfileService';

export const CheckoutPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const {showToast} = useUI();
    const {user} = useAuth();
    const [travellers, setTravellers] = useState([]);
    const [saveNewTravellers, setSaveNewTravellers] = useState(false);

    const {
        tripId, 
        selectedSeats, 
        totalPrice, 
        boardingPointId,    
        droppingPointId,    
        boardingPointName,  
        droppingPointName
    } = location.state || {};

    console.log("Checkout Data Received:", { tripId, selectedSeats, totalPrice, boardingPointId, droppingPointId, boardingPointName, droppingPointName });
    
    if(!tripId || !selectedSeats){
        navigate('/search');
        return null;
    }

    const [passengers, setPassengers] = useState(
        selectedSeats.map((seat: any) => ({
            seat_id: seat.seat_id,
            seat_number: seat.seat_number,
            passenger_name: "",
            passenger_age: "",
            passenger_gender: ""
        }))
    );

    const handlePassengerChange = (index: number, field: string, value:string)=>{
        const updated = [...passengers];
        updated[index]= {...updated[index],[field]:value};
        setPassengers(updated);
    };

    useEffect(() => {
        const fetchTravelers = async () => {
            if (user?.user_id) {
                try {
                    const response = await UserProfileService.getTravellers();
                    const list = (response as any).data || response || [];
                    setTravellers(list);
                } catch (err) {
                    console.error("Failed to load saved travelers", err);
                }
            }
        };
        fetchTravelers();
    }, [user?.user_id]);

    // Add this helper function to fill data when a chip is clicked
    const handleAutoFill = (index: number, traveller: any) => {
        const updated = [...passengers];
        updated[index] = {
            ...updated[index],
            passenger_name: traveller.name,
            passenger_age: String(traveller.age), // Ensure it's a string for the TextField
            passenger_gender: traveller.gender
        };
        setPassengers(updated);
    };

    const handleBooking = async()=>{
        
        for (const p of passengers){
            if(!p.passenger_name || !p.passenger_age || !p.passenger_gender){
                showToast("Missing Details",`Please fill all the details for Seat ${p.seatnumber}`, "warning");
                return;
            }
        }
        if(!user?.user_id){
            showToast("Error", "User not found", "error");
            return;
        }
        try{
            if (saveNewTravellers) {
                await Promise.all(passengers.map((p: any) => {
                    if (p.passenger_name && p.passenger_age) {
                        return UserProfileService.addTraveller({
                            name: p.passenger_name,
                            age: Number(p.passenger_age),
                            gender: p.passenger_gender
                        }).catch(e => console.error("Failed to save traveler", e));
                    }
                    return Promise.resolve();
                }));
            }
            const requestBody: BookingRequest = {
                user_id: user.user_id,
                trip_id: tripId,
                pickup_stop_id : boardingPointId,
                drop_stop_id: droppingPointId,
                passengers: passengers.map((p: any)=>({
                    seat_id: p.seat_id,
                    seat_number: p.seat_number,
                    name: p.passenger_name,
                    age: Number(p.passenger_age),
                    gender: p.passenger_gender
                }))
            };
            console.log("Submitting Booking Request: ",requestBody);

            const response = await BookingFlowService.createBooking(requestBody);
            console.log("Booking Response: ",response);
            if (response.success){
                showToast("Success", "Booking Confirmed Successfully", "success");
                navigate('/search');
            }else{
                showToast("Failed", response.message || "Booking Failed", "error");
            }
        }catch (error: any){
            console.error("Booking Error: ",error);
            const errorMessage = error.body?.message || "An error occurred while booking.";
            showToast("Failed", errorMessage, "error");
        }
    };
    return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', pb: 8 }}>
        <Header />

        <Container maxWidth="md" sx={{ mt: 4 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
                Passenger Details
            </Typography>

            {/* TRIP SUMMARY CARD */}
            <Paper sx={{ p: 3, mb: 3, bgcolor: '#e3f2fd', border: '1px solid #90caf9' }}>
                <Stack direction="row" justifyContent="space-between">
                    <Box>
                        <Typography variant="subtitle2" color="text.secondary">Boarding Point</Typography>
                        <Typography fontWeight="bold">{boardingPointName}</Typography>
                    </Box>
                    <Box textAlign="right">
                        <Typography variant="subtitle2" color="text.secondary">Dropping Point</Typography>
                        <Typography fontWeight="bold">{droppingPointName}</Typography>
                    </Box>
                </Stack>
            </Paper>

            {/* DYNAMIC PASSENGER FORMS */}
            {passengers.map((passenger: any, index: number) => (
                <Paper key={passenger.seat_number} sx={{ p: 3, mb: 2 }}>

                    {/* HEADER: Seat Info & Quick Fill Chips */}
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2} flexWrap="wrap" gap={2}>
                        
                        {/* Left: Seat Info */}
                        <Stack direction="row" alignItems="center" gap={1}>
                            <PersonIcon color="primary" />
                            <Typography variant="h6" fontSize="1rem">
                                Passenger {index + 1} | <span style={{ color: '#1976d2', fontWeight: 'bold' }}>Seat {passenger.seat_number}</span>
                            </Typography>
                        </Stack>

                        {/* Right: Saved Traveler Chips */}
                        {travellers.length > 0 && (
                            <Stack direction="row" gap={1} flexWrap="wrap">
                                <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                                    Quick Fill:
                                </Typography>
                                {travellers.map((t: any) => (
                                    <Chip
                                        key={t.traveler_id || t.id}
                                        label={t.name}
                                        icon={<ContentPasteIcon sx={{ fontSize: '14px !important' }} />}
                                        size="small"
                                        onClick={() => handleAutoFill(index, t)}
                                        clickable
                                        color="info"
                                        variant="outlined"
                                    />
                                ))}
                            </Stack>
                        )}
                    </Stack>

                    {/* INPUT FIELDS (Restored) */}
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Full Name"
                                fullWidth
                                size="small"
                                placeholder="e.g. John Doe"
                                value={passenger.passenger_name}
                                onChange={(e) => handlePassengerChange(index, 'passenger_name', e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <TextField
                                label="Age"
                                type="number"
                                fullWidth
                                size="small"
                                placeholder="Age"
                                value={passenger.passenger_age}
                                onChange={(e) => handlePassengerChange(index, 'passenger_age', e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <TextField
                                select
                                label="Gender"
                                fullWidth
                                size="small"
                                value={passenger.passenger_gender}
                                onChange={(e) => handlePassengerChange(index, 'passenger_gender', e.target.value)}
                            >
                                <MenuItem value="Male">Male</MenuItem>
                                <MenuItem value="Female">Female</MenuItem>
                                <MenuItem value="Other">Other</MenuItem>
                            </TextField>
                        </Grid>
                    </Grid>
                </Paper>
            ))}

            {/* PRICE SUMMARY & PAY BUTTON */}
            <Paper sx={{ p: 3, mt: 4, borderTop: '4px solid #1976d2' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6">Total Amount</Typography>
                    <Typography variant="h4" fontWeight="bold" color="primary">₹ {totalPrice}</Typography>
                </Stack>
                <Divider sx={{ mb: 2 }} />

                {/* THE MISSING CHECKBOX */}
                <Box sx={{ mb: 2 }}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={saveNewTravellers}
                                onChange={(e) => setSaveNewTravellers(e.target.checked)}
                            />
                        }
                        label="Save these travelers to my profile for faster booking next time"
                    />
                </Box>

                <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    startIcon={<PaymentIcon />}
                    onClick={handleBooking}
                    sx={{ height: 50, fontSize: '1.1rem' }}
                >
                    Confirm & Pay
                </Button>
            </Paper>

        </Container>
    </Box>
);
}