import React, { createContext, useState, useContext, useEffect } from 'react';
import jsonData from '../json_prueba.json';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [centrosVacunacion, setCentrosVacunacion] = useState([]);
  const [ninos, setNinos] = useState([]);
  const [tutores, setTutores] = useState([]);
  const [vacunas, setVacunas] = useState([]);
  const [lotesVacunas, setLotesVacunas] = useState([]);
  const [dosisAplicadas, setDosisAplicadas] = useState([]);
  const [directores, setDirectores] = useState([
    { id: 1, username: 'director1', name: 'Dr. Roberto Méndez', email: 'roberto.mendez@centros.com', centrosAsignados: [1, 2], role: 'director', active: true },
    { id: 2, username: 'director2', name: 'Dra. Carmen Jiménez', email: 'carmen.jimenez@centros.com', centrosAsignados: [3, 4, 5], role: 'director', active: true },
    { id: 3, username: 'director3', name: 'Dr. Luis Fernández', email: 'luis.fernandez@centro.com', centrosAsignados: [6], role: 'director', active: true }
  ]);

  useEffect(() => {
    // Cargar datos del JSON
    const centrosGet = jsonData.Centros_Vacunacion.GET;
    const centrosPost = jsonData.Centros_Vacunacion.POST.map((centro) => ({
      ...centro,
      id_centro: `temp-${Math.random()}`,
      fecha_creacion: new Date().toISOString(),
      fecha_actualizacion: new Date().toISOString(),
    }));
    const allCentros = [...centrosGet, ...centrosPost];
    setCentrosVacunacion(allCentros);
    
    const ninosGet = jsonData.Niños.GET.map((nino) => ({
      ...nino,
      activo: nino.activo !== undefined ? nino.activo : true // Por defecto activo
    }));
    const ninosPost = jsonData.Niños.POST.map((nino) => ({
      ...nino,
      id_niño: `temp-${Math.random()}`,
      fecha_creacion: new Date().toISOString(),
      fecha_actualizacion: new Date().toISOString(),
      activo: nino.activo !== undefined ? nino.activo : true // Por defecto activo
    }));
    setNinos([...ninosGet, ...ninosPost]);
    
    const tutoresGet = jsonData.Tutores.GET;
    const tutoresPost = jsonData.Tutores.POST.map((tutor) => ({
      ...tutor,
      id_tutor: `temp-${Math.random()}`,
      fecha_creacion: new Date().toISOString(),
      fecha_actualizacion: new Date().toISOString(),
    }));
    setTutores([...tutoresGet, ...tutoresPost]);
    
    setVacunas(jsonData.Vacunas.GET);
    setLotesVacunas(jsonData.Lotes_Vacunas.GET);
    setDosisAplicadas(jsonData.Dosis_Aplicadas?.GET || []); // Asumiendo que existe esta sección
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