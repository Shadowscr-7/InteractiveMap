'use client';

import React, { useState } from 'react';
import { Grid, Box, Typography, Paper } from '@mui/material';
import FormHome from '../../../../components/FormHome';
import MapCompleto from '../../../../components/mapCompleto';
import StreetRenderer from '../../../../components/streetRenderer';

const AddCliente = () => {
    const [params, setParams] = useState({
      pais: 'Uruguay',
      departamento: '',
      ciudad: '',
      calle: '',
      numero: '',
      esquina: ''
    });
  
    const handleParamsChange = (updatedParams: any) => {
        setParams((prev) => {
          // Extraemos los valores de los parámetros que se desean actualizar
          const newParams = { ...prev, ...updatedParams };
      
          // Aseguramos que los valores sean cadenas vacías si están nulos o indefinidos
          newParams.departamento = updatedParams.departamento?.DepartamentoNombre ?? newParams.departamento ?? '';
          newParams.ciudad = updatedParams.ciudad?.CiudadNombre ?? newParams.ciudad ?? '';
          newParams.calle = updatedParams.calle?.CalleNombre ?? newParams.calle ?? '';
          newParams.numero = updatedParams.numero ?? newParams.numero ?? '';
          newParams.esquina = updatedParams.esquina ?? newParams.esquina ?? '';
      
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
      {/* Contenido Principal */}
      <Grid container spacing={2} sx={{ height: 'calc(100% - 80px)' }}>
        {/* Sección del Formulario */}
        <Grid item xs={12} md={6}>
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
        <Grid item xs={12} md={6}>
          <Paper
            elevation={3}
            sx={{
              height: '100%',
              overflow: 'hidden',
              padding: 3,
            }}
          >
            <MapCompleto 
              params={params}
              onParamsUpdate={handleParamsChange} // Añadimos onParamsUpdate
            >
              <StreetRenderer />
            </MapCompleto>

          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AddCliente;
