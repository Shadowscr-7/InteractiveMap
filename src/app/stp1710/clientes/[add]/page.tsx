"use client";

import React, { useState } from "react";
import { Box, IconButton } from "@mui/material";
import FormHome from "../../../../components/FormHome";
import MapCompleto from "../../../../components/mapCompleto";
import StreetRenderer from "../../../../components/streetRenderer";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";

const AddCliente = () => {
  const [params, setParams] = useState({
    pais: "Uruguay",
    departamento: "",
    ciudad: "",
    calle: "",
    numero: "",
    esquina: "",
  });
  const [isExpanded, setIsExpanded] = useState(false);

  const handleParamsChange = (updatedParams: any) => {
    setParams((prev) => ({ ...prev, ...updatedParams }));
  };

  const toggleMapSize = () => {
    setIsExpanded((prev) => !prev);
  };

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      {/* Panel Izquierdo - Formulario */}
      {!isExpanded && (
        <Box
          sx={{
            width: "70%",
            backgroundColor: "#263238",
            padding: 3,
            overflowY: "auto",
          }}
        >
          <FormHome onParamsChange={handleParamsChange} params={params} />
        </Box>
      )}

      {/* Panel Derecho - Mapa */}
      <Box
        sx={{
          flex: isExpanded ? 1 : "30%",
          position: "relative",
          backgroundColor: "#263238",
        }}
      >
        <MapCompleto params={params} onParamsUpdate={handleParamsChange}>
          <StreetRenderer />
        </MapCompleto>

        {/* Botón de Expansión */}
        <IconButton
          onClick={toggleMapSize}
          sx={{
            position: "absolute",
            top: 10,
            left: 10,
            backgroundColor: "#fff",
            boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
            "&:hover": { backgroundColor: "#f0f0f0" },
          }}
        >
          {isExpanded ? <FullscreenExitIcon /> : <FullscreenIcon />}
        </IconButton>
      </Box>
    </Box>
  );
};

export default AddCliente;
