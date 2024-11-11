// src/services/services.js
import http from './http';

// Ejemplo de función para iniciar sesión
export const login = async (credentials) => {
  try {
    const response = await http.post('/auth/login', credentials);
    // Guardar el token en localStorage
    localStorage.setItem('jwtToken', response.data.token);
    return response.data;
  } catch (error) {
    console.error('Error en el login:', error);
    throw error;
  }
};

// Ejemplo de función para obtener datos de usuario
export const getUserData = async () => {
  try {
    const response = await http.get('/user/data');
    return response.data;
  } catch (error) {
    console.error('Error al obtener datos de usuario:', error);
    throw error;
  }
};

// Ejemplo de función para realizar otra solicitud GET
export const getSomeData = async () => {
  try {
    const response = await http.get('/some/endpoint');
    return response.data;
  } catch (error) {
    console.error('Error al obtener algunos datos:', error);
    throw error;
  }
};

// Ejemplo de función para realizar una solicitud POST
export const postData = async (data) => {
  try {
    const response = await http.post('/some/endpoint', data);
    return response.data;
  } catch (error) {
    console.error('Error al enviar datos:', error);
    throw error;
  }
};
