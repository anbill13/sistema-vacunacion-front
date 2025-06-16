<<<<<<< HEAD
import { jsonService } from './jsonService.jsx';
=======
import { jsonService } from './jsonService';
>>>>>>> develop

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

// Función para obtener datos de los centros
export const centrosService = {
  getCentros() {
<<<<<<< HEAD
    try {
      // Obtener datos del JSON
      const centrosBase = jsonService.getData('Centros_Vacunacion', 'GET') || [];
      const centrosNuevos = jsonService.getData('Centros_Vacunacion', 'POST') || [];
      const centrosActualizados = jsonService.getData('Centros_Vacunacion', 'PUT') || [];
      const centrosEliminados = jsonService.getData('Centros_Vacunacion', 'DELETE') || [];
      
      console.log('Centros base:', centrosBase);
      console.log('Centros nuevos:', centrosNuevos);
      console.log('Centros actualizados:', centrosActualizados);
      console.log('Centros eliminados:', centrosEliminados);
      
      // Combinar centros base con nuevos centros
      let centros = [...centrosBase];
      
      // Añadir centros nuevos (asegurarse de que tengan id_centro)
      centrosNuevos.forEach(nuevoCentro => {
        if (!nuevoCentro.id_centro) {
          nuevoCentro.id_centro = `centro-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        }
        centros.push(nuevoCentro);
      });
      
      // Aplicar actualizaciones
      centros = centros.map(centro => {
        const actualizado = centrosActualizados.find(c => c.id_centro === centro.id_centro);
        return actualizado ? { ...centro, ...actualizado } : centro;
      });
      
      // Eliminar centros marcados como eliminados
      if (Array.isArray(centrosEliminados)) {
        centros = centros.filter(centro => !centrosEliminados.includes(centro.id_centro));
      } else {
        console.warn('centrosEliminados no es un array:', centrosEliminados);
      }
      
      return centros.sort((a, b) => a.nombre_centro.localeCompare(b.nombre_centro));
    } catch (error) {
      console.error('Error al obtener centros:', error);
      return [];
    }
=======
    const centrosBase = jsonService.getData('Centros_Vacunacion', 'GET') || [];
    const centrosNuevos = jsonService.getData('Centros_Vacunacion', 'POST') || [];
    const centrosActualizados = jsonService.getData('Centros_Vacunacion', 'PUT') || [];
    const centrosEliminados = jsonService.getData('Centros_Vacunacion', 'DELETE') || [];

    // Combinar centros base con nuevos centros
    let centros = [...centrosBase, ...centrosNuevos];

    // Aplicar actualizaciones
    centros = centros.map(centro => {
      const actualizado = centrosActualizados.find(c => c.id_centro === centro.id_centro);
      return actualizado || centro;
    });

    // Eliminar centros marcados como eliminados
    centros = centros.filter(centro => !centrosEliminados.includes(centro.id_centro));

    return centros.sort((a, b) => a.nombre_centro.localeCompare(b.nombre_centro));
>>>>>>> develop
  },

  async saveCentro(centro) {
    try {
      if (!centro.nombre_centro || !centro.direccion) {
        throw new Error('El nombre del centro y la dirección son obligatorios');
      }

      // Si el centro tiene ID, es una actualización
      if (centro.id_centro) {
        await jsonService.saveData('Centros_Vacunacion', 'PUT', {
          ...centro,
          updated_at: new Date().toISOString()
        });
      } else {
        // Si no tiene ID, es un nuevo centro
        await jsonService.saveData('Centros_Vacunacion', 'POST', {
          ...centro,
          id_centro: `centro-${Date.now()}`,
          created_at: new Date().toISOString()
        });
      }
      return true;
    } catch (error) {
      console.error('Error al guardar centro:', error);
      throw error; // Propagar el error para manejarlo en el componente
    }
  },

  async deleteCentro(centroId) {
    try {
      if (!centroId) {
        throw new Error('ID del centro es requerido');
      }

      // Verificar si el centro existe antes de eliminarlo
      const centros = this.getCentros();
      const centroExiste = centros.some(c => c.id_centro === centroId);
      
      if (!centroExiste) {
        throw new Error('El centro no existe');
      }

<<<<<<< HEAD
      console.log('Eliminando centro con ID:', centroId);
      
      // Pasar directamente el ID como string, no como objeto
      await jsonService.saveData('Centros_Vacunacion', 'DELETE', centroId);
      
      // Verificar que se haya eliminado correctamente
      const centrosActualizados = this.getCentros();
      const eliminadoCorrectamente = !centrosActualizados.some(c => c.id_centro === centroId);
      
      if (!eliminadoCorrectamente) {
        console.warn('El centro no se eliminó correctamente');
      } else {
        console.log('Centro eliminado correctamente');
      }
      
=======
      await jsonService.saveData('Centros_Vacunacion', 'DELETE', centroId);
>>>>>>> develop
      return true;
    } catch (error) {
      console.error('Error al eliminar centro:', error);
      throw error;
    }
  },

  // Función para filtrar centros por diferentes criterios
  filterCentros(centros, filterTerm, filterType) {
    if (!filterTerm || filterTerm.trim() === "") {
      return centros;
    }

    const term = filterTerm.toLowerCase();
    const centrosData = Array.isArray(centros) ? centros : this.getCentros();

    switch (filterType) {
      case "provincia":
<<<<<<< HEAD
        // Filtramos por dirección ya que en el JSON no hay campo provincia específico
=======
>>>>>>> develop
        return centrosData.filter(centro => 
          centro.direccion && centro.direccion.toLowerCase().includes(term)
        );
      case "sector":
<<<<<<< HEAD
        // Filtramos por nombre_centro ya que en el JSON no hay campo sector específico
        return centrosData.filter(centro => 
          centro.nombre_centro && centro.nombre_centro.toLowerCase().includes(term)
=======
        return centrosData.filter(centro => 
          centro.direccion && centro.direccion.toLowerCase().includes(term)
>>>>>>> develop
        );
      case "director":
        return centrosData.filter(centro => 
          centro.director && centro.director.toLowerCase().includes(term)
        );
      default:
<<<<<<< HEAD
        // Búsqueda general en todos los campos
        return centrosData.filter(centro => 
          (centro.nombre_centro && centro.nombre_centro.toLowerCase().includes(term)) ||
          (centro.direccion && centro.direccion.toLowerCase().includes(term)) ||
          (centro.director && centro.director.toLowerCase().includes(term)) ||
          (centro.telefono && centro.telefono.toLowerCase().includes(term))
        );
=======
        return centrosData;
>>>>>>> develop
    }
  },

  // Función para obtener opciones de filtro según el tipo
  getFilterOptions(filterType, centros) {
    const centrosData = centros || this.getCentros();
    
    switch (filterType) {
      case "provincia":
        return provinciasRD;
      case "sector":
        return sectoresRD;
      case "director":
        // Extraer directores únicos de los centros
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