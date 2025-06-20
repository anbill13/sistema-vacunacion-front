import jsonDataService from './jsonDataService';
import authService from './authService';

const usuariosService = {
  async getUsuarios() {
    try {
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const usuarios = jsonDataService.getUsuarios();
      console.log('Usuarios obtenidos:', usuarios);
      return Array.isArray(usuarios) ? usuarios : [usuarios];
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  },

  async getUsuariosPorCentro(centroId) {
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const usuarios = jsonDataService.getUsuariosPorCentro(centroId);
      return usuarios;
    } catch (error) {
      console.error(`Error obteniendo usuarios para centro ${centroId}:`, error);
      return [];
    }
  },

  async getUsuariosPorRol(rol) {
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const usuarios = jsonDataService.getUsuarios();
      return usuarios.filter(usuario => usuario.rol.toLowerCase() === rol.toLowerCase());
    } catch (error) {
      console.error(`Error obteniendo usuarios con rol ${rol}:`, error);
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

  async updateUsuario(userId, datos) {
    try {
      await new Promise(resolve => setTimeout(resolve, 400));
      
      const datosActualizados = {
        ...datos,
        id_usuario: userId,
        fecha_actualizacion: new Date().toISOString()
      };
      
      console.log('Usuario actualizado:', datosActualizados);
      return {
        success: true,
        message: 'Usuario actualizado correctamente',
        data: datosActualizados
      };
    } catch (error) {
      console.error('Error actualizando usuario:', error);
      throw new Error(error.message || 'Error al actualizar usuario');
    }
  },

  async asignarCentrosADoctor(doctorId, centrosIds) {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (!doctorId) {
        throw new Error('ID del doctor es requerido');
      }
      
      // Asegurarse de que centrosIds sea un array
      const centros = Array.isArray(centrosIds) ? centrosIds : [];
      
      console.log(`Asignando centros ${centros.join(', ')} al doctor ${doctorId}`);
      
      return {
        success: true,
        message: 'Centros asignados correctamente',
        data: {
          doctorId,
          centrosAsignados: centros
        }
      };
    } catch (error) {
      console.error('Error al asignar centros al doctor:', error);
      throw new Error(error.message || 'Error al asignar centros');
    }
  },

  async eliminarUsuario(userId) {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      if (!userId) {
        throw new Error('ID del usuario es requerido');
      }
      
      console.log(`Eliminando usuario ${userId}`);
      
      return {
        success: true,
        message: 'Usuario eliminado correctamente'
      };
    } catch (error) {
      console.error('Error eliminando usuario:', error);
      throw new Error(error.message || 'Error al eliminar usuario');
    }
  },

  async buscarUsuarios(termino) {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const usuarios = jsonDataService.getUsuarios();
      const resultados = usuarios.filter(usuario => 
        usuario.nombre.toLowerCase().includes(termino.toLowerCase()) ||
        usuario.username.toLowerCase().includes(termino.toLowerCase()) ||
        usuario.email.toLowerCase().includes(termino.toLowerCase()) ||
        usuario.rol.toLowerCase().includes(termino.toLowerCase())
      );
      
      return resultados;
    } catch (error) {
      console.error('Error buscando usuarios:', error);
      return [];
    }
  },

  async getEstadisticasUsuarios() {
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const usuarios = jsonDataService.getUsuarios();
      const estadisticas = {
        total: usuarios.length,
        activos: usuarios.filter(u => u.estado === 'Activo').length,
        inactivos: usuarios.filter(u => u.estado === 'Inactivo').length,
        administradores: usuarios.filter(u => u.rol === 'Administrador').length,
        doctores: usuarios.filter(u => u.rol === 'Doctor').length,
        enfermeras: usuarios.filter(u => u.rol === 'Enfermera').length,
        directores: usuarios.filter(u => u.rol === 'Director').length
      };
      
      return estadisticas;
    } catch (error) {
      console.error('Error obteniendo estadísticas de usuarios:', error);
      return {
        total: 0,
        activos: 0,
        inactivos: 0,
        administradores: 0,
        doctores: 0,
        enfermeras: 0,
        directores: 0
      };
    }
  }
};

export default usuariosService;