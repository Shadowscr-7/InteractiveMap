'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Typography,
  Paper,
  TextField,
} from '@mui/material';
import { getDepartamentos, getCiudades, getCalles } from '../services/services';

const FormHome = ({ onParamsChange }) => {
  const [departamento, setDepartamento] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [calle, setCalle] = useState('');

  const [departamentos, setDepartamentos] = useState([]);
  const [ciudades, setCiudades] = useState([]);
  const [calles, setCalles] = useState([]);

  const [filteredCiudades, setFilteredCiudades] = useState([]);
  const [filteredCalles, setFilteredCalles] = useState([]);
  const [callePage, setCallePage] = useState(1);

  const [searchCiudad, setSearchCiudad] = useState('');
  const [searchCalle, setSearchCalle] = useState('');

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
        try {
          const ciudades = await getCiudades(departamento);
          setCiudades(ciudades || []);
          setFilteredCiudades(ciudades || []);
        } catch (error) {
          console.error('Error al obtener ciudades:', error);
        }
      };

      fetchCiudades();
    }
  }, [departamento]);

  // Obtener calles al seleccionar un departamento y ciudad
  useEffect(() => {
    if (departamento && ciudad) {
      const fetchCalles = async () => {
        try {
          const calles = await getCalles(departamento, ciudad);
          setCalles(calles || []);
          setFilteredCalles(calles.slice(0, 5) || []);
          setCallePage(1);
        } catch (error) {
          console.error('Error al obtener calles:', error);
        }
      };

      fetchCalles();
    }
  }, [departamento, ciudad]);

  // Manejo de eventos de cambio
  const handleDepartamentoChange = (event) => {
    const newDepartamento = event.target.value;
    setDepartamento(newDepartamento);
    setCiudad('');
    setCalle('');
    setCiudades([]);
    setCalles([]);
    onParamsChange({ departamento: newDepartamento, ciudad: '', calle: '' });
  };

  const handleCiudadChange = (event) => {
    const newCiudad = event.target.value;
    setCiudad(newCiudad);
    setCalle('');
    setCalles([]);
    onParamsChange({ departamento, ciudad: newCiudad, calle: '' });
  };

  const handleCalleChange = (event) => {
    const newCalle = event.target.value;
    setCalle(newCalle);
    onParamsChange({ departamento, ciudad, calle: newCalle });
  };

  // Filtrado dinámico
  useEffect(() => {
    setFilteredCiudades(
      ciudades.filter((c) =>
        c.CiudadNombre.toLowerCase().includes(searchCiudad.toLowerCase())
      )
    );
  }, [searchCiudad, ciudades]);

  const handleScrollCalle = (event) => {
    const { scrollTop, scrollHeight, clientHeight } = event.target;
    if (scrollTop + clientHeight >= scrollHeight) {
      const nextPage = callePage + 1;
      setFilteredCalles((prev) => [
        ...prev,
        ...calles.slice(nextPage * 5, (nextPage + 1) * 5),
      ]);
      setCallePage(nextPage);
    }
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
          <FormControl fullWidth>
            <InputLabel id="departamento-select-label">Departamento</InputLabel>
            <Select
              labelId="departamento-select-label"
              value={departamento}
              onChange={handleDepartamentoChange}
            >
              {departamentos.map((dep) => (
                <MenuItem key={dep.DepartamentoId} value={dep.DepartamentoId}>
                  {dep.DepartamentoNombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Combo Ciudad */}
        <Grid item xs={12}>
          <FormControl fullWidth>
            <TextField
              label="Filtrar Ciudades"
              variant="outlined"
              value={searchCiudad}
              onChange={(e) => setSearchCiudad(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Select
              labelId="ciudad-select-label"
              value={ciudad}
              onChange={handleCiudadChange}
            >
              {filteredCiudades.map((ci) => (
                <MenuItem key={ci.CiudadId} value={ci.CiudadId}>
                  {ci.CiudadNombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Combo Calle */}
        <Grid item xs={12}>
          <FormControl fullWidth>
            <TextField
              label="Filtrar Calles"
              variant="outlined"
              value={searchCalle}
              onChange={(e) => setSearchCalle(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Select
              labelId="calle-select-label"
              value={calle}
              onChange={handleCalleChange}
              onScroll={handleScrollCalle}
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 200,
                  },
                },
              }}
            >
              {filteredCalles.map((cal) => (
                <MenuItem key={cal.CalleId} value={cal.CalleId}>
                  {cal.CalleNombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default FormHome;
