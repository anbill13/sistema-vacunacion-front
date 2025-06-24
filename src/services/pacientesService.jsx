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
    console.log(`[pacientesService #${Date.now()}] URL completa: ${API_URL}/appointments?id_paciente=${idNino}`);
    
    // Intentar primero el endpoint general de appointments con filtro
    const response = await fetch(`${API_URL}/appointments?id_paciente=${idNino}`, {
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
      return [];
    }

    // Filtrar citas por el ID del paciente en caso de que el backend no lo haga
    const citasFiltradas = citas.filter(cita => 
      cita.id_paciente === idNino || cita.id_niño === idNino
    );

    console.log(`[pacientesService #${Date.now()}] Citas filtradas para paciente ${idNino}:`, citasFiltradas);
    return citasFiltradas;
  } catch (error) {
    console.error(`[pacientesService #${Date.now()}] Error obteniendo citas para paciente ${idNino}:`, error);
    
    // Si el error es porque no se encontraron citas, retornar array vacío
    if (error.message.includes('404')) {
      console.log(`[pacientesService #${Date.now()}] Retornando array vacío para paciente sin citas`);
      return [];
    }
    
    return []; // Retornar array vacío en lugar de lanzar error para mejor UX
  }
};

export const agregarCitaVacuna = async (idNino, cita) => {
  try {
    if (!idNino || !cita) {
      console.error(`[pacientesService #${Date.now()}] Invalid parameters: idNino=${idNino}, cita=${cita}`);
      throw new Error('Parámetros inválidos');
    }

    console.log(`[pacientesService #${Date.now()}] Agregando cita para paciente ${idNino}:`, cita);
    
    // Try to get real center ID if not provided
    let defaultCentro = cita.id_centro;
    
    // If we don't have a real center ID, try to get first available from a centers endpoint
    if (!defaultCentro) {
      try {
        const centrosResponse = await fetch(`${API_URL}/centers`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        
        if (centrosResponse.ok) {
          const centros = await centrosResponse.json();
          if (Array.isArray(centros) && centros.length > 0) {
            defaultCentro = centros[0].id_centro;
            console.log(`[pacientesService #${Date.now()}] Using first available center:`, defaultCentro);
          }
        }
      } catch (fetchError) {
        console.warn(`[pacientesService #${Date.now()}] Could not fetch centers:`, fetchError);
      }
    }
    
    // Map frontend parameters to backend expected format
    const nuevaCita = {
      id_niño: idNino, // Backend expects id_niño
      id_centro: defaultCentro, // Use real center ID or null
      fecha_cita: cita.fecha || cita.fecha_cita || new Date().toISOString(), // Required date-time
      estado: cita.estado || 'Pendiente', // Required status
    };

    console.log(`[pacientesService #${Date.now()}] Datos de cita a enviar al backend:`, nuevaCita);
    const response = await fetch(`${API_URL}/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(nuevaCita),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[pacientesService #${Date.now()}] HTTP error! Status: ${response.status}, Response: ${errorText}`);
      throw new Error(`HTTP error! Status: ${response.status}, Response: ${errorText}`);
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
      id_paciente: idNino,
      fecha_actualizacion: new Date().toISOString(),
    };

    const response = await fetch(`${API_URL}/appointments/${citaId}`, {
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
    const response = await fetch(`${API_URL}/appointments/${citaId}`, {
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

export const getAllChildren = async () => {
  try {
    console.log(`[pacientesService #${Date.now()}] Fetching all children from ${API_URL}/patients`);
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

    // Mapeo para asegurar que todos los pacientes tengan id_niño
    const mappedNinos = ninos.map((n) => ({
      ...n,
      id_niño: n.id_paciente // Siempre usar id_paciente, nunca n.id
    }));

    console.log(`[pacientesService #${Date.now()}] Children mapped successfully:`, mappedNinos);
    return mappedNinos;
  } catch (error) {
    console.error(`[pacientesService #${Date.now()}] Error fetching children:`, error.message, error.stack);
    throw error; // Propagar el error para que DataContext lo capture
  }
};

export const getHistorialVacunacion = async (idPaciente) => {
  try {
    if (!idPaciente) {
      console.error(`[pacientesService #${Date.now()}] ID de paciente no válido:`, idPaciente);
      throw new Error('ID de paciente no válido');
    }

    console.log(`[pacientesService #${Date.now()}] Obteniendo historial de vacunación para paciente: ${idPaciente}`);
    const response = await fetch(`${API_URL}/patients/${idPaciente}/vaccination-history`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[pacientesService #${Date.now()}] HTTP error! Status: ${response.status}, Response: ${errorText}`);
      
      // Si es 404, puede que el paciente no tenga historial aún, retornar array vacío
      if (response.status === 404) {
        console.log(`[pacientesService #${Date.now()}] Paciente sin historial de vacunación, retornando array vacío`);
        return [];
      }
      
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const historial = await response.json();
    console.log(`[pacientesService #${Date.now()}] Historial obtenido:`, historial);

    if (!Array.isArray(historial)) {
      console.error(`[pacientesService #${Date.now()}] Response is not an array:`, historial);
      return [];
    }

    return historial;
  } catch (error) {
    console.error(`[pacientesService #${Date.now()}] Error obteniendo historial para paciente ${idPaciente}:`, error);
    
    // Si el error es porque no se encontró historial, retornar array vacío
    if (error.message.includes('404')) {
      console.log(`[pacientesService #${Date.now()}] Retornando array vacío para paciente sin historial`);
      return [];
    }
    
    return [];
  }
};

export const getTutoresPorNino = async (idNino) => {
  try {
    if (!idNino) {
      console.error(`[pacientesService #${Date.now()}] ID de niño no válido:`, idNino);
      throw new Error('ID de niño no válido');
    }

    console.log(`[pacientesService #${Date.now()}] Obteniendo tutores para niño: ${idNino}`);
    const response = await fetch(`${API_URL}/patients/${idNino}/tutors`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[pacientesService #${Date.now()}] HTTP error! Status: ${response.status}, Response: ${errorText}`);
      
      // Si es 404, puede que el paciente no tenga tutores registrados, retornar array vacío
      if (response.status === 404) {
        console.log(`[pacientesService #${Date.now()}] Paciente sin tutores registrados, retornando array vacío`);
        return [];
      }
      
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const tutores = await response.json();
    console.log(`[pacientesService #${Date.now()}] Tutores obtenidos:`, tutores);

    if (!Array.isArray(tutores)) {
      console.error(`[pacientesService #${Date.now()}] Response is not an array:`, tutores);
      return [];
    }

    return tutores;
  } catch (error) {
    console.error(`[pacientesService #${Date.now()}] Error obteniendo tutores para niño ${idNino}:`, error);
    
    // Si el error es porque no se encontraron tutores, retornar array vacío
    if (error.message.includes('404')) {
      console.log(`[pacientesService #${Date.now()}] Retornando array vacío para niño sin tutores`);
      return [];
    }
    
    return [];
  }
};

// Functions to get vaccines and vaccine lots
export const getVacunas = async () => {
  try {
    console.log(`[pacientesService #${Date.now()}] Fetching vaccines from ${API_URL}/vaccines`);
    const response = await fetch(`${API_URL}/vaccines`, {
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

    const vacunas = await response.json();
    console.log(`[pacientesService #${Date.now()}] Vaccines fetched:`, vacunas);
    return Array.isArray(vacunas) ? vacunas : [];
  } catch (error) {
    console.error(`[pacientesService #${Date.now()}] Error fetching vaccines:`, error);
    return [];
  }
};

export const getLotesVacunas = async () => {
  try {
    console.log(`[pacientesService #${Date.now()}] Fetching vaccine lots from ${API_URL}/vaccine-lots`);
    const response = await fetch(`${API_URL}/vaccine-lots`, {
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

    const lotes = await response.json();
    console.log(`[pacientesService #${Date.now()}] Vaccine lots fetched:`, lotes);
    return Array.isArray(lotes) ? lotes : [];
  } catch (error) {
    console.error(`[pacientesService #${Date.now()}] Error fetching vaccine lots:`, error);
    return [];
  }
};

export const getPersonalSalud = async () => {
  try {
    console.log(`[pacientesService #${Date.now()}] Fetching health staff from ${API_URL}/health-staff`);
    const response = await fetch(`${API_URL}/health-staff`, {
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

    const personal = await response.json();
    console.log(`[pacientesService #${Date.now()}] Health staff fetched:`, personal);
    return Array.isArray(personal) ? personal : [];
  } catch (error) {
    console.error(`[pacientesService #${Date.now()}] Error fetching health staff:`, error);
    return [];
  }
};

export const registrarVacunacion = async (datosVacunacion) => {
  try {
    if (!datosVacunacion || !datosVacunacion.id_paciente) {
      console.error(`[pacientesService #${Date.now()}] Invalid parameters:`, datosVacunacion);
      throw new Error('Datos de vacunación inválidos');
    }

    console.log(`[pacientesService #${Date.now()}] Registrando vacunación:`, datosVacunacion);
    
    // Try to get real IDs from backend if not provided
    let defaultLote = datosVacunacion.id_lote;
    let defaultPersonal = datosVacunacion.id_personal;
    let defaultCentro = datosVacunacion.id_centro;

    // If we don't have real IDs, try to get the first available ones from backend
    if (!defaultLote || !defaultPersonal || !defaultCentro) {
      try {
        const [lotes, personal] = await Promise.all([
          getLotesVacunas(),
          getPersonalSalud()
        ]);
        
        if (!defaultLote && lotes.length > 0) {
          defaultLote = lotes[0].id_lote;
          console.log(`[pacientesService #${Date.now()}] Using first available lot:`, defaultLote);
        }
        
        if (!defaultPersonal && personal.length > 0) {
          defaultPersonal = personal[0].id_personal;
          console.log(`[pacientesService #${Date.now()}] Using first available staff:`, defaultPersonal);
        }
      } catch (fetchError) {
        console.warn(`[pacientesService #${Date.now()}] Could not fetch backend data:`, fetchError);
      }
    }

    // Map frontend parameters to backend expected format
    // Only include fields that we have real values for
    const vacunacionData = {
      id_niño: datosVacunacion.id_paciente, // Backend expects id_niño
      fecha_vacunacion: datosVacunacion.fecha_aplicacion || new Date().toISOString(),
      dosis_aplicada: Number(datosVacunacion.dosis_aplicada) || 1, // Required integer, ensure it's a number
      sitio_aplicacion: datosVacunacion.sitio_aplicacion || 'Brazo izquierdo', // Optional string
      observaciones: datosVacunacion.notas || '', // Optional string
    };

    // Only add foreign keys if we have real IDs
    if (defaultLote) {
      vacunacionData.id_lote = defaultLote;
    }
    if (defaultPersonal) {
      vacunacionData.id_personal = defaultPersonal;
    }
    if (defaultCentro) {
      vacunacionData.id_centro = defaultCentro;
    }

    console.log(`[pacientesService #${Date.now()}] Datos a enviar al backend:`, vacunacionData);
    
    const response = await fetch(`${API_URL}/vaccination-history`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(vacunacionData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[pacientesService #${Date.now()}] HTTP error! Status: ${response.status}, Response: ${errorText}`);
      throw new Error(`HTTP error! Status: ${response.status}, Response: ${errorText}`);
    }

    const result = await response.json();
    console.log(`[pacientesService #${Date.now()}] Vacunación registrada exitosamente:`, result);
    return result;
  } catch (error) {
    console.error(`[pacientesService #${Date.now()}] Error registrando vacunación:`, error);
    throw new Error(`Failed to register vaccination: ${error.message}`);
  }
};
