// Usuario administrador hardcodeado
const adminUser = {
  id: 'admin-1',
  username: 'admin',
  password: 'admin123',
  role: 'administrador',
  name: 'Administrador Sistema',
  email: 'admin@sistema.com',
  active: true
};

const USERS_STORAGE_KEY = 'app_users';

export const usuariosService = {

  /**
   * Asigna una lista de centros (array de IDs) a un doctor y persiste el cambio.
   * @param {string} doctorId
   * @param {string[]} centrosIds
   * @returns {object|null} doctor actualizado o null si no existe
   */
  asignarCentrosADoctor(doctorId, centrosIds) {
    try {
      const users = this.getUsuarios().filter(u => u.id !== adminUser.id);
      const doctorIdx = users.findIndex(u => u.id === doctorId);
      if (doctorIdx === -1) return null;
      const doctor = users[doctorIdx];
      doctor.centrosAsignados = Array.isArray(centrosIds) ? [...centrosIds] : [];
      users[doctorIdx] = doctor;
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
      return doctor;
    } catch (error) {
      console.error('Error al asignar centros a doctor:', error);
      return null;
    }
  },

  getUsuarios() {
    try {
      const storedUsers = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY)) || [];
      return [adminUser, ...storedUsers];
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      return [adminUser];
    }
  },

  saveUsuario(newUser) {
    try {
      const users = this.getUsuarios().filter(u => u.id !== adminUser.id);
      const userToSave = {
        ...newUser,
        id: newUser.id || `user-${Date.now()}`,
        active: newUser.active !== undefined ? newUser.active : true
      };

      // Verificar si el usuario ya existe
      const existingUserIndex = users.findIndex(u => u.id === userToSave.id);
      if (existingUserIndex >= 0) {
        users[existingUserIndex] = userToSave;
      } else {
        users.push(userToSave);
      }

      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
      return userToSave;
    } catch (error) {
      console.error('Error al guardar usuario:', error);
      throw error;
    }
  },

  deleteUsuario(userId) {
    try {
      if (userId === adminUser.id) {
        throw new Error('No se puede eliminar el usuario administrador');
      }
      const users = this.getUsuarios().filter(u => u.id !== adminUser.id);
      const updatedUsers = users.filter(u => u.id !== userId);
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
      return true;
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      throw error;
    }
  },

  validateLogin(username, password) {
    // Primero verificamos si es el administrador
    if (username === adminUser.username && password === adminUser.password) {
      return adminUser;
    }
    // Luego buscamos en los usuarios guardados
    const users = this.getUsuarios();
    return users.find(user => 
      user.username === username && 
      user.password === password &&
      user.active
    );
  },

  getUsuarioPorId(userId) {
    if (userId === adminUser.id) {
      return adminUser;
    }
    const users = this.getUsuarios();
    return users.find(user => user.id === userId);
  },

  getCentrosAsignadosADirector(directorId) {
    const director = this.getUsuarioPorId(directorId);
    return director?.centrosAsignados || [];
  },

  getCentroAsignadoADoctor(doctorId) {
    const doctor = this.getUsuarioPorId(doctorId);
    return doctor?.centroTrabajo;
  },

  asignarCentroADirector(directorId, centro) {
    try {
      // Obtener el usuario director
      const users = this.getUsuarios().filter(u => u.id !== adminUser.id);
      const director = users.find(u => u.id === directorId);
      
      if (!director) {
        throw new Error('Director no encontrado');
      }

      // Actualizar centros asignados
      director.centrosAsignados = director.centrosAsignados || [];
      const centroIndex = director.centrosAsignados.findIndex(c => c.id === centro.id);
      
      if (centroIndex >= 0) {
        // Actualizar centro existente
        director.centrosAsignados[centroIndex] = centro;
      } else {
        // Agregar nuevo centro
        director.centrosAsignados.push(centro);
      }

      // Guardar cambios
      const updatedUsers = users.map(u => u.id === directorId ? director : u);
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
      
      return director;
    } catch (error) {
      console.error('Error al asignar centro a director:', error);
      throw error;
    }
  },
};
