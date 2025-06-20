import jsonDataService from './jsonDataService';

export const vacunasService = {
  async getVacunas() {
    try {
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 200));
      return jsonDataService.getVacunas() || [];
    } catch (error) {
      console.error('Error obteniendo vacunas:', error);
      return [];
    }
  },

  async getLotes() {
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      return jsonDataService.getLotesVacunas() || [];
    } catch (error) {
      console.error('Error obteniendo lotes:', error);
      return [];
    }
  },

  async getDosisAplicadas() {
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      return jsonDataService.getDosisAplicadas() || [];
    } catch (error) {
      console.error('Error obteniendo dosis aplicadas:', error);
      return [];
    }
  },

  async getHistorialVacunas(ninoId) {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const historial = jsonDataService.getHistorialPorNino(ninoId);
      const vacunas = jsonDataService.getVacunas();
      const lotes = jsonDataService.getLotesVacunas();
      
      return historial.map(h => {
        const lote = lotes.find(l => l.id_lote === h.id_lote);
        const vacuna = vacunas.find(v => v.id_vacuna === h.id_vacuna);
        return {
          ...h,
          nombre_vacuna: vacuna?.nombre_vacuna || 'Desconocida',
          fabricante: vacuna?.fabricante || 'Desconocido',
          numero_lote: lote?.numero_lote || 'N/A',
          fecha_vencimiento: lote?.fecha_vencimiento || null,
          vacuna: vacuna,
          lote: lote
        };
      });
    } catch (error) {
      console.error(`Error obteniendo historial para niño ${ninoId}:`, error);
      return [];
    }
  },

  async getVacunasFaltantes(ninoId) {
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const historial = await this.getHistorialVacunas(ninoId);
      const vacunasAplicadas = historial.map(h => h.id_vacuna);
      const todasLasVacunas = jsonDataService.getVacunas();
      
      return todasLasVacunas.filter(vacuna => !vacunasAplicadas.includes(vacuna.id_vacuna));
    } catch (error) {
      console.error(`Error obteniendo vacunas faltantes para niño ${ninoId}:`, error);
      return [];
    }
  },

  async getLotesPorCentro(centroId) {
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const lotes = jsonDataService.getLotesPorCentro(centroId);
      const vacunas = jsonDataService.getVacunas();
      
      return lotes.map(lote => {
        const vacuna = vacunas.find(v => v.id_vacuna === lote.id_vacuna);
        return {
          ...lote,
          nombre_vacuna: vacuna?.nombre_vacuna || 'Desconocida',
          fabricante: vacuna?.fabricante || 'Desconocido',
          vacuna: vacuna
        };
      });
    } catch (error) {
      console.error(`Error obteniendo lotes para centro ${centroId}:`, error);
      return [];
    }
  },

  async getCampanasVacunacion() {
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const campanas = jsonDataService.getCampanasVacunacion();
      const vacunas = jsonDataService.getVacunas();
      
      return campanas.map(campana => {
        const vacuna = vacunas.find(v => v.id_vacuna === campana.id_vacuna);
        return {
          ...campana,
          nombre_vacuna: vacuna?.nombre_vacuna || 'Desconocida',
          vacuna: vacuna
        };
      });
    } catch (error) {
      console.error('Error obteniendo campañas de vacunación:', error);
      return [];
    }
  },

  async aplicarVacuna(datos) {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const nuevaAplicacion = {
        id_historial: `550e8400-e29b-41d4-a716-${Date.now().toString(16)}`,
        ...datos,
        fecha_aplicacion: new Date().toISOString().split('T')[0],
        fecha_creacion: new Date().toISOString(),
        fecha_actualizacion: new Date().toISOString()
      };
      
      console.log('Aplicación de vacuna registrada:', nuevaAplicacion);
      return { success: true, data: nuevaAplicacion };
    } catch (error) {
      console.error('Error aplicando vacuna:', error);
      throw error;
    }
  },

  async actualizarLote(loteId, datos) {
    try {
      await new Promise(resolve => setTimeout(resolve, 400));
      
      const datosActualizados = {
        ...datos,
        id_lote: loteId,
        fecha_actualizacion: new Date().toISOString()
      };
      
      console.log('Lote actualizado:', datosActualizados);
      return { success: true, data: datosActualizados };
    } catch (error) {
      console.error('Error actualizando lote:', error);
      throw error;
    }
  }
};
