import { jsonService } from './jsonService';

export const getPacientesCentro = async (idCentro) => {
  try {
    console.log(`Solicitando pacientes para centro ${idCentro}`);
    const ninos = await jsonService.getData('Niños', 'GET');
    console.log('Niños obtenidos:', ninos.map(n => ({ id_niño: n.id_niño, id_centro_salud: n.id_centro_salud })));
    // Convertir idCentro a cadena para comparar con UUIDs si es necesario
    const centroIdStr = idCentro.toString();
    const pacientes = ninos.filter(nino => {
      const centroSaludStr = nino.id_centro_salud ? nino.id_centro_salud.toString() : '';
      console.log(`Comparando: centroId=${centroIdStr}, id_centro_salud=${centroSaludStr}`);
      return centroSaludStr === centroIdStr;
    });
    console.log(`Pacientes filtrados para centro ${idCentro}:`, pacientes);
    return pacientes;
  } catch (error) {
    console.error(`Error obteniendo pacientes para centro ${idCentro}:`, error);
    return [];
  }
};

export const getCitasVacunas = async (idNino) => {
  try {
    console.log(`Solicitando citas para niño ${idNino}`);
    const citas = await jsonService.getData('Citas', 'GET') || [];
    const citasFiltradas = citas.filter(cita => cita.id_niño === idNino);
    console.log(`Citas obtenidas:`, citasFiltradas);
    return citasFiltradas;
  } catch (error) {
    console.error(`Error obteniendo citas para niño ${idNino}:`, error);
    return [];
  }
};

export const agregarCitaVacuna = async (idNino, cita) => {
  try {
    console.log(`Agregando cita para niño ${idNino}:`, cita);
    const nuevaCita = { ...cita, id_niño: idNino };
    await jsonService.saveData('Citas', 'POST', nuevaCita);
    console.log('Cita agregada exitosamente');
  } catch (error) {
    console.error('Error agregando cita:', error);
    throw error;
  }
};

export const editarCitaVacuna = async (idNino, citaId, datos) => {
  try {
    console.log(`Editando cita ${citaId} para niño ${idNino}:`, datos);
    await jsonService.saveData('Citas', 'PUT', { ...datos, id_cita: citaId });
    console.log('Cita editada exitosamente');
  } catch (error) {
    console.error('Error editando cita:', error);
    throw error;
  }
};

export const eliminarCitaVacuna = async (idNino, citaId) => {
  try {
    console.log(`Eliminando cita ${citaId} para niño ${idNino}`);
    await jsonService.saveData('Citas', 'DELETE', citaId);
    console.log('Cita eliminada exitosamente');
  } catch (error) {
    console.error('Error eliminando cita:', error);
    throw error;
  }
};