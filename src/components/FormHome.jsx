'use client';

import React, { useState } from 'react';
import { Box, Grid, MenuItem, Select, FormControl, InputLabel, Typography, Paper } from '@mui/material';

const FormHome = ({ onParamsChange }) => {
  const [pais, setPais] = useState('');
  const [departamento, setDepartamento] = useState('');
  const [ciudad, setCiudad] = useState('');

  const handlePaisChange = (event) => {
    const newPais = event.target.value;
    setPais(newPais);
    onParamsChange({ pais: newPais, departamento, ciudad });
  };

  const handleDepartamentoChange = (event) => {
    const newDepartamento = event.target.value;
    setDepartamento(newDepartamento);
    onParamsChange({ pais, departamento: newDepartamento, ciudad });
  };

  const handleCiudadChange = (event) => {
    const newCiudad = event.target.value;
    setCiudad(newCiudad);
    onParamsChange({ pais, departamento, ciudad: newCiudad });
  };

  return (
    <Paper
      elevation={3}
      sx={{
        padding: 3,
        borderRadius: 2,
        backgroundColor: '#f9f9f9',
        maxWidth: '100%',
        margin: 'auto',
      }}
    >
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Filtros de Localización
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Selecciona el país, departamento y ciudad para filtrar los resultados.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel id="pais-select-label">País</InputLabel>
            <Select
              labelId="pais-select-label"
              value={pais}
              onChange={handlePaisChange}
            >
              <MenuItem value="Uruguay">Uruguay</MenuItem>
              <MenuItem value="Argentina">Argentina</MenuItem>
              <MenuItem value="Brasil">Brasil</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel id="departamento-select-label">Departamento</InputLabel>
            <Select
              labelId="departamento-select-label"
              value={departamento}
              onChange={handleDepartamentoChange}
            >
              <MenuItem value="Montevideo">Montevideo</MenuItem>
              <MenuItem value="Canelones">Canelones</MenuItem>
              <MenuItem value="Maldonado">Maldonado</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel id="ciudad-select-label">Ciudad</InputLabel>
            <Select
              labelId="ciudad-select-label"
              value={ciudad}
              onChange={handleCiudadChange}
            >
              <MenuItem value="Ciudad Vieja">Ciudad Vieja</MenuItem>
              <MenuItem value="Punta del Este">Punta del Este</MenuItem>
              <MenuItem value="Atlantida">Atlantida</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default FormHome;
