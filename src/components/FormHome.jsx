"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Typography,
  Autocomplete,
  TextField,
  CircularProgress,
} from "@mui/material";
import { getDepartamentos, getCiudades, getCalles } from "../services/services";

const FormHome = ({ onParamsChange, params }) => {
  const [departamento, setDepartamento] = useState(null);
  const [ciudad, setCiudad] = useState(null);
  const [calle, setCalle] = useState(null);
  const [numeroPuerta, setNumeroPuerta] = useState(""); // Nuevo estado
  const [calleEsquina, setCalleEsquina] = useState(null); // Nueva calle de esquina
  const [numero, setNumero] = useState("");
  const [departamentos, setDepartamentos] = useState([]);
  const [ciudades, setCiudades] = useState([]);
  const [calles, setCalles] = useState([]);

  const [loadingCiudades, setLoadingCiudades] = useState(false);
  const [loadingCalles, setLoadingCalles] = useState(false);

  // Sincroniza los estados del formulario con los nuevos parámetros
  useEffect(() => {
    if (params) {
      console.log("Params recibidos:", params);

      const departamentoEncontrado = departamentos.find(
        (dep) => dep.DepartamentoNombre === params.departamento,
      );
      console.log("Departamento encontrado:", departamentoEncontrado);

      const ciudadEncontrada = ciudades.find(
        (ciu) => ciu.CiudadNombre === params.ciudad,
      );
      console.log("Ciudad encontrada:", ciudadEncontrada);

      const calleEncontrada = calles.find(
        (cal) => cal.CalleNombre === params.calle,
      );
      console.log("Calle encontrada:", calleEncontrada);

      // Buscar y establecer la calle esquina
      const esquinaEncontrada = calles.find(
        (cal) => cal.CalleNombre === params.esquina,
      );
      console.log("Calle esquina encontrada:", esquinaEncontrada);

      setDepartamento(departamentoEncontrado || null);
      setCiudad(ciudadEncontrada || null);
      setCalle(calleEncontrada || null);
      setCalleEsquina(esquinaEncontrada || null);

      // Manejo de múltiples números de puerta
      const numerosPuerta = params.numero ? params.numero.split(",") : [""]; // Divide los números o asigna un array con cadena vacía
      setNumeroPuerta(numerosPuerta[0] || ""); // Toma el primer número o asigna una cadena vacía
      console.log("Número de puerta procesado:", numerosPuerta[0]);
    }
  }, [params, departamentos, ciudades, calles]);

  // Obtener departamentos al cargar
  useEffect(() => {
    const fetchDepartamentos = async () => {
      try {
        const departamentos = await getDepartamentos();
        setDepartamentos(departamentos);
      } catch (error) {
        console.error("Error al obtener departamentos:", error);
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
          console.error("Error al obtener ciudades:", error);
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
    if (departamento) {
      const fetchCalles = async () => {
        setLoadingCalles(true);
        try {
          // Si ciudad no está definida, usar "0" como predeterminado
          const ciudadId = ciudad?.CiudadId || "0";
          const calles = await getCalles(departamento.DepartamentoId, ciudadId);
          setCalles(calles || []);
        } catch (error) {
          console.error("Error al obtener calles:", error);
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
    onParamsChange({
      departamento: newValue,
      ciudad: null,
      calle: null,
      esquina: null,
    });
  };

  const handleCiudadChange = (event, newValue) => {
    setCiudad(newValue);
    setCalle(null);
    setCalleEsquina(null);
    onParamsChange({
      departamento,
      ciudad: newValue,
      calle: null,
      esquina: null,
    });
  };

  const handleCalleChange = (event, newValue) => {
    setCalle(newValue);
    onParamsChange({
      departamento,
      ciudad,
      calle: newValue,
      esquina: calleEsquina,
    });
  };

  const handleNumeroPuertaChange = (event) => {
    const value = event.target.value.replace(/\D/g, ""); // Permitir solo números
    setNumeroPuerta(value);
    onParamsChange({ departamento, ciudad, calle, numero: value });
  };

  const handleCalleEsquinaChange = (event, newValue) => {
    console.log("Nuevo valor de calle esquina seleccionado:", newValue);

    setCalleEsquina(newValue);

    // Verifica si número es vacío y lo ajusta a ""
    const updatedNumero = numero || "";
    console.log("Valor actualizado de numero:", updatedNumero);

    // Actualiza los parámetros con el valor correcto
    const updatedParams = {
      departamento,
      ciudad,
      calle,
      numero: updatedNumero,
      esquina: newValue.CalleNombre,
    };

    console.log(
      "Parámetros actualizados enviados a onParamsChange:",
      updatedParams,
    );

    onParamsChange(updatedParams);
  };

  const textFieldStyles = {
    "& .MuiOutlinedInput-root": {
      color: "#ffffff", // Color del texto
      "& fieldset": {
        borderColor: "#ffffff", // Bordes blancos
      },
      "&:hover fieldset": {
        borderColor: "#ffffff", // Bordes al pasar el mouse
      },
      "&.Mui-focused fieldset": {
        borderColor: "#ffffff", // Bordes al enfocar
      },
    },
    "& .MuiInputLabel-root": {
      color: "#ffffff", // Label blanco
    },
    "& .MuiInputLabel-root.Mui-focused": {
      color: "#ffffff", // Label blanco al enfocar
    },
  };
  
  const customPaperProps = {
    paper: {
      sx: {
        minWidth: '300px', // Ancho mínimo
        width: 'auto',     // Se ajusta al contenido
        backgroundColor: "#ffffff", // Fondo blanco
        boxShadow: 3,      // Sombras
      },
    },
  };
  

  return (
    <>
      <Grid container spacing={3} alignItems="flex-start">
  {/* Primera fila */}
  <Grid item xs={6} sm={3}>
    <Autocomplete
      options={departamentos}
      getOptionLabel={(option) => option.DepartamentoNombre}
      value={departamento}
      componentsProps={customPaperProps}
      onChange={handleDepartamentoChange}
      renderInput={(params) => (
        <TextField {...params} label="Departamento" variant="outlined" fullWidth sx={textFieldStyles} />
      )}
    />
  </Grid>

  <Grid item xs={6} sm={3}>
    <Autocomplete
      options={ciudades}
      value={ciudad}
      componentsProps={customPaperProps}
      onChange={handleCiudadChange}
      getOptionLabel={(option) => option.CiudadNombre}
      renderInput={(params) => (
        <TextField {...params} label="Ciudad" variant="outlined" fullWidth sx={textFieldStyles} />
      )}
    />
  </Grid>

  <Grid item xs={12} sm={6}>
    <Autocomplete
      options={calles}
      getOptionLabel={(option) => option.CalleNombre}
      value={calle}
      componentsProps={customPaperProps}
      onChange={handleCalleChange}
      renderInput={(params) => (
        <TextField {...params} label="Calle Principal" variant="outlined" fullWidth sx={textFieldStyles} />
      )}
    />
  </Grid>

  <Grid item xs={6} sm={3}>
    <TextField
      label="Número de Puerta"
      variant="outlined"
      value={numeroPuerta}
      onChange={handleNumeroPuertaChange}
      fullWidth
      sx={textFieldStyles}
    />
  </Grid>

  {/* Segunda fila */}
  <Grid item xs={12} sm={6}>
    <Autocomplete
      options={calles}
      getOptionLabel={(option) => option.CalleNombre}
      value={calleEsquina}
      componentsProps={customPaperProps}
      onChange={handleCalleEsquinaChange}
      renderInput={(params) => (
        <TextField {...params} label="Esquina 1" variant="outlined" fullWidth sx={textFieldStyles} />
      )}
    />
  </Grid>

  <Grid item xs={12} sm={6}>
    <Autocomplete
      options={calles}
      getOptionLabel={(option) => option.CalleNombre}
      value={calleEsquina}
      componentsProps={customPaperProps}
      onChange={handleCalleEsquinaChange}
      renderInput={(params) => (
        <TextField {...params} label="Esquina 2" variant="outlined" fullWidth sx={textFieldStyles} />
      )}
    />
  </Grid>

  {/* Contenedor de campos pequeños y Observación */}
  <Grid container item spacing={3} alignItems="flex-start">
    {/* Campos pequeños */}
    <Grid item xs={12} sm={6}>
      <Grid container spacing={3}>
        <Grid item xs={3}>
          <TextField label="Apto." variant="outlined" fullWidth sx={textFieldStyles} />
        </Grid>
        <Grid item xs={3}>
          <TextField label="Km" variant="outlined" fullWidth sx={textFieldStyles} />
        </Grid>
        <Grid item xs={3}>
          <TextField label="Manzana" variant="outlined" fullWidth sx={textFieldStyles} />
        </Grid>
        <Grid item xs={3}>
          <TextField label="Block/Solar" variant="outlined" fullWidth sx={textFieldStyles} />
        </Grid>
        <Grid item xs={3}>
          <TextField label="Nivel" variant="outlined" fullWidth sx={textFieldStyles} />
        </Grid>
        <Grid item xs={3}>
          <TextField label="Local" variant="outlined" fullWidth sx={textFieldStyles} />
        </Grid>
      </Grid>
    </Grid>

    {/* Observación */}
    <Grid item xs={12} sm={6}>
      <TextField
        label="Observación"
        variant="outlined"
        multiline
        rows={5}
        fullWidth
        sx={{
          ...textFieldStyles,
          marginTop: '8px', // Espacio extra si es necesario
        }}
      />
    </Grid>
  </Grid>
</Grid>


    </>
  );
};

export default FormHome;
