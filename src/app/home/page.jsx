'use client';

import React, { useState } from 'react';
import { Grid, Box, Typography, Paper } from '@mui/material';
import FormHome from '../../components/FormHome';
import MapCompleto from '../../components/mapCompleto';
import StreetRenderer from '../../components/streetRenderer';

const HomePage = () => {
    const [params, setParams] = useState({
      pais: 'Uruguay',
      departamento: '',
      ciudad: '',
      calle: '',
      numero: '',
      esquina: ''
    });
  
    const handleParamsChange = (updatedParams) => {
      setParams((prev) => {
        // Extraemos los valores de los parámetros que se desean actualizar
        const newParams = { ...prev, ...updatedParams };
  
        // Si los valores vienen como objetos y necesitamos los nombres, extraemos solo esos valores
        if (updatedParams.departamento) {
          newParams.departamento = updatedParams.departamento.DepartamentoNombre || '';
        }
        if (updatedParams.ciudad) {
          newParams.ciudad = updatedParams.ciudad.CiudadNombre || '';
        }
        if (updatedParams.calle) {
          newParams.calle = updatedParams.calle.CalleNombre || '';
        }
        if (updatedParams.numero) {
          newParams.numero = updatedParams.numero || '';
        }
        if (updatedParams.esquina) {
          newParams.esquina = updatedParams.esquina || '';
        }
  
        console.log('Parametros actualizados:', newParams); // Verifica si los parámetros están siendo actualizados correctamente
        return newParams;
      });
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
          color: '#000'
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          Alta Cliente
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          Selecciona tu ubicación y observa el mapa interactivo.
        </Typography>
      </Box>

      {/* Contenido Principal */}
      <Grid container spacing={2} sx={{ height: 'calc(100% - 80px)' }}>
        {/* Sección del Formulario */}
        <Grid item xs={12} md={8}>
          <Paper
            elevation={3}
            sx={{
              height: '100%',
              padding: 3,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <FormHome onParamsChange={handleParamsChange} params={params}/>
          </Paper>
        </Grid>

        {/* Sección del Mapa */}
        <Grid item xs={12} md={4}>
          <Paper
            elevation={3}
            sx={{
              height: '100%',
              overflow: 'hidden',
              padding: 3,
            }}
          >
            <MapCompleto params={params}>
             <StreetRenderer />
            </MapCompleto>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default HomePage;
