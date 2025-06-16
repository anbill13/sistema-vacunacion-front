import React, { createContext, useState, useContext, useEffect } from 'react';
import { jsonService } from '../services/jsonService.jsx';
import { usuariosService } from '../services/usuariosService';

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

        // Cargar tutores
        const tutoresData = jsonService.getData('Tutores', 'GET') || [];
        setTutores(tutoresData);

        // Cargar vacunas
        const vacunasData = jsonService.getData('Vacunas', 'GET') || [];
        setVacunas(vacunasData);

        // Cargar lotes de vacunas combinando GET, POST y PUT
        const lotesGet = jsonService.getData('Lotes_Vacunas', 'GET') || [];
        const lotesPost = jsonService.getData('Lotes_Vacunas', 'POST') || [];
        const lotesPut = (jsonService.getData('Lotes_Vacunas', 'PUT') || []).filter(l => l && (l.id_lote || l.id) && (l.cantidad_disponible === undefined || l.cantidad_disponible > 0));
        // Unifica y asegura id_lote único
        const lotesData = [...lotesGet, ...lotesPost, ...lotesPut].map((l, idx) => ({
          ...l,
          id_lote: l.id_lote || l.id || `${l.id_vacuna}_${l.numero_lote || idx}`
        }));
        setLotesVacunas(lotesData);

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
      ninos,
      tutores,
      vacunas,
      lotesVacunas,
      dosisAplicadas,
      directores,
      
      // Funciones para actualizar datos
      setCentrosVacunacion,
      setNinos,
      setTutores,
      setVacunas,
      setLotesVacunas,
      setDosisAplicadas,
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