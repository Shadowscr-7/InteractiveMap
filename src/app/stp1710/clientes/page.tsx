"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import Table from "../../../components/table/Table";

const Clientes = () => {
  const router = useRouter();

  const headers = ["ID", "Nombre", "Correo", "Teléfono", "País"];
  const data = [
    {
      ID: 1,
      Nombre: "Juan Pérez",
      Correo: "juan.perez@example.com",
      Teléfono: "+1 555-0101",
      País: "México",
    },
    {
      ID: 2,
      Nombre: "María Gómez",
      Correo: "maria.gomez@example.com",
      Teléfono: "+1 555-0102",
      País: "Colombia",
    },
    {
      ID: 3,
      Nombre: "Carlos Ruiz",
      Correo: "carlos.ruiz@example.com",
      Teléfono: "+1 555-0103",
      País: "Argentina",
    },
    {
      ID: 4,
      Nombre: "Ana Fernández",
      Correo: "ana.fernandez@example.com",
      Teléfono: "+1 555-0104",
      País: "Chile",
    },
    {
      ID: 5,
      Nombre: "Lucía Martínez",
      Correo: "lucia.martinez@example.com",
      Teléfono: "+1 555-0105",
      País: "Perú",
    },
  ];

  const handleAddClient = () => {
    router.push("/stp1710/clientes/add"); // Redirección a la página para agregar cliente
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Clientes
      </Typography>
      <Typography variant="body1" color="textSecondary" gutterBottom>
        Aquí puedes encontrar la lista de clientes registrados en el sistema.
      </Typography>
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          marginBottom: 2,
          gap: 2,
        }}
      >
        <TextField
          variant="outlined"
          placeholder="Buscar..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: 300 }}
        />
        <IconButton color="primary">
          <FilterListIcon />
        </IconButton>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddClient}
        >
          Agregar Cliente
        </Button>
      </Box>
      <Table headers={headers} data={data} actions />
    </Box>
  );
};

export default Clientes;
