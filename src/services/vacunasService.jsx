import { jsonService } from './jsonService.jsx';

export const vacunasService = {
  getVacunas() {
    return jsonService.getData('Vacunas', 'GET') || [];
  },

  getLotes() {
    return jsonService.getData('Lotes_Vacunas', 'GET') || [];
  },

  getDosisAplicadas() {
    return jsonService.getData('Dosis_Aplicadas', 'GET') || [];
  },

  getHistorialVacunas(ninoId) {
    const dosisAplicadas = this.getDosisAplicadas();
    const historial = dosisAplicadas.filter(dosis => dosis.id_niño === ninoId);
    
    return historial.map(dosis => {
      const lote = this.getLotes().find(l => l.id_lote === dosis.id_lote);
      const vacuna = this.getVacunas().find(v => v.id_vacuna === lote?.id_vacuna);
      return {
        ...dosis,
        nombre_vacuna: vacuna?.nombre_vacuna || 'Desconocida',
        fabricante: vacuna?.fabricante || 'Desconocido',
        numero_lote: lote?.numero_lote || 'N/A',
        fecha_vencimiento: lote?.fecha_vencimiento || null
      };
    });
  },

  getVacunasFaltantes(ninoId) {
    const historial = this.getHistorialVacunas(ninoId);
    const vacunasAplicadas = historial.map(h => h.id_vacuna);
    const todasLasVacunas = this.getVacunas();
    
    return todasLasVacunas.filter(vacuna => !vacunasAplicadas.includes(vacuna.id_vacuna));
  }
};
