import { useState } from 'react';
import BrandLogo from '../components/common/Brandlogo';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Paper
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import loginBg from '../assets/login-bg.jpg'; 
import {useUI} from '../context/UIProvider';
import {useAuth} from '../context/AuthProvider';

import {AuthenticationService} from '../services/api/services/AuthenticationService';
import type {LoginRequest} from '../services/api/models/LoginRequest';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {login} = useAuth();
  const from = location.state?.from?.pathname || '/';

  const {showToast} = useUI();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

const handleLogin = async () => {
    try {
        const loginData: LoginRequest = { email, password };
        const response = await AuthenticationService.loginUser(loginData);


        const token = typeof response === 'string' 
              ? response 
              : (response as any)?.token;        
        if (token) {
            const rawUser = (response as any)?.user || {};

            const userData = {
                user_id: rawUser.user_id || rawUser.id, // Fallback if API uses 'id'
                name: rawUser.name || rawUser.username || "User",
                email: email, // We know the email from the form
                token: token,
                role: rawUser.role || "passenger"
            };
            login(userData);

            showToast("Welcome Back!", "Login Successful!", "success");
            
           if(rawUser.role === "admin"){
            navigate('/admin/dashboard',{replace:true})
           }
           else if(rawUser.role === "operator"){
            navigate('/operator/dashboard',{replace:true})
           }
           else{
            const destination = location.state?.from?.pathname || '/search';
            navigate(destination, { replace: true });           }
        } 
        else {
            console.error("Login Error: Token missing in response");
            showToast("Login Error", "Server response missing token", "error");
        }

    } catch (err: any) {
        console.error("Login Error:", err);
        const errorMessage = err.body?.message || "Invalid credentials";
        showToast("Login Failed!", errorMessage, "error");
    }
};

  return (
    <Grid container component="main" sx={{ height: '100vh' }}>
      
      {/* LEFT SIDE: Image Section */}
      <Grid
        size={{ sm: 4, md: 7 }}
        sx={{
          backgroundImage: `url(${loginBg})`,
          backgroundRepeat: 'no-repeat',
          backgroundColor: (t) => t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
          display: { xs: 'none', sm: 'flex' }, // Hides on mobile, shows on tablet/desktop
          flexDirection: 'column',
          justifyContent: 'flex-end',
          p: 4,
          color: 'white'
        }}
      >
        <BrandLogo />
        {/* Text Overlay */}
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            Journey with Comfort.
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9 }}>
            The safest and most affordable way to travel.
          </Typography>
        </Box>
        
        {/* Dark Gradient for readability */}
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
        {/* THE CARD (Paper) - Nested safely inside the Grid */}
        <Paper
          elevation={6}
          sx={{
            my: 8,
            mx: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            p: 4,
            borderRadius: 2,
            width: '100%',
            maxWidth: '450px' // Controls how wide the white card gets
          }}
        >
          <Typography component="h1" variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
            Welcome Back
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Please enter your details to sign in.
          </Typography>

          <Box component="form" noValidate sx={{ mt: 1, width: '100%' }}>
            
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Button
              type="button"
              fullWidth
              variant="contained"
              size="large"
              onClick={handleLogin}
              disabled={!email || !password}
              sx={{ mt: 3, mb: 2, py: 1.5, fontSize: '1rem' }}
            >
              Sign In
            </Button>

            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Don't have an account?{' '}
                <Link to="/signup" style={{ color: 'text.primary', textDecoration: 'none', fontWeight: 600 }}>
                  Create one
                </Link>
              </Typography>
            </Box>
            
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default Login;