// src/services/usuariosService.jsx
import apiService from './apiService.jsx';
import authService from './authService.jsx';

const usuariosService = {
  // Obtener todos los usuarios
  async getUsuarios() {
    try {
      const response = await apiService.get('/api/users');
      console.log('[usuariosService] Get usuarios response:', response);
      
      const usuarios = Array.isArray(response) ? response : [];
      return usuarios.map(u => {
        // Determinar el estado activo de forma más explícita
        let isActive = true; // Por defecto activo
        
        if (u.estado) {
          // Si existe el campo estado, usarlo
          isActive = u.estado === 'Activo';
        } else if (u.active !== undefined) {
          // Si existe el campo active, usarlo
          isActive = u.active === true;
        }
        
        console.log(`[usuariosService] Usuario ${u.nombre || u.name}: estado="${u.estado}", active="${u.active}", isActive="${isActive}"`);
        
        return {
          ...u,
          name: u.nombre || u.name || u.username,
          role: (u.rol || u.role || 'usuario').toLowerCase(),
          rol: (u.rol || u.role || 'usuario').toLowerCase(),
          id: u.id_usuario || u.id,
          active: isActive,
          estado: u.estado || (isActive ? 'Activo' : 'Inactivo')
        };
      });
    } catch (error) {
      console.error('[usuariosService] Error getting usuarios:', error);
      return [];
    }
  },

  // Obtener un usuario por ID
  async getUsuarioById(id) {
    try {
      const response = await apiService.get(`/api/users/${id}`);
      console.log('[usuariosService] Get usuario by ID response:', response);
      
      return {
        ...response,
        name: response.nombre || response.name || response.username,
        role: (response.rol || response.role || 'usuario').toLowerCase(),
        rol: (response.rol || response.role || 'usuario').toLowerCase(),
        id: response.id_usuario || response.id,
        active: response.estado === 'Activo' || response.active !== false
      };
    } catch (error) {
      console.error('[usuariosService] Error getting usuario by ID:', error);
      throw new Error(error.message || 'Error al obtener usuario');
    }
  },

  // Crear un nuevo usuario
  async createUsuario(userData) {
    try {
      // Validaciones básicas antes de enviar
      if (!userData.nombre && !userData.name) {
        throw new Error('El nombre es requerido');
      }
      if (!userData.username) {
        throw new Error('El nombre de usuario es requerido');
      }
      if (!userData.password) {
        throw new Error('La contraseña es requerida');
      }
      if (userData.password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }

      const requestData = {
        nombre: userData.name || userData.nombre,
        username: userData.username,
        password: userData.password,
        rol: userData.role || userData.rol || 'usuario'
      };

      // Solo agregar email si tiene valor
      if (userData.email && userData.email.trim() !== '') {
        requestData.email = userData.email.trim();
      }

      // Solo agregar telefono si tiene valor
      if (userData.telefono && userData.telefono.trim() !== '') {
        requestData.telefono = userData.telefono.trim();
      }

      // Solo agregar id_centro si tiene un valor válido (no null, no undefined, no vacío)
      if (userData.id_centro && userData.id_centro !== null && userData.id_centro !== '') {
        requestData.id_centro = userData.id_centro;
      }
      
      console.log('\n=== CREATE USUARIO SERVICE ===');
      console.log('[usuariosService] Datos recibidos:', userData);
      console.log('[usuariosService] Request data enviado:', requestData);
      console.log('[usuariosService] id_centro final:', requestData.id_centro, typeof requestData.id_centro);
      console.log('==============================\n');
      
      const response = await apiService.post('/api/users', requestData);
      console.log('[usuariosService] Create usuario response:', response);
      
      // El backend devuelve {id_usuario: null} cuando crea exitosamente
      // pero no devuelve los datos completos del usuario
      if (response && (response.id_usuario === null || response.id_usuario)) {
        // Usuario creado exitosamente, devolver los datos que enviamos
        return {
          id: response.id_usuario,
          name: requestData.nombre,
          username: requestData.username,
          role: requestData.rol.toLowerCase(),
          rol: requestData.rol.toLowerCase(),
          email: requestData.email,
          telefono: requestData.telefono,
          id_centro: requestData.id_centro,
          active: true
        };
      }
      
      // Fallback para respuestas completas del backend
      return {
        ...response,
        name: response.nombre || response.name || response.username,
        role: (response.rol || response.role || 'usuario').toLowerCase(),
        rol: (response.rol || response.role || 'usuario').toLowerCase(),
        id: response.id_usuario || response.id,
        active: response.estado === 'Activo' || response.active !== false
      };
    } catch (error) {
      console.error('[usuariosService] Error creating usuario:', error);
      
      // Mejorar el manejo de errores específicos
      let errorMessage = 'Error al crear usuario';
      
      if (error.message) {
        if (error.message.includes('Validación fallida')) {
          errorMessage = 'Los datos ingresados no son válidos. Verifique que todos los campos requeridos estén completos.';
        } else if (error.message.includes('username') || error.message.includes('usuario')) {
          errorMessage = 'El nombre de usuario ya existe. Por favor, elija otro.';
        } else if (error.message.includes('email')) {
          errorMessage = 'El email ya está registrado. Por favor, use otro email.';
        } else if (error.message.includes('servidor') || error.message.includes('conexión')) {
          errorMessage = 'Error de conexión con el servidor. Verifique su conexión a internet.';
        } else {
          errorMessage = error.message;
        }
      }
      
      throw new Error(errorMessage);
    }
  },

  // Actualizar un usuario existente
  async updateUsuario(id, userData) {
    try {
      // Preparar datos para envío
      const updateData = {
        nombre: userData.name || userData.nombre,
        username: userData.username,
        rol: userData.role || userData.rol || 'usuario'
      };

      // Solo agregar password si se proporciona
      if (userData.password && userData.password.trim() !== '') {
        updateData.password = userData.password.trim();
      }

      // Solo agregar email si tiene valor
      if (userData.email && userData.email.trim() !== '') {
        updateData.email = userData.email.trim();
      }

      // Solo agregar telefono si tiene valor
      if (userData.telefono && userData.telefono.trim() !== '') {
        updateData.telefono = userData.telefono.trim();
      }

      // Solo agregar id_centro si tiene un valor válido (no null, no undefined, no vacío)
      if (userData.id_centro && userData.id_centro !== null && userData.id_centro !== '') {
        updateData.id_centro = userData.id_centro;
      }

      // Agregar estado del usuario (activo/inactivo)
      if (userData.active !== undefined) {
        updateData.estado = userData.active ? 'Activo' : 'Inactivo';
      }
      
      console.log('\n=== UPDATE USUARIO SERVICE ===');
      console.log('[usuariosService] ID a actualizar:', id);
      console.log('[usuariosService] Datos recibidos:', userData);
      console.log('[usuariosService] Update data enviado:', updateData);
      console.log('[usuariosService] id_centro final:', updateData.id_centro, typeof updateData.id_centro);
      console.log('[usuariosService] estado final:', updateData.estado);
      console.log('[usuariosService] Campos enviados:', Object.keys(updateData));
      console.log('==============================\n');
      const response = await apiService.put(`/api/users/${id}`, updateData);
      console.log('[usuariosService] Update usuario response:', response);
      
      return {
        ...response,
        name: response.nombre || response.name || response.username,
        role: (response.rol || response.role || 'usuario').toLowerCase(),
        rol: (response.rol || response.role || 'usuario').toLowerCase(),
        id: response.id_usuario || response.id,
        active: response.estado === 'Activo' || response.active !== false
      };
    } catch (error) {
      console.error('[usuariosService] Error updating usuario:', error);
      throw new Error(error.message || 'Error al actualizar usuario');
    }
  },

  // Eliminar un usuario
  async deleteUsuario(id) {
    try {
      const response = await apiService.delete(`/api/users/${id}`);
      console.log('[usuariosService] Delete usuario response:', response);
      return response;
    } catch (error) {
      console.error('[usuariosService] Error deleting usuario:', error);
      throw new Error(error.message || 'Error al eliminar usuario');
    }
  },



  // Activar/Desactivar un usuario usando los endpoints correctos
  async updateUsuarioStatus(id, isActive) {
    try {
      console.log('\n=== UPDATE USUARIO STATUS ===');
      console.log('[usuariosService] ID a actualizar:', id);
      console.log('[usuariosService] Acción:', isActive ? 'ACTIVAR' : 'DESACTIVAR');
      console.log('=============================\n');
      
      let response;
      
      if (isActive) {
        // Activar usuario usando PUT /api/users/{id}/activate
        console.log('[usuariosService] Activando usuario...');
        response = await apiService.put(`/api/users/${id}/activate`);
      } else {
        // Desactivar usuario usando DELETE /api/users/{id}
        console.log('[usuariosService] Desactivando usuario...');
        response = await apiService.delete(`/api/users/${id}`);
      }
      
      console.log('[usuariosService] Response:', response);
      
      // El backend puede devolver respuesta vacía para indicar éxito
      // Devolver una respuesta consistente
      return {
        success: true,
        id: id,
        active: isActive,
        estado: isActive ? 'Activo' : 'Inactivo',
        message: `Usuario ${isActive ? 'activado' : 'desactivado'} correctamente`,
        response: response || 'OK'
      };
      
    } catch (error) {
      console.error('[usuariosService] Error updating usuario status:', error);
      console.error('[usuariosService] Error response data:', error.response?.data);
      console.error('[usuariosService] Error status:', error.response?.status);
      console.error('[usuariosService] Error headers:', error.response?.headers);
      
      // Intentar extraer más información del error
      let errorMessage = 'Error al actualizar estado del usuario';
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        } else if (error.response.data.errors) {
          // Si hay errores de validación específicos
          errorMessage = `Validación fallida: ${JSON.stringify(error.response.data.errors)}`;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  },

  // Guardar usuario (crear o actualizar)
  async saveUsuario(userData) {
    try {
      if (userData.id || userData.id_usuario) {
        // Actualizar usuario existente
        const id = userData.id || userData.id_usuario;
        return await this.updateUsuario(id, userData);
      } else {
        // Crear nuevo usuario
        return await this.createUsuario(userData);
      }
    } catch (error) {
      console.error('[usuariosService] Error saving usuario:', error);
      throw new Error(error.message || 'Error al guardar usuario');
    }
  },

  // Obtener usuarios por centro
  async getUsuariosPorCentro(centroId) {
    try {
      const response = await apiService.get(`/api/users?centroId=${centroId}`);
      console.log('[usuariosService] Get usuarios por centro response:', response);
      
      const usuarios = Array.isArray(response) ? response : [];
      return usuarios.map(u => ({
        ...u,
        name: u.nombre || u.name || u.username,
        role: (u.rol || u.role || 'usuario').toLowerCase(),
        rol: (u.rol || u.role || 'usuario').toLowerCase(),
        id: u.id_usuario || u.id,
        active: u.estado === 'Activo' || u.active !== false
      }));
    } catch (error) {
      console.error('[usuariosService] Error getting usuarios por centro:', error);
      return [];
    }
  },

  // Obtener usuarios por rol
  async getUsuariosPorRol(rol) {
    try {
      const response = await apiService.get(`/api/users?rol=${rol}`);
      console.log('[usuariosService] Get usuarios por rol response:', response);
      
      const usuarios = Array.isArray(response) ? response : [];
      return usuarios.map(u => ({
        ...u,
        name: u.nombre || u.name || u.username,
        role: (u.rol || u.role || 'usuario').toLowerCase(),
        rol: (u.rol || u.role || 'usuario').toLowerCase(),
        id: u.id_usuario || u.id,
        active: u.estado === 'Activo' || u.active !== false
      }));
    } catch (error) {
      console.error('[usuariosService] Error getting usuarios por rol:', error);
      return [];
    }
  },

  // Validar login
  async validateLogin(username, password) {
    try {
      const result = await authService.login(username, password);
      if (result.success) {
        return result.user;
      } else {
        throw new Error(result.error || 'Error de autenticación');
      }
    } catch (error) {
      console.error('[usuariosService] Error validating login:', error);
      throw error;
    }
  },

  // Asignar centro a director
  async asignarCentroADirector(directorId, centro) {
    try {
      const response = await apiService.put(`/api/users/${directorId}`, {
        id_centro: centro.id_centro || centro.id
      });
      console.log('[usuariosService] Assign centro to director response:', response);
      return response;
    } catch (error) {
      console.error('[usuariosService] Error assigning centro to director:', error);
      throw new Error(error.message || 'Error al asignar centro al director');
    }
  },

  // Desasignar centro de director
  async desasignarCentroDeDirector(directorId) {
    try {
      const response = await apiService.put(`/api/users/${directorId}`, {
        id_centro: null
      });
      console.log('[usuariosService] Unassign centro from director response:', response);
      return response;
    } catch (error) {
      console.error('[usuariosService] Error unassigning centro from director:', error);
      throw new Error(error.message || 'Error al desasignar centro del director');
    }
  },

  // Asignar múltiples centros a doctor
  async asignarCentrosADoctor(doctorId, centrosIds) {
    try {
      const response = await apiService.put(`/api/users/${doctorId}`, {
        centrosAsignados: centrosIds
      });
      console.log('[usuariosService] Assign centros to doctor response:', response);
      return response;
    } catch (error) {
      console.error('[usuariosService] Error assigning centros to doctor:', error);
      throw new Error(error.message || 'Error al asignar centros al doctor');
    }
  },

  // Obtener doctores por centro
  async getDoctoresPorCentro(centroId) {
    try {
      const usuarios = await this.getUsuarios();
      return usuarios.filter(u => 
        u.role === 'doctor' && 
        (u.centrosAsignados?.includes(centroId) || u.id_centro === centroId)
      );
    } catch (error) {
      console.error('[usuariosService] Error getting doctores por centro:', error);
      return [];
    }
  }
};

export default usuariosService;
