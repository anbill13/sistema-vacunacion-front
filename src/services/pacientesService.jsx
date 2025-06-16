import { jsonService } from './jsonService.jsx';

export const getAllPacientes = () => {
  // En el JSON, los niños son los pacientes
  return jsonService.getData('Niños', 'GET') || [];
};

export const getPacientesCentro = (idCentro) => {
  const pacientes = getAllPacientes();
  return pacientes
    .filter((paciente) => paciente.id_centro_salud === idCentro)
    .map((paciente) => ({
      ...paciente,
      // Aseguramos que tenga un campo activo por defecto
      activo: paciente.activo !== undefined ? paciente.activo : true,
    }));
};

export const getPacientesDelCentro = (centroId) => {
  const pacientes = getAllPacientes();
  // En el JSON, el campo se llama id_centro_salud
  return pacientes.filter(paciente => paciente.id_centro_salud === centroId);
};

export const getHistorialVacunas = (pacienteId) => {
  // En el JSON, las dosis aplicadas contienen el historial de vacunación
  const historial = jsonService.getData('Dosis_Aplicadas', 'GET') || [];
  return historial.filter(registro => registro.id_niño === pacienteId);
};

export const getVacunasFaltantes = (pacienteId) => {
  const todasLasVacunas = jsonService.getData('Vacunas', 'GET') || [];
  const historialPaciente = getHistorialVacunas(pacienteId);
  
  return todasLasVacunas.filter(vacuna => 
    !historialPaciente.some(registro => registro.id_vacuna === vacuna.id_vacuna)
  );
};

export const getTutorNombre = (tutorId) => {
  const tutores = jsonService.getData('Tutores', 'GET') || [];
  const tutor = tutores.find(t => t.id_tutor === tutorId);
  return tutor ? tutor.nombre_completo : 'No especificado';
};

export const togglePacienteStatus = (pacienteId) => {
  const pacientes = getAllPacientes();
  const pacienteIndex = pacientes.findIndex(p => p.id_niño === pacienteId);
  
  if (pacienteIndex !== -1) {
    const paciente = pacientes[pacienteIndex];
    paciente.activo = !paciente.activo;
    // Guardamos en Niños, no en Pacientes
    jsonService.saveData('Niños', 'PUT', paciente);
    return true;
  }
  return false;
};

// --- NUEVO: Manejo de citas de vacunación ---

export const getCitasVacunas = (pacienteId) => {
  const pacientes = getAllPacientes();
  const paciente = pacientes.find(p => p.id_niño === pacienteId);
  return paciente && Array.isArray(paciente.citasVacunas) ? paciente.citasVacunas : [];
};

export const agregarCitaVacuna = (pacienteId, cita) => {
  const pacientes = getAllPacientes();
  const pacienteIndex = pacientes.findIndex(p => p.id_niño === pacienteId);
  if (pacienteIndex !== -1) {
    const paciente = pacientes[pacienteIndex];
    if (!Array.isArray(paciente.citasVacunas)) paciente.citasVacunas = [];
    const nuevaCita = { ...cita, id: Date.now().toString() };
    paciente.citasVacunas.push(nuevaCita);
    jsonService.saveData('Niños', 'PUT', paciente);
    return nuevaCita;
  }
  return null;
};

export const editarCitaVacuna = (pacienteId, citaId, datosActualizados) => {
  const pacientes = getAllPacientes();
  const pacienteIndex = pacientes.findIndex(p => p.id_niño === pacienteId);
  if (pacienteIndex !== -1) {
    const paciente = pacientes[pacienteIndex];
    if (!Array.isArray(paciente.citasVacunas)) paciente.citasVacunas = [];
    const citaIndex = paciente.citasVacunas.findIndex(c => c.id === citaId);
    if (citaIndex !== -1) {
      paciente.citasVacunas[citaIndex] = { ...paciente.citasVacunas[citaIndex], ...datosActualizados };
      jsonService.saveData('Niños', 'PUT', paciente);
      return paciente.citasVacunas[citaIndex];
    }
  }
  return null;
};

export const eliminarCitaVacuna = (pacienteId, citaId) => {
  const pacientes = getAllPacientes();
  const pacienteIndex = pacientes.findIndex(p => p.id_niño === pacienteId);
  if (pacienteIndex !== -1) {
    const paciente = pacientes[pacienteIndex];
    if (!Array.isArray(paciente.citasVacunas)) paciente.citasVacunas = [];
    paciente.citasVacunas = paciente.citasVacunas.filter(c => c.id !== citaId);
    jsonService.saveData('Niños', 'PUT', paciente);
    return true;
  }
  return false;
};