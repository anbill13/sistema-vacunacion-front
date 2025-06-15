import React, { useState, useEffect } from 'react';
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

  const handleToggleExpand = (pacienteId, keys) => {
    if (keys && keys.has("details")) {
      setExpandedPacienteId(pacienteId);
    } else {
      setExpandedPacienteId(null);
    }
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
    </Modal>
  );
};

export default PacientesModal;