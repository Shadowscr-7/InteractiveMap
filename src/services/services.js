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

// Ejemplo de función para invocar la API ListMoviles
export const getMovilesData = async (escenarioId) => {
    try {
      const response = await http.get('/DatosMapa/ListMoviles', {
        headers: {
          EscenarioId: escenarioId,
          Cookie: 'GX_CLIENT_ID=6b58c02d-0340-45bf-bab4-377f4376f5c0', // Configura la cookie aquí
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener datos de Moviles:', error);
      throw error;
    }
  };