'use client';

import Box from '@mui/material/Box';
import * as React from 'react';
import Navbar from '@/components/Navbar';

export default function LoggedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <Box
        component="main"
        sx={{
          bgcolor: 'background.default',
          mt: ['48px', '56px', '64px'],
          marginX: ['0.5rem', '1rem', '4rem'],
          px: 1,
          pt: 3,
        }}
      >
        {children}
      </Box>
    </>
  );
}
