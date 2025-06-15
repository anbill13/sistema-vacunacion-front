import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { centrosService } from '../../services/centrosService';
import { jsonService } from '../../services/jsonService';
import { usuariosService } from '../../services/usuariosService';
import CentrosFilter from './CentrosFilter';
import CentrosMap from './CentrosMap';
import CentrosList from './CentrosList';
import PacientesModal from '../pacientes/PacientesModal';

const CentrosPage = () => {
  const { currentUser } = useAuth();
  const [centrosVacunacion, setCentrosVacunacion] = useState([]);
  const [filterType, setFilterType] = useState("provincia");
  const [filterTerm, setFilterTerm] = useState("");
  const [filteredCentros, setFilteredCentros] = useState([]);
  const [selectedCentro, setSelectedCentro] = useState(null);
  const [showPacientesModal, setShowPacientesModal] = useState(false);

  useEffect(() => {
    const loadCentros = () => {
      try {
        let centros = jsonService.getData('Centros_Vacunacion', 'GET') || [];
        
        // Si el usuario es un director, filtrar solo sus centros asignados
        if (currentUser?.role === 'director') {
          const centrosAsignados = usuariosService.getCentrosAsignadosADirector(currentUser.id);
          centros = centros.filter(centro => centrosAsignados.includes(centro.id_centro));
        }
        // Si el usuario es un doctor, mostrar solo su centro asignado
        else if (currentUser?.role === 'doctor') {
          const centroAsignado = usuariosService.getCentroAsignadoADoctor(currentUser.id);
          centros = centros.filter(centro => centro.id_centro === centroAsignado);
        }
        
        setCentrosVacunacion(centros);
      } catch (error) {
        console.error('Error loading centros:', error);
        setCentrosVacunacion([]);
      }
    };

    loadCentros();
  }, [currentUser]);
  
  // Debug
  console.log("CentrosPage rendered with centros:", centrosVacunacion.length);

  useEffect(() => {
    setFilteredCentros(centrosService.filterCentros(centrosVacunacion, filterTerm, filterType));
  }, [filterTerm, filterType, centrosVacunacion]);

  const handleCentroClick = (centro) => {
    // Esta función se implementaría para centrar el mapa en el centro seleccionado
    console.log("Centro seleccionado:", centro);
  };

  const handleVerPacientes = (e, centro) => {
    e.stopPropagation();
    setSelectedCentro(centro);
    setShowPacientesModal(true);
  };

  return (
    <div>
      <CentrosFilter 
        filterType={filterType}
        setFilterType={setFilterType}
        filterTerm={filterTerm}
        setFilterTerm={setFilterTerm}
        centrosVacunacion={centrosVacunacion}
      />
      
      <CentrosMap 
        filteredCentros={filteredCentros}
        handleCentroClick={handleCentroClick}
        handleVerPacientes={handleVerPacientes}
        currentUser={currentUser}
      />
      
      <div className="mt-4">
        <h3>Listado de Centros</h3>
        <CentrosList 
          filteredCentros={filteredCentros}
          handleCentroClick={handleCentroClick}
          handleVerPacientes={handleVerPacientes}
          currentUser={currentUser}
        />
      </div>

      {/* Modal de Pacientes */}
      {showPacientesModal && selectedCentro && (
        <PacientesModal 
          isOpen={showPacientesModal}
          onClose={() => setShowPacientesModal(false)}
          centro={selectedCentro}
        />
      )}
    </div>
  );
};

export default CentrosPage;