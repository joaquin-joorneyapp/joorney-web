'use client';

import Copyright from '@/components/Copyright';
import { resetPassword } from '@/fetchs/auth';
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
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { useState } from 'react';

export default function Login() {
  const [isProcessing, setProcessing] = useState(false);
  const [errors, setErrors] = useState<any[]>([]);
  const [emailSent, setEmailSent] = useState(false);
  const router = useRouter();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    setProcessing(true);
    setErrors([]);
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    resetPassword({
      email: data.get('email')?.toString() || '',
    })
      .then(() => {
        setEmailSent(true);
      })
      .catch((err) => {
        const errors = parseHTTPErrors(err);
        setErrors(
          !errors || !errors.length
            ? [
                {
                  message: `We couldn't find an account with this email. Try to Sign Up`,
                },
              ]
            : errors
        );
      })
      .finally(() => setProcessing(false));
  };

  return (
    <Grid container component="main" sx={{ height: '100vh' }}>
      <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6}>
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
          {emailSent ? (
            <Stack alignItems={'center'} sx={{ mt: 15 }}>
              <Box>
                <CheckCircleIcon
                  style={{ transform: 'scale(3.8)' }}
                  htmlColor="green"
                />
              </Box>
              <Typography variant="h6" sx={{ mt: 7 }}>
                We sent you an email to reset your password.
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Please, check your inbox to complete the process.
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
                Reset Password
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
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  autoFocus
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
                  Confirm email
                </LoadingButton>
                <Grid container>
                  <Grid item xs>
                    <Link href="/login" variant="body2">
                      Go to Log In
                    </Link>
                  </Grid>
                  <Grid item>
                    <Link href="/signup" variant="body2">
                      {"Don't have an account? Sign Up"}
                    </Link>
                  </Grid>
                </Grid>
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
