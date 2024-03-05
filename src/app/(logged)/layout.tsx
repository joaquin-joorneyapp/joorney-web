'use client';

import Box from '@mui/material/Box';
import * as React from 'react';
import Navbar from './navbar';

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
          flexGrow: 1,
          bgcolor: 'background.default',
          mt: ['48px', '56px', '64px'],
          marginX: ['0px', '0px', '4rem'],
          px: 1,
          pt: 3,
        }}
      >
        {children}
      </Box>
    </>
  );
}
