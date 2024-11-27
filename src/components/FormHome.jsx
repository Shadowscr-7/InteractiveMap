'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Paper,
  Autocomplete,
  TextField,
  CircularProgress,
} from '@mui/material';
import { getDepartamentos, getCiudades, getCalles } from '../services/services';

const FormHome = ({ onParamsChange }) => {
  const [departamento, setDepartamento] = useState(null);
  const [ciudad, setCiudad] = useState(null);
  const [calle, setCalle] = useState(null);

  const [departamentos, setDepartamentos] = useState([]);
  const [ciudades, setCiudades] = useState([]);
  const [calles, setCalles] = useState([]);

  const [loadingCiudades, setLoadingCiudades] = useState(false);
  const [loadingCalles, setLoadingCalles] = useState(false);

  // Obtener departamentos al cargar
  useEffect(() => {
    const fetchDepartamentos = async () => {
      try {
        const departamentos = await getDepartamentos();
        setDepartamentos(departamentos);
      } catch (error) {
        console.error('Error al obtener departamentos:', error);
      }
    };

    fetchDepartamentos();
  }, []);

  // Obtener ciudades al seleccionar un departamento
  useEffect(() => {
    if (departamento) {
      const fetchCiudades = async () => {
        setLoadingCiudades(true);
        try {
          const ciudades = await getCiudades(departamento.DepartamentoId);
          setCiudades(ciudades || []);
        } catch (error) {
          console.error('Error al obtener ciudades:', error);
        } finally {
          setLoadingCiudades(false);
        }
      };

      fetchCiudades();
    } else {
      setCiudades([]);
      setCiudad(null);
    }
  }, [departamento]);

  // Obtener calles al seleccionar un departamento y ciudad
  useEffect(() => {
    if (departamento && ciudad) {
      const fetchCalles = async () => {
        setLoadingCalles(true);
        try {
          const calles = await getCalles(departamento.DepartamentoId, ciudad.CiudadId);
          setCalles(calles || []);
        } catch (error) {
          console.error('Error al obtener calles:', error);
        } finally {
          setLoadingCalles(false);
        }
      };

      fetchCalles();
    } else {
      setCalles([]);
      setCalle(null);
    }
  }, [departamento, ciudad]);

  // Manejo de eventos de cambio
  const handleDepartamentoChange = (event, newValue) => {
    setDepartamento(newValue);
    setCiudad(null);
    setCalle(null);
    onParamsChange({ departamento: newValue, ciudad: null, calle: null });
  };

  const handleCiudadChange = (event, newValue) => {
    setCiudad(newValue);
    setCalle(null);
    onParamsChange({ departamento, ciudad: newValue, calle: null });
  };

  const handleCalleChange = (event, newValue) => {
    setCalle(newValue);
    onParamsChange({ departamento, ciudad, calle: newValue });
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
          Selecciona el departamento, ciudad y calle para filtrar los resultados.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Combo Departamento */}
        <Grid item xs={12}>
          <Autocomplete
            options={departamentos}
            getOptionLabel={(option) => option.DepartamentoNombre}
            value={departamento}
            onChange={handleDepartamentoChange}
            renderInput={(params) => (
              <TextField {...params} label="Departamento" variant="outlined" />
            )}
          />
        </Grid>

        {/* Combo Ciudad */}
        <Grid item xs={12}>
          <Autocomplete
            options={ciudades}
            getOptionLabel={(option) => option.CiudadNombre}
            value={ciudad}
            onChange={handleCiudadChange}
            loading={loadingCiudades}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Ciudad"
                variant="outlined"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loadingCiudades ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
        </Grid>

        {/* Combo Calle */}
        <Grid item xs={12}>
          <Autocomplete
            options={calles}
            getOptionLabel={(option) => option.CalleNombre}
            value={calle}
            onChange={handleCalleChange}
            loading={loadingCalles}
            ListboxProps={{
              style: {
                maxHeight: '200px', // Máximo alto del dropdown
                overflowY: 'auto', // Habilitar scroll interno
              },
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Calle"
                variant="outlined"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loadingCalles ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default FormHome;
