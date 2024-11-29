"use client";

import { useState } from "react";
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
} from "@mui/material";
import {
  fetchCallesFromOverpass,
  enrichStreetsWithNominatim,
  fetchLocalidadesFromOverpass,
  fetchPuntosInteresFromOverpass,
  sendLocalidadToService,
  sendPOIToService,
  sendStreetToService,
} from "../services/services";

const ImportForm = () => {
  const [pais, setPais] = useState("");
  const [departamento, setDepartamento] = useState("");
  const [resultados, setResultados] = useState([]);
  const [localidades, setLocalidades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingLocalidades, setLoadingLocalidades] = useState(false);
  const [loadingPtosInteres, setLoadingPtosInteres] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Delay entre solicitudes
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // Importar calles
  const fetchData = async () => {
    if (!pais || !departamento) {
      alert("Por favor, complete ambos campos: País y Departamento.");
      return;
    }

    setLoading(true);

    try {
      console.log("Obteniendo calles del departamento desde Overpass...");

      const overpassQuery = `
        [out:json];
        area["name"="Uruguay"]["admin_level"="2"]->.country;
        area["name"="${departamento}"]["admin_level"="4"](area.country)->.searchArea;
        (
          way["highway"]["name"](area.searchArea);
        );
        out tags;
      `;
      const overpassResponse = await fetch(
        "https://overpass-api.de/api/interpreter",
        {
          method: "POST",
          headers: { "Content-Type": "text/plain" },
          body: overpassQuery,
        },
      );

      if (!overpassResponse.ok) {
        throw new Error(`Error en Overpass API: ${overpassResponse.status}`);
      }

      const overpassData = await overpassResponse.json();

      const uniqueStreets = Array.from(
        new Map(
          overpassData.elements.map((way) => [
            way.tags.name,
            { name: way.tags.name, old_name: way.tags.old_name || "N/A" },
          ]),
        ).values(),
      );

      const enrichedStreets = [];

      for (const street of uniqueStreets) {
        const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          street.name,
        )}, ${departamento}, ${pais}&format=json&addressdetails=1`;

        try {
          const nominatimResponse = await fetch(nominatimUrl, {
            headers: { "User-Agent": "YourAppName/1.0" },
          });

          if (!nominatimResponse.ok) {
            throw new Error(`Error en Nominatim para ${street.name}`);
          }

          const nominatimData = await nominatimResponse.json();

          const address = nominatimData[0]?.address || {};
          const localidad =
            address.city ||
            address.town ||
            address.village ||
            address.suburb ||
            address.neighbourhood ||
            address.hamlet ||
            "Desconocido";
          const departamento = address.state;
          const lat = nominatimData[0]?.lat || null;
          const lon = nominatimData[0]?.lon || null;

          enrichedStreets.push({
            ...street,
            localidad,
            departamento,
            lat,
            lon,
          });

          if (lat && lon) {
            await sendStreetToService({
              name: street.name,
              lat,
              lon,
              place: localidad,
              departamento: departamento,
            });
          }
        } catch (error) {
          console.warn(
            `Error consultando Nominatim para ${street.name}:`,
            error.message,
          );
          enrichedStreets.push({
            ...street,
            localidad: "Error",
            lat: null,
            lon: null,
          });
        }

        await delay(1000);
      }

      setResultados(enrichedStreets);
    } catch (error) {
      console.error("Error obteniendo datos:", error.message);
      alert(
        "Hubo un error obteniendo los datos. Consulte la consola para más detalles.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Importar localidades
  const fetchLocalidades = async () => {
    if (!departamento) {
      alert("Por favor, ingrese un departamento para importar localidades.");
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
      console.error("Error importando localidades:", error.message);
      setErrorMessage(
        "Error al importar localidades. Consulte la consola para más detalles.",
      );
    } finally {
      setLoadingLocalidades(false);
    }
  };

  // Importar puntos de interés
  const fetchPtosInteres = async () => {
    if (!departamento) {
      alert(
        "Por favor, ingrese un departamento para importar puntos de interés.",
      );
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
      console.error("Error importando puntos de interés:", error.message);
      alert("Hubo un error al importar los puntos de interés.");
    } finally {
      setLoadingPtosInteres(false);
    }
  };

  return (
    <Box
      sx={{
        p: 4,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
      }}
    >
      <Box
        sx={{
          p: 4,
          maxWidth: 800,
          width: "100%",
          backgroundColor: "white",
          borderRadius: 2,
          boxShadow: 3,
        }}
      >
        <Typography
          variant="h4"
          gutterBottom
          sx={{ color: "black", textAlign: "center" }}
        >
          Importar Calles, Localidades y Puntos de Interés
        </Typography>

        <Box sx={{ mb: 3, display: "flex", gap: 2 }}>
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

        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={fetchData}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Importar Calles"}
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={fetchLocalidades}
            disabled={loadingLocalidades}
          >
            {loadingLocalidades ? (
              <CircularProgress size={24} />
            ) : (
              "Importar Localidades"
            )}
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={fetchPtosInteres}
            disabled={loadingPtosInteres}
          >
            {loadingPtosInteres ? (
              <CircularProgress size={24} />
            ) : (
              "Importar Puntos de Interés"
            )}
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
