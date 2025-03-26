import React from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Paper,
  Button,
  Typography,
  Link,
  Stack,
} from '@mui/material';
import ShowPassword from '@mui/icons-material/Visibility'
import HidePassword from '@mui/icons-material/VisibilityOff'
import { FormProvider, useForm, handleSubmit, Input } from 'react-fatless-form'
import * as yup from 'yup'

import { useRegisterMutation } from '../store/api';

const schema = yup.object().shape({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  email: yup
    .string()
    .email('Please enter a valid email')
    .required('Email is required'),
  password: yup.string().required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
})

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [register, { isLoading }] = useRegisterMutation();

  const form = useForm({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const onSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault()

    await handleSubmit(form, schema, async values => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword, ...data } = values
      const response = await register(data).unwrap();
      if (response) navigate('/');

      return response
    })
  }

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
          maxWidth: 500,
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Sign Up
        </Typography>
        <FormProvider form={form}>
          <form onSubmit={onSubmit}>
            <Stack direction='row' spacing={1}>
              <Box width='50%'>
                <Input type='text' name='firstName' label='First Name' />
              </Box>
              <Box width='50%'>
                <Input type='text' name='lastName' label='Last Name' />
              </Box>
            </Stack>
            <Stack direction='column' spacing={1}>
              <Input type='text' name='email' label='Email Address' />
              <Input
                type='password'
                name='password'
                label='Password'
                showIcon={<ShowPassword />}
                hideIcon={<HidePassword />}
              />
              <Input
                type='password'
                name='confirmPassword'
                label='Confirm Password'
                showStrengthIndicator={false}
                showIcon={<ShowPassword />}
                hideIcon={<HidePassword />}
                style={{ top: '-17px', marginBottom: '-17px' }}
              />
            </Stack>
            <Stack spacing={3}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={isLoading}
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
        </FormProvider>
      </Paper>
    </Box>
  );
};

export default Register; 