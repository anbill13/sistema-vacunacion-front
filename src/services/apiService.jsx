import axios from 'axios';
import apiConfig from '../config/apiConfig.jsx';

const apiClient = axios.create({
  baseURL: apiConfig.baseURL,
  timeout: apiConfig.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRedirecting = false;

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      
      // Manejar errores de autenticación
      if (status === 401 && !isRedirecting) {
        isRedirecting = true;
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        setTimeout(() => { isRedirecting = false; }, 1000);
        return Promise.reject(new Error('Su sesión ha expirado. Por favor, inicie sesión nuevamente.'));
      }
      
      // Manejar errores 500 con más detalle
      if (status === 500) {
        console.error('[apiService] Server Error 500:', data);
        if (data?.error && data?.data) {
          return Promise.reject(new Error(`${data.error}: ${data.data}`));
        }
        return Promise.reject(new Error(data?.message || data?.error || 'Error interno del servidor'));
      }
      
      if (status === 200 && data?.code === 403) {
        return Promise.reject(new Error(`Acceso prohibido: ${data.message || 'Sin detalles'}`));
      }
      
      return Promise.reject(new Error(data?.message || data?.error || 'Error en la solicitud al servidor'));
    }
    return Promise.reject(new Error('No se pudo conectar con el servidor'));
  }
);

const apiService = {
  async get(endpoint, params = {}) {
    try {
      const response = await apiClient.get(endpoint, { params });
      return response.data;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  async post(endpoint, data) {
    try {
      console.log(`[apiService] POST ${endpoint}:`, data);
      const response = await apiClient.post(endpoint, data);
      console.log(`[apiService] POST ${endpoint} response:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`[apiService] POST ${endpoint} error:`, error);
      console.error(`[apiService] Error response:`, error.response?.data);
      console.error(`[apiService] Error status:`, error.response?.status);
      
      if (error.response?.data) {
        throw new Error(error.response.data.message || error.response.data.error || 'Error en la solicitud al servidor');
      }
      throw new Error(error.message);
    }
  },

  async put(endpoint, data) {
    try {
      const response = await apiClient.put(endpoint, data);
      return response.data;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  async patch(endpoint, data) {
    try {
      console.log(`[apiService] PATCH ${endpoint}:`, data);
      const response = await apiClient.patch(endpoint, data);
      console.log(`[apiService] PATCH ${endpoint} response:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`[apiService] PATCH ${endpoint} error:`, error);
      console.error(`[apiService] Error response:`, error.response?.data);
      console.error(`[apiService] Error status:`, error.response?.status);
      
      if (error.response?.data) {
        throw new Error(error.response.data.message || error.response.data.error || 'Error en la solicitud al servidor');
      }
      throw new Error(error.message);
    }
  },

  async delete(endpoint) {
    try {
      const response = await apiClient.delete(endpoint);
      return response.data;
    } catch (error) {
      throw new Error(error.message);
    }
  },
};

export default apiService;