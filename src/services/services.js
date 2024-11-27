import http from './http';

/**
 * Servicio para obtener los departamentos.
 * Endpoint: /getDepartamentos
 * @returns {Promise<Object>} Lista de departamentos
 */
export const getDepartamentos = async () => {
  try {
    const response = await http.get('/getDepartamentos', {
      withCredentials: true, // Incluye cookies si el servidor las requiere
    },
    {
      headers: {
        Cookie: 'GX_CLIENT_ID=6b58c02d-0340-45bf-bab4-377f4376f5c0',
      },
    });
    return response.data.sdtDepartamentos;
  } catch (error) {
    console.error('Error al obtener departamentos:', error);
    throw error;
  }
};

/**
 * Servicio para obtener las ciudades de un departamento.
 * Endpoint: /getCiudades
 * @param {number} departamentoId - ID del departamento
 * @returns {Promise<Object>} Lista de ciudades
 */
export const getCiudades = async (departamentoId) => {
  try {
    const response = await http.get('/getCiudades', {
      params: { DepartamentoId: departamentoId },
      withCredentials: true,
    });
    return response.data.sdtCiudades;
  } catch (error) {
    console.error(`Error al obtener ciudades para DepartamentoId ${departamentoId}:`, error);
    throw error;
  }
};

/**
 * Servicio para obtener las calles de un departamento y ciudad.
 * Endpoint: /getCalles
 * @param {number} departamentoId - ID del departamento
 * @param {number} ciudadId - ID de la ciudad
 * @returns {Promise<Object>} Lista de calles
 */
export const getCalles = async (departamentoId, ciudadId) => {
  try {
    const response = await http.post(
      '/getCalles',
      {
        DepartamentoId: departamentoId,
        CiudadId: ciudadId,
      },
      {
        withCredentials: true,
      }
    );
    return response.data.CalleCiudad;
  } catch (error) {
    console.error(`Error al obtener calles para DepartamentoId ${departamentoId} y CiudadId ${ciudadId}:`, error);
    throw error;
  }
};

/**
 * Servicio para obtener datos de móviles.
 * Endpoint: /DatosMapa/ListarMovilesAgencias
 * @param {number} escenarioId - ID del escenario
 * @param {number} agenciaId - ID de la agencia
 * @returns {Promise<Object>} Datos de móviles
 */
export const getMovilesData = async (escenarioId, agenciaId) => {
  try {
    const response = await http.post(
      '/DatosMapa/ListarMovilesAgencias',
      {
        EscenarioId: escenarioId,
        AgenciaId: agenciaId,
      },
      {
        headers: {
          Cookie: 'GX_CLIENT_ID=6b58c02d-0340-45bf-bab4-377f4376f5c0',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error al obtener datos de Moviles:', error);
    throw error;
  }
};

/**
 * Servicio para obtener localidades desde Overpass API.
 * @param {string} departamento - Nombre del departamento.
 * @returns {Promise<Array>} Lista de localidades.
 */
export const fetchLocalidadesFromOverpass = async (departamento) => {
  try {
    const overpassQuery = `
      [out:json][timeout:25];
      area["name"="${departamento}"]["admin_level"="4"]->.searchArea;
      node["place"]["name"](area.searchArea);
      out body;
    `;

    const response = await http.post('https://overpass-api.de/api/interpreter', overpassQuery, {
      headers: { 'Content-Type': 'text/plain' },
    });

    return response.data.elements.map((node) => ({
      name: node.tags.name,
      lat: node.lat,
      lon: node.lon,
      place: node.tags.place,
      departamento,
    }));
  } catch (error) {
    console.error('Error al obtener localidades desde Overpass:', error);
    throw error;
  }
};

/**
 * Servicio para enviar localidades al backend.
 * Endpoint: /ImportarLocalidades
 * @param {Object} localidad - Objeto con datos de la localidad.
 * @returns {Promise<void>}
 */
export const sendLocalidadToService = async (localidad) => {
  try {
    const response = await http.post('/ImportarLocalidades', localidad, {
      withCredentials: true,
    });
    console.log(`Localidad enviada correctamente: ${localidad.name}`);
  } catch (error) {
    console.error(`Error al enviar la localidad ${localidad.name}:`, error);
    throw error;
  }
};

/**
 * Servicio para obtener puntos de interés desde Overpass API.
 * @param {string} departamento - Nombre del departamento.
 * @returns {Promise<Array>} Lista de puntos de interés.
 */
export const fetchPuntosInteresFromOverpass = async (departamento) => {
  try {
    const overpassQuery = `
      [out:json][timeout:25];
      area["name"="Uruguay"]["admin_level"="2"]->.country;
      area["name"="${departamento}"]["admin_level"="4"](area.country)->.departamento;
      (
        node["amenity"](area.departamento);
        way["amenity"](area.departamento);
        relation["amenity"](area.departamento);
      );
      out center;
    `;

    const response = await http.post('https://overpass-api.de/api/interpreter', overpassQuery, {
      headers: { 'Content-Type': 'text/plain' },
    });

    return response.data.elements.map((element) => ({
      name: element.tags.name || '',
      amenity: element.tags.amenity || '',
      lat: element.lat || element.center?.lat || '',
      lon: element.lon || element.center?.lon || '',
      departamento,
    }));
  } catch (error) {
    console.error('Error al obtener puntos de interés desde Overpass:', error);
    throw error;
  }
};

/**
 * Servicio para enviar puntos de interés al backend.
 * Endpoint: /ImportarPtosInteres
 * @param {Object} poi - Objeto con datos del punto de interés.
 * @returns {Promise<void>}
 */
export const sendPOIToService = async (poi) => {
  try {
    const response = await http.post('/ImportarPtosInteres', poi, {
      withCredentials: true,
    });
    console.log(`Punto de interés enviado correctamente: ${poi.name}`);
  } catch (error) {
    console.error(`Error al enviar el punto de interés ${poi.name}:`, error);
    throw error;
  }
};

/**
 * Servicio para enviar calles al backend.
 * Endpoint: /ImportarCalles
 * @param {Object} calle - Objeto con datos de la calle.
 * @returns {Promise<void>}
 */
export const sendStreetToService = async (calle) => {
  try {
    const response = await http.post('/ImportarCalles', calle, {
      withCredentials: true,
    });
    console.log(`Calle enviada correctamente: ${calle.name}`);
  } catch (error) {
    console.error(`Error al enviar la calle ${calle.name}:`, error);
    throw error;
  }
};
