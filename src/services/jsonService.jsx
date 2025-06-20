import apiService from './apiService';
import jsonDataService from './jsonDataService';

const endpointMapping = {
  Centros_Vacunacion: '/api/centers',
  Niños: '/api/children',
  Tutores: '/api/guardians',
  Vacunas: '/api/vaccinations',
  Lotes_Vacunas: '/api/vaccine-batches',
  Dosis_Aplicadas: '/api/vaccinations',
  Usuarios: '/api/users',
  Campañas_Vacunacion: '/api/campaigns',
  Campaña_Centro: '/api/campaign-assignments',
  Citas: '/api/appointments',
  Historial_Vacunacion: '/api/vaccinations',
  Inventario_Suministros: '/api/supplies',
  Suministro_Vacunacion: '/api/supply-acciones',
  Esquema_Vacunacion: '/api/vaccination-schedules',
  Auditoria: '/api/audits',
  Eventos_Adversos: '/api/adverse-events',
  Alertas: '/api/alerts',
};

export const jsonService = {
  async getData(endpoint, method = 'GET', params = {}) {
    // Si estamos en modo demo/local, usar jsonDataService
    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      console.log(`[DEBUG] Usando jsonDataService para ${endpoint}`);
      return jsonDataService.getData(endpoint, method);
    }
    
    try {
      const apiEndpoint = endpointMapping[endpoint] || `/api/${endpoint.toLowerCase()}`;
      let data;
      if (method === 'GET') {
        if (endpoint === 'Citas' && params.id_centro) {
          data = await apiService.get(`/api/appointments/center/${params.id_centro}`);
        } else if (endpoint === 'Reportes') {
          if (params.type === 'coverage' && params.id_centro) {
            data = await apiService.get(`/api/reports/coverage/${params.id_centro}`);
          } else if (params.type === 'pending-appointments' && params.id_niño) {
            data = await apiService.get(`/api/reports/pending-appointments/${params.id_niño}`);
          } else if (params.type === 'expired-batches' && params.id_centro) {
            data = await apiService.get(`/api/reports/expired-batches/${params.id_centro}`);
          } else if (params.type === 'incomplete-schedules' && params.id_niño) {
            data = await apiService.get(`/api/reports/incomplete-schedules/${params.id_niño}`);
          } else {
            throw new Error('Invalid report type or parameters');
          }
        } else if (endpoint === 'Centros_Vacunacion' && params.id) {
          data = await apiService.get(`${apiEndpoint}/${params.id}`);
          console.log(`Fetched center ${params.id}:`, data);
          return data;
        } else {
          data = await apiService.get(apiEndpoint, params);
          console.log(`Fetched ${endpoint} data:`, data);
        }
      } else {
        data = await apiService.get(`${apiEndpoint}/${method.toLowerCase()}`, params);
      }
      // Ensure array for Centros_Vacunacion when not fetching by ID
      if (endpoint === 'Centros_Vacunacion' && !params.id) {
        return Array.isArray(data) ? data : data ? [data] : [];
      }
      return Array.isArray(data) ? data : [data];
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      return []; // Return empty array on error
    }
  },

  async saveData(endpoint, method, data) {
    // Si estamos en modo demo/local, usar jsonDataService
    if (typeof window !== 'undefined' && window.location && window.location.hostname === 'localhost') {
      // Simulación local
      return jsonDataService.saveData(endpoint, method, data);
    }
    try {
      const apiEndpoint = endpointMapping[endpoint] || `/api/${endpoint.toLowerCase()}`;
      let response;
      if (method === 'POST') {
        if (endpoint === 'Usuarios' && data.login) {
          response = await apiService.post('/api/users/login', data);
        } else {
          response = await apiService.post(apiEndpoint, data);
        }
      } else if (method === 'PUT') {
        const idField = getIdField(endpoint);
        const id = data[idField] || data.id;
        response = await apiService.put(`${apiEndpoint}/${id}`, data);
      } else if (method === 'DELETE') {
        const id = typeof data === 'object' ? (data[getIdField(endpoint)] || data.id) : data;
        response = await apiService.delete(`${apiEndpoint}/${id}`);
      } else {
        throw new Error(`Método ${method} no soportado`);
      }
      return response;
    } catch (error) {
      console.error(`Error saving data for ${endpoint}[${method}]:`, error);
      throw error;
    }
  },

  getUIConfig(section, subsection = null) {
    return null;
  },
};

const getIdField = (endpoint) => {
  switch (endpoint) {
    case 'Lotes_Vacunas': return 'id_lote';
    case 'Centros_Vacunacion': return 'id_centro';
    case 'Niños': return 'id_niño';
    case 'Vacunas': return 'id_vacuna';
    case 'Tutores': return 'id_tutor';
    case 'Campañas_Vacunacion': return 'id_campaña';
    case 'Campaña_Centro': return 'id_campaña_centro';
    case 'Citas': return 'id_cita';
    case 'Historial_Vacunacion': return 'id_historial';
    case 'Inventario_Suministros': return 'id_suministro';
    case 'Suministro_Vacunacion': return 'id_suministro_vacunacion';
    case 'Esquema_Vacunacion': return 'id_esquema';
    case 'Auditoria': return 'id_auditoria';
    case 'Eventos_Adversos': return 'id_evento';
    case 'Alertas': return 'id_alerta';
    case 'Usuarios': return 'id_usuario';
    default: return 'id';
  }
};