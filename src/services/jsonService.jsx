import { addToSyncQueue } from '../utils/syncQueue';
// --- Persistencia temporal en localStorage para pruebas ---
// Si existe una copia en localStorage, úsala; si no, usa el archivo original
let jsonData = (() => {
  const key = '__json_backend__';
  try {
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored);
  } catch {}
  return require('../json_prueba.json').default || {};
})();
const persistJsonData = () => {
  try {
    localStorage.setItem('__json_backend__', JSON.stringify(jsonData));
  } catch (e) { /* Fallback: no hacer nada si falla */ }
};

// Para facilitar el futuro reemplazo por una API real, solo cambia las funciones getData/saveData
export const jsonService = {
  getData(endpoint, method = 'GET') {
    try {
      // Verificar si el endpoint y el método existen en el JSON
      if (!jsonData[endpoint] || !jsonData[endpoint][method]) {
        // Para endpoints nuevos, inicializar
        return [];
      }
      const data = jsonData[endpoint][method];
      // Asegurarse de que siempre devolvemos un array
      if (Array.isArray(data)) {
        return [...data]; // Devolver una copia para evitar mutaciones
      } else if (data === null || data === undefined) {
        return [];
      } else {
        return [data]; // Convertir a array si no lo es
      }
    } catch (error) {
      return [];
    }
  },

  saveData(endpoint, method, data) {
    try {
      // Asegurarse de que el endpoint y el método existen
      if (!jsonData[endpoint]) {
        jsonData[endpoint] = {};
      }
      if (!jsonData[endpoint][method]) {
        jsonData[endpoint][method] = [];
      }
      // Aquí podrías intentar sincronizar con el backend real
      // Si falla, agrega a la cola (por ahora, siempre agrega para simular offline)
      addToSyncQueue({ endpoint, method, data });
      // Persistencia local como respaldo
      // Para POST, agregamos al array existente
      if (method === 'POST') {
        // Guardar en POST
        const currentPost = this.getData(endpoint, 'POST') || [];
        if (!jsonData[endpoint]) jsonData[endpoint] = {};
        jsonData[endpoint]['POST'] = [...currentPost, { ...data }];
        // Guardar también en GET (persistencia global)
        const currentGet = this.getData(endpoint, 'GET') || [];
        jsonData[endpoint]['GET'] = [...currentGet, { ...data }];
        persistJsonData();
      }
      // Para GET, sobrescribimos el array (simula persistencia real)
      else if (method === 'GET') {
        if (!jsonData[endpoint]) jsonData[endpoint] = {};
        jsonData[endpoint][method] = Array.isArray(data) ? [...data] : [data];
        persistJsonData();
      }
      // Para PUT, actualizamos el array existente
      else if (method === 'PUT') {
        if (!jsonData[endpoint]) jsonData[endpoint] = {};
        // Actualizar en PUT
        const currentPut = this.getData(endpoint, 'PUT') || [];
        let idField = 'id';
        if (endpoint === 'Lotes_Vacunas') idField = 'id_lote';
        else if (endpoint === 'Centros_Vacunacion') idField = 'id_centro';
        else if (endpoint === 'Niños') idField = 'id_niño';
        else if (endpoint === 'Vacunas') idField = 'id_vacuna';
        const indexPut = currentPut.findIndex(item => item[idField] === data[idField]);
        if (indexPut >= 0) {
          currentPut[indexPut] = { ...currentPut[indexPut], ...data };
        } else {
          currentPut.push(data);
        }
        jsonData[endpoint]['PUT'] = currentPut;
        // Actualizar también en GET
        const currentGet = this.getData(endpoint, 'GET') || [];
        const indexGet = currentGet.findIndex(item => item[idField] === data[idField]);
        if (indexGet >= 0) {
          currentGet[indexGet] = { ...currentGet[indexGet], ...data };
        } else {
          currentGet.push(data);
        }
        jsonData[endpoint]['GET'] = currentGet;
        persistJsonData();
      }
      // Para DELETE, agregamos el ID al array de eliminados
      else if (method === 'DELETE') {
        if (!jsonData[endpoint]) jsonData[endpoint] = {};
        const currentData = this.getData(endpoint, method) || [];
        // Manejar tanto objetos como IDs directos
        const idToDelete = typeof data === 'object' ? (data.id || data.id_centro) : data;
        if (!currentData.includes(idToDelete)) {
          jsonData[endpoint][method] = [...currentData, idToDelete];
        }
        persistJsonData();
      }
      return true;
    } catch (error) {
      console.error(`Error saving data for ${endpoint}[${method}]:`, error);
      return false;
    }
  },

  getUIConfig(section, subsection = null) {
    try {
      return subsection 
        ? jsonData.UI_Config[section][subsection]
        : jsonData.UI_Config[section];
    } catch (error) {
      console.error(`Error accessing UI configuration for ${section}:`, error);
      return null;
    }
  }
};
