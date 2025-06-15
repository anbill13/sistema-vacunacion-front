import jsonData from '../json_prueba.json';


export const jsonService = {
  getData(endpoint, method = 'GET') {
    try {
      const data = jsonData[endpoint][method];
      if (!data) return [];
      return Array.isArray(data) ? [...data] : data;
    } catch (error) {
      console.error(`Error accessing data for ${endpoint}[${method}]:`, error);
      return [];
    }
  },

  saveData(endpoint, method, data) {
    try {
      // Para POST, agregamos al array existente
      if (method === 'POST') {
        const currentData = this.getData(endpoint, method) || [];
        jsonData[endpoint][method] = [...currentData, { ...data }];
      }
      // Para PUT, actualizamos el array existente
      else if (method === 'PUT') {
        const currentData = this.getData(endpoint, method) || [];
        const index = currentData.findIndex(item => item.id === data.id);
        if (index >= 0) {
          currentData[index] = { ...currentData[index], ...data };
          jsonData[endpoint][method] = currentData;
        }
      }
      // Para DELETE, agregamos el ID al array de eliminados
      else if (method === 'DELETE') {
        const currentData = this.getData(endpoint, method) || [];
        if (!currentData.includes(data.id)) {
          jsonData[endpoint][method] = [...currentData, data.id];
        }
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
