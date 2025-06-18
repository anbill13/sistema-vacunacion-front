import React, { createContext, useState, useContext, useEffect } from 'react';
import { jsonService } from '../services/jsonService';
import usuariosService from '../services/usuariosService';
import { useAuth } from './AuthContext';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [centrosVacunacion, setCentrosVacunacion] = useState([]);
  const [ninos, setNinos] = useState([]);
  const [tutores, setTutores] = useState([]);
  const [vacunas, setVacunas] = useState([]);
  const [lotesVacunas, setLotesVacunas] = useState([]);
  const [dosisAplicadas, setDosisAplicadas] = useState([]);
  const [directores, setDirectores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    console.log('[DEBUG] currentUser cambió:', currentUser);
    let mounted = true;

    const loadData = async () => {
      if (!mounted || !currentUser) return;
      setLoading(true);
      setError(null); // Limpiar errores previos
      try {
        const requests = [
          jsonService.getData('Centros_Vacunacion', 'GET'),
          jsonService.getData('Niños', 'GET'),
          jsonService.getData('Tutores', 'GET'),
          jsonService.getData('Vacunas', 'GET'),
          jsonService.getData('Lotes_Vacunas', 'GET'),
          jsonService.getData('Dosis_Aplicadas', 'GET'),
          usuariosService.getUsuarios(),
        ];

        // Si el usuario es director, obtener sus centros asignados
        let centrosAsignadosDirector = [];
        if (currentUser && currentUser.role === 'director') {
          try {
            const directorService = require('../services/directorService').default;
            centrosAsignadosDirector = await directorService.getCentrosAsignados(currentUser.id_usuario || currentUser.id);
            console.log('[DEBUG] Centros asignados obtenidos desde directorService:', centrosAsignadosDirector);
          } catch (e) {
            console.warn('No se pudieron obtener centros asignados del servicio de director', e);
          }
        }

        const [
          centros,
          ninosData,
          tutoresData,
          vacunasData,
          lotesData,
          dosisData,
          usuarios,
        ] = await Promise.all(requests.map(p => p.catch(e => {
          console.error(`Error fetching data: ${e.message}`);
          return null; // Retornar null para evitar fallo total
        })));

        if (!mounted) return;

        console.log('[DEBUG] Centros recibidos:', centros);
        setCentrosVacunacion(Array.isArray(centros) ? centros : centros ? [centros] : []);
        // Si es director, guarda los centros asignados en el usuario para filtrado global
        if (currentUser && currentUser.role === 'director' && centrosAsignadosDirector.length > 0) {
          currentUser.centrosAsignados = centrosAsignadosDirector.map(c => c.id_centro);
          localStorage.setItem('currentUser', JSON.stringify(currentUser));
        }
        setNinos(ninosData?.map(nino => ({
          ...nino,
          activo: nino?.activo !== undefined ? nino.activo : true,
        }) || []));
        const padresUsuarios = usuarios?.filter(u => u?.role === 'responsable') || [];
        setTutores([
          ...(tutoresData || []),
          ...padresUsuarios
            .filter(padre => !tutoresData?.some(t => t?.id_tutor === padre?.id_usuario))
            .map(padre => ({
              id_tutor: padre?.id_usuario,
              nombre: padre?.name || padre?.nombre || '',
              apellido: padre?.apellido || '',
              identificacion: padre?.identificacion || padre?.cedula || padre?.username || padre?.email || '',
            })),
        ]);
        setVacunas(vacunasData || []);
        setLotesVacunas(lotesData || []);
        setDosisAplicadas(dosisData || []);
        setDirectores(
          (usuarios || [])
            .filter(user => user?.role === 'director')
            .map(director => ({
              ...director,
              centrosAsignados: director?.centrosAsignados || [],
            })) || []
        );
      } catch (err) {
        if (mounted) {
          setError(err.message || 'Error al cargar datos');
          console.error('General error loading data:', err);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    // Si el usuario no está autenticado, no limpiar el estado por defecto, solo mostrar error
    if (!currentUser) {
      console.warn('[DEBUG] currentUser es null, no se cargan ni limpian datos.');
      setError('Debes iniciar sesión para ver los datos.');
      return;
    }

    loadData();

    // Permitir recarga manual desde componentes hijos
    DataProvider.reloadData = loadData;

    return () => { mounted = false; };
  }, [currentUser]);

  const handleUpdateNino = async (updatedNino) => {
    try {
      await jsonService.saveData('Niños', 'PUT', updatedNino);
      setNinos(prevNinos =>
        prevNinos.map(nino =>
          nino.id_niño === updatedNino.id_niño ? updatedNino : nino
        )
      );
    } catch (error) {
      console.error('Error updating niño:', error);
    }
  };

  const handleUpdateTutor = async (updatedTutor) => {
    try {
      await jsonService.saveData('Tutores', 'PUT', updatedTutor);
      setTutores(prevTutores =>
        prevTutores.map(tutor =>
          tutor.id_tutor === updatedTutor.id_tutor ? updatedTutor : tutor
        )
      );
    } catch (error) {
      console.error('Error updating tutor:', error);
    }
  };

  const handleNinoAdd = async (newNino) => {
    try {
      const savedNino = await jsonService.saveData('Niños', 'POST', newNino);
      setNinos(prevNinos => [...prevNinos, savedNino]);
    } catch (error) {
      console.error('Error adding niño:', error);
    }
  };

  const handleTutorAdd = async (newTutor) => {
    try {
      const savedTutor = await jsonService.saveData('Tutores', 'POST', newTutor);
      setTutores(prevTutores => [...prevTutores, savedTutor]);
    } catch (error) {
      console.error('Error adding tutor:', error);
    }
  };

  const togglePacienteStatus = async (pacienteId) => {
    try {
      const nino = ninos.find(n => n.id_niño === pacienteId);
      if (!nino) return;
      const updatedNino = { ...nino, activo: !nino.activo };
      await jsonService.saveData('Niños', 'PUT', updatedNino);
      setNinos(prevNinos =>
        prevNinos.map(n =>
          n.id_niño === pacienteId ? { ...n, activo: !n.activo } : n
        )
      );
    } catch (error) {
      console.error('Error toggling paciente status:', error);
    }
  };

  const getTutorNombre = (idTutor) => {
    const tutor = tutores.find(t => t.id_tutor === idTutor);
    return tutor ? `${tutor.nombre} ${tutor.apellido || ''}` : 'No especificado';
  };

  const getHistorialVacunas = async (ninoId) => {
    try {
      const dosisDelNino = await jsonService.getData('Dosis_Aplicadas', 'GET', { id_niño: ninoId });
      return dosisDelNino.map(dosis => {
        const lote = lotesVacunas.find(l => l.id_lote === dosis.id_lote);
        const vacuna = vacunas.find(v => v.id_vacuna === lote?.id_vacuna);
        return {
          ...dosis,
          nombre_vacuna: vacuna?.nombre_vacuna || 'Desconocida',
          numero_lote: lote?.numero_lote || 'N/A',
        };
      });
    } catch (error) {
      console.error('Error fetching historial vacunas:', error);
      return [];
    }
  };

  const getVacunasFaltantes = async (ninoId) => {
    try {
      const historial = await getHistorialVacunas(ninoId);
      const vacunasAplicadas = historial.map(h => h.nombre_vacuna);
      const vacunasRequeridas = vacunas.map(v => v.nombre_vacuna);
      return vacunasRequeridas.filter(vacuna => !vacunasAplicadas.includes(vacuna));
    } catch (error) {
      console.error('Error calculating vacunas faltantes:', error);
      return [];
    }
  };

  const getCoverageReport = async (idCentro) => {
    try {
      return await jsonService.getData('Reportes', 'GET', { type: 'coverage', id_centro: idCentro });
    } catch (error) {
      console.error('Error fetching coverage report:', error);
      return [];
    }
  };

  const getPendingAppointments = async (idNiño) => {
    try {
      return await jsonService.getData('Reportes', 'GET', { type: 'pending-appointments', id_niño: idNiño });
    } catch (error) {
      console.error('Error fetching pending appointments:', error);
      return [];
    }
  };

  const getExpiredBatches = async (idCentro) => {
    try {
      return await jsonService.getData('Reportes', 'GET', { type: 'expired-batches', id_centro: idCentro });
    } catch (error) {
      console.error('Error fetching expired batches:', error);
      return [];
    }
  };

  const getIncompleteSchedules = async (idNiño) => {
    try {
      return await jsonService.getData('Reportes', 'GET', { type: 'incomplete-schedules', id_niño: idNiño });
    } catch (error) {
      console.error('Error fetching incomplete schedules:', error);
      return [];
    }
  };

  const updateDirectorCentros = async (directorId, newCentros) => {
    try {
      const director = directores.find(d => d.id_usuario === directorId);
      if (!director) return;
      const updatedDirector = { ...director, centrosAsignados: newCentros };
      await jsonService.saveData('Usuarios', 'PUT', updatedDirector);
      setDirectores(prevDirectores =>
        prevDirectores.map(d =>
          d.id_usuario === directorId ? { ...d, centrosAsignados: [...newCentros] } : d
        )
      );
    } catch (error) {
      console.error('Error updating director centros:', error);
    }
  };

  const getCentrosDisponibles = (excludeDirectorId = null) => {
    const centrosAsignados = directores
      .filter(director => director.id_usuario !== excludeDirectorId)
      .flatMap(director => director.centrosAsignados);
    return centrosVacunacion.filter(centro => !centrosAsignados.includes(centro.id_centro));
  };

  const getCentrosAsignadosADirector = (directorId) => {
    const director = directores.find(d => d.id_usuario === directorId);
    return director ? director.centrosAsignados : [];
  };

  return (
    <DataContext.Provider
      value={{
        centrosVacunacion,
        setCentrosVacunacion,
        ninos,
        setNinos,
        tutores,
        setTutores,
        vacunas,
        setVacunas,
        lotesVacunas,
        setLotesVacunas,
        dosisAplicadas,
        setDosisAplicadas,
        directores,
        setDirectores,
        handleUpdateNino,
        handleUpdateTutor,
        handleNinoAdd,
        handleTutorAdd,
        togglePacienteStatus,
        getTutorNombre,
        getHistorialVacunas,
        getVacunasFaltantes,
        getCoverageReport,
        getPendingAppointments,
        getExpiredBatches,
        getIncompleteSchedules,
        updateDirectorCentros,
        getCentrosDisponibles,
        getCentrosAsignadosADirector,
        loading,
        error,
        reloadData: DataProvider.reloadData
      }}
    >
      {error && (
        <div style={{color:'red',background:'#fff3f3',padding:'1rem',textAlign:'center',fontWeight:'bold'}}>
          {error}
        </div>
      )}
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);