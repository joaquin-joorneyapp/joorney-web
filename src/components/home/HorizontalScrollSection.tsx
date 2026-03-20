import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import React from 'react';

interface Props {
  title: string;
  children: React.ReactNode;
}

export default function HorizontalScrollSection({ title, children }: Props) {
  return (
    <Box sx={{ mb: 5 }}>
      <Typography variant="h4" component="div" sx={{ mb: 2 }}>
        {title}
      </Typography>
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          overflowX: 'auto',
          pb: 1,
          '&::-webkit-scrollbar': { height: '4px' },
          '&::-webkit-scrollbar-thumb': { backgroundColor: 'grey.300', borderRadius: '2px' },
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
