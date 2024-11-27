'use client';

import React, { useState } from 'react';
import { Grid, Box } from '@mui/material';
import FormHome from '../../components/FormHome';
import MapCompleto from '../../components/mapCompleto';

const HomePage = () => {
  const [params, setParams] = useState({
    pais: '',
    departamento: '',
    ciudad: ''
  });

  const handleParamsChange = (updatedParams) => {
    setParams((prev) => ({ ...prev, ...updatedParams }));
  };

  return (
    <Box sx={{ height: '100vh', padding: 2 }}>
      <Grid container spacing={2} sx={{ height: '100%' }}>
        <Grid item xs={4} sx={{ borderRight: '1px solid #ccc' }}>
          <FormHome onParamsChange={handleParamsChange} />
        </Grid>
        <Grid item xs={8}>
          <MapCompleto params={params} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default HomePage;
