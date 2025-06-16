import React, { useState, useEffect } from 'react';
<<<<<<< HEAD
import { 
  Modal, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  ModalFooter 
} from "@nextui-org/react";
import { 
  Button, 
  Input, 
  Card, 
  CardBody, 
  Chip, 
  Accordion, 
  AccordionItem, 
  Table, 
  TableHeader, 
  TableBody, 
  TableColumn, 
  TableRow, 
  TableCell,
  Divider
} from "@nextui-org/react";
=======
import { Modal, ModalHeader, ModalBody } from '../ui/Modal';
import Button from '../ui/Button';
>>>>>>> develop
import { getPacientesCentro } from '../../services/pacientesService';
import { vacunasService } from '../../services/vacunasService';
import { jsonService } from '../../services/jsonService';

const PacientesModal = ({ isOpen, onClose, centro }) => {
  const [pacientesCentro, setPacientesCentro] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedPacienteId, setExpandedPacienteId] = useState(null);

  const getHistorialVacunas = (id_niño) => {
    return vacunasService.getHistorialVacunas(id_niño);
  };

  const getVacunasFaltantes = (id_niño) => {
    return vacunasService.getVacunasFaltantes(id_niño);
  };

  const getTutorNombre = (id_tutor) => {
    if (!id_tutor) return 'No especificado';
    const tutores = jsonService.getData('Tutores', 'GET') || [];
    const tutor = tutores.find(t => t.id_tutor === id_tutor);
    return tutor ? tutor.nombre_completo : 'No encontrado';
  };

  useEffect(() => {
    if (centro) {
      const pacientesDelCentro = getPacientesCentro(centro.id_centro);
      setPacientesCentro(pacientesDelCentro);
    }
  }, [centro]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const filteredPacientes = pacientesCentro.filter(paciente => 
    paciente.nombre_completo.toLowerCase().includes(searchTerm) ||
    paciente.id_niño.toString().includes(searchTerm)
  );

<<<<<<< HEAD
  const handleToggleExpand = (pacienteId, keys) => {
    if (keys && keys.has("details")) {
      setExpandedPacienteId(pacienteId);
    } else {
      setExpandedPacienteId(null);
    }
=======
  const handleToggleExpand = (pacienteId) => {
    setExpandedPacienteId(expandedPacienteId === pacienteId ? null : pacienteId);
>>>>>>> develop
  };

  const handleToggleStatus = (e, pacienteId) => {
    e.stopPropagation();
    const ninos = jsonService.getData('Niños', 'GET') || [];
    const nino = ninos.find(n => n.id_niño === pacienteId);
    if (nino) {
      nino.activo = !nino.activo;
      jsonService.saveData('Niños', 'PUT', ninos);
      // Actualizar la lista local
      setPacientesCentro(pacientesCentro.map(p => 
        p.id_niño === pacienteId ? {...p, activo: nino.activo} : p
      ));
    }
  };

  return (
<<<<<<< HEAD
    <Modal isOpen={isOpen} onClose={onClose} size="3xl">
      <ModalContent>
        <ModalHeader>
          Pacientes de {centro?.nombre_centro}
        </ModalHeader>
        <ModalBody>
          <Input
          type="text"
          placeholder="Buscar paciente por nombre o ID..."
          value={searchTerm}
          onChange={handleSearch}
          className="mb-4"
          isClearable
          startContent={
            <span className="text-default-400 text-small">🔍</span>
          }
        />

        {filteredPacientes.length > 0 ? (
          <div className="space-y-3">
            {filteredPacientes.map(paciente => (
              <Card 
                key={paciente.id_niño} 
                className={`${!paciente.activo ? 'opacity-70' : ''}`}
                shadow="sm"
              >
                <CardBody className="p-0">
                  <Accordion 
                    variant="shadow"
                    selectionMode="single"
                    selectedKeys={expandedPacienteId === paciente.id_niño ? ["details"] : []}
                    onSelectionChange={(keys) => {
                      handleToggleExpand(paciente.id_niño, keys);
                    }}
                  >
                    <AccordionItem
                      key="details"
                      aria-label={`Detalles de ${paciente.nombre_completo}`}
                      title={
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{paciente.nombre_completo}</span>
                            {!paciente.activo && (
                              <Chip color="warning" size="sm" variant="flat">Inactivo</Chip>
                            )}
                          </div>
                          <div className="text-small text-default-500">
                            ID: {paciente.id_niño} | Tutor: {getTutorNombre(paciente.id_tutor)}
                          </div>
                        </div>
                      }
                      indicator={
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            color={paciente.activo ? "danger" : "success"}
                            variant="flat"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleStatus(e, paciente.id_niño);
                            }}
                          >
                            {paciente.activo ? "Desactivar" : "Activar"}
                          </Button>
                        </div>
                      }
                    >
                      <div className="px-2 py-3 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          <div>
                            <span className="font-semibold">Fecha de Nacimiento:</span> {paciente.fecha_nacimiento}
                          </div>
                          <div>
                            <span className="font-semibold">Género:</span> {paciente.genero}
                          </div>
                          <div>
                            <span className="font-semibold">Dirección:</span> {paciente.direccion_residencia}
                          </div>
                        </div>
                        
                        <Divider />
                        
                        <div>
                          <h6 className="text-md font-semibold mb-2">Historial de Vacunación</h6>
                          {getHistorialVacunas(paciente.id_niño).length > 0 ? (
                            <Table 
                              aria-label="Historial de vacunación"
                              isStriped
                              isCompact
                              removeWrapper
                            >
                              <TableHeader>
                                <TableColumn>VACUNA</TableColumn>
                                <TableColumn>FECHA</TableColumn>
                                <TableColumn>LOTE</TableColumn>
                              </TableHeader>
                              <TableBody>
                                {getHistorialVacunas(paciente.id_niño).map((dosis, index) => (
                                  <TableRow key={index}>
                                    <TableCell>{dosis.nombre_vacuna}</TableCell>
                                    <TableCell>{dosis.fecha_aplicacion}</TableCell>
                                    <TableCell>{dosis.numero_lote}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          ) : (
                            <p className="text-default-500">No hay registros de vacunación</p>
                          )}
                        </div>
                        
                        <Divider />
                        
                        <div>
                          <h6 className="text-md font-semibold mb-2">Vacunas Pendientes</h6>
                          {getVacunasFaltantes(paciente.id_niño).length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {getVacunasFaltantes(paciente.id_niño).map((vacuna, index) => (
                                <Chip key={index} color="warning" variant="flat">{vacuna}</Chip>
                              ))}
                            </div>
                          ) : (
                            <Chip color="success" variant="flat">Todas las vacunas aplicadas</Chip>
                          )}
                        </div>
                      </div>
                    </AccordionItem>
                  </Accordion>
                </CardBody>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Chip color="warning" variant="flat" size="lg">
              {searchTerm 
                ? "No se encontraron pacientes que coincidan con la búsqueda." 
                : "No hay pacientes registrados en este centro."}
            </Chip>
          </div>
        )}
      </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={onClose}>
            Cerrar
          </Button>
        </ModalFooter>
      </ModalContent>
=======
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
>>>>>>> develop
    </Modal>
  );
};

export default PacientesModal;