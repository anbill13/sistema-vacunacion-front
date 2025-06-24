import apiService from './apiService.jsx';

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
    
    // Enriquecer las citas con información adicional si es necesario
    try {
      const citasEnriquecidas = citasFiltradas.map(cita => ({
        ...cita,
        // Asegurar que tenemos un ID consistente
        id: cita.id_cita || cita.id,
        // Formatear fecha para mostrar
        fecha: cita.fecha_cita ? 
          new Date(cita.fecha_cita).toLocaleDateString('es-ES') : 
          'Fecha no disponible',
        // Mantener fecha original para operaciones
        fecha_original: cita.fecha_cita,
        // Estado por defecto
        estado: cita.estado || 'Pendiente',
        // Información del centro (se puede enriquecer más adelante si es necesario)
        centro: cita.id_centro ? `Centro ID: ${cita.id_centro}` : 'No especificado'
      }));

      return citasEnriquecidas;
      
    } catch (enrichError) {
      console.error(`[pacientesService #${Date.now()}] Error enriqueciendo citas, retornando datos básicos:`, enrichError);
      
      // Si no se puede enriquecer, al menos formatear las fechas básicas
      return citasFiltradas.map(cita => ({
        ...cita,
        id: cita.id_cita || cita.id,
        fecha: cita.fecha_cita ? 
          new Date(cita.fecha_cita).toLocaleDateString('es-ES') : 
          'Fecha no disponible',
        estado: cita.estado || 'Pendiente'
      }));
    }
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
    console.log(`[pacientesService #${Date.now()}] URL completa: ${API_URL}/vaccination-history/by-child/${idPaciente}`);
    
    // Usar el endpoint correcto según la documentación: /api/vaccination-history/by-child/:id
    const response = await fetch(`${API_URL}/vaccination-history/by-child/${idPaciente}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log(`[pacientesService #${Date.now()}] Response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[pacientesService #${Date.now()}] HTTP error! Status: ${response.status}, Response: ${errorText}`);
      
      // Si es 404, puede que el paciente no tenga historial aún, retornar array vacío
      if (response.status === 404) {
        console.log(`[pacientesService #${Date.now()}] Paciente sin historial de vacunación, retornando array vacío`);
        return [];
      }
      
      // Si es 500 y contiene error de id_personal, es un problema del backend
      if (response.status === 500 && errorText.includes('id_personal')) {
        console.warn(`[pacientesService #${Date.now()}] Backend tiene problema con id_personal, retornando array vacío temporalmente`);
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

    // Enriquecer el historial con información de vacunas y lotes
    try {
      console.log(`[pacientesService #${Date.now()}] Enriqueciendo historial con información de vacunas y lotes...`);
      
      const [vacunas, lotes] = await Promise.all([
        getVacunas(),
        getLotesVacunas()
      ]);

      console.log(`[pacientesService #${Date.now()}] Vacunas disponibles para enriquecer:`, vacunas?.length || 0, vacunas);
      console.log(`[pacientesService #${Date.now()}] Lotes disponibles para enriquecer:`, lotes?.length || 0, lotes);

      const historialEnriquecido = historial.map(registro => {
        // Buscar información del lote
        const loteInfo = lotes.find(lote => lote.id_lote === registro.id_lote);
        console.log(`[pacientesService] Buscando lote ${registro.id_lote}, encontrado:`, loteInfo);
        
        // Si encontramos el lote, buscar la vacuna asociada
        let vacunaInfo = null;
        if (loteInfo && loteInfo.id_vacuna) {
          vacunaInfo = vacunas.find(vacuna => vacuna.id_vacuna === loteInfo.id_vacuna);
          console.log(`[pacientesService] Buscando vacuna ${loteInfo.id_vacuna}, encontrada:`, vacunaInfo);
        }

        // Enriquecer el registro con la información completa
        const registroEnriquecido = {
          ...registro,
          // Información de la vacuna
          nombre_vacuna: vacunaInfo?.nombre || `Vacuna ID: ${loteInfo?.id_vacuna || 'No especificado'}`,
          tipo_vacuna: vacunaInfo?.tipo || 'No especificado',
          descripcion_vacuna: vacunaInfo?.descripcion || '',
          
          // Información del lote
          numero_lote: loteInfo?.numero_lote || `Lote ID: ${registro.id_lote}`,
          fecha_vencimiento: loteInfo?.fecha_vencimiento || null,
          fabricante: loteInfo?.fabricante || 'No especificado',
          
          // Formatear fecha para mostrar
          fecha_aplicacion: registro.fecha_vacunacion ? 
            new Date(registro.fecha_vacunacion).toLocaleDateString('es-ES') : 
            'Fecha no disponible'
        };
        
        console.log(`[pacientesService] Registro enriquecido:`, registroEnriquecido);
        return registroEnriquecido;
      });

      console.log(`[pacientesService #${Date.now()}] Historial enriquecido:`, historialEnriquecido);
      return historialEnriquecido;
      
    } catch (enrichError) {
      console.error(`[pacientesService #${Date.now()}] Error enriqueciendo historial, retornando datos básicos:`, enrichError);
      
      // Si no se puede enriquecer, al menos formatear las fechas y usar los IDs como fallback
      return historial.map(registro => ({
        ...registro,
        nombre_vacuna: registro.nombre_vacuna || `Registro ID: ${registro.id_historial}`,
        numero_lote: registro.numero_lote || `Lote ID: ${registro.id_lote}`,
        fecha_aplicacion: registro.fecha_vacunacion ? 
          new Date(registro.fecha_vacunacion).toLocaleDateString('es-ES') : 
          (registro.fecha_aplicacion || 'Fecha no disponible'),
        observaciones: registro.observaciones || ''
      }));
    }
  } catch (error) {
    console.error(`[pacientesService #${Date.now()}] Error obteniendo historial para paciente ${idPaciente}:`, error);
    
    // Si el error es porque no se encontró historial, retornar array vacío
    if (error.message.includes('404')) {
      console.log(`[pacientesService #${Date.now()}] Retornando array vacío para paciente sin historial`);
      return [];
    }
    
    // Si el error menciona id_personal, es un problema del backend que debe resolverse
    if (error.message.includes('id_personal')) {
      console.warn(`[pacientesService #${Date.now()}] Error conocido del backend con id_personal, retornando array vacío temporalmente`);
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
    
    // Verificar estructura de datos de vacunas
    if (Array.isArray(vacunas) && vacunas.length > 0) {
      console.log(`[pacientesService #${Date.now()}] Estructura de primera vacuna:`, Object.keys(vacunas[0]));
    }
    
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
    
    // Verificar estructura de datos de lotes
    if (Array.isArray(lotes) && lotes.length > 0) {
      console.log(`[pacientesService #${Date.now()}] Estructura de primer lote:`, Object.keys(lotes[0]));
    }
    
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
    let defaultPersonal = datosVacunacion.id_usuario;
    let defaultCentro = datosVacunacion.id_centro;

    // Si no hay IDs reales, obtener los primeros disponibles del backend
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
          defaultPersonal = personal[0].id_usuario;
          console.log(`[pacientesService #${Date.now()}] Using first available staff:`, defaultPersonal);
        }
        // Si no hay personal de salud disponible, mostrar error y no continuar
        if (!defaultPersonal) {
          throw new Error('No hay personal de salud disponible para registrar la vacunación. Contacte al administrador.');
        }
      } catch (fetchError) {
        console.warn(`[pacientesService #${Date.now()}] Could not fetch backend data:`, fetchError);
        throw new Error('No se pudo obtener información de lotes o personal de salud. Intente más tarde.');
      }
    }

    // Map frontend parameters to backend expected format
    // Solo incluir campos con valores reales
    const vacunacionData = {
      id_niño: datosVacunacion.id_paciente, // Backend espera id_niño
      fecha_vacunacion: datosVacunacion.fecha_aplicacion || new Date().toISOString(),
      dosis_aplicada: Number(datosVacunacion.dosis_aplicada) || 1, // Requerido entero
      sitio_aplicacion: datosVacunacion.sitio_aplicacion || 'Brazo izquierdo', // Opcional
      observaciones: datosVacunacion.notas || '', // Opcional
    };

    // Solo agregar claves foráneas si hay IDs reales
    if (defaultLote) {
      vacunacionData.id_lote = defaultLote;
    }
    if (defaultPersonal) {
      vacunacionData.id_usuario = defaultPersonal;
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
    throw new Error(error.message || 'Failed to register vaccination');
  }
};

