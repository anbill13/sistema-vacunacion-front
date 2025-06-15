import { jsonService } from './jsonService';

export const getAllPacientes = () => {
  return jsonService.getData('Pacientes', 'GET') || [];
};

export const getPacientesCentro = (idCentro) => {
  const pacientes = getAllPacientes();
  return pacientes
    .filter((paciente) => paciente.id_centro_salud === idCentro)
    .map((paciente) => ({
      ...paciente,
      nombre: paciente.nombre_completo.split(" ")[0],
      apellido: paciente.nombre_completo.split(" ").slice(1).join(" "),
    }));
};

export const getPacientesDelCentro = (centroId) => {
  const pacientes = getAllPacientes();
  return pacientes.filter(paciente => paciente.centro_vacunacion === centroId);
};

export const getHistorialVacunas = (pacienteId) => {
  const historial = jsonService.getData('Historial_Vacunas', 'GET') || [];
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
    jsonService.saveData('Pacientes', 'PUT', pacientes);
    return true;
  }
  return false;
};