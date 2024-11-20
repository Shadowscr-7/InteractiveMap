// src/services/services.js
import http from './http';

// Ejemplo de función para iniciar sesión
/*export const login = async (credentials) => {
  try {
    const response = await http.post('/auth/login', credentials);
    // Guardar el token en localStorage
    localStorage.setItem('jwtToken', response.data.token);
    return response.data;
  } catch (error) {
    console.error('Error en el login:', error);
    throw error;
  }
};*/

export const getMovilesData = async (escenarioId, agenciaId) => {
  try {
    // Parámetros enviados en el body
    const response = await http.post('/DatosMapa/ListarMovilesAgencias', {
      EscenarioId: escenarioId, // En el body
      AgenciaId: agenciaId     // En el body
    }, {
      headers: {
        Cookie: 'GX_CLIENT_ID=6b58c02d-0340-45bf-bab4-377f4376f5c0', // Cookie
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener datos de Moviles:', error);
    throw error;
  }
};
