import apiService from './apiService';

const authService = {
  async login(username, password) {
    try {
      const response = await apiService.post('/api/users/login', { username, password });
      return response; // Expect { token, user }
    } catch (error) {
      throw new Error(error.message || 'Error al iniciar sesión');
    }
  },

  async register(userData) {
    try {
      const response = await apiService.post('/api/users', userData);
      return response; // Expect { token, user }
    } catch (error) {
      throw new Error(error.message || 'Error al registrarse');
    }
  },
};

export default authService;