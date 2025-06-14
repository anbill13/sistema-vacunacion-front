import React, { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { filterCentros } from '../../services/centrosService';
import CentrosFilter from './CentrosFilter';
import CentrosMap from './CentrosMap';
import CentrosList from './CentrosList';
import PacientesModal from '../pacientes/PacientesModal';

const CentrosPage = () => {
  const { centrosVacunacion = [] } = useData();
  const { currentUser } = useAuth();
  
  const [filterType, setFilterType] = useState("provincia");
  const [filterTerm, setFilterTerm] = useState("");
  const [filteredCentros, setFilteredCentros] = useState([]);
  const [selectedCentro, setSelectedCentro] = useState(null);
  const [showPacientesModal, setShowPacientesModal] = useState(false);
  
  // Debug
  console.log("CentrosPage rendered with centros:", centrosVacunacion.length);

  useEffect(() => {
    setFilteredCentros(filterCentros(centrosVacunacion, filterTerm, filterType));
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