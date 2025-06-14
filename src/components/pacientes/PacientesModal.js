import React, { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody } from '../ui/Modal';
import Button from '../ui/Button';
import { useData } from '../../contexts/DataContext';

const PacientesModal = ({ isOpen, onClose, centro }) => {
  const { 
    ninos, 
    togglePacienteStatus, 
    getTutorNombre, 
    getHistorialVacunas,
    getVacunasFaltantes
  } = useData();
  
  const [pacientesCentro, setPacientesCentro] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedPacienteId, setExpandedPacienteId] = useState(null);

  useEffect(() => {
    if (centro) {
      const pacientesDelCentro = ninos.filter(
        nino => nino.id_centro_salud === centro.id_centro
      );
      setPacientesCentro(pacientesDelCentro);
    }
  }, [centro, ninos]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const filteredPacientes = pacientesCentro.filter(paciente => 
    paciente.nombre_completo.toLowerCase().includes(searchTerm) ||
    paciente.id_niño.toString().includes(searchTerm)
  );

  const handleToggleExpand = (pacienteId) => {
    setExpandedPacienteId(expandedPacienteId === pacienteId ? null : pacienteId);
  };

  const handleToggleStatus = (e, pacienteId) => {
    e.stopPropagation();
    togglePacienteStatus(pacienteId);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalHeader>
        <div className="modal-header-content">
          <h4>Pacientes de {centro?.nombre_centro}</h4>
          <button 
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Cerrar modal"
          >
            ✕
          </button>
        </div>
      </ModalHeader>
      <ModalBody>
        <div className="search-container mb-4">
          <input
            type="text"
            className="form-control"
            placeholder="Buscar paciente por nombre o ID..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>

        {filteredPacientes.length > 0 ? (
          <div className="patients-list">
            {filteredPacientes.map(paciente => (
              <div 
                key={paciente.id_niño} 
                className={`patient-item ${!paciente.activo ? 'inactive-patient' : ''}`}
                onClick={() => handleToggleExpand(paciente.id_niño)}
              >
                <div className="patient-info">
                  <div className="patient-name">
                    {paciente.nombre_completo}
                    {!paciente.activo && <span className="inactive-badge"> (Inactivo)</span>}
                  </div>
                  <div className="patient-details">
                    ID: {paciente.id_niño} | Tutor: {getTutorNombre(paciente.id_tutor)}
                  </div>
                  
                  {expandedPacienteId === paciente.id_niño && (
                    <div className="patient-expanded-info mt-2">
                      <div className="patient-data-row">
                        <strong>Fecha de Nacimiento:</strong> {paciente.fecha_nacimiento}
                      </div>
                      <div className="patient-data-row">
                        <strong>Género:</strong> {paciente.genero}
                      </div>
                      <div className="patient-data-row">
                        <strong>Dirección:</strong> {paciente.direccion_residencia}
                      </div>
                      
                      <div className="patient-vaccines mt-2">
                        <h6>Historial de Vacunación</h6>
                        {getHistorialVacunas(paciente.id_niño).length > 0 ? (
                          <table className="table table-sm">
                            <thead>
                              <tr>
                                <th>Vacuna</th>
                                <th>Fecha</th>
                                <th>Lote</th>
                              </tr>
                            </thead>
                            <tbody>
                              {getHistorialVacunas(paciente.id_niño).map((dosis, index) => (
                                <tr key={index}>
                                  <td>{dosis.nombre_vacuna}</td>
                                  <td>{dosis.fecha_aplicacion}</td>
                                  <td>{dosis.numero_lote}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : (
                          <p className="text-muted">No hay registros de vacunación</p>
                        )}
                      </div>
                      
                      <div className="patient-pending-vaccines mt-2">
                        <h6>Vacunas Pendientes</h6>
                        {getVacunasFaltantes(paciente.id_niño).length > 0 ? (
                          <ul>
                            {getVacunasFaltantes(paciente.id_niño).map((vacuna, index) => (
                              <li key={index}>{vacuna}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-muted">Todas las vacunas aplicadas</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="patient-actions">
                  <Button
                    size="sm"
                    className={expandedPacienteId === paciente.id_niño ? "btn-secondary" : "btn-primary"}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleExpand(paciente.id_niño);
                    }}
                  >
                    {expandedPacienteId === paciente.id_niño ? "Ocultar" : "Ver Detalles"}
                  </Button>
                  
                  <Button
                    size="sm"
                    className={paciente.activo ? "btn-danger" : "btn-success"}
                    onClick={(e) => handleToggleStatus(e, paciente.id_niño)}
                  >
                    {paciente.activo ? "Desactivar" : "Activar"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-patients">
            <p className="text-center text-muted">
              {searchTerm 
                ? "No se encontraron pacientes que coincidan con la búsqueda." 
                : "No hay pacientes registrados en este centro."}
            </p>
          </div>
        )}
      </ModalBody>
    </Modal>
  );
};

export default PacientesModal;