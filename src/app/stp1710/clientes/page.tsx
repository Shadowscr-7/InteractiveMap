'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  TextField,
  InputAdornment,
  Modal,
  IconButton,
  MenuItem,
  Grid,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import Table from '../../../components/table/Table';

const Clientes = () => {
  const headers = ['ID', 'Nombre', 'Correo', 'Teléfono', 'País'];
  const originalData = [
    { ID: 1, Nombre: 'Juan Pérez', Correo: 'juan.perez@example.com', Teléfono: '+1 555-0101', País: 'México', Estado: 'Activo', Tipo: 'Individual', RUC: 'MX-12345' },
    { ID: 2, Nombre: 'María Gómez', Correo: 'maria.gomez@example.com', Teléfono: '+1 555-0102', País: 'Colombia', Estado: 'Inactivo', Tipo: 'Corporativo', RUC: 'CO-23456' },
    { ID: 3, Nombre: 'Carlos Ruiz', Correo: 'carlos.ruiz@example.com', Teléfono: '+1 555-0103', País: 'Argentina', Estado: 'Activo', Tipo: 'Corporativo', RUC: 'AR-34567' },
    { ID: 4, Nombre: 'Ana Fernández', Correo: 'ana.fernandez@example.com', Teléfono: '+1 555-0104', País: 'Chile', Estado: 'Inactivo', Tipo: 'Individual', RUC: 'CL-45678' },
    { ID: 5, Nombre: 'Lucía Martínez', Correo: 'lucia.martinez@example.com', Teléfono: '+1 555-0105', País: 'Perú', Estado: 'Activo', Tipo: 'Corporativo', RUC: 'PE-56789' },
  ];

  const [data, setData] = useState(originalData);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    estado: '',
    tipo: '',
    ruc: '',
  });

  const handleAddClient = () => {
    console.log('Agregar Cliente');
  };

  const handleView = (row: any) => {
    console.log('Ver:', row);
  };

  const handleEdit = (row: any) => {
    console.log('Editar:', row);
  };

  const handleDelete = (row: any) => {
    console.log('Eliminar:', row);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);

    filterData(query, advancedFilters);
  };

  const handleFilterChange = (key: string, value: string) => {
    setAdvancedFilters((prev) => ({ ...prev, [key]: value }));
  };

  const filterData = (query: string, filters: Record<string, string>) => {
    const filteredData = originalData.filter((row) => {
      const matchesQuery =
        query === '' ||
        Object.values(row).some((value) =>
          value.toString().toLowerCase().includes(query)
        );

      const matchesFilters =
        (filters.estado === '' || row.Estado === filters.estado) &&
        (filters.tipo === '' || row.Tipo === filters.tipo) &&
        (filters.ruc === '' || row.RUC.toLowerCase().includes(filters.ruc.toLowerCase()));

      return matchesQuery && matchesFilters;
    });

    setData(filteredData);
  };

  const handleApplyFilters = () => {
    filterData(searchQuery, advancedFilters);
    setIsFilterModalOpen(false);
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
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          marginBottom: 2,
          gap: 2,
        }}
      >
        <TextField
          variant="outlined"
          placeholder="Buscar..."
          value={searchQuery}
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: 300 }}
        />
        <IconButton color="primary" onClick={() => setIsFilterModalOpen(true)}>
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
      <Table
        headers={headers}
        data={data}
        actions
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
      />

      {/* Modal de Filtros Avanzados */}
      <Modal
        open={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        aria-labelledby="filtros-modal-title"
        aria-describedby="filtros-modal-description"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography id="filtros-modal-title" variant="h6" gutterBottom>
            Filtros Avanzados
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Estado del Cliente"
                value={advancedFilters.estado}
                onChange={(e) => handleFilterChange('estado', e.target.value)}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="Activo">Activo</MenuItem>
                <MenuItem value="Inactivo">Inactivo</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Tipo de Cliente"
                value={advancedFilters.tipo}
                onChange={(e) => handleFilterChange('tipo', e.target.value)}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="Individual">Individual</MenuItem>
                <MenuItem value="Corporativo">Corporativo</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="RUC"
                value={advancedFilters.ruc}
                onChange={(e) => handleFilterChange('ruc', e.target.value)}
              />
            </Grid>
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleApplyFilters}
            >
              Aplicar Filtros
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default Clientes;
