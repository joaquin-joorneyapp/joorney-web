'use client';

import { AuthUserContext } from '@/contexts/AuthUserContext';
import { registerWithGoogle, signup } from '@/fetchs/auth';
import { parseHTTPErrors } from '@/utils/http';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { LoadingButton } from '@mui/lab';
import { Alert, AlertTitle, Divider, Paper, Stack } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { CredentialResponse, GoogleLogin } from '@react-oauth/google';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { useContext, useState } from 'react';
import { Copyright } from '../login/page';

export default function SignUp() {
  const { setUser } = useContext(AuthUserContext);
  const [isProcessing, setProcessing] = useState(false);
  const [errors, setErrors] = useState<any[]>([]);
  const [success, setSuccess] = useState(false);
  const [googleErrors, setGoogleErrors] = useState<any[]>([]);
  const router = useRouter();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    setProcessing(true);
    setErrors([]);
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    signup({
      email: data.get('email')?.toString() || '',
      password: data.get('password')?.toString() || '',
      firstName: data.get('firstName')?.toString() || '',
      lastName: data.get('lastName')?.toString() || '',
    })
      .then(() => {
        setSuccess(true);
      })
      .catch((err) => {
        setErrors(parseHTTPErrors(err));
      })
      .finally(() => setProcessing(false));
  };

  const signUpWithGoogle = (res: CredentialResponse) => {
    setGoogleErrors([]);
    registerWithGoogle({ token: res.credential || '' })
      .then((res) => {
        setUser(res.data);
        router.push('/cities');
      })
      .catch((err) => {
        setGoogleErrors(parseHTTPErrors(err));
      });
  };

  return (
    <Grid container component="main" sx={{ height: '100vh' }}>
      <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
        <Box
          sx={{
            my: 8,
            mx: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <img src="/logo.svg" alt="logo" style={{ marginTop: '1rem' }} />
          {success ? (
            <Stack alignItems={'center'} sx={{ mt: 15 }}>
              <Box>
                <CheckCircleIcon
                  style={{ transform: 'scale(3.8)' }}
                  htmlColor="green"
                />
              </Box>
              <Typography variant="h6" sx={{ mt: 7 }}>
                Your account was registered successfully!
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Please, check your inbox to verify your email and complete the
                process.
              </Typography>
              <Link href="/login" variant="body1" sx={{ mt: 2 }}>
                Go to Sign In
              </Link>
            </Stack>
          ) : (
            <>
              <Avatar sx={{ m: 1, mt: 10, bgcolor: 'secondary.main' }}>
                <LockOutlinedIcon />
              </Avatar>
              <Typography component="h1" variant="h5">
                Sign up
              </Typography>

              <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      autoComplete="given-name"
                      name="firstName"
                      required
                      fullWidth
                      id="firstName"
                      label="First Name"
                      autoFocus
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      id="lastName"
                      label="Last Name"
                      name="lastName"
                      autoComplete="family-name"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      id="email"
                      label="Email Address"
                      name="email"
                      autoComplete="email"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      name="password"
                      label="Password"
                      type="password"
                      id="password"
                      autoComplete="new-password"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={<Checkbox value="true" color="primary" />}
                      label="I want to receive inspiration, marketing promotions and updates via email."
                    />
                  </Grid>
                </Grid>
                {!isProcessing && errors.length > 0 && (
                  <Alert severity="error" sx={{ mt: 1 }}>
                    <AlertTitle>Error</AlertTitle>
                    {errors.map((e) => e.message).join('. ') + '.'}
                  </Alert>
                )}
                <LoadingButton
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                  loading={isProcessing}
                >
                  Sign Up
                </LoadingButton>
                <Grid container justifyContent="flex-end">
                  <Grid item>
                    <Link href="/login" variant="body2">
                      Already have an account? Sign in
                    </Link>
                  </Grid>
                </Grid>
                <Divider sx={{ mt: 3, mb: 3 }}>OR</Divider>
                <Box
                  sx={{
                    width: '100%',
                  }}
                  display={'flex'}
                  flexDirection={'column'}
                  alignItems={'center'}
                >
                  <GoogleLogin
                    onSuccess={signUpWithGoogle}
                    onError={console.error}
                  />
                </Box>
                {googleErrors.length > 0 && (
                  <Box sx={{ width: '100%', mt: 2 }}>
                    <Alert severity="error">
                      <AlertTitle>Error</AlertTitle>
                      {googleErrors.map((e) => e.message).join('. ') + '.'}
                    </Alert>
                  </Box>
                )}
                <Copyright sx={{ mt: 5 }} />
              </Box>
            </>
          )}
        </Box>
      </Grid>
      <Grid
        item
        xs={false}
        sm={4}
        md={7}
        sx={{
          backgroundImage:
            'url(https://images.unsplash.com/photo-1558369178-6556d97855d0?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)',
          backgroundRepeat: 'no-repeat',
          backgroundColor: 'grey',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
    </Grid>
  );
}
