import { useEffect, useState } from 'react';
import { 
  Box, Container, Typography, Grid, CircularProgress, Stack, Button, Paper, 
  Radio, RadioGroup, FormControlLabel, FormControl, Divider, IconButton, Chip
} from '@mui/material';
import SteeringIcon from '@mui/icons-material/SportsEsports';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { useUI } from '../context/UIProvider';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

import { PublicSearchService } from '../services/api/services/PublicSearchService';
import { Header } from '../components/common/Header';
import { SeatIcon } from '../components/booking/SeatIcon';
import type { SeatLayoutPassenger } from '../services/api/models/SeatLayoutPassenger';

// Interfaces
interface SelectedSeat {
  seat_id: number;
  seat_number: string;
  seat_type: string;
  price: number;
  status: string;
}

export const SeatSelectionPage = () => {
  const { tripId } = useParams();
  const { showToast } = useUI();
  const navigate = useNavigate();
  const location = useLocation();

  // --- Loading States ---
  const [initialLoading, setInitialLoading] = useState(true); // For first load
  const [updatingLayout, setUpdatingLayout] = useState(false); // For point changes

  const busDetails = location.state?.bus; 

  // --- Data States ---
  const [lowerDeck, setLowerDeck] = useState<SeatLayoutPassenger[]>([]);
  const [upperDeck, setUpperDeck] = useState<SeatLayoutPassenger[]>([]);
  
  const [boardingPoints, setBoardingPoints] = useState<any[]>([]);
  const [droppingPoints, setDroppingPoints] = useState<any[]>([]);
  
  // --- Selection States ---
  const [selectedBoardingId, setSelectedBoardingId] = useState<number | ''>('');
  const [selectedDroppingId, setSelectedDroppingId] = useState<number | ''>('');
  const [selectedSeats, setSelectedSeats] = useState<SelectedSeat[]>([]);
  
  // Calculated dynamically from selected seats
  const totalPrice = selectedSeats.reduce((sum, s) => sum + s.price, 0);

  // 1. Initial Load (Get Points & Default Layout)
  useEffect(() => {
    if (!tripId) return;

    const fetchInitialData = async () => {
      try {
        setInitialLoading(true);
        const id = Number(tripId);
        // Call API without points first to get the list
        const response = await PublicSearchService.getTripLayout(id);
        const layoutData = (response as any).data || response;

        if (layoutData) {
          // Set Points
          if (layoutData.boarding_points?.length > 0) {
             setBoardingPoints(layoutData.boarding_points);
             // Default to first option
             setSelectedBoardingId(layoutData.boarding_points[0].stop_id);
          }
          if (layoutData.dropping_points?.length > 0) {
             setDroppingPoints(layoutData.dropping_points);
             // Default to last option (common logic) or first
             setSelectedDroppingId(layoutData.dropping_points[layoutData.dropping_points.length - 1].stop_id);
          }
          
          // Set Seats (Initial View)
          processSeats(layoutData.seats);
        }
      } catch (err) {
        console.error("Initial Layout Error:", err);
        showToast("Error", "Failed to load bus layout", "error");
      } finally {
        setInitialLoading(false);
      }
    };

    fetchInitialData();
  }, [tripId]);

  // 2. Re-Fetch Layout when Points Change (To get Dynamic Prices)
  useEffect(() => {
    // Only fetch if we have both points and the initial load is done
    if (!tripId || !selectedBoardingId || !selectedDroppingId || initialLoading) return;

    const updateSeatPrices = async () => {
      try {
        setUpdatingLayout(true);
        
        // Pass IDs to API to get calculated fare
        const response = await PublicSearchService.getTripLayout(
            Number(tripId), 
            Number(selectedBoardingId), 
            Number(selectedDroppingId)
        );
        const layoutData = (response as any).data || response;

        if (layoutData && layoutData.seats) {
            processSeats(layoutData.seats);
        }
        
        // IMPORTANT: Clear selected seats because price or availability might have changed
        setSelectedSeats([]);

      } catch (err) {
        console.error("Price Update Error:", err);
        showToast("Error", "Failed to update seat prices", "error");
      } finally {
        setUpdatingLayout(false);
      }
    };

    updateSeatPrices();
  }, [selectedBoardingId, selectedDroppingId]);


  // Helper to split decks
  const processSeats = (seats: SeatLayoutPassenger[]) => {
      if (!seats) return;
      setUpperDeck(seats.filter((s) => s.seat_type?.toLowerCase().includes('upper')));
      setLowerDeck(seats.filter((s) => !s.seat_type?.toLowerCase().includes('upper')));
  };

  // 3. Handle Seat Click
  const handleSeatClick = (seat: SeatLayoutPassenger) => {
    if (!seat.seat_number || seat.status === 'BOOKED') return;
    
    // Safety check: Ensure points are selected
    if(!selectedBoardingId || !selectedDroppingId) {
        return showToast("Select Points", "Please select Boarding & Dropping points first.", "warning");
    }

    const price = Number(seat.price) || 0;
    const isSelected = selectedSeats.some(s => s.seat_number === seat.seat_number);

    if (isSelected) {
      setSelectedSeats(prev => prev.filter(s => s.seat_number !== seat.seat_number));
    } else {
      if (selectedSeats.length >= 6) {
        return showToast("Limit Reached", "Max 6 seats allowed", "warning");
      }
      setSelectedSeats(prev => [...prev, {
          seat_id: Number(seat.seat_id), 
          seat_number: seat.seat_number!, 
          seat_type: seat.seat_type!,
          price: price, // Use the dynamic price from API
          status: 'SELECTED'
      }]);
    }
  };

  // 4. Handle Proceed
  const handleProceed = () => {
    if (!selectedBoardingId || !selectedDroppingId) {
        return showToast("Selection Missing", "Please select Boarding & Dropping points.", "warning");
    }
    if (selectedSeats.length === 0) {
       return showToast("Selection Missing", "Please select at least one seat.", "warning");
    }

    // Find Names for Display
    const boardObj = boardingPoints.find(b => Number(b.stop_id) === Number(selectedBoardingId));
    const dropObj = droppingPoints.find(d => Number(d.stop_id) === Number(selectedDroppingId));
    
    navigate('/checkout', { 
        state: { 
          tripId: Number(tripId), 
          selectedSeats,
          totalPrice, 
          boardingPointId: selectedBoardingId, 
          droppingPointId: selectedDroppingId,
          boardingPointName: boardObj?.stop_name,
          droppingPointName: dropObj?.stop_name
        } 
    });
  };

  // 5. Render Helper (Vertical Bus)
  const renderVerticalDeck = (title: string, seats: SeatLayoutPassenger[], isLower: boolean) => (
    <Box sx={{ 
        p: 2, bgcolor: '#fff', border: '1px solid #e0e0e0', borderRadius: 3, 
        width: '200px', minHeight: '450px', position: 'relative',
        transition: 'opacity 0.2s',
        opacity: updatingLayout ? 0.5 : 1, // Visual cue that data is updating
        pointerEvents: updatingLayout ? 'none' : 'auto' 
    }}>
      {/* Deck Loading Overlay */}
      {updatingLayout && (
          <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 10 }}>
              <CircularProgress size={30} />
          </Box>
      )}

      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
         <Typography variant="subtitle1" fontWeight="bold" color="text.secondary">{title}</Typography>
         {isLower && <SteeringIcon sx={{ color: '#bdbdbd', fontSize: 30 }} />}
      </Stack>
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, justifyContent: 'center' }}>
         {seats.map((seat) => {
            const isSelected = selectedSeats.some(s => s.seat_number === seat.seat_number);
            return <SeatIcon 
                key={seat.seat_id}
                seatNumber={seat.seat_number || ''}
                price={Number(seat.price)}
                status={seat.status === 'BOOKED' ? 'BOOKED' : isSelected ? 'SELECTED' : 'AVAILABLE'} 
                type={seat.seat_type?.toLowerCase().includes('sleeper') ? 'sleeper' : 'seater'} 
                onClick={() => handleSeatClick(seat)}
             />
         })}
      </Box>
    </Box>
  );

  if (initialLoading) return (
     <Box sx={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress />
     </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', pb: 8 }}>
      <Header />
      
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        
        {/* Top Header Row */}
        <Stack direction="row" alignItems="center" mb={3} gap={2}>
            <IconButton onClick={() => navigate(-1)}><ArrowBackIcon /></IconButton>
            <Box>
                <Typography variant="h5" fontWeight="bold">Select Seats</Typography>
                {busDetails && (
                    <Typography variant="body2" color="text.secondary">
                        {busDetails.bus_name} | {busDetails.bus_type}
                    </Typography>
                )}
            </Box>
        </Stack>

        <Grid container spacing={3}>
            {/* LEFT: SEAT LAYOUT */}
            <Grid item xs={12} md={8}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={4} justifyContent="center" alignItems="flex-start">
                    {renderVerticalDeck("Lower Deck", lowerDeck, true)}
                    {upperDeck.length > 0 && renderVerticalDeck("Upper Deck", upperDeck, false)}
                </Stack>
                
                {/* Legend */}
                <Stack direction="row" gap={3} justifyContent="center" mt={4}>
                    <LegendItem color="#fff" borderColor="#bdbdbd" label="Available" />
                    <LegendItem color="#e0e0e0" borderColor="#bdbdbd" label="Booked" />
                    <LegendItem color="#fff" borderColor="#ec407a" label="Selected" />
                </Stack>
            </Grid>

            {/* RIGHT: SIDEBAR */}
            <Grid item xs={12} md={4}>
                <Paper elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2, overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ p: 2, bgcolor: '#e3f2fd', borderBottom: '1px solid #bbdefb' }}>
                        <Typography variant="h6" fontWeight="bold">Trip Details</Typography>
                    </Box>
                    
                    <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
                        {/* Boarding Points */}
                        <Box sx={{ p: 2 }}>
                            <Stack direction="row" gap={1} mb={1}>
                                <MyLocationIcon color="primary" fontSize="small"/>
                                <Typography variant="subtitle2" fontWeight="bold">Boarding Points</Typography>
                            </Stack>
                            <FormControl component="fieldset">
                                <RadioGroup value={selectedBoardingId} onChange={(e) => setSelectedBoardingId(Number(e.target.value))}>
                                    {boardingPoints.map((bp) => (
                                        <FormControlLabel 
                                            key={bp.stop_id} value={bp.stop_id} control={<Radio size="small" />} 
                                            label={<Typography variant="body2">{bp.time} - {bp.stop_name}</Typography>} 
                                        />
                                    ))}
                                </RadioGroup>
                            </FormControl>
                        </Box>
                        <Divider />
                        {/* Dropping Points */}
                        <Box sx={{ p: 2 }}>
                            <Stack direction="row" gap={1} mb={1}>
                                <LocationOnIcon color="error" fontSize="small"/>
                                <Typography variant="subtitle2" fontWeight="bold">Dropping Points</Typography>
                            </Stack>
                            <FormControl component="fieldset">
                                <RadioGroup value={selectedDroppingId} onChange={(e) => setSelectedDroppingId(Number(e.target.value))}>
                                    {droppingPoints.map((dp) => (
                                        <FormControlLabel 
                                            key={dp.stop_id} value={dp.stop_id} control={<Radio size="small" />} 
                                            label={<Typography variant="body2">{dp.time} - {dp.stop_name}</Typography>} 
                                        />
                                    ))}
                                </RadioGroup>
                            </FormControl>
                        </Box>
                    </Box>

                    {/* Sticky Footer inside Sidebar */}
                    <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderTop: '1px solid #e0e0e0' }}>
                        <Stack direction="row" justifyContent="space-between" mb={1}>
                            <Typography variant="body2" color="text.secondary">Selected Seats</Typography>
                            <Box sx={{ textAlign: 'right' }}>
                                {selectedSeats.length > 0 ? (
                                    selectedSeats.map(s => (
                                        <Chip key={s.seat_number} label={s.seat_number} size="small" sx={{ ml: 0.5, mb: 0.5 }} />
                                    ))
                                ) : "-"}
                            </Box>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between" mb={2}>
                            <Typography variant="body2" color="text.secondary">Total Amount</Typography>
                            <Typography variant="h5" fontWeight="bold" color="primary">₹ {totalPrice}</Typography>
                        </Stack>
                        
                        <Button 
                            variant="contained" fullWidth size="large" 
                            startIcon={<DirectionsBusIcon />}
                            onClick={handleProceed}
                            disabled={selectedSeats.length === 0 || updatingLayout}
                        >
                            {updatingLayout ? "Updating Prices..." : "Proceed to Book"}
                        </Button>
                    </Box>
                </Paper>
            </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

const LegendItem = ({ color, borderColor, label }: any) => (
  <Stack direction="row" alignItems="center" gap={1}>
    <Box sx={{ width: 18, height: 18, bgcolor: color, border: `1px solid ${borderColor}`, borderRadius: 0.5 }} />
    <Typography variant="caption">{label}</Typography>
  </Stack>
);