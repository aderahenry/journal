import React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
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

import { useLoginMutation } from '../store/api';

export const schema = yup.object().shape({
  email: yup
    .string()
    .email('Please enter a valid email')
    .required('Enter your email address'),
  password: yup.string().required('Your password is required'),
})


export default function Login() {
  const [login, { isLoading }] = useLoginMutation();
  const navigate = useNavigate()

  const form = useForm({
    email: '',
    password: '',
  })

  const onSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault()

    await handleSubmit(form, schema, async values => {
      const response = await login(values).unwrap()
      if (response) navigate('/')
        
      return response;
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
          maxWidth: 400,
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Sign In
        </Typography>
        <FormProvider form={form}>
          <form onSubmit={onSubmit}>
          <Input type='text' name='email' label='Email' />
          <Input type='password' name='password' label='Password' showStrengthIndicator={false} showIcon={<ShowPassword />} hideIcon={<HidePassword />} />
            <Stack spacing={3}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={isLoading}
              >
                Sign In
              </Button>
              <Typography align="center">
                Don't have an account?{' '}
                <Link component={RouterLink} to="/register">
                  Sign Up
                </Link>
              </Typography>
            </Stack>
          </form>
        </FormProvider>
      </Paper>
    </Box>
  );
};