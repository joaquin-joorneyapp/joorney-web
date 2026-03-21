'use client';

import Copyright from '@/components/Copyright';
import { confirmPasswordReset } from '@/fetchs/auth';
import { parseHTTPErrors } from '@/utils/http';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { LoadingButton } from '@mui/lab';
import { Alert, AlertTitle, Stack } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useRouter, useSearchParams } from 'next/navigation';
import * as React from 'react';
import { Suspense, useEffect, useState } from 'react';

export default function WrappedResetPassword() {
  return (
    <Suspense>
      <ResetPassword />
    </Suspense>
  );
}

function ResetPassword() {
  const [success, setSuccess] = useState(false);
  const [isProcessing, setProcessing] = useState(false);
  const [errors, setErrors] = useState<any[]>([]);
  const [intervalId, setIntervalId] = useState<any>(0);
  const [times, setTimes] = useState(5);
  const router = useRouter();
  const params = useSearchParams();

  const token = params.get('token') || '';

  useEffect(() => {
    if (times === 0) router.push('/login');
  }, [times]);

  useEffect(() => {
    return () => clearInterval(intervalId);
  }, []);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    setProcessing(true);
    setErrors([]);
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    confirmPasswordReset({
      token,
      password: data.get('password')?.toString() || '',
    })
      .then(() => {
        setSuccess(true);

        const intervalId = setInterval(() => {
          setTimes((prevTime) => prevTime - 1);
        }, 1000);

        setIntervalId(intervalId);
      })
      .catch((err) => {
        const errors = parseHTTPErrors(err);
        setErrors(
          !errors || !errors.length
            ? [
                {
                  message: `The token is expired or invalid. Try again`,
                },
              ]
            : errors
        );
      })
      .finally(() => setProcessing(false));
  };

  return (
    <Grid container component="main" sx={{ height: '100vh' }}>
      <Grid size={{ xs: 12, sm: 8, md: 5 }} component={Paper} elevation={6}>
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
                Your password was updated successfully.
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                You'll be redirected to the Sign In page in {times} seconds.
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
                Change Password
              </Typography>
              <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{ mt: 1, width: '70%' }}
              >
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="current-password"
                />
                {!isProcessing && errors.length > 0 && (
                  <Box sx={{ width: '100%', mt: 1 }}>
                    <Alert severity="error">
                      <AlertTitle>Error</AlertTitle>
                      {errors.map((e) => e.message).join('. ') + '.'}
                    </Alert>
                  </Box>
                )}
                <LoadingButton
                  loading={isProcessing}
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                >
                  Reset
                </LoadingButton>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Link href="/request-reset-password" variant="body2">
                    Forgot password?
                  </Link>
                  <Link href="/signup" variant="body2">
                    {"Don't have an account? Sign Up"}
                  </Link>
                </Box>
                <Copyright sx={{ mt: 5 }} />
              </Box>
            </>
          )}
        </Box>
      </Grid>
      <Grid
        size={{ sm: 4, md: 7 }}
        sx={{
          display: { xs: 'none', sm: 'block' },
          backgroundImage:
            'url(https://images.unsplash.com/photo-1541336032412-2048a678540d?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)',
          backgroundRepeat: 'no-repeat',
          backgroundColor: 'grey',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
    </Grid>
  );
}
