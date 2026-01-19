import React, { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { Box, Typography, Paper } from '@mui/material';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import PlaceIcon from '@mui/icons-material/Place';

// The data we will pass to each node
interface BusStopData {
    label: string;
    isTerminus?: boolean; // Is it a start/end point?
    price? : string | number;
    estimated_time?: string;
    stop_type?: string;
}

export const BusStopNode = memo(({ data }: NodeProps<BusStopData>) => {
    return (
        <Box sx={{ position: 'relative' }}>
            <Handle type="target" position={Position.Left} style={{ background: '#555', width: 10, height: 10 }} />

            <Paper 
                elevation={3}
                sx={{ 
                    p: 1.5, 
                    minWidth: '180px', // Made it slightly wider to fit details
                    textAlign: 'center',
                    borderRadius: 2,
                    // LOGIC: Blue border if 'isTerminus' is true, Grey otherwise
                    border: data.isTerminus ? '2px solid #1976d2' : '1px solid #ddd',
                    bgcolor: 'white'
                }}
            >
                {/* Header: Icon + Name */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1, borderBottom: '1px solid #eee', pb: 0.5 }}>
                    {data.isTerminus ? <DirectionsBusIcon color="primary" fontSize="small" /> : <PlaceIcon color="action" fontSize="small" />}
                    <Typography variant="subtitle2" fontWeight="bold">
                        {data.label}
                    </Typography>
                </Box>
                
                {/* Details Section */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 1 }}>
                    <Box>
                        <Typography variant="caption" color="text.secondary" display="block">Price</Typography>
                        <Typography variant="body2" fontWeight="bold" color="success.main">
                           {data.price ? `₹${data.price}` : '-'}
                        </Typography>
                    </Box>
                    <Box>
                        <Typography variant="caption" color="text.secondary" display="block">Time</Typography>
                        <Typography variant="body2" fontWeight="bold">
                            {data.estimated_time || '-'}
                        </Typography>
                    </Box>
                </Box>

            </Paper>

            <Handle type="source" position={Position.Right} style={{ background: '#555', width: 10, height: 10 }} />
        </Box>
    );
});