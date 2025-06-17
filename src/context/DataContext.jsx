import React, { createContext, useState, useContext, useEffect } from 'react';
import { jsonService } from '../services/jsonService.jsx';
import { usuariosService } from '../services/usuariosService.jsx';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [centrosVacunacion, setCentrosVacunacion] = useState([]);
  const [ninos, setNinos] = useState([]);
  const [tutores, setTutores] = useState([]);
  const [vacunas, setVacunas] = useState([]);
  const [lotesVacunas, setLotesVacunas] = useState([]);
  const [dosisAplicadas, setDosisAplicadas] = useState([]);
  const [directores, setDirectores] = useState([]);

  useEffect(() => {
    // Cargar datos usando los servicios
    const loadData = () => {
      try {
        // Cargar centros
        const centros = jsonService.getData('Centros_Vacunacion', 'GET') || [];
        setCentrosVacunacion(centros);

        // Cargar niños y configurar estado activo por defecto
        const ninosData = jsonService.getData('Niños', 'GET') || [];
        const ninosWithActive = ninosData.map(nino => ({
          ...nino,
          activo: nino.activo !== undefined ? nino.activo : true
        }));
        setNinos(ninosWithActive);

        // Cargar tutores y unificar con usuarios con rol 'padre' (para todos los roles)
        const tutoresData = jsonService.getData('Tutores', 'GET') || [];
        let padresUsuarios = [];
        try {
          padresUsuarios = usuariosService.getUsuarios().filter(u => u.role === 'padre');
        } catch (e) {}
        // Unificar por id_tutor (evitar duplicados)
        const todosTutores = [
          ...tutoresData,
          ...padresUsuarios.filter(padre => !tutoresData.some(t => t.id_tutor === padre.id))
            .map(padre => ({
              id_tutor: padre.id,
              nombre: padre.name || padre.nombre || '',
              apellido: padre.apellido || '',
              identificacion: padre.identificacion || padre.cedula || padre.username || padre.email || padre.correo || '',
            }))
        ];
        setTutores(todosTutores);

        // Unificar vacunas de GET, POST y PUT (sin duplicados)
        const vacunasGet = jsonService.getData('Vacunas', 'GET') || [];
        const vacunasPost = jsonService.getData('Vacunas', 'POST') || [];
        const vacunasPut = jsonService.getData('Vacunas', 'PUT') || [];
        const vacunasDelete = jsonService.getData('Vacunas', 'DELETE') || [];
        // Prioridad: PUT > POST > GET, y filtrar eliminadas
        const vacunasUnificadas = [...vacunasGet, ...vacunasPost, ...vacunasPut].reduce((acc, v) => {
          if (!v || !v.id_vacuna) return acc;
          if (!acc.some(x => x.id_vacuna === v.id_vacuna)) acc.push(v);
          return acc;
        }, []).filter(v => !vacunasDelete.includes(v.id_vacuna));
        setVacunas(vacunasUnificadas);

        // Unificar lotes de GET, POST y PUT (sin duplicados)
        const lotesGet = jsonService.getData('Lotes_Vacunas', 'GET') || [];
        const lotesPost = jsonService.getData('Lotes_Vacunas', 'POST') || [];
        const lotesPut = jsonService.getData('Lotes_Vacunas', 'PUT') || [];
        const lotesDelete = jsonService.getData('Lotes_Vacunas', 'DELETE') || [];
        const lotesUnificados = [...lotesGet, ...lotesPost, ...lotesPut].reduce((acc, l) => {
          const id_lote = l?.id_lote || l?.id || `${l?.id_vacuna}_${l?.numero_lote}`;
          if (!id_lote) return acc;
          if (!acc.some(x => (x.id_lote || x.id) === id_lote)) acc.push({ ...l, id_lote });
          return acc;
        }, []).filter(l => !lotesDelete.includes(l.id_lote));
        setLotesVacunas(lotesUnificados);

        // Cargar dosis aplicadas
        const dosisData = jsonService.getData('Dosis_Aplicadas', 'GET') || [];
        setDosisAplicadas(dosisData);

        // Cargar directores con sus centros asignados
        const usuarios = usuariosService.getUsuarios();
        const directoresData = usuarios
          .filter(user => user.role === 'director')
          .map(director => ({
            ...director,
            centrosAsignados: director.centrosAsignados || []
          }));

        setDirectores(directoresData);
      } catch (error) {
        console.error('Error al cargar datos:', error);
      }
    };

    loadData();
  }, []);

  // Funciones para actualizar datos
  const handleUpdateNino = (updatedNino) => {
    setNinos((prevNinos) =>
      prevNinos.map((nino) =>
        nino.id_niño === updatedNino.id_niño ? updatedNino : nino
      )
    );
  };

  const handleUpdateTutor = (updatedTutor) => {
    setTutores((prevTutores) =>
      prevTutores.map((tutor) =>
        tutor.id_tutor === updatedTutor.id_tutor ? updatedTutor : tutor
      )
    );
  };

  const handleNinoAdd = (newNino) => {
    setNinos((prevNinos) => [...prevNinos, newNino]);
  };

  const handleTutorAdd = (newTutor) => {
    setTutores((prevTutores) => [...prevTutores, newTutor]);
  };

  const togglePacienteStatus = (pacienteId) => {
    setNinos(prevNinos => 
      prevNinos.map(nino => 
        nino.id_niño === pacienteId 
          ? { ...nino, activo: !nino.activo }
          : nino
      )
    );
  };

  // Funciones para obtener datos
  const getTutorNombre = (idTutor) => {
    const tutor = tutores.find((t) => t.id_tutor === idTutor);
    return tutor ? `${tutor.nombre} ${tutor.apellido}` : "No especificado";
  };

  const getHistorialVacunas = (ninoId) => {
    if (!dosisAplicadas) return [];
    const dosisDelNino = dosisAplicadas.filter(d => d.id_niño === ninoId);
    return dosisDelNino.map(dosis => {
      const lote = lotesVacunas.find(l => l.id_lote === dosis.id_lote);
      const vacuna = vacunas.find(v => v.id_vacuna === lote?.id_vacuna);
      return {
        ...dosis,
        nombre_vacuna: vacuna?.nombre_vacuna || 'Desconocida',
        numero_lote: lote?.numero_lote || 'N/A'
      };
    });
  };

  const getVacunasFaltantes = (ninoId) => {
    const historial = getHistorialVacunas(ninoId);
    const vacunasAplicadas = historial.map(h => h.nombre_vacuna);
    
    // Lista de vacunas requeridas
    const vacunasRequeridas = vacunas.map(v => v.nombre_vacuna);
    
    return vacunasRequeridas.filter(vacuna => !vacunasAplicadas.includes(vacuna));
  };

  // Funciones para directores
  const updateDirectorCentros = (directorId, newCentros) => {
    setDirectores(prevDirectores => 
      prevDirectores.map(director => 
        director.id === directorId 
          ? { ...director, centrosAsignados: [...newCentros] }
          : director
      )
    );
  };

  const getCentrosDisponibles = (excludeDirectorId = null) => {
    const centrosAsignados = directores
      .filter(director => director.id !== excludeDirectorId)
      .flatMap(director => director.centrosAsignados);
    
    return centrosVacunacion.filter(centro => 
      !centrosAsignados.includes(centro.id_centro)
    );
  };

  const getCentrosAsignadosADirector = (directorId) => {
    const director = directores.find(d => d.id === directorId);
    return director ? director.centrosAsignados : [];
  };

  return (
    <DataContext.Provider value={{
      // Datos
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
      
      // Funciones para obtener datos
      getTutorNombre,
      getHistorialVacunas,
      getVacunasFaltantes,
      
      // Funciones para directores
      updateDirectorCentros,
      getCentrosDisponibles,
      getCentrosAsignadosADirector
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);