// src/services/vacunasService.jsx
import apiService from './apiService.jsx';

export const vacunasService = {
  // Obtener todas las vacunas
  async getVacunas() {
    try {
      const response = await apiService.get('/api/vaccines');
      console.log('[vacunasService] Get vacunas response:', response);
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('[vacunasService] Error getting vacunas:', error);
      return [];
    }
  },

  // Obtener una vacuna por ID
  async getVacunaById(id) {
    try {
      const response = await apiService.get(`/api/vaccines/${id}`);
      console.log('[vacunasService] Get vacuna by ID response:', response);
      return response;
    } catch (error) {
      console.error('[vacunasService] Error getting vacuna by ID:', error);
      throw new Error(error.message || 'Error al obtener vacuna');
    }
  },

  // Crear una nueva vacuna
  async createVacuna(vacunaData) {
    try {
      const response = await apiService.post('/api/vaccines', {
        nombre: vacunaData.nombre_vacuna || vacunaData.nombre,
        fabricante: vacunaData.fabricante,
        tipo: vacunaData.tipo,
        dosis_requeridas: parseInt(vacunaData.dosis_requeridas) || 1,
        intervalo_dosis: parseInt(vacunaData.intervalo_dosis) || 0,
        edad_minima: parseInt(vacunaData.edad_minima) || 0,
        edad_maxima: parseInt(vacunaData.edad_maxima) || 100,
        descripcion: vacunaData.descripcion || null
      });
      console.log('[vacunasService] Create vacuna response:', response);
      return response;
    } catch (error) {
      console.error('[vacunasService] Error creating vacuna:', error);
      throw new Error(error.message || 'Error al crear vacuna');
    }
  },

  // Actualizar una vacuna existente
  async updateVacuna(id, vacunaData) {
    try {
      const response = await apiService.put(`/api/vaccines/${id}`, {
        nombre: vacunaData.nombre_vacuna || vacunaData.nombre,
        fabricante: vacunaData.fabricante,
        tipo: vacunaData.tipo,
        dosis_requeridas: parseInt(vacunaData.dosis_requeridas) || 1,
        intervalo_dosis: parseInt(vacunaData.intervalo_dosis) || 0,
        edad_minima: parseInt(vacunaData.edad_minima) || 0,
        edad_maxima: parseInt(vacunaData.edad_maxima) || 100,
        descripcion: vacunaData.descripcion || null
      });
      console.log('[vacunasService] Update vacuna response:', response);
      return response;
    } catch (error) {
      console.error('[vacunasService] Error updating vacuna:', error);
      throw new Error(error.message || 'Error al actualizar vacuna');
    }
  },

  // Eliminar una vacuna
  async deleteVacuna(id) {
    try {
      const response = await apiService.delete(`/api/vaccines/${id}`);
      console.log('[vacunasService] Delete vacuna response:', response);
      return response;
    } catch (error) {
      console.error('[vacunasService] Error deleting vacuna:', error);
      throw new Error(error.message || 'Error al eliminar vacuna');
    }
  },

  // Guardar vacuna (crear o actualizar)
  async saveVacuna(vacunaData) {
    try {
      if (vacunaData.id_vacuna) {
        // Actualizar vacuna existente
        return await this.updateVacuna(vacunaData.id_vacuna, vacunaData);
      } else {
        // Crear nueva vacuna
        return await this.createVacuna(vacunaData);
      }
    } catch (error) {
      console.error('[vacunasService] Error saving vacuna:', error);
      throw new Error(error.message || 'Error al guardar vacuna');
    }
  },

  // Obtener lotes de vacunas
  async getLotes() {
    try {
      const response = await apiService.get('/api/vaccine-lots');
      console.log('[vacunasService] Get lotes response:', response);
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('[vacunasService] Error getting lotes:', error);
      return [];
    }
  },

  // Crear un nuevo lote
  async createLote(loteData) {
    try {
      const response = await apiService.post('/api/vaccine-lots', {
        id_vacuna: loteData.id_vacuna,
        numero_lote: loteData.numero_lote,
        fecha_fabricacion: loteData.fecha_fabricacion,
        fecha_vencimiento: loteData.fecha_vencimiento,
        cantidad_dosis: parseInt(loteData.cantidad_dosis) || 0,
        temperatura_almacenamiento: loteData.temperatura_almacenamiento || null,
        id_centro: loteData.id_centro || null
      });
      console.log('[vacunasService] Create lote response:', response);
      return response;
    } catch (error) {
      console.error('[vacunasService] Error creating lote:', error);
      throw new Error(error.message || 'Error al crear lote');
    }
  },

  // Actualizar un lote existente
  async updateLote(id, loteData) {
    try {
      const response = await apiService.put(`/api/vaccine-lots/${id}`, {
        id_vacuna: loteData.id_vacuna,
        numero_lote: loteData.numero_lote,
        fecha_fabricacion: loteData.fecha_fabricacion,
        fecha_vencimiento: loteData.fecha_vencimiento,
        cantidad_dosis: parseInt(loteData.cantidad_dosis) || 0,
        temperatura_almacenamiento: loteData.temperatura_almacenamiento || null,
        id_centro: loteData.id_centro || null
      });
      console.log('[vacunasService] Update lote response:', response);
      return response;
    } catch (error) {
      console.error('[vacunasService] Error updating lote:', error);
      throw new Error(error.message || 'Error al actualizar lote');
    }
  },

  // Eliminar un lote
  async deleteLote(id) {
    try {
      const response = await apiService.delete(`/api/vaccine-lots/${id}`);
      console.log('[vacunasService] Delete lote response:', response);
      return response;
    } catch (error) {
      console.error('[vacunasService] Error deleting lote:', error);
      throw new Error(error.message || 'Error al eliminar lote');
    }
  },

  // Guardar lote (crear o actualizar)
  async saveLote(loteData) {
    try {
      if (loteData.id_lote) {
        // Actualizar lote existente
        return await this.updateLote(loteData.id_lote, loteData);
      } else {
        // Crear nuevo lote
        return await this.createLote(loteData);
      }
    } catch (error) {
      console.error('[vacunasService] Error saving lote:', error);
      throw new Error(error.message || 'Error al guardar lote');
    }
  },

  // Obtener historial de vacunación
  async getHistorialVacunas(ninoId) {
    try {
      const response = await apiService.get(`/api/vaccination-history?childId=${ninoId}`);
      console.log('[vacunasService] Get historial response:', response);
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('[vacunasService] Error getting historial:', error);
      return [];
    }
  },

  // Obtener dosis aplicadas
  async getDosisAplicadas() {
    try {
      const response = await apiService.get('/api/vaccination-history');
      console.log('[vacunasService] Get dosis aplicadas response:', response);
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('[vacunasService] Error getting dosis aplicadas:', error);
      return [];
    }
  },

  // Aplicar vacuna
  async aplicarVacuna(datos) {
    try {
      const response = await apiService.post('/api/vaccination-history', {
        id_nino: datos.id_nino,
        id_vacuna: datos.id_vacuna,
        id_lote: datos.id_lote,
        fecha_aplicacion: datos.fecha_aplicacion || new Date().toISOString().split('T')[0],
        id_centro: datos.id_centro,
        id_usuario: datos.id_usuario || null,
        notas: datos.notas || null
      });
      console.log('[vacunasService] Apply vacuna response:', response);
      return response;
    } catch (error) {
      console.error('[vacunasService] Error applying vacuna:', error);
      throw new Error(error.message || 'Error al aplicar vacuna');
    }
  },

  // Obtener lotes por centro
  async getLotesPorCentro(centroId) {
    try {
      const response = await apiService.get(`/api/vaccine-lots?centerId=${centroId}`);
      console.log('[vacunasService] Get lotes por centro response:', response);
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('[vacunasService] Error getting lotes por centro:', error);
      return [];
    }
  },

  // Obtener campañas de vacunación
  async getCampanasVacunacion() {
    try {
      const response = await apiService.get('/api/campaigns');
      console.log('[vacunasService] Get campañas response:', response);
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('[vacunasService] Error getting campañas:', error);
      return [];
    }
  }
};
