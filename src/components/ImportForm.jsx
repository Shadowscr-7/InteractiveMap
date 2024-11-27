'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Paper,
  Alert,
} from '@mui/material';
import {
  fetchCallesFromOverpass,
  enrichStreetsWithNominatim,
  fetchLocalidadesFromOverpass,
  fetchPuntosInteresFromOverpass,
  sendLocalidadToService,
  sendPOIToService,
  sendStreetToService,
} from '../services/services';

const ImportForm = () => {
  const [pais, setPais] = useState('');
  const [departamento, setDepartamento] = useState('');
  const [resultados, setResultados] = useState([]);
  const [localidades, setLocalidades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingLocalidades, setLoadingLocalidades] = useState(false);
  const [loadingPtosInteres, setLoadingPtosInteres] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Delay entre solicitudes
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // Importar calles
  const fetchData = async () => {
    if (!pais || !departamento) {
      alert('Por favor, complete ambos campos: País y Departamento.');
      return;
    }

    setLoading(true);

    try {
      console.log('Obteniendo calles del departamento desde Overpass...');
      const calles = await fetchCallesFromOverpass(pais, departamento);
      const enrichedStreets = await enrichStreetsWithNominatim(calles, pais, departamento);

      // Enviar cada calle al servicio
      for (const street of enrichedStreets) {
        if (street.lat && street.lon) {
          await sendStreetToService({
            name: street.name,
            lat: street.lat,
            lon: street.lon,
            place: street.localidad,
            departamento: street.departamento,
          });
          await delay(1000); // Delay para evitar saturar el servidor
        }
      }

      setResultados(enrichedStreets);
    } catch (error) {
      console.error('Error obteniendo datos:', error.message);
      alert('Hubo un error obteniendo los datos. Consulte la consola para más detalles.');
    } finally {
      setLoading(false);
    }
  };

  // Importar localidades
  const fetchLocalidades = async () => {
    if (!departamento) {
      alert('Por favor, ingrese un departamento para importar localidades.');
      return;
    }

    setLoadingLocalidades(true);

    try {
      const localidadesData = await fetchLocalidadesFromOverpass(departamento);

      // Enviar cada localidad al servicio
      for (const localidad of localidadesData) {
        await sendLocalidadToService(localidad);
        await delay(1000); // Delay para evitar saturar el servidor
      }

      setLocalidades(localidadesData);
    } catch (error) {
      console.error('Error importando localidades:', error.message);
      setErrorMessage('Error al importar localidades. Consulte la consola para más detalles.');
    } finally {
      setLoadingLocalidades(false);
    }
  };

  // Importar puntos de interés
  const fetchPtosInteres = async () => {
    if (!departamento) {
      alert('Por favor, ingrese un departamento para importar puntos de interés.');
      return;
    }

    setLoadingPtosInteres(true);

    try {
      const puntosInteres = await fetchPuntosInteresFromOverpass(departamento);

      // Enviar cada punto de interés al servicio
      for (const poi of puntosInteres) {
        await sendPOIToService(poi);
      }
    } catch (error) {
      console.error('Error importando puntos de interés:', error.message);
      alert('Hubo un error al importar los puntos de interés.');
    } finally {
      setLoadingPtosInteres(false);
    }
  };

  return (
    <Box
      sx={{
        p: 4,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
      }}
    >
      <Box
        sx={{
          p: 4,
          maxWidth: 800,
          width: '100%',
          backgroundColor: 'white',
          borderRadius: 2,
          boxShadow: 3,
        }}
      >
        <Typography variant="h4" gutterBottom sx={{ color: 'black', textAlign: 'center' }}>
          Importar Calles, Localidades y Puntos de Interés
        </Typography>

        <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
          <TextField
            label="País"
            variant="outlined"
            fullWidth
            value={pais}
            onChange={(e) => setPais(e.target.value)}
          />
          <TextField
            label="Departamento"
            variant="outlined"
            fullWidth
            value={departamento}
            onChange={(e) => setDepartamento(e.target.value)}
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={fetchData}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Importar Calles'}
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={fetchLocalidades}
            disabled={loadingLocalidades}
          >
            {loadingLocalidades ? <CircularProgress size={24} /> : 'Importar Localidades'}
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={fetchPtosInteres}
            disabled={loadingPtosInteres}
          >
            {loadingPtosInteres ? <CircularProgress size={24} /> : 'Importar Puntos de Interés'}
          </Button>
        </Box>

        {errorMessage && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {errorMessage}
          </Alert>
        )}

        {resultados.length > 0 && (
          <TableContainer component={Paper} sx={{ mb: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nombre de la Calle</TableCell>
                  <TableCell>Old Name</TableCell>
                  <TableCell>Localidad</TableCell>
                  <TableCell>Barrio</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {resultados.map((street, index) => (
                  <TableRow key={index}>
                    <TableCell>{street.name}</TableCell>
                    <TableCell>{street.old_name}</TableCell>
                    <TableCell>{street.localidad}</TableCell>
                    <TableCell>{street.barrio}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {localidades.length > 0 && (
          <Typography variant="body1" color="success.main">
            Se han importado {localidades.length} localidades.
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default ImportForm;
