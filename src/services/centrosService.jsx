// src/services/centrosService.jsx
import { jsonService } from './jsonService.jsx';

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
      const centros = await jsonService.getData('Centros_Vacunacion', 'GET');
      console.log('Fetched centers in centrosService:', centros);
      return centros.sort((a, b) => a.nombre_centro.localeCompare(b.nombre_centro));
    } catch (error) {
      console.error('Error al obtener centros:', error);
      return [];
    }
  },

  async getCentroById(id) {
    try {
      const centro = await jsonService.getData('Centros_Vacunacion', 'GET', { id });
      if (!centro) {
        throw new Error('Centro no encontrado');
      }
      console.log('Fetched center by ID:', centro);
      return centro;
    } catch (error) {
      console.error(`Error al obtener centro con ID ${id}:`, error);
      throw error;
    }
  },

  async saveCentro(centro) {
    try {
      if (!centro.nombre_centro || !centro.direccion || !centro.latitud || !centro.longitud) {
        throw new Error('El nombre del centro, la dirección, la latitud y la longitud son obligatorios');
      }

      const centroData = {
        ...centro,
        updated_at: new Date().toISOString(),
        created_at: centro.id_centro ? centro.created_at : new Date().toISOString(),
        id_centro: centro.id_centro || `centro-${Date.now()}-${Math.floor(Math.random() * 10000)}`
      };

      const method = centro.id_centro ? 'PUT' : 'POST';
      const response = await jsonService.saveData('Centros_Vacunacion', method, centroData);

      return {
        success: true,
        id_centro: centroData.id_centro,
        message: method === 'POST' ? 'Center created' : 'Center updated'
      };
    } catch (error) {
      console.error('Error al guardar centro:', error);
      throw error;
    }
  },

  async deleteCentro(centroId) {
    try {
      if (!centroId) {
        throw new Error('ID del centro es requerido');
      }

      await jsonService.saveData('Centros_Vacunacion', 'DELETE', centroId);
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