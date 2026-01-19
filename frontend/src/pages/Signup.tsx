import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Paper
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {useUI} from '../context/UIProvider';
import { AuthenticationService } from '../services/api/services/AuthenticationService';
import type { SignupRequest } from '../services/api/models/SignupRequest';

// Import your background image
import BrandLogo from '../components/common/Brandlogo';
import signupBg from '../assets/login-bg.jpg'; 

const Signup = () => {
  // 1. Form Data State
  const navigate = useNavigate();
  const {showToast} = useUI();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  // 2. Error State (Stores validation messages)
  const [errors, setErrors] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });


  // Helper to update form data
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'phone') {
      if (/^\d*$/.test(value) && value.length <= 10) {
        setFormData({ ...formData, [name]: value });
        if (errors.phone) setErrors({ ...errors, phone: '' });
      }
    } else {
      setFormData({ ...formData, [name]: value });
      if (errors[name as keyof typeof errors]) {
        setErrors({ ...errors, [name]: '' });
      }
    }
  };

  const validate = () => {
    let tempErrors = { ...errors };
    let isValid = true;

    if (!formData.fullName.trim()) {
      tempErrors.fullName = "Full Name is required";
      isValid = false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      tempErrors.email = "Email is required";
      isValid = false;
    } else if (!emailRegex.test(formData.email)) {
      tempErrors.email = "Invalid email format";
      isValid = false;
    }
    if (!formData.phone) {
      tempErrors.phone = "Mobile number is required";
      isValid = false;
    } else if (formData.phone.length !== 10) {
      tempErrors.phone = "Phone number must be 10 digits";
      isValid = false;
    }
    if (!formData.password) {
      tempErrors.password = "Password is required";
      isValid = false;
    } else if (formData.password.length < 6) {
      tempErrors.password = "Password must be at least 6 characters";
      isValid = false;
    }
    if (formData.confirmPassword !== formData.password) {
      tempErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }
    setErrors(tempErrors);
    return isValid;
  };

  const handleSignup = async () => {
    if (validate()) {
      try{
        const requestBody: SignupRequest = {
          name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password
        };

        console.log("Sending Request:",requestBody);
        const response = await AuthenticationService.registerUser(requestBody);
        console.log("Signup Success:",response);
        showToast("Account created","Registration Successful! Please Login", "success");
        navigate('/login');
      } catch (err: any){
        console.error("Sign-up failed:",err);
        const errorMsg = err.response?.data?.message || "Registration failed. Please try again.";
        showToast("Account creation failed", errorMsg, "error");
      }
    }
    else{
      showToast("Account creation failed", "Please fill all the fields", "warning");
    }
  };

  return (
    <Grid container component="main" sx={{ height: '100vh' }}>
      
      {/* LEFT SIDE: Image Section */}
      <Grid
        size={{ sm: 4, md: 7 }}
        sx={{
          backgroundImage: `url(${signupBg})`,
          backgroundRepeat: 'no-repeat',
          backgroundColor: (t) => t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
          display: { xs: 'none', sm: 'flex' },
          flexDirection: 'column',
          justifyContent: 'flex-end',
          p: 4,
          color: 'white'
        }}
      >
        <BrandLogo />
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            Join the Journey.
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9 }}>
            Create an account to start booking your next adventure.
          </Typography>
        </Box>
        <Box 
          sx={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.1))',
            zIndex: 0
          }}
        />
      </Grid>
      {/* RIGHT SIDE: Form Section */}
      <Grid 
        size={{ xs: 12, sm: 8, md: 5 }} 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: '#f4f6f8' 
        }}
      >
        <Paper
          elevation={6}
          sx={{
            my: 4, 
            mx: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            p: 4,
            borderRadius: 2,
            width: '100%',
            maxWidth: '450px',
            maxHeight: '90vh', 
            overflowY: 'auto' 
          }}
        >
          <Typography component="h1" variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
            Create Account
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Please fill in your details to register.
          </Typography>

          <Box component="form" noValidate sx={{ mt: 1, width: '100%' }}>
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="fullName"
              label="Full Name"
              value={formData.fullName}
              onChange={handleChange}
              error={!!errors.fullName}        // Shows red border if error exists
              helperText={errors.fullName}     // Shows error message below input
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="email"
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="phone"
              label="Mobile Number"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              error={!!errors.phone}
              helperText={errors.phone}
              inputProps={{ maxLength: 10 }} // Hard limit on HTML level too
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              error={!!errors.password}
              helperText={errors.password}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
            />

            <Button
              type="button"
              fullWidth
              variant="contained"
              size="large"
              onClick={handleSignup}
              sx={{ mt: 3, mb: 2, py: 1.5, fontSize: '1rem' }}
            >
              Sign Up
            </Button>

            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?{' '}
                <Link to="/login" style={{ color: 'text.primary', textDecoration: 'none', fontWeight: 600 }}>
                  Log In
                </Link>
              </Typography>
            </Box>
            
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default Signup; 