/**
 * Registra una vacunación para una lista de vacunas, buscando lote y personal real por vacuna.
 * Devuelve un array de resultados con éxito/error por cada vacuna.
 * Si se pasa id_usuario, se usa ese para todas las vacunas.
 */
export const registrarVacunacionesMultiples = async ({
  vacunas, // array de objetos { descripcion, ... }
  id_paciente,
  fecha_aplicacion,
  id_centro,
  sitio_aplicacion,
  notas,
  id_usuario // <-- Nuevo parámetro opcional
}) => {
  if (!Array.isArray(vacunas) || vacunas.length === 0) {
    throw new Error('No hay vacunas seleccionadas para registrar.');
  }
  if (!id_paciente) {
    throw new Error('ID de paciente inválido.');
  }

  // Obtener lotes y personal de salud disponibles
  const [lotes, personal] = await Promise.all([
    getLotesVacunas(),
    getPersonalSalud()
  ]);

  // Si no se pasa id_usuario y no hay personal, error
  if (!id_usuario && !personal.length) {
    throw new Error('No hay personal de salud disponible para registrar la vacunación. Contacte al administrador.');
  }
  if (!lotes.length) {
    throw new Error('No hay lotes de vacunas disponibles. Contacte al administrador.');
  }

  // Para cada vacuna, buscar lote y registrar
  const resultados = [];
  for (const vacuna of vacunas) {
    // Buscar lote por nombre de vacuna (si hay coincidencia)
    let loteVacuna = lotes.find(l =>
      l.nombre_vacuna && vacuna.descripcion &&
      l.nombre_vacuna.toLowerCase().includes(vacuna.descripcion.toLowerCase())
    );
    if (!loteVacuna) {
      // Si no hay coincidencia exacta, usar el primero
      loteVacuna = lotes[0];
    }
    // Usar el id_usuario loggeado si está, si no el primero disponible
    const personalSaludId = id_usuario || (personal[0] && personal[0].id_usuario);
    if (!loteVacuna || !personalSaludId) {
      resultados.push({
        vacuna: vacuna.descripcion,
        success: false,
        error: 'No se encontró lote o personal válido para esta vacuna.'
      });
      continue;
    }
    try {
      const res = await registrarVacunacion({
        id_paciente,
        id_lote: loteVacuna.id_lote,
        id_usuario: personalSaludId,
        id_centro,
        fecha_aplicacion: fecha_aplicacion || new Date().toISOString(),
        dosis_aplicada: 1,
        sitio_aplicacion: sitio_aplicacion || 'Brazo izquierdo',
        notas: `Vacuna del esquema: ${vacuna.descripcion}. ${notas || ''}`
      });
      resultados.push({ vacuna: vacuna.descripcion, success: true, data: res });
    } catch (error) {
      resultados.push({ vacuna: vacuna.descripcion, success: false, error: error.message });
    }
  }
  return resultados;
};

