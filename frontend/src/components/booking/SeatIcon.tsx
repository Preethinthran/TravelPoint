import React from 'react';
import { Box, Typography, Stack } from '@mui/material';

interface SeatIconProps {
  seatNumber: string;
  price: number; // Added price prop
  type: 'seater' | 'sleeper';  
  status: 'AVAILABLE' | 'BOOKED' | 'SELECTED'; 
  onClick?: () => void;
}

export const SeatIcon: React.FC<SeatIconProps> = ({ seatNumber, price, type, status, onClick }) => {
  
  // Color Logic (Simple & Clean)
  const getColors = () => {
    switch (status) {
      case 'BOOKED':
        return { bg: '#e0e0e0', border: '#bdbdbd', text: '#9e9e9e', cursor: 'not-allowed' };
      case 'SELECTED':
        return { bg: '#fff', border: '#ec407a', fill: '#ec407a', text: '#ec407a', cursor: 'pointer' }; // Pink Border/Text
      default:
        return { bg: '#fff', border: '#bdbdbd', text: '#757575', cursor: 'pointer' };
    }
  };

  const colors = getColors();
  const isSleeper = type === 'sleeper';
  // Sleepers are taller (vertical orientation)
  const width = isSleeper ? 35 : 35;
  const height = isSleeper ? 80 : 35; 

  return (
    <Stack alignItems="center" spacing={0.5}>
      {/* The Seat Shape */}
      <Box
        onClick={() => status !== 'BOOKED' && onClick?.()}
        sx={{
          width: width, 
          height: height,
          bgcolor: status === 'SELECTED' ? '#fce4ec' : colors.bg, // Light pink fill if selected
          border: `1px solid ${colors.border}`,
          borderRadius: isSleeper ? 1 : 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: colors.cursor,
          position: 'relative',
          transition: 'all 0.2s',
          boxShadow: status === 'SELECTED' ? '0 0 0 1px #ec407a' : 'none',
          '&:hover': {
             borderColor: status === 'AVAILABLE' ? 'primary.main' : colors.border
          }
        }}
      >
        {/* Simple Pillow for Sleeper */}
        {isSleeper && (
          <Box sx={{ position: 'absolute', top: 4, width: '70%', height: 4, bgcolor: '#e0e0e0', borderRadius: 1 }} />
        )}
        
        {/* Only Seat Number inside */}
        <Typography variant="caption" sx={{ color: colors.text, fontWeight: 'bold', fontSize: '0.7rem' }}>
            {seatNumber}
        </Typography>
      </Box>

      {/* Price Label Below Seat */}
      <Typography variant="caption" sx={{ fontSize: '0.65rem', color: '#666', fontWeight: 'medium' }}>
        ₹{price}
      </Typography>
    </Stack>
  );
};