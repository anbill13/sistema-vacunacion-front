const API_URL = 'https://sistema-vacunacion-backend.onrender.com/api';

export const getPacientesCentro = async (idCentro) => {
  try {
    if (!idNino) {
      console.error(`[pacientesService #${Date.now()}] ID de niño no válido:`, idNino);
      throw new Error('ID de niño no válido');
    }

    console.log(`[pacientesService #${Date.now()}] Obteniendo citas para paciente: ${idNino}`);
    console.log(`[pacientesService #${Date.now()}] URL completa: ${API_URL}/patients/${idNino}/appointments`);
    
    const response = await fetch(`${API_URL}/patients/${idNino}/appointments`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log(`[pacientesService #${Date.now()}] Response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[pacientesService #${Date.now()}] HTTP error! Status: ${response.status}, Response: ${errorText}`);
      
      // Si es 404, puede que el paciente no tenga citas aún, retornar array vacío
      if (response.status === 404) {
        console.log(`[pacientesService #${Date.now()}] Paciente sin citas, retornando array vacío`);
        return [];
      }
      
      throw new Error(`HTTP error! Status: ${response.status}`);
    }) => {
  try {
    if (!idCentro) {
      console.error(`[pacientesService #${Date.now()}] Invalid idCentro: ${idCentro}`);
      throw new Error('ID de centro inválido');
    }

    console.log(`[pacientesService #${Date.now()}] Fetching all patients from ${API_URL}/patients`);
    const response = await fetch(`${API_URL}/patients`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[pacientesService #${Date.now()}] HTTP error! Status: ${response.status}, Response: ${errorText}`);
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const pacientes = await response.json();
    console.log(`[pacientesService #${Date.now()}] Raw response from ${API_URL}/patients:`, pacientes);

    if (!Array.isArray(pacientes)) {
      console.error(`[pacientesService #${Date.now()}] Response is not an array:`, pacientes);
      throw new Error('Formato de datos inválido');
    }

    // Filter patients by id_centro_salud
    const mappedPacientes = pacientes
      .filter((paciente) => paciente.id_centro_salud === idCentro)
      .map((paciente) => ({
        id_paciente: paciente.id_paciente,
        nombre_completo: paciente.nombre_completo,
        fecha_nacimiento: paciente.fecha_nacimiento,
        id_centro_salud: paciente.id_centro_salud,
        estado: paciente.estado,
        activo: paciente.estado === 'Activo',
        genero: paciente.genero || null,
        direccion_residencia: paciente.direccion_residencia || null,
        tutores: paciente.tutores || [],
      }));

    console.log(`[pacientesService #${Date.now()}] Mapped patients for centro ${idCentro}:`, mappedPacientes);
    return mappedPacientes;
  } catch (error) {
    console.error(`[pacientesService #${Date.now()}] Error fetching patients for centro ${idCentro}:`, error);
    throw new Error(`Failed to fetch patients: ${error.message}`);
  }
};

export const getAllChildren = async () => {
  try {
    console.log(`[pacientesService #${Date.now()}] Initiating fetch for all patients from ${API_URL}/patients`);
    const response = await fetch(`${API_URL}/patients`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Añade autenticación si es necesaria, e.g.:
        // 'Authorization': `Bearer ${token}` (obtén token de useAuth si aplica)
      },
    });

    console.log(`[pacientesService #${Date.now()}] Fetch response status: ${response.status}`);
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[pacientesService #${Date.now()}] HTTP error! Status: ${response.status}, Response: ${errorText}`);
      throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorText}`);
    }

    const ninos = await response.json();
    console.log(`[pacientesService #${Date.now()}] Raw response from ${API_URL}/patients:`, ninos);

    if (!Array.isArray(ninos)) {
      console.error(`[pacientesService #${Date.now()}] Response is not an array, type: ${typeof ninos}, value:`, ninos);
      throw new Error('Formato de datos inválido, respuesta no es un array');
    }

    const mappedNinos = ninos.map((nino) => ({
      id_paciente: nino.id_paciente || nino.id,
      nombre_completo: nino.nombre_completo || `${nino.nombre} ${nino.apellido}` || 'Sin nombre',
      fecha_nacimiento: nino.fecha_nacimiento,
      id_centro_salud: nino.id_centro_salud,
      estado: nino.estado || 'Activo',
      activo: (nino.estado || 'Activo') === 'Activo',
      genero: nino.genero || null,
      direccion_residencia: nino.direccion_residencia || null,
      tutores: nino.tutores || [],
    }));

    console.log(`[pacientesService #${Date.now()}] Patients mapped successfully:`, mappedNinos);
    return mappedNinos;
  } catch (error) {
    console.error(`[pacientesService #${Date.now()}] Error fetching patients:`, error.message, error.stack);
    throw error; // Propagar el error para que DataContext lo capture
  }
};

export const getCitasVacunas = async (idNino) => {
  try {
    if (!idNino) {
      console.error(`[pacientesService #${Date.now()}] Invalid idNino: ${idNino}`);
      throw new Error('ID de niño inválido');
    }

    console.log(`[pacientesService #${Date.now()}] Fetching citas for paciente ${idNino} from ${API_URL}/patients/${idNino}/appointments`);
    const response = await fetch(`${API_URL}/patients/${idNino}/appointments`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[pacientesService #${Date.now()}] HTTP error! Status: ${response.status}, Response: ${errorText}`);
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const citas = await response.json();
    console.log(`[pacientesService #${Date.now()}] Citas obtenidas:`, citas);

    if (!Array.isArray(citas)) {
      console.error(`[pacientesService #${Date.now()}] Response is not an array:`, citas);
      throw new Error('Formato de datos inválido');
    }

    return citas;
  } catch (error) {
    console.error(`[pacientesService #${Date.now()}] Error obteniendo citas para paciente ${idNino}:`, error);
    throw new Error(`Failed to fetch citas: ${error.message}`);
  }
};

export const agregarCitaVacuna = async (idNino, cita) => {
  try {
    if (!idNino || !cita) {
      console.error(`[pacientesService #${Date.now()}] Invalid parameters: idNino=${idNino}, cita=${cita}`);
      throw new Error('Parámetros inválidos');
    }

    console.log(`[pacientesService #${Date.now()}] Agregando cita para paciente ${idNino}:`, cita);
    const nuevaCita = {
      ...cita,
      id_niño: idNino,
      fecha_creacion: new Date().toISOString(),
      fecha_actualizacion: new Date().toISOString(),
    };

    const response = await fetch(`${API_URL}/patients/${idNino}/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(nuevaCita),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[pacientesService #${Date.now()}] HTTP error! Status: ${response.status}, Response: ${errorText}`);
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();
    console.log(`[pacientesService #${Date.now()}] Cita agregada exitosamente:`, result);
    return result;
  } catch (error) {
    console.error(`[pacientesService #${Date.now()}] Error agregando cita:`, error);
    throw new Error(`Failed to add cita: ${error.message}`);
  }
};

export const editarCitaVacuna = async (idNino, citaId, datos) => {
  try {
    if (!idNino || !citaId || !datos) {
      console.error(`[pacientesService #${Date.now()}] Invalid parameters: idNino=${idNino}, citaId=${citaId}, datos=${datos}`);
      throw new Error('Parámetros inválidos');
    }

    console.log(`[pacientesService #${Date.now()}] Editando cita ${citaId} para paciente ${idNino}:`, datos);
    const datosActualizados = {
      ...datos,
      fecha_actualizacion: new Date().toISOString(),
    };

    const response = await fetch(`${API_URL}/patients/${idNino}/appointments/${citaId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(datosActualizados),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[pacientesService #${Date.now()}] HTTP error! Status: ${response.status}, Response: ${errorText}`);
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();
    console.log(`[pacientesService #${Date.now()}] Cita editada exitosamente:`, result);
    return result;
  } catch (error) {
    console.error(`[pacientesService #${Date.now()}] Error editando cita:`, error);
    throw new Error(`Failed to update cita: ${error.message}`);
  }
};

export const eliminarCitaVacuna = async (idNino, citaId) => {
  try {
    if (!idNino || !citaId) {
      console.error(`[pacientesService #${Date.now()}] Invalid parameters: idNino=${idNino}, citaId=${citaId}`);
      throw new Error('Parámetros inválidos');
    }

    console.log(`[pacientesService #${Date.now()}] Eliminando cita ${citaId} para paciente ${idNino}`);
    const response = await fetch(`${API_URL}/patients/${idNino}/appointments/${citaId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[pacientesService #${Date.now()}] HTTP error! Status: ${response.status}, Response: ${errorText}`);
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    console.log(`[pacientesService #${Date.now()}] Cita eliminada exitosamente`);
  } catch (error) {
    console.error(`[pacientesService #${Date.now()}] Error eliminando cita:`, error);
    throw new Error(`Failed to delete cita: ${error.message}`);
  }
};

export const getTutoresPorNino = async (idNino) => {
  try {
    if (!idNino) {
      console.error(`[pacientesService #${Date.now()}] Invalid idNino: ${idNino}`);
      throw new Error('ID de niño inválido');
    }

    console.log(`[pacientesService #${Date.now()}] Fetching tutores for paciente ${idNino} from ${API_URL}/patients/${idNino}/guardians`);
    const response = await fetch(`${API_URL}/patients/${idNino}/guardians`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[pacientesService #${Date.now()}] HTTP error! Status: ${response.status}, Response: ${errorText}`);
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const tutores = await response.json();
    console.log(`[pacientesService #${Date.now()}] Tutores obtenidos:`, tutores);

    if (!Array.isArray(tutores)) {
      console.error(`[pacientesService #${Date.now()}] Response is not an array:`, tutores);
      throw new Error('Formato de datos inválido');
    }

    return tutores;
  } catch (error) {
    console.error(`[pacientesService #${Date.now()}] Error obteniendo tutores para paciente ${idNino}:`, error);
    throw new Error(`Failed to fetch tutores: ${error.message}`);
  }
};

export const getHistorialVacunacion = async (idNino) => {
  try {
    if (!idNino) {
      console.error(`[pacientesService #${Date.now()}] Invalid idNino: ${idNino}`);
      throw new Error('ID de niño inválido');
    }

    console.log(`[pacientesService #${Date.now()}] Fetching historial for paciente ${idNino} from ${API_URL}/patients/${idNino}/vaccination-history`);
    const response = await fetch(`${API_URL}/patients/${idNino}/vaccination-history`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[pacientesService #${Date.now()}] HTTP error! Status: ${response.status}, Response: ${errorText}`);
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const historial = await response.json();
    console.log(`[pacientesService #${Date.now()}] Historial obtenido:`, historial);

    if (!Array.isArray(historial)) {
      console.error(`[pacientesService #${Date.now()}] Response is not an array:`, historial);
      throw new Error('Formato de datos inválido');
    }

    return historial;
  } catch (error) {
    console.error(`[pacientesService #${Date.now()}] Error obteniendo historial para paciente ${idNino}:`, error);
    throw new Error(`Failed to fetch historial: ${error.message}`);
  }
};

export const buscarPacientes = async (termino) => {
  try {
    if (!termino) {
      console.error(`[pacientesService #${Date.now()}] Invalid termino: ${termino}`);
      throw new Error('Término de búsqueda inválido');
    }

    console.log(`[pacientesService #${Date.now()}] Buscando pacientes con término "${termino}" from ${API_URL}/patients/search?term=${encodeURIComponent(termino)}`);
    const response = await fetch(`${API_URL}/patients/search?term=${encodeURIComponent(termino)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[pacientesService #${Date.now()}] HTTP error! Status: ${response.status}, Response: ${errorText}`);
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const resultados = await response.json();
    console.log(`[pacientesService #${Date.now()}] Resultados de búsqueda para "${termino}":`, resultados);

    if (!Array.isArray(resultados)) {
      console.error(`[pacientesService #${Date.now()}] Response is not an array:`, resultados);
      throw new Error('Formato de datos inválido');
    }

    const mappedResultados = resultados.map((nino) => ({
      id_paciente: nino.id_paciente,
      nombre_completo: nino.nombre_completo,
      fecha_nacimiento: nino.fecha_nacimiento,
      id_centro_salud: nino.id_centro_salud,
      estado: nino.estado,
      activo: nino.estado === 'Activo',
      genero: nino.genero || null,
      direccion_residencia: nino.direccion_residencia || null,
      tutores: nino.tutores || [],
    }));

    return mappedResultados;
  } catch (error) {
    console.error(`[pacientesService #${Date.now()}] Error en búsqueda de pacientes:`, error);
    throw new Error(`Failed to search pacientes: ${error.message}`);
  }
};