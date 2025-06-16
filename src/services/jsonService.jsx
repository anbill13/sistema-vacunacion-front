import jsonData from '../json_prueba.json';


export const jsonService = {
  getData(endpoint, method = 'GET') {
    try {
      // Verificar si el endpoint y el método existen en el JSON
      if (!jsonData[endpoint] || !jsonData[endpoint][method]) {
        console.warn(`No data found for ${endpoint}[${method}]`);
        return [];
      }
      
      const data = jsonData[endpoint][method];
      
      // Asegurarse de que siempre devolvemos un array
      if (Array.isArray(data)) {
        return [...data]; // Devolver una copia para evitar mutaciones
      } else if (data === null || data === undefined) {
        return [];
      } else {
        console.warn(`Data for ${endpoint}[${method}] is not an array:`, data);
        return [data]; // Convertir a array si no lo es
      }
    } catch (error) {
      console.error(`Error accessing data for ${endpoint}[${method}]:`, error);
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
      
      // Para POST, agregamos al array existente
      if (method === 'POST') {
        const currentData = this.getData(endpoint, method) || [];
        jsonData[endpoint][method] = [...currentData, { ...data }];
        console.log(`Saved POST data for ${endpoint}:`, jsonData[endpoint][method]);
      }
      // Para PUT, actualizamos el array existente
      else if (method === 'PUT') {
        const currentData = this.getData(endpoint, method) || [];
        // Buscar por id_centro para centros o por id para otros tipos
        const idField = endpoint === 'Centros_Vacunacion' ? 'id_centro' : 'id';
        const index = currentData.findIndex(item => item[idField] === data[idField]);
        
        if (index >= 0) {
          currentData[index] = { ...currentData[index], ...data };
        } else {
          currentData.push(data);
        }
        jsonData[endpoint][method] = currentData;
        console.log(`Saved PUT data for ${endpoint}:`, jsonData[endpoint][method]);
      }
      // Para DELETE, agregamos el ID al array de eliminados
      else if (method === 'DELETE') {
        const currentData = this.getData(endpoint, method) || [];
        // Manejar tanto objetos como IDs directos
        const idToDelete = typeof data === 'object' ? (data.id || data.id_centro) : data;
        
        if (!currentData.includes(idToDelete)) {
          jsonData[endpoint][method] = [...currentData, idToDelete];
        }
        console.log(`Saved DELETE data for ${endpoint}:`, jsonData[endpoint][method]);
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
