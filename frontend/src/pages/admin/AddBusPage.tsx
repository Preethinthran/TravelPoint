import React, {useState , useEffect} from 'react';
import {
    Box, Container, Typography, Paper,
    TextField, Button, Grid, MenuItem,
    InputAdornment
} from '@mui/material';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import BadgeIcon from '@mui/icons-material/Badge';

import {useNavigate} from 'react-router-dom';
import {useUI} from '../../context/UIProvider';
import { AdminService } from '../../services/api/services/AdminService';
import type { BusRequest } from '../../services/api/models/BusRequest';
import { BUS_TYPES } from '../../utils/constants';
import { Header } from '../../components/common/Header';

interface Operator {
    user_id: number;
    name: string;
    email: string;
}

export const AddBusPage = () => {
    const {showToast} = useUI();
    const navigate = useNavigate();
    const [loading,setLoading] = useState(false);
    const [operators, setOperators] = useState<Operator[]>([]);

    const [formData, setFormData]= useState({
        bus_number: '',
        operator_id: '',
        total_seats: '',
        bus_type: ''
    });

    useEffect(()=>{
        const fetchOperators = async () =>{
            try{
                const response = await AdminService.getOperators();
                const list = response.data || [];
                setOperators(list as Operator[]);
            }
            catch(err){
                console.error("Failed to fetch operators:", err);
                showToast("Failed to fetch operators!", "Please try again", "error");
            }
        }
        fetchOperators();
    },[])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData ({...formData, [e.target.name]: e.target.value});
    };

    const handleSubmit = async (e: React.FormEvent)=>{
        e.preventDefault();
        if (!formData.bus_number|| !formData.operator_id || !formData.total_seats || !formData.bus_type){
            showToast("All fields are required!", "Please fill all the fields", "warning");
            return;
        }
        try{
            setLoading(true);

            const payload = {
                bus_number: formData.bus_number,
                operator_id: Number(formData.operator_id),
                total_seats: Number(formData.total_seats),
                bus_type: formData.bus_type as BusRequest['bus_type']
            };

            const response = await AdminService.addBus(payload);

            if (response){
                showToast("Bus added successfully!", "Bus added successfully", "success");
                navigate('/admin/dashboard');
            }
            
        }catch(error: any){
            console.error("Failed to add bus:", error);
            showToast("Failed to add bus!", error?.message, "error");
        }finally{
            setLoading(false);
        }
    };
    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', pb: 8 }}>
            <Header />
            <Container maxWidth="sm" sx={{ mt: 8 }}>
                <Paper sx={{ p: 4, borderRadius: 2 }}>
                    
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <DirectionsBusIcon color="primary" sx={{ fontSize: 50, mb: 1 }} />
                        <Typography variant="h5" fontWeight="bold">Register New Bus</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Enter vehicle details below
                        </Typography>
                    </Box>

                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={3}>
                            
                            {/* Bus Number */}
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Bus Number (Plate No)"
                                    name="bus_number"
                                    placeholder="e.g. TN-01-AB-1234"
                                    value={formData.bus_number}
                                    onChange={handleChange}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <ConfirmationNumberIcon color="action" />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>

                            {/* Operator ID */}
                            <Grid item xs={12}>
                                <TextField
                                    select
                                    fullWidth
                                    label="Operator ID"
                                    name="operator_id"
                                    value={formData.operator_id}
                                    onChange={handleChange}
                                    helperText="Select the owner of this bus"
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <BadgeIcon color="action" />
                                            </InputAdornment>
                                        ),
                                    }}
                                >
                                    {operators.length > 0 ? (
                                        operators.map((op)=> (
                                            <MenuItem key={op.user_id} value={op.user_id}>
                                                {op.name} {op.email}
                                            </MenuItem>
                                        ))
                                    ) : (
                                        <MenuItem disabled>
                                            <em>No operators available</em>
                                        </MenuItem>
                                    )}
                                </TextField>
                            </Grid>

                            {/* Capacity & Type Row */}
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Total Seats"
                                    name="total_seats"
                                    type="number"
                                    value={formData.total_seats}
                                    onChange={handleChange}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <EventSeatIcon color="action" />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    select
                                    fullWidth
                                    label="Bus Type"
                                    name="bus_type"
                                    value={formData.bus_type}
                                    onChange={handleChange}
                                >
                                    {BUS_TYPES.map((type) => (
                                        <MenuItem key={type} value={type}>
                                            {type}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>

                            {/* Submit Button */}
                            <Grid item xs={12}>
                                <Button 
                                    type="submit" 
                                    variant="contained" 
                                    fullWidth 
                                    size="large"
                                    disabled={loading}
                                    sx={{ mt: 2, height: 50 }}
                                >
                                    {loading ? "Registering..." : "Add Bus"}
                                </Button>
                            </Grid>
                        </Grid>
                    </form>
                </Paper>
            </Container>
        </Box>
    );

}
