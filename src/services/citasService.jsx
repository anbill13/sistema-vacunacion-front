// src/services/citasService.jsx
import apiService from './apiService.jsx';
import jsonDataService from './jsonDataService.jsx';

const citasService = {
  // Obtener todas las citas
  async getCitas() {
    try {
      // Intentar obtener desde API primero
      const response = await apiService.get('/api/citas');
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.log('[citasService] API no disponible, usando datos locales');
      // Fallback a datos locales
      return jsonDataService.getCitas();
    }
  },

  // Obtener citas por centro
  async getCitasPorCentro(centroId) {
    try {
      const citas = await this.getCitas();
      return citas.filter(cita => cita.id_centro === centroId);
    } catch (error) {
      console.error('[citasService] Error getting citas por centro:', error);
      return [];
    }
  },

  // Obtener citas por doctor (basado en centros asignados)
  async getCitasPorDoctor(doctorId, centrosAsignados = []) {
    try {
      const citas = await this.getCitas();
      return citas.filter(cita => 
        centrosAsignados.includes(cita.id_centro) ||
        cita.id_doctor === doctorId
      );
    } catch (error) {
      console.error('[citasService] Error getting citas por doctor:', error);
      return [];
    }
  },

  // Obtener cita por ID
  async getCitaById(citaId) {
    try {
      const response = await apiService.get(`/api/citas/${citaId}`);
      return response;
    } catch (error) {
      console.log('[citasService] API no disponible, usando datos locales');
      const citas = jsonDataService.getCitas();
      return citas.find(cita => cita.id_cita === citaId);
    }
  },

  // Crear nueva cita
  async createCita(citaData) {
    try {
      const response = await apiService.post('/api/citas', citaData);
      return response;
    } catch (error) {
      console.error('[citasService] Error creating cita:', error);
      throw new Error(error.message || 'Error al crear la cita');
    }
  },

  // Actualizar cita existente
  async updateCita(citaId, citaData) {
    try {
      const response = await apiService.put(`/api/citas/${citaId}`, citaData);
      return response;
    } catch (error) {
      console.error('[citasService] Error updating cita:', error);
      throw new Error(error.message || 'Error al actualizar la cita');
    }
  },

  // Eliminar cita
  async deleteCita(citaId) {
    try {
      const response = await apiService.delete(`/api/citas/${citaId}`);
      return response;
    } catch (error) {
      console.error('[citasService] Error deleting cita:', error);
      throw new Error(error.message || 'Error al eliminar la cita');
    }
  },

  // Cambiar estado de cita
  async cambiarEstadoCita(citaId, nuevoEstado) {
    try {
      const response = await apiService.put(`/api/citas/${citaId}`, {
        estado: nuevoEstado
      });
      return response;
    } catch (error) {
      console.error('[citasService] Error changing cita estado:', error);
      throw new Error(error.message || 'Error al cambiar el estado de la cita');
    }
  },

  // Reprogramar cita
  async reprogramarCita(citaId, nuevaFecha, observaciones = '') {
    try {
      const response = await apiService.put(`/api/citas/${citaId}`, {
        fecha_cita: nuevaFecha,
        observaciones: observaciones,
        estado: 'Reprogramada'
      });
      return response;
    } catch (error) {
      console.error('[citasService] Error reprogramming cita:', error);
      throw new Error(error.message || 'Error al reprogramar la cita');
    }
  }
};

export default citasService;