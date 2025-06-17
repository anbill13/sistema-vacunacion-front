import apiService from './apiService';
import authService from './authService';

const usuariosService = {
  async getUsuarios() {
    try {
      const users = await apiService.get('/api/users');
      return Array.isArray(users) ? users : [users];
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  },

  async validateLogin(username, password) {
    try {
      const { token, user } = await authService.login(username, password);
      localStorage.setItem('authToken', token);
      return user;
    } catch (error) {
      console.error('Error validating login:', error);
      return null;
    }
  },

  async saveUsuario(user) {
    try {
      const { token, user: savedUser } = await authService.register(user);
      localStorage.setItem('authToken', token);
      return savedUser;
    } catch (error) {
      console.error('Error saving user:', error);
      throw new Error(error.message);
    }
  },
};

export default usuariosService;