// Función para actualizar un paciente
export const updatePaciente = async (idPaciente, datosActualizados) => {
  try {
    console.log(`[pacientesService] Updating patient ${idPaciente} with data:`, datosActualizados);
    
    const response = await fetch(`${API_URL}/patients/${idPaciente}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(datosActualizados),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[pacientesService] HTTP error updating patient! Status: ${response.status}, Response: ${errorText}`);
      throw new Error(`Error al actualizar paciente: ${response.status} - ${errorText}`);
    }

    const updatedPatient = await response.json();
    console.log(`[pacientesService] Patient updated successfully:`, updatedPatient);
    return updatedPatient;
  } catch (error) {
    console.error(`[pacientesService] Error updating patient:`, error);
    throw error;
  }
};

// Nuevo método para actualizar pacientes usando apiService
export const updatePatient = async (id, patientData) => {
  try {
    console.log(`[pacientesService] Updating patient ${id} with data:`, patientData);
    
    // Obtener información completa del paciente actual para incluir tutores
    let currentPatient = null;
    try {
      const currentResponse = await apiService.get(`/api/patients/${id}`);
      currentPatient = currentResponse;
      console.log(`[pacientesService] Current patient data:`, currentPatient);
    } catch (fetchError) {
      console.warn(`[pacientesService] Could not fetch current patient data:`, fetchError);
    }
    
    // Formatear los datos completos del paciente según el formato requerido
    const completePatientData = {
      id_paciente: id,
      nombre_completo: patientData.nombre_completo || null,
      identificacion: patientData.identificacion || null,
      nacionalidad: patientData.nacionalidad || null,
      pais_nacimiento: patientData.pais_nacimiento || null,
      fecha_nacimiento: patientData.fecha_nacimiento || null,
      genero: patientData.genero || null,
      direccion_residencia: patientData.direccion_residencia || null,
      latitud: patientData.latitud || 1,
      longitud: patientData.longitud || 1,
      id_centro_salud: patientData.id_centro_salud || null,
      contacto_principal: patientData.contacto_principal || null,
      estado: patientData.estado || 'Activo',
      // Incluir tutores existentes o los nuevos tutor_ids
      tutores: currentPatient?.tutores || []
    };
    
    // Si hay tutor_ids nuevos, obtener información completa de los tutores
    if (patientData.tutor_ids && patientData.tutor_ids.length > 0) {
      try {
        const tutorsPromises = patientData.tutor_ids.map(async (tutorId) => {
          try {
            console.log(`[pacientesService] Fetching tutor data for ID: ${tutorId}`);
            const tutorResponse = await apiService.get(`/api/tutors/${tutorId}`);
            console.log(`[pacientesService] Tutor response for ${tutorId}:`, tutorResponse);
            
            // El tutorResponse puede ser el objeto directamente o estar en .data
            const tutorData = tutorResponse.data || tutorResponse;
            
            const formattedTutor = {
              id_tutor: tutorData.id_tutor || tutorData.id || tutorId,
              nombre: tutorData.nombre || null,
              relacion: tutorData.relacion || null,
              nacionalidad: tutorData.nacionalidad || null,
              identificacion: tutorData.identificacion || null,
              telefono: tutorData.telefono || null,
              email: tutorData.email || null,
              direccion: tutorData.direccion || null,
              tipo_relacion: tutorData.tipo_relacion || 'TutorLegal',
              estado: tutorData.estado || 'Activo'
            };
            
            console.log(`[pacientesService] Formatted tutor data:`, formattedTutor);
            return formattedTutor;
          } catch (tutorError) {
            console.error(`[pacientesService] Error fetching tutor ${tutorId}:`, tutorError);
            
            // Intentar obtener el tutor de una lista completa como fallback
            try {
              console.log(`[pacientesService] Trying to get tutor from complete list...`);
              const allTutorsResponse = await apiService.get('/api/tutors');
              const allTutors = allTutorsResponse.data || allTutorsResponse;
              
              if (Array.isArray(allTutors)) {
                const foundTutor = allTutors.find(t => 
                  (t.id_tutor === tutorId) || (t.id === tutorId)
                );
                
                if (foundTutor) {
                  console.log(`[pacientesService] Found tutor in complete list:`, foundTutor);
                  return {
                    id_tutor: foundTutor.id_tutor || foundTutor.id || tutorId,
                    nombre: foundTutor.nombre || null,
                    relacion: foundTutor.relacion || null,
                    nacionalidad: foundTutor.nacionalidad || null,
                    identificacion: foundTutor.identificacion || null,
                    telefono: foundTutor.telefono || null,
                    email: foundTutor.email || null,
                    direccion: foundTutor.direccion || null,
                    tipo_relacion: foundTutor.tipo_relacion || 'TutorLegal',
                    estado: foundTutor.estado || 'Activo'
                  };
                }
              }
            } catch (fallbackError) {
              console.warn(`[pacientesService] Fallback tutor fetch also failed:`, fallbackError);
            }
            
            // Si todo falla, devolver objeto con ID solamente
            console.warn(`[pacientesService] Using minimal tutor data for ${tutorId}`);
            return {
              id_tutor: tutorId,
              nombre: null,
              relacion: null,
              nacionalidad: null,
              identificacion: null,
              telefono: null,
              email: null,
              direccion: null,
              tipo_relacion: 'TutorLegal',
              estado: 'Activo'
            };
          }
        });
        
        const tutorsData = await Promise.all(tutorsPromises);
        completePatientData.tutores = tutorsData;
        console.log(`[pacientesService] Tutors data included:`, tutorsData);
      } catch (tutorsError) {
        console.warn(`[pacientesService] Error fetching tutors data:`, tutorsError);
      }
    }
    
    console.log(`[pacientesService] Complete patient data to send:`, completePatientData);
    
    // Usar apiService que maneja mejor las respuestas vacías
    const response = await apiService.put(`/api/patients/${id}`, completePatientData);
    
    console.log(`[pacientesService] Patient updated successfully:`, response);
    
    // Asegurar que devolvemos un formato consistente
    return {
      success: true,
      data: response.success ? completePatientData : response,
      status: response.status || 200
    };
  } catch (error) {
    console.error(`[pacientesService] Error updating patient:`, error);
    throw error;
  }
};
