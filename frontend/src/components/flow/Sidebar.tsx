import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';

export const Sidebar = () => {
  // This function runs when you start dragging the "Bus Stop" box
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <Paper sx={{ width: '250px', p: 2, mr: 2, borderRight: '1px solid #ddd' }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Toolbox
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Drag these nodes to the canvas.
      </Typography>

      {/* DRAGGABLE ITEM */}
      <Paper
        elevation={1}
        onDragStart={(event) => onDragStart(event, 'busStop')}
        draggable
        sx={{
          p: 2,
          mb: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          cursor: 'grab',
          border: '1px solid #1976d2',
          bgcolor: '#e3f2fd',
          '&:hover': { bgcolor: '#bbdefb' }
        }}
      >
        <DirectionsBusIcon color="primary" />
        <Typography variant="subtitle2">Bus Stop</Typography>
      </Paper>
    </Paper>
  );
};