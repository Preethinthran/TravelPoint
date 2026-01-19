import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { Header } from '../../components/common/Header';

export const AdminDashboard = () => {
 
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <Header />
      
      <Box sx={{ p: 4, textAlign: 'center', mt: 4 }}>
          <Typography variant="h3" color="primary" fontWeight="bold" gutterBottom>
            Admin Dashboard
          </Typography>
          <Typography variant="h6">
            Welcome, Administrator.
          </Typography>
          <Typography sx={{ mb: 6, color: 'text.secondary' }}>
            Manage Buses and Operators here.
          </Typography>
          
          {/* 2. Main Admin Actions */}
          <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
            
            {/* Placeholder for Add Operator */}
            <Button 
                variant="contained" 
                size="large"
                startIcon={<AddCircleIcon />}
                onClick={() => navigate('/admin/add-operator')}
                sx={{ px: 4, py: 2, fontSize: '1.1rem' }}
            >
                Add Operator
            </Button>
            {/* Add Bus Button */}
            <Button 
                variant="contained" 
                size="large"
                startIcon={<AddCircleIcon />}
                onClick={() => navigate('/admin/add-bus')}
                sx={{ px: 4, py: 2, fontSize: '1.1rem' }}
            >
                Add New Bus
            </Button>

            
          </Box>
      </Box>
    </Box>
  );
};