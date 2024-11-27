'use client';

import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import FormHome from '../../../../components/FormHome'; // Formulario reutilizado
import MapCompleto from '../../../../components/mapCompleto'; // Mapa reutilizado

const AddCliente = () => {
  const [params, setParams] = useState({
    pais: '',
    departamento: '',
    ciudad: '',
  });

  const handleParamsChange = (updatedParams: any) => {
    setParams((prev) => ({ ...prev, ...updatedParams }));
  };

  return (
    <Box
      sx={{
        height: '100vh',
        backgroundColor: '#f5f5f5',
        padding: 3,
      }}
    >
      {/* Encabezado */}
      <Box
        sx={{
          marginBottom: 3,
          textAlign: 'center',
          padding: 2,
          backgroundColor: '#fff',
          borderRadius: 2,
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
          color: '#000',
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          Agregar Cliente
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          Complete los datos del cliente y asigne su ubicación.
        </Typography>
      </Box>

      {/* Contenido Principal */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        {/* Formulario */}
        <Box
          sx={{
            flex: '1 1 40%',
            padding: 3,
            backgroundColor: '#fff',
            borderRadius: 2,
            boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
          }}
        >
          <FormHome onParamsChange={handleParamsChange} />
        </Box>

        {/* Mapa */}
        <Box
          sx={{
            flex: '1 1 55%',
            padding: 3,
            backgroundColor: '#fff',
            borderRadius: 2,
            boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
            height: '500px',
          }}
        >
          <MapCompleto 
                      pais={params.pais}
                      departamento={params.departamento}
                      ciudad={params.ciudad} calle={undefined} numero={undefined} esquina={undefined} children={undefined} onParamsUpdate={undefined}            />

        </Box>
      </Box>
    </Box>
  );
};

export default AddCliente;
