// src/services/tutorsService.jsx
import apiService from './apiService.jsx';

const tutorsService = {
  // Crear un nuevo tutor
  async createTutor(tutorData) {
    try {
      console.log('[tutorsService] Creating tutor with raw data:', tutorData);
      
      // Formatear los datos exactamente según el formato requerido por el backend
      const formattedData = {
        id_niño: null, // Siempre null para el registro inicial de padres
        nombre: tutorData.nombre || tutorData.name || null,
        relacion: (tutorData.relacion || 'Madre').toLowerCase(), // Convertir a minúsculas
        nacionalidad: tutorData.nacionalidad || 'Dominicano',
        identificacion: tutorData.identificacion || tutorData.cedula || null,
        telefono: tutorData.telefono || null,
        email: tutorData.email || null,
        direccion: tutorData.direccion || null,
        username: tutorData.username || null, // Incluir username
        password: tutorData.password || null  // Incluir password
      };

      // Eliminar campos vacíos y convertir a null (excepto id_niño, username y password)
      Object.keys(formattedData).forEach(key => {
        if (!['id_niño', 'username', 'password'].includes(key) && (formattedData[key] === '' || formattedData[key] === undefined)) {
          formattedData[key] = null;
        }
      });

      console.log('[tutorsService] Formatted data to send (debe coincidir con el formato requerido):');
      console.log(JSON.stringify(formattedData, null, 2));
      
      // Verificar campos críticos
      console.log('[tutorsService] ===== VERIFICACIÓN FINAL DEL FORMATO =====');
      console.log('✓ Campo id_niño presente:', 'id_niño' in formattedData);
      console.log('✓ Valor id_niño:', formattedData.id_niño);
      console.log('✓ id_niño es null:', formattedData.id_niño === null);
      console.log('✓ Campo username presente:', 'username' in formattedData);
      console.log('✓ Valor username:', formattedData.username);
      console.log('✓ Campo password presente:', 'password' in formattedData);
      console.log('✓ Valor password:', formattedData.password ? '***PRESENTE***' : '***AUSENTE***');
      console.log('[tutorsService] ===== FIN VERIFICACIÓN =====');
      
      // Verificar que el formato coincida exactamente con el ejemplo
      const expectedFormat = {
        "id_niño": null,
        "nombre": "María Rodríguez",
        "relacion": "madre", 
        "nacionalidad": "Dominicano",
        "identificacion": "001-1234567-8",
        "telefono": "809-555-1234",
        "email": "maria.rodriguez@example.com",
        "direccion": "Calle 1, La Romana",
        "username": "maria_rodriguez",
        "password": "password123"
      };
      
      console.log('[tutorsService] Formato esperado:');
      console.log(JSON.stringify(expectedFormat, null, 2));
      
      const response = await apiService.post('/api/tutors', formattedData);
      console.log('[tutorsService] Create tutor response:', response);
      
      return response;
    } catch (error) {
      console.error('[tutorsService] Error creating tutor:', error);
      throw new Error(error.message || 'Error al crear tutor');
    }
  },

  // Obtener todos los tutores
  async getTutors() {
    try {
      const response = await apiService.get('/api/tutors');
      console.log('[tutorsService] Get tutors response:', response);
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('[tutorsService] Error getting tutors:', error);
      return [];
    }
  },

  // Obtener tutor por ID
  async getTutorById(id) {
    try {
      const response = await apiService.get(`/api/tutors/${id}`);
      console.log('[tutorsService] Get tutor by ID response:', response);
      return response;
    } catch (error) {
      console.error('[tutorsService] Error getting tutor by ID:', error);
      throw new Error(error.message || 'Error al obtNo ener tutor');
    }
  },

  // Actualizar tutor
  async updateTutor(id, tutorData) {
    try {
      console.log('[tutorsService] Updating tutor with data:', tutorData);
      
      // Formatear los datos según el formato requerido por el backend
      const formattedData = {
        id_niño: tutorData.id_niño || null,
        nombre: tutorData.nombre || tutorData.name,
        relacion: tutorData.relacion ? tutorData.relacion.toLowerCase() : null,
        nacionalidad: tutorData.nacionalidad,
        identificacion: tutorData.identificacion || null,
        telefono: tutorData.telefono || null,
        email: tutorData.email || null,
        direccion: tutorData.direccion || null
      };

      // Eliminar campos vacíos y convertir a null
      Object.keys(formattedData).forEach(key => {
        if (formattedData[key] === '' || formattedData[key] === undefined) {
          formattedData[key] = null;
        }
      });

      console.log('[tutorsService] Formatted data to send:', formattedData);

      const response = await apiService.put(`/api/tutors/${id}`, formattedData);
      console.log('[tutorsService] Update tutor response:', response);
      
      return response;
    } catch (error) {
      console.error('[tutorsService] Error updating tutor:', error);
      throw new Error(error.message || 'Error al actualizar tutor');
    }
  },

  // Eliminar tutor
  async deleteTutor(id) {
    try {
      const response = await apiService.delete(`/api/tutors/${id}`);
      console.log('[tutorsService] Delete tutor response:', response);
      return response;
    } catch (error) {
      console.error('[tutorsService] Error deleting tutor:', error);
      throw new Error(error.message || 'Error al eliminar tutor');
    }
  },

  // Obtener hijos de un tutor específico
  async getChildrenByTutor(tutorId) {
    try {
      console.log(`[tutorsService] Getting children for tutor: ${tutorId} using dedicated endpoint.`);
      
      // Usar el endpoint específico del backend: /api/tutors/{id}/children
      const childrenResponse = await apiService.get(`/api/tutors/${tutorId}/children`);
      
      // El backend debe devolver un array. Si no, es una respuesta inesperada.
      if (!Array.isArray(childrenResponse)) {
        console.warn(`[tutorsService] Unexpected response format for tutor ${tutorId}. Expected array, got:`, childrenResponse);
        // Devolver un array vacío para evitar que la UI se rompa, pero registrar el aviso.
        return [];
      }

      console.log(`[tutorsService] Found ${childrenResponse.length} children for tutor ${tutorId}:`, childrenResponse);
      
      // Formatear la respuesta para mantener consistencia.
      const formattedChildren = childrenResponse.map(child => ({
        ...child,
        tutor_relation: child.tutor_relation || {
          id_tutor: tutorId,
          relacion: child.relacion || 'Tutor',
          tipo_relacion: 'TutorLegal'
        }
      }));
      
      return formattedChildren;
      
    } catch (error) {
      console.error(`[tutorsService] Error getting children for tutor ${tutorId}:`, error);

      // Si el error indica que el tutor no existe (mensaje de la API) o es un 404,
      // es seguro asumir que no hay hijos y devolver un array vacío.
      if (error.message && (error.message.includes('El tutor especificado no existe') || error.message.includes('404'))) {
        console.log(`[tutorsService] Tutor ${tutorId} not found or has no children. Returning empty array.`);
        return [];
      }
      
      // Para otros errores (500, CORS, red), relanzar el error para que sea manejado en la UI.
      // Esto permite mostrar mensajes de error más específicos al usuario.
      throw new Error(error.message || `Error al obtener los hijos del tutor. Por favor, revise su conexión o intente más tarde.`);
    }
  }
};

export default tutorsService;
