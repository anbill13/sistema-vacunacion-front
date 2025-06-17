import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { centrosService } from '../../services/centrosService';
import usuariosService from '../../services/usuariosService';
import CentrosFilter from './CentrosFilter';
import CentrosMap from './CentrosMap';
import CentrosList from './CentrosList';
import PacientesModal from '../pacientes/PacientesModal';
import { Card, CardBody, CardHeader, Divider, Spinner } from "@nextui-org/react";

const CentrosPage = () => {
  const { currentUser } = useAuth();
  const [centrosVacunacion, setCentrosVacunacion] = useState([]);
  const [filterType, setFilterType] = useState("provincia");
  const [filterTerm, setFilterTerm] = useState("");
  const [filteredCentros, setFilteredCentros] = useState([]);
  const [selectedCentro, setSelectedCentro] = useState(null);
  const [showPacientesModal, setShowPacientesModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCentros = () => {
      setLoading(true);
      try {
        // Usar el servicio de centros para obtener todos los centros (incluidos los nuevos y actualizados)
        let centros = centrosService.getCentros();
        console.log('Centros cargados en CentrosPage:', centros);

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
      } finally {
        setLoading(false);
      }
    };

    loadCentros();
  }, [currentUser]);

  useEffect(() => {
    setFilteredCentros(centrosService.filterCentros(centrosVacunacion, filterTerm, filterType));
  }, [filterTerm, filterType, centrosVacunacion]);

  const handleCentroClick = (centro) => {
    // Esta función se implementaría para centrar el mapa en el centro seleccionado
    console.log("Centro seleccionado:", centro);
  };

  const handleVerPacientes = (e, centro) => {
    // Evitar la propagación del evento si existe el método stopPropagation
    if (e && typeof e.stopPropagation === 'function') {
      e.stopPropagation();
    }
    setSelectedCentro(centro);
    setShowPacientesModal(true);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardBody>
          <CentrosFilter
            filterType={filterType}
            setFilterType={setFilterType}
            filterTerm={filterTerm}
            setFilterTerm={setFilterTerm}
            centrosVacunacion={centrosVacunacion}
          />
        </CardBody>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader className="bg-primary-50 dark:bg-primary-900/20">
          <h3 className="text-lg font-semibold">Mapa de Centros de Vacunación</h3>
        </CardHeader>
        <CardBody className="p-0">
          {loading ? (
            <div className="flex justify-center items-center h-[400px]">
              <Spinner size="lg" label="Cargando centros..." />
            </div>
          ) : (
            <CentrosMap
              filteredCentros={filteredCentros}
              handleCentroClick={handleCentroClick}
              handleVerPacientes={handleVerPacientes}
              currentUser={currentUser}
            />
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader className="bg-primary-50 dark:bg-primary-900/20">
          <h3 className="text-lg font-semibold">Listado de Centros</h3>
        </CardHeader>
        <Divider />
        <CardBody>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Spinner size="lg" label="Cargando centros..." />
            </div>
          ) : (
            <CentrosList
              filteredCentros={filteredCentros}
              handleCentroClick={handleCentroClick}
              handleVerPacientes={handleVerPacientes}
              currentUser={currentUser}
            />
          )}
        </CardBody>
      </Card>

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