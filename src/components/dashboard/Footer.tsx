'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';

const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        textAlign: 'center',
        padding: 2,
        backgroundColor: 'primary.main',
        color: 'white',
      }}
    >
      <Typography variant="body2">© 2024 Mi Aplicación</Typography>
    </Box>
  );
};

export default Footer;
