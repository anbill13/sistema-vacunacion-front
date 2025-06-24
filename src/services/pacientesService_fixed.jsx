const API_URL = 'https://sistema-vacunacion-backend.onrender.com/api';

export const getPacientesCentro = async (idCentro) => {
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
    
    // Si el error es porque no se encontraron citas, retornar array vacío
    if (error.message.includes('404')) {
      console.log(`[pacientesService #${Date.now()}] Retornando array vacío para paciente sin citas`);
      return [];
    }
    
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

export const editarCitaVacuna = async (idNino, citaId, datosActualizados) => {
  try {
    if (!idNino || !citaId || !datosActualizados) {
      console.error(`[pacientesService #${Date.now()}] Invalid parameters: idNino=${idNino}, citaId=${citaId}, datosActualizados=${datosActualizados}`);
      throw new Error('Parámetros inválidos');
    }

    console.log(`[pacientesService #${Date.now()}] Editando cita ${citaId} para paciente ${idNino}:`, datosActualizados);
    const citaActualizada = {
      ...datosActualizados,
      fecha_actualizacion: new Date().toISOString(),
    };

    const response = await fetch(`${API_URL}/patients/${idNino}/appointments/${citaId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(citaActualizada),
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
    throw new Error(`Failed to edit cita: ${error.message}`);
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
    return true;
  } catch (error) {
    console.error(`[pacientesService #${Date.now()}] Error eliminando cita:`, error);
    throw new Error(`Failed to delete cita: ${error.message}`);
  }
};

// Resto de funciones del servicio...
export const agregarPaciente = async (pacienteData) => {
  try {
    const response = await fetch(`${API_URL}/patients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pacienteData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error agregando paciente:', error);
    throw error;
  }
};

export const actualizarPaciente = async (id, pacienteData) => {
  try {
    const response = await fetch(`${API_URL}/patients/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pacienteData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error actualizando paciente:', error);
    throw error;
  }
};

export const eliminarPaciente = async (id) => {
  try {
    const response = await fetch(`${API_URL}/patients/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error('Error eliminando paciente:', error);
    throw error;
  }
};
