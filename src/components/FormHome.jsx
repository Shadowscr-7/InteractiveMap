'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Autocomplete,
  TextField,
  CircularProgress,
} from '@mui/material';
import { getDepartamentos, getCiudades, getCalles } from '../services/services';

const FormHome = ({ onParamsChange }) => {
  const [departamento, setDepartamento] = useState(null);
  const [ciudad, setCiudad] = useState(null);
  const [calle, setCalle] = useState(null);
  const [numeroPuerta, setNumeroPuerta] = useState(''); // Nuevo estado
  const [calleEsquina, setCalleEsquina] = useState(null); // Nueva calle de esquina

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
      setCalleEsquina(null);
    }
  }, [departamento, ciudad]);

  // Manejo de eventos de cambio
  const handleDepartamentoChange = (event, newValue) => {
    setDepartamento(newValue);
    setCiudad(null);
    setCalle(null);
    setCalleEsquina(null);
    onParamsChange({ departamento: newValue, ciudad: null, calle: null, esquina: null });
  };

  const handleCiudadChange = (event, newValue) => {
    setCiudad(newValue);
    setCalle(null);
    setCalleEsquina(null);
    onParamsChange({ departamento, ciudad: newValue, calle: null, esquina: null });
  };

  const handleCalleChange = (event, newValue) => {
    setCalle(newValue);
    onParamsChange({ departamento, ciudad, calle: newValue, esquina: calleEsquina });
  };

  const handleNumeroPuertaChange = (event) => {
    const value = event.target.value.replace(/\D/g, ''); // Permitir solo números
    setNumeroPuerta(value);
    onParamsChange({ departamento, ciudad, calle, numero: value });
  };

  const handleCalleEsquinaChange = (event, newValue) => {
    setCalleEsquina(newValue);
    onParamsChange({ departamento, ciudad, calle, esquina: newValue });
  };

  return (
    <>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Datos del Cliente
        </Typography>
      </Box>

      <Grid container spacing={3}>
  {/* Columna Izquierda */}
  <Grid item xs={12} sm={6}>
    {/* Combo Departamento */}
    <Autocomplete
      options={departamentos}
      getOptionLabel={(option) => option.DepartamentoNombre}
      value={departamento}
      onChange={handleDepartamentoChange}
      renderInput={(params) => (
        <TextField {...params} label="Departamento" variant="outlined" fullWidth />
      )}
    />
  </Grid>

  {/* Combo Ciudad */}
  <Grid item xs={12} sm={6}>
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
          fullWidth
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
  <Grid item xs={12} sm={6}>
    <Autocomplete
      options={calles}
      getOptionLabel={(option) => option.CalleNombre}
      value={calle}
      onChange={handleCalleChange}
      loading={loadingCalles}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Calle Principal"
          variant="outlined"
          fullWidth
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

  {/* Número de Puerta */}
  <Grid item xs={12} sm={6}>
    <TextField
      label="Número de Puerta"
      variant="outlined"
      value={numeroPuerta}
      onChange={handleNumeroPuertaChange}
      inputProps={{ maxLength: 6 }} // Limitar a 6 dígitos
      fullWidth
    />
  </Grid>

  {/* Combo Calle Esquina */}
  <Grid item xs={12} sm={6}>
    <Autocomplete
      options={calles}
      getOptionLabel={(option) => option.CalleNombre}
      value={calleEsquina}
      onChange={handleCalleEsquinaChange}
      loading={loadingCalles}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Calle Esquina"
          variant="outlined"
          fullWidth
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

    </>
  );
};

export default FormHome;
