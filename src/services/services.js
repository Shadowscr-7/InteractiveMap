import http from "./http";

/**
 * Servicio para obtener los departamentos.
 * Endpoint: /getDepartamentos
 * @returns {Promise<Object>} Lista de departamentos
 */
export const getDepartamentos = async () => {
  try {
    const response = await http.get(
      "/getDepartamentos",
      {
        withCredentials: true, // Incluye cookies si el servidor las requiere
      },
      {
        headers: {
          Cookie: "GX_CLIENT_ID=6b58c02d-0340-45bf-bab4-377f4376f5c0",
        },
      },
    );
    return response.data.sdtDepartamentos;
  } catch (error) {
    console.error("Error al obtener departamentos:", error);
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
    const response = await http.get("/getCiudades", {
      params: { Departamentoid: departamentoId },
      withCredentials: true,
    });
    return response.data.sdtCiudades;
  } catch (error) {
    console.error(
      `Error al obtener ciudades para DepartamentoId ${departamentoId}:`,
      error,
    );
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
      "/getCalles",
      {
        DepartamentoId: departamentoId,
        CiudadId: ciudadId,
      },
      {
        withCredentials: true,
      },
    );
    return response.data.CalleCiudad;
  } catch (error) {
    console.error(
      `Error al obtener calles para DepartamentoId ${departamentoId} y CiudadId ${ciudadId}:`,
      error,
    );
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
      "/DatosMapa/ListarMovilesAgencias",
      {
        EscenarioId: escenarioId,
        AgenciaId: agenciaId,
      },
      {
        headers: {
          Cookie: "GX_CLIENT_ID=6b58c02d-0340-45bf-bab4-377f4376f5c0",
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error al obtener datos de Moviles:", error);
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

    const response = await http.post(
      "https://overpass-api.de/api/interpreter",
      overpassQuery,
      {
        headers: { "Content-Type": "text/plain" },
      },
    );

    return response.data.elements.map((node) => ({
      name: node.tags.name,
      lat: node.lat,
      lon: node.lon,
      place: node.tags.place,
      departamento,
    }));
  } catch (error) {
    console.error("Error al obtener localidades desde Overpass:", error);
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
    const response = await http.post("/ImportarLocalidades", localidad, {
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

    const response = await http.post(
      "https://overpass-api.de/api/interpreter",
      overpassQuery,
      {
        headers: { "Content-Type": "text/plain" },
      },
    );

    return response.data.elements.map((element) => ({
      name: element.tags.name || "",
      amenity: element.tags.amenity || "",
      official_name: element.tags["official_name"] || "",
      phone: element.tags.phone || "",
      lat: element.lat || element.center?.lat || "",
      lon: element.lon || element.center?.lon || "",
      street: element.tags["addr:street"] || "",
      place:
        element.tags["addr:city"] ||
        element.tags["addr:suburb"] ||
        element.tags["addr:hamlet"] ||
        "",
      housenumber: element.tags["addr:housenumber"] || "",
      branch: element.tags.branch || "",
      departamento,
    }));
  } catch (error) {
    console.error("Error al obtener puntos de interés desde Overpass:", error);
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
    const response = await http.post("/ImportarPtosInteres", poi, {
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
    const response = await http.post("/ImportarCalles", calle, {
      withCredentials: true,
    });
    console.log(`Calle enviada correctamente: ${calle.name}`);
  } catch (error) {
    console.error(`Error al enviar la calle ${calle.name}:`, error);
    throw error;
  }
};

/**
 * Servicio para obtener POIs desde el backend.
 * Endpoint: /ImportarOSM/getPOIs
 * @param {Object} params - Objeto con los parámetros de búsqueda (departamento, ciudad, POIs).
 * @returns {Promise<Array>} Lista de POIs.
 */
export const fetchPOIs = async (params) => {
  console.log("Iniciando fetchPOIs con los siguientes parámetros:", params);

  try {
    const response = await http.post("/getPOIs", params, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("Respuesta recibida de /getPOIs:", response);

    if (response.status !== 200) {
      console.error(
        "Error en la respuesta de /getPOIs, código de estado:",
        response.status,
      );
      throw new Error("Error fetching POIs");
    }

    console.log("Datos obtenidos de /getPOIs:", response.data);
    console.log("Datos obtenidos de /getPOIs 2:", response.data.sdtPOIs);

    return response.data.sdtPOIs || [];
  } catch (error) {
    console.error("Error al obtener POIs en fetchPOIs:", error.message);
    console.error("Detalles del error:", error);
    throw error;
  }
};

/**
 * Servicio para obtener el identificador desde el backend.
 * Endpoint: /ImportarOSM/getIdentificador
 * @param {Object} params - Objeto con los parámetros de búsqueda (Departamento, Ciudad, Calle, Tipo).
 * @returns {Promise<Object>} Identificador correspondiente a los datos enviados.
 */
export const getIdentificador = async (params) => {
  try {
    const response = await http.post("/getIdentificador", params, {
      headers: {
        "Content-Type": "application/json",
        Cookie: "GX_CLIENT_ID=cbf08e02-eb36-4c6b-b019-eda6ae23d7eb",
      },
    });

    console.log("Identificador obtenido correctamente:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error al obtener el identificador:", error.message);
    console.error("Detalles del error:", error);
    throw error;
  }
};

/**
 * Servicio para obtener la latitud y longitud de un punto de interés en un departamento y ciudad.
 * Endpoint: /getPtoInteres
 * @param {number} departamento - ID del departamento
 * @param {number} ciudad - ID de la ciudad
 * @param {string} Calle - Punto de interés a buscar
 * @returns {Promise<{lat: number, lon: number}>} Latitud y longitud del punto de interés
 */
export const getPtoInteres = async (departamento, ciudad, calle) => {
  try {
    const response = await http.post(
      "/getPtoInteres",
      {
        Departamento: departamento,
        Ciudad: ciudad,
        Calle: calle,
      },
      {
        withCredentials: true,
      },
    );
    // Se asume que la API devuelve un objeto con 'lat' y 'long'
    const { lat, lon } = response.data;
    return { lat, lon };
  } catch (error) {
    console.error(
      `Error al obtener coordenadas para DepartamentoId ${departamento}, CiudadId ${ciudad}, PtoInteres ${ptoInteres}:`,
      error,
    );
    throw error;
  }
};

/**
 * Servicio para crear un Punto de Interés (POI).
 * Endpoint: /ImportarOSM/createPOI
 * @param {Object} poiData - Datos del Punto de Interés.
 * @returns {Promise<Object>} Respuesta del servidor.
 */
export const createPOI = async (poiData) => {
  try {
    const response = await http.post(
      "https://www.riogas.uy/puestos2/rest/ImportarOSM/createPOI",
      poiData,
      {
        headers: {
          "Content-Type": "application/json",
          Cookie: "GX_CLIENT_ID=cbf08e02-eb36-4c6b-b019-eda6ae23d7eb",
        },
      },
    );
    console.log("POI creado correctamente:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error al crear el POI:", error.message);
    throw error;
  }
};

/**
 * Servicio para obtener la colección de móviles y sus coordenadas.
 * Endpoint: /ListaCoordenadas (usando el proxy de api2)
 * @returns {Promise<Array>} Lista de móviles con coordenadas
 */
export const getMoviles = async () => {
  try {
    const response = await http.get("/api2/ListaCoordenadas", {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
        Cookie: "GX_CLIENT_ID=f6822eb4-3f36-4384-a124-5f1046709e68", // Ajusta el valor si cambia
      },
    });

    console.log("Datos obtenidos de /api2/ListaCoordenadas:", response.data);
    return response.data || [];
  } catch (error) {
    console.error("Error al obtener móviles:", error.message);
    throw error;
  }
};
