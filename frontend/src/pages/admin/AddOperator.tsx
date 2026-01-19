import React, { useState } from 'react';
import { 
    Box, Container, Typography, Paper, TextField, 
    Button, Grid, InputAdornment, IconButton 
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EmailIcon from '@mui/icons-material/Email';
import BadgeIcon from '@mui/icons-material/Badge';
import PhoneIcon from '@mui/icons-material/Phone';
import KeyIcon from '@mui/icons-material/Key';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

import { useUI } from '../../context/UIProvider';
import { useNavigate } from 'react-router-dom';
import { AdminService } from '../../services/api/services/AdminService';
import type { SignupRequest } from '../../services/api/models/SignupRequest';
import { Header } from '../../components/common/Header';

export const AddOperatorPage = () => {
    const { showToast } = useUI();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // 1. Basic Validation
        if (!formData.name || !formData.email || !formData.password || !formData.phone) {
            showToast("Missing Fields", "Please fill in all details", "warning");
            return;
        }

        try {
            setLoading(true);

            // 2. Prepare Payload
            const payload: SignupRequest = {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                phone: formData.phone
            };

            // 3. Call API
            const response = await AdminService.addOperator(payload);

            if (response) {
                showToast("Success", "Operator Registered Successfully!", "success");
                navigate('/admin/dashboard'); 
            }
        } catch (error: any) {
            console.error("Add Operator Error:", error);
            // Handle specific "Email exists" error (409)
            const msg = error.body?.message || "Failed to register operator";
            showToast("Error", msg, "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', pb: 8 }}>
            <Header />
            <Container maxWidth="sm" sx={{ mt: 8 }}>
                <Paper sx={{ p: 4, borderRadius: 2 }}>
                    
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <PersonAddIcon color="primary" sx={{ fontSize: 50, mb: 1 }} />
                        <Typography variant="h5" fontWeight="bold">Add New Operator</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Create a login for a bus operator
                        </Typography>
                    </Box>

                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={3}>
                            
                            {/* Name */}
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Operator Name"
                                    name="name"
                                    placeholder="e.g. Garuda Travels"
                                    value={formData.name}
                                    onChange={handleChange}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <BadgeIcon color="action" />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>

                            {/* Email */}
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Email Address"
                                    name="email"
                                    type="email"
                                    placeholder="e.g. admin@garuda.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <EmailIcon color="action" />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>

                            {/* Phone */}
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Phone Number"
                                    name="phone"
                                    placeholder="e.g. 9876543210"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <PhoneIcon color="action" />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>

                            {/* Password */}
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={handleChange}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <KeyIcon color="action" />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    edge="end"
                                                >
                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
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
                                    {loading ? "Creating Account..." : "Register Operator"}
                                </Button>
                            </Grid>
                        </Grid>
                    </form>
                </Paper>
            </Container>
        </Box>
    );
};