'use client';

import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import FormHome from '../../../../components/FormHome'; // Formulario reutilizado
import MapCompleto from '../../../../components/mapCompleto'; // Mapa reutilizado
import StreetRenderer from '../../../../components/streetRenderer'; // Componente reutilizado

const AddCliente = () => {
  const [params, setParams] = useState({
    pais: 'Uruguay', // Valor fijo
    departamento: '',
    ciudad: '',
    calle: '',
    numero: undefined,
    esquina: undefined,
  });

  const handleParamsChange = (updatedParams: any) => {
    setParams((prev) => ({
      ...prev,
      pais: 'Uruguay', // Fijo
      departamento: updatedParams.departamento?.DepartamentoNombre || prev.departamento,
      ciudad: updatedParams.ciudad?.CiudadNombre || prev.ciudad,
      calle: updatedParams.calle?.CalleNombre || prev.calle,
    }));
  };

  const handleParamsUpdate = (updatedParams: any) => {
    setParams((prev) => ({
      ...prev,
      ...updatedParams,
    }));
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
            height: '800px',
          }}
        >
          <MapCompleto
            pais={params.pais}
            departamento={params.departamento}
            ciudad={params.ciudad}
            calle={params.calle}
            numero={params.numero}
            esquina={params.esquina}
            onParamsUpdate={handleParamsChange} // Callback para actualizaciones desde el mapa
            >
            {/* Pasar StreetRenderer como hijo */}
            <StreetRenderer params={params} map={undefined} isMapReady={undefined} setLastCoordinates={undefined} />
          </MapCompleto>
        </Box>
      </Box>
    </Box>
  );
};

export default AddCliente;
