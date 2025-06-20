// src/services/centrosService.jsx
import jsonDataService from './jsonDataService';

export const provinciasRD = [
  "Azua", "Bahoruco", "Barahona", "Dajabón", "Distrito Nacional", "Duarte", "Elías Piña",
  "El Seibo", "Espaillat", "Hato Mayor", "Hermanas Mirabal", "Independencia", "La Altagracia",
  "La Romana", "La Vega", "María Trinidad Sánchez", "Monseñor Nouel", "Monte Cristi",
  "Monte Plata", "Pedernales", "Peravia", "Puerto Plata", "Samaná", "San Cristóbal",
  "San José de Ocoa", "San Juan", "San Pedro de Macorís", "Sánchez Ramírez", "Santiago",
  "Santiago Rodríguez", "Santo Domingo", "Valverde"
];

export const sectoresRD = [
  "Salud Pública", "Privado", "ONG", "Militar", "Educativo"
];

export const centrosService = {
  async getCentros() {
    try {
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const centros = jsonDataService.getCentrosConDatos();
      console.log('Fetched centers in centrosService:', centros);
      return centros.sort((a, b) => a.nombre_centro.localeCompare(b.nombre_centro));
    } catch (error) {
      console.error('Error al obtener centros:', error);
      return [];
    }
  },

  async getCentroById(id) {
    try {
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const centro = jsonDataService.getCentroById(id);
      if (!centro) {
        throw new Error('Centro no encontrado');
      }
      
      // Agregar datos adicionales
      const ninos = jsonDataService.getNinos().filter(n => n.id_centro_salud === id);
      const usuarios = jsonDataService.getUsuariosPorCentro(id);
      const lotes = jsonDataService.getLotesPorCentro(id);
      
      const centroCompleto = {
        ...centro,
        totalPacientes: ninos.length,
        pacientes: ninos,
        usuarios: usuarios,
        lotes: lotes
      };
      
      console.log('Fetched center by ID:', centroCompleto);
      return centroCompleto;
    } catch (error) {
      console.error(`Error al obtener centro con ID ${id}:`, error);
      throw error;
    }
  },

  async saveCentro(centro) {
    try {
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (!centro.nombre_centro || !centro.direccion || !centro.latitud || !centro.longitud) {
        throw new Error('El nombre del centro, la dirección, la latitud y la longitud son obligatorios');
      }

      const centroData = {
        ...centro,
        fecha_actualizacion: new Date().toISOString(),
        fecha_creacion: centro.id_centro ? centro.fecha_creacion : new Date().toISOString(),
        id_centro: centro.id_centro || `550e8400-e29b-41d4-a716-${Date.now().toString(16)}`
      };

      // En una implementación real, aquí se guardaría en el JSON o base de datos
      console.log('Guardando centro:', centroData);

      return {
        success: true,
        id_centro: centroData.id_centro,
        message: centro.id_centro ? 'Centro actualizado' : 'Centro creado'
      };
    } catch (error) {
      console.error('Error al guardar centro:', error);
      throw error;
    }
  },

  async deleteCentro(centroId) {
    try {
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 300));
      
      if (!centroId) {
        throw new Error('ID del centro es requerido');
      }

      // En una implementación real, aquí se eliminaría del JSON o base de datos
      console.log('Eliminando centro:', centroId);
      
      return { success: true, message: 'Centro eliminado' };
    } catch (error) {
      console.error('Error al eliminar centro:', error);
      throw error;
    }
  },

  filterCentros(centros, filterTerm, filterType) {
    // Ensure centros is an array
    const centrosData = Array.isArray(centros) ? centros : [];
    console.log('Filtering centers:', centrosData, 'Filter term:', filterTerm, 'Filter type:', filterType);

    if (!filterTerm || filterTerm.trim() === "") {
      return centrosData;
    }

    const term = filterTerm.toLowerCase();

    switch (filterType) {
      case "provincia":
        return centrosData.filter(centro => 
          centro.direccion && centro.direccion.toLowerCase().includes(term)
        );
      case "sector":
        return centrosData.filter(centro => 
          centro.nombre_centro && centro.nombre_centro.toLowerCase().includes(term)
        );
      case "director":
        return centrosData.filter(centro => 
          centro.director && centro.director.toLowerCase().includes(term)
        );
      default:
        return centrosData.filter(centro => 
          (centro.nombre_centro && centro.nombre_centro.toLowerCase().includes(term)) ||
          (centro.direccion && centro.direccion.toLowerCase().includes(term)) ||
          (centro.director && centro.director.toLowerCase().includes(term)) ||
          (centro.telefono && centro.telefono.toLowerCase().includes(term))
        );
    }
  },

  getFilterOptions(filterType, centros) {
    const centrosData = Array.isArray(centros) ? centros : [];
    
    switch (filterType) {
      case "provincia":
        return provinciasRD;
      case "sector":
        return sectoresRD;
      case "director":
        const directores = [...new Set(
          centrosData
            .filter(centro => centro.director)
            .map(centro => centro.director)
        )];
        return directores.sort();
      default:
        return [];
    }
  }
};