import jsonDataService from './jsonDataService';

const authService = {
  async login(username, password) {
    try {
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const user = jsonDataService.authenticate(username, password);
      
      if (user) {
        // Simular token
        const token = `token_${user.id}_${Date.now()}`;
        return { 
          token, 
          user: {
            ...user,
            token
          }
        };
      } else {
        throw new Error('Credenciales inválidas');
      }
    } catch (error) {
      throw new Error(error.message || 'Error al iniciar sesión');
    }
  },

  async register(userData) {
    try {
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 500));
      // Guardar en memoria si estamos en modo demo/local
      if (typeof window !== 'undefined' && window.location && window.location.hostname === 'localhost') {
        const newUser = {
          id_usuario: `nuevo_${Date.now()}`,
          nombre: userData.nombre,
          rol: userData.rol || userData.role || 'usuario',
          role: (userData.rol || userData.role || 'usuario').toLowerCase(),
          email: userData.email,
          telefono: userData.telefono,
          username: userData.username,
          estado: 'Activo',
          id_centro: userData.id_centro || null
        };
        jsonDataService.saveData('Usuarios', 'POST', newUser);
        const token = `token_${newUser.id_usuario}_${Date.now()}`;
        return { token, user: { ...newUser, token } };
      }
      // En un sistema real, aquí se agregaría el usuario al JSON o base de datos
      // Por ahora solo simulamos que se registra correctamente
      const newUser = {
        id: `nuevo_${Date.now()}`,
        nombre: userData.nombre,
        rol: userData.rol || 'usuario',
        role: userData.rol || 'usuario',
        email: userData.email,
        telefono: userData.telefono,
        username: userData.username,
        estado: 'Activo'
      };
      
      const token = `token_${newUser.id}_${Date.now()}`;
      
      return { 
        token, 
        user: {
          ...newUser,
          token
        }
      };
    } catch (error) {
      throw new Error(error.message || 'Error al registrarse');
    }
  },

  // Usuarios predefinidos para pruebas rápidas
  getTestUsers() {
    return [
      { username: 'juanadmin', password: 'hashed_password_123', rol: 'administrador' },
      { username: 'mariaenf', password: 'hashed_password_456', rol: 'doctor' },
      { username: 'pedrodig', password: 'hashed_password_789', rol: 'director' },
      { username: 'anasup', password: 'hashed_password_101', rol: 'padre' }
    ];
  }
};

export default authService;