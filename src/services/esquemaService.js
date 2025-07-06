// Servicio para obtener el esquema de vacunación desde el API
import apiService from './apiService';

export async function getEsquemaVacunacion() {
  try {
    const response = await apiService.get('/api/vaccination-schedules');
    return Array.isArray(response) ? response : [];
  } catch (error) {
    console.error('[esquemaService] Error getting vaccination schedules:', error);
    return [];
  }
}
