"use client";

import React, { useState, useEffect } from "react";
import { Grid, Box, Typography, Paper } from "@mui/material";
import FormHome from "../../../../components/FormHome";
import MapCompleto from "../../../../components/mapCompleto";
import StreetRenderer from "../../../../components/streetRenderer";

const AddCliente = () => {
  const [params, setParams] = useState({
    pais: "Uruguay",
    departamento: "",
    ciudad: "",
    calle: "",
    numero: "",
    esquina: "",
  });

  const handleParamsChange = (updatedParams: any) => {
    setParams((prev) => {
      const newParams = { ...prev, ...updatedParams };

      // Aseguramos que los valores sean cadenas vacías si están nulos o indefinidos
      newParams.departamento =
        updatedParams.departamento?.DepartamentoNombre ??
        newParams.departamento ??
        "";
      newParams.ciudad =
        updatedParams.ciudad?.CiudadNombre ?? newParams.ciudad ?? "";
      newParams.calle =
        updatedParams.calle?.CalleNombre ?? newParams.calle ?? "";
      newParams.numero = updatedParams.numero ?? newParams.numero ?? "";
      newParams.esquina = updatedParams.esquina ?? newParams.esquina ?? "";

      console.log("Parametros actualizados:", newParams);
      return newParams;
    });
  };

  // Hook para eliminar el indicador de "Static route"
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const staticRouteIndicator = document.querySelector(
        '[data-nextjs-status-indicator]'
      );
      if (staticRouteIndicator) {
        staticRouteIndicator.remove();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Cleanup del observer
    return () => observer.disconnect();
  }, []);

  return (
    <Box
      sx={{
        backgroundColor: "#263238",
        padding: 3,
        height: "100vh",
      }}
    >
      {/* Contenido Principal */}
      <Grid container spacing={2} sx={{ height: "100%" }}>
        {/* Sección del Formulario */}
        <Grid item xs={12} md={9}>
          <div>
            <FormHome onParamsChange={handleParamsChange} params={params} />
          </div>
        </Grid>

        {/* Sección del Mapa */}
        <Grid item xs={12} md={3}>
          <div style={{ height: "100%" }}>
          <MapCompleto params={params} onParamsUpdate={handleParamsChange}>
            <StreetRenderer /> 
          </MapCompleto>

          </div>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AddCliente;
