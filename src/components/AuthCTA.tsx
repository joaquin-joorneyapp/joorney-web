'use client';

import { AuthUserContext } from '@/contexts/AuthUserContext';
import { Box, Button, Typography } from '@mui/material';
import { useContext, useEffect, useState } from 'react';

export default function AuthCTA() {
  const { user } = useContext(AuthUserContext);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || user) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        bgcolor: 'background.paper',
        borderTop: '1px solid',
        borderColor: 'divider',
        p: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        zIndex: 1200,
        boxShadow: '0 -2px 8px rgba(0,0,0,0.08)',
      }}
    >
      <Typography variant="body1">
        Sign in to save activities and build your travel plan
      </Typography>
      <Button href="/login" variant="contained" size="small" sx={{ color: 'white' }}>
        Sign In
      </Button>
    </Box>
  );
}
