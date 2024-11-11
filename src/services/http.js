// src/services/http.js
import axios from 'axios';

// URL base de tu API (ajústala según sea necesario)
const BASE_URL = 'https://tu-api.com/api';

// Obtener el token JWT del almacenamiento local
const getToken = () => {
  return localStorage.getItem('jwtToken');
};

// Configurar la instancia de Axios
const http = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de solicitud para agregar el token JWT en cada solicitud
http.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de respuesta para manejar errores
http.interceptors.response.use(
  (response) => response,
  (error) => {
    // Manejar el error (p. ej., redirigir al login si el token es inválido)
    if (error.response && error.response.status === 401) {
      // Redireccionar al login u otra acción si el token es inválido
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default http;
