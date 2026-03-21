'use client';

import Copyright from '@/components/Copyright';
import { AuthUserContext } from '@/contexts/AuthUserContext';
import { login, registerWithGoogle, verifyEmail } from '@/fetchs/auth';
import { parseHTTPErrors } from '@/utils/http';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { LoadingButton } from '@mui/lab';
import { Alert, AlertTitle, Divider, Skeleton } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { CredentialResponse, GoogleLogin } from '@react-oauth/google';
import { useRouter, useSearchParams } from 'next/navigation';
import * as React from 'react';
import { Suspense, useContext, useEffect, useState } from 'react';

export default function WrappedLogin() {
  return (
    <Suspense>
      <Login />
    </Suspense>
  );
}

function Login() {
  const { setUser } = useContext(AuthUserContext);
  const [isProcessing, setProcessing] = useState(false);
  const [isGoogleProcessing, setGoogleProcessing] = useState(false);
  const [errors, setErrors] = useState<any[]>([]);
  const [googleErrors, setGoogleErrors] = useState<any[]>([]);
  const [isEmailValidated, setEmailValidated] = useState(true);
  const [isValidating, setValidating] = useState(true);
  const [locationHash, setLocationHash] = useState('');
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    setLocationHash(window.location.hash);
  }, []);

  const token = params.get('token');

  useEffect(() => {
    if (token) {
      setValidating(true);
      verifyEmail(token)
        .then(() => {
          setEmailValidated(true);
        })
        .catch(() => setEmailValidated(false))
        .finally(() =>
          setTimeout(() => {
            setValidating(false);
          }, 1000)
        );
    } else {
      setValidating(false);
    }
  }, [token]);

  const handlePostLogin = async (res: any) => {
    setUser(res);
    const { hash } = location;
    if (hash && hash.includes('redirect')) {
      router.push(hash.split(/=(.*)/s)[1]);
      return;
    }
    router.push('/home');
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    setProcessing(true);
    setErrors([]);
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    login({
      email: data.get('email')?.toString() || '',
      password: data.get('password')?.toString() || '',
    })
      .then(handlePostLogin)
      .catch((err) => {
        setErrors(parseHTTPErrors(err));
      })
      .finally(() => setProcessing(false));
  };

  const signInWithGoogle = (res: CredentialResponse) => {
    setGoogleErrors([]);
    if (!res.credential) return;
    setGoogleProcessing(true);
    registerWithGoogle({ token: res.credential })
      .then(handlePostLogin)
      .catch((err) => {
        setGoogleProcessing(false);
        setGoogleErrors(parseHTTPErrors(err));
      });
  };

  return (
    <Grid container component="main" sx={{ height: '100vh' }}>
      <Grid size={{ xs: 12, sm: 8, md: 5 }} component={Paper} elevation={6} square sx={{ position: 'relative' }}>
        {isGoogleProcessing && (
          <Backdrop
            open
            disablePortal
            sx={{
              position: 'absolute',
              bgcolor: 'rgba(255, 255, 255, 0.82)',
              backdropFilter: 'blur(3px)',
              zIndex: (theme) => theme.zIndex.modal,
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <CircularProgress sx={{ color: 'primary.main' }} />
            <Typography variant="body1" color="text.secondary">
              Signing you in…
            </Typography>
          </Backdrop>
        )}
        <Box
          sx={{
            my: 8,
            mx: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Link href="/" style={{ cursor: 'pointer' }}>
            <img src="/logo.svg" alt="logo" style={{ marginTop: '1rem' }} />
          </Link>
          <Avatar sx={{ m: 1, mt: 10, bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign in
          </Typography>
            {token && (
              <Box sx={{ mt: 2, width: '100%', p: 1 }}>
                {isValidating ? (
                  <Skeleton height={70} />
                ) : isEmailValidated ? (
                  <Alert severity="success">
                    <b>Great! Your account was validated.</b> Now, sign in using
                    your credentials.
                  </Alert>
                ) : (
                  <Alert severity="error">
                    <b>Something went wrong.</b> The token was expired or is
                    invalid. Contact support.
                  </Alert>
                )}
              </Box>
            )}
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
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
            <FormControlLabel
              control={<Checkbox value="remember" color="primary" />}
              label="Remember me"
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
              Sign In
            </LoadingButton>
            <Grid container>
              <Grid size="grow">
                <Link href="/request-reset-password" variant="body2">
                  Forgot password?
                </Link>
              </Grid>
              <Grid>
                <Link href={`/signup${locationHash}`} variant="body2">
                  {"Don't have an account? Sign Up"}
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
                onSuccess={signInWithGoogle}
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
        </Box>
      </Grid>
      <Grid
        size={{ sm: 4, md: 7 }}
        data-testid="background-panel"
        sx={{
          display: { xs: 'none', sm: 'block' },
          backgroundImage:
            'url(https://images.unsplash.com/photo-1440613905118-99b921706b5c?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)',
          backgroundRepeat: 'no-repeat',
          backgroundColor: 'grey',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
    </Grid>
  );
}
