import React from 'react';
import { Paper, Typography, Box, Button, Chip, Divider, Stack } from '@mui/material';
import Grid from '@mui/material/Grid2';
import StarIcon from '@mui/icons-material/Star';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

import type { BusSearchResult } from '../../services/api/models/BusSearchResult';

interface BusCardProps {
  bus: BusSearchResult;
}

export const BusCard = ({ bus }: BusCardProps) => {
  const navigate = useNavigate();

  // Helper to split "30th Dec 2025, 11:30 AM"
  const formatDateTimeDisplay = (fullString?: string) => {
    if (!fullString) return { date: '--', time: '--:--' };
    const parts = fullString.split(', '); 
    return parts.length === 2 ? { date: parts[0], time: parts[1] } : { date: '', time: fullString };
  };

  const departure = formatDateTimeDisplay(bus.departure_time);
  const arrival = formatDateTimeDisplay(bus.arrival_time);
  const isNextDay = departure.date !== arrival.date;

  const handleViewSeats = () => {
    // Navigate to the new page, passing the 'bus' object so we can show details there too
    navigate(`/book/${bus.trip_id}`, { state: { bus } }); 
  };

  return (
    <Paper 
      elevation={0} 
      sx={{ p: 2, mb: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider', transition: '0.3s', '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderColor: 'primary.main' } }}
    >
      <Grid container spacing={2} alignItems="center">
        {/* COLUMN 1: Bus Info */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Stack direction="row" alignItems="center" gap={1} mb={0.5}>
            <DirectionsBusIcon color="primary" />
            <Typography variant="h6" fontWeight="bold">{bus.bus_name}</Typography>
          </Stack>
          <Stack direction="row" gap={1} flexWrap="wrap">
            <Typography variant="body2" color="text.secondary">{bus.bus_type}</Typography>
            {bus.bus_type?.includes('AC') && !bus.bus_type?.includes('Non-AC') && (
              <Chip icon={<AcUnitIcon fontSize="small"/>} label="AC" size="small" color="info" variant="outlined" />
            )}
          </Stack>
           <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
            <Chip icon={<StarIcon sx={{ fontSize: '1rem !important' }} />} label={bus.rating || "New"} size="small" color="success" sx={{ fontWeight: 'bold' }} />
            <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>(Ratings)</Typography>
          </Box>
        </Grid>

        {/* COLUMN 2: Schedule */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
            <Box textAlign="center">
              <Typography variant="h5" fontWeight="bold">{departure.time}</Typography>
              <Typography variant="caption" display="block" color="text.primary" fontWeight="bold">{departure.date}</Typography>
              <Typography variant="caption" color="text.secondary">Pickup</Typography>
            </Box>
            <Box sx={{ flexGrow: 1, textAlign: 'center', px: 2 }}>
              <Typography variant="caption" color="text.secondary">6h 30m</Typography>
              <Divider sx={{ my: 0.5, borderColor: 'divider' }}><Chip label="TO" size="small" sx={{ height: 20, fontSize: '0.6rem' }} /></Divider>
              <Typography variant="caption" color="primary.main">{bus.distance} km</Typography>
            </Box>
            <Box textAlign="center">
              <Typography variant="h5" fontWeight="bold">{arrival.time}</Typography>
              <Typography variant="caption" display="block" fontWeight="bold" color={isNextDay ? "error.main" : "text.primary"}>{arrival.date}</Typography>
              <Typography variant="caption" color="text.secondary">Drop</Typography>
            </Box>
          </Stack>
        </Grid>

        {/* COLUMN 3: Price & Action */}
        <Grid size={{ xs: 12, md: 3 }} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
          <Typography variant="h5" fontWeight="bold" color="primary.main">₹{bus.price}</Typography>
          <Typography variant="caption" color="text.secondary" display="block" gutterBottom>{bus.available_seats} Seats Left</Typography>
          
          {/* SIMPLIFIED BUTTON: Just navigates */}
          <Button variant="contained" disableElevation fullWidth onClick={handleViewSeats} sx={{ mt: 1 }}>
            Select Seats
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};