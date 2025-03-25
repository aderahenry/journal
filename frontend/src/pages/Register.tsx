import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Link,
  Stack,
} from '@mui/material';
import { useRegisterMutation } from '../store/api';
import { showNotification } from '../store/slices/notificationSlice';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [register, { isLoading }] = useRegisterMutation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      dispatch(showNotification({
        message: 'Passwords do not match',
        type: 'error'
      }));
      return;
    }
    try {
      await register({ email, password }).unwrap();
      dispatch(showNotification({
        message: 'Registration successful! Welcome to the Journal App.',
        type: 'success'
      }));
      // Navigate to dashboard instead of login since user is now automatically signed in
      navigate('/');
    } catch (error) {
      console.error('Registration failed:', error);
      dispatch(showNotification({
        message: 'Registration failed. Please try again.',
        type: 'error'
      }));
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 400,
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Sign Up
        </Typography>
        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
            />
            <TextField
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              fullWidth
              error={password !== confirmPassword}
              helperText={password !== confirmPassword ? 'Passwords do not match' : ''}
            />
            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={!email || !password || !confirmPassword || password !== confirmPassword}
            >
              Sign Up
            </Button>
            <Typography align="center">
              Already have an account?{' '}
              <Link component={RouterLink} to="/login">
                Sign In
              </Link>
            </Typography>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
};

export default Register; 