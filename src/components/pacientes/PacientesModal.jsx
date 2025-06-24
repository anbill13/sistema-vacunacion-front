import React, { useState, useEffect, useRef } from 'react';
import { useData } from '../../context/DataContext';
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
  Divider,
  Spinner,
} from '@nextui-org/react';
import { getPacientesCentro, getHistorialVacunacion, getTutoresPorNino } from '../../services/pacientesService';
import vacunasService from '../../services/vacunasService';

const API_URL = 'https://sistema-vacunacion-backend.onrender.com/api';

const PacientesModal = ({ isOpen, onClose, centro }) => {
  const { dosisAplicadas = [], vacunas = [] } = useData();
  const [pacientesCentro, setPacientesCentro] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedPacienteId, setExpandedPacienteId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [historialVacunas, setHistorialVacunas] = useState({});
  const [vacunasFaltantes, setVacunasFaltantes] = useState({});
  const [tutoresNombres, setTutoresNombres] = useState({});
  const initialLoadRef = useRef(false);

  useEffect(() => {
    console.log(`[PacientesModal #${Date.now()}] Modal props - isOpen: ${isOpen}, centro:`, centro);
    let isMounted = true;

    const loadPacientes = async () => {
      console.log(
        `[PacientesModal #${Date.now()}] loadPacientes called: isOpen=${isOpen}, centro=${JSON.stringify(
          centro
        )}, initialLoadRef=${initialLoadRef.current}, loading=${loading}`
      );

      if (!isOpen || !centro?.id_centro) {
        console.log(`[PacientesModal #${Date.now()}] Skipping load due to conditions`);
        return;
      }

      setLoading(true);
      setError(null);
      console.log(
        `[PacientesModal #${Date.now()}] Fetching patients for centro ${centro.id_centro} (${centro.nombre_centro})`
      );

      try {
        console.log(
          `[PacientesModal #${Date.now()}] Calling getPacientesCentro with id_centro=${centro.id_centro}`
        );
        const pacientesDelCentro = await getPacientesCentro(centro.id_centro);
        console.log(`[PacientesModal #${Date.now()}] Patients fetched:`, pacientesDelCentro);

        if (!Array.isArray(pacientesDelCentro)) {
          console.error(
            `[PacientesModal #${Date.now()}] Patients data is not an array:`,
            pacientesDelCentro
          );
          throw new Error('Formato de datos de pacientes inválido');
        }

        if (isMounted) {
          setPacientesCentro(pacientesDelCentro);
          initialLoadRef.current = true;
          console.log(
            `[PacientesModal #${Date.now()}] Set pacientesCentro with ${pacientesDelCentro.length} patients for centro ${centro.id_centro}`
          );
        }
      } catch (err) {
        console.error(`[PacientesModal #${Date.now()}] Error fetching patients:`, err, err.stack);
        if (isMounted) {
          setError(`Error: ${err.message} (Status: ${err.status || 'unknown'})`);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          console.log(`[PacientesModal #${Date.now()}] Loading complete`);
        }
      }
    };

    loadPacientes();

    return () => {
      isMounted = false;
      console.log(`[PacientesModal #${Date.now()}] Cleanup: Component unmounted`);
    };
  }, [isOpen, centro, loading]);

  useEffect(() => {
    if (!isOpen) {
      initialLoadRef.current = false;
      setPacientesCentro([]);
      setError(null);
      setSearchTerm('');
      setExpandedPacienteId(null);
      setHistorialVacunas({});
      setVacunasFaltantes({});
      setTutoresNombres({});
      console.log(`[PacientesModal #${Date.now()}] Modal closed: Reset initialLoadRef and states`);
    }
  }, [isOpen]);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    console.log(`[PacientesModal #${Date.now()}] Search term updated: ${term}`);
  };

  const filteredPacientes = pacientesCentro.filter((paciente) =>
    (paciente.nombre_completo && paciente.nombre_completo.toLowerCase().includes(searchTerm)) ||
    (paciente.id_paciente && paciente.id_paciente.toLowerCase().includes(searchTerm))
  );
  console.log(`[PacientesModal #${Date.now()}] Filtered patients for render:`, filteredPacientes);

  const loadHistorialVacunas = async (id_paciente) => {
    if (!historialVacunas[id_paciente]) {
      try {
        const historial = await getHistorialVacunacion(id_paciente);
        setHistorialVacunas((prev) => ({ ...prev, [id_paciente]: historial || [] }));
        console.log(
          `[PacientesModal #${Date.now()}] Loaded historial for id_paciente ${id_paciente}:`,
          historial
        );
      } catch (error) {
        console.error(
          `[PacientesModal #${Date.now()}] Error loading historial for id_paciente ${id_paciente}:`,
          error
        );
        setHistorialVacunas((prev) => ({ ...prev, [id_paciente]: [] }));
      }
    }
    return historialVacunas[id_paciente] || [];
  };

  const loadVacunasFaltantes = async (id_paciente) => {
    if (!vacunasFaltantes[id_paciente]) {
      try {
        const faltantes = await vacunasService.getVacunasFaltantes(id_paciente, {
          dosisAplicadas,
          vacunas,
        });
        setVacunasFaltantes((prev) => ({ ...prev, [id_paciente]: faltantes || [] }));
        console.log(
          `[PacientesModal #${Date.now()}] Loaded vacunas faltantes for id_paciente ${id_paciente}:`,
          faltantes
        );
      } catch (error) {
        console.error(
          `[PacientesModal #${Date.now()}] Error loading vacunas faltantes for id_paciente ${id_paciente}:`,
          error
        );
        setVacunasFaltantes((prev) => ({ ...prev, [id_paciente]: [] }));
      }
    }
    return vacunasFaltantes[id_paciente] || [];
  };

  const loadTutorNombre = async (id_paciente, tutores = []) => {
    if (!tutoresNombres[id_paciente]) {
      try {
        if (!id_paciente) {
          console.log(`[PacientesModal #${Date.now()}] No id_paciente provided`);
          setTutoresNombres((prev) => ({ ...prev, [id_paciente]: 'No especificado' }));
          return 'No especificado';
        }

        let tutorList = tutores;
        // If no tutors in API response, fetch from endpoint
        if (tutorList.length === 0) {
          tutorList = await getTutoresPorNino(id_paciente);
          console.log(
            `[PacientesModal #${Date.now()}] Fetched tutors for id_paciente ${id_paciente}:`,
            tutorList
          );
        }

        if (!tutorList || tutorList.length === 0) {
          console.log(`[PacientesModal #${Date.now()}] No tutors found for id_paciente ${id_paciente}`);
          setTutoresNombres((prev) => ({ ...prev, [id_paciente]: 'No especificado' }));
          return 'No especificado';
        }

        // Format tutor names based on count
        let displayText;
        if (tutorList.length === 1) {
          const tutorName = tutorList[0].nombre || 'No especificado';
          displayText = `Tutor: ${tutorName}`;
        } else {
          // Take first two tutors for "Responsables"
          const firstTwoNames = tutorList
            .slice(0, 2)
            .map((tutor) => tutor.nombre || 'No especificado')
            .join(', ');
          displayText = `Responsables: ${firstTwoNames}`;
          // Add third tutor if exists
          if (tutorList.length >= 3) {
            const thirdTutorName = tutorList[2].nombre || 'No especificado';
            displayText += `, Tutor: ${thirdTutorName}`;
          }
        }

        setTutoresNombres((prev) => ({ ...prev, [id_paciente]: displayText }));
        console.log(
          `[PacientesModal #${Date.now()}] Tutor display text for id_paciente ${id_paciente}: ${displayText}`
        );
        return displayText;
      } catch (error) {
        console.error(
          `[PacientesModal #${Date.now()}] Error fetching tutor for id_paciente ${id_paciente}:`,
          error
        );
        setTutoresNombres((prev) => ({ ...prev, [id_paciente]: 'No encontrado' }));
        return 'No encontrado';
      }
    }
    return tutoresNombres[id_paciente] || 'Cargando...';
  };

  const handleToggleExpand = async (pacienteId, keys) => {
    const newExpandedId = keys && keys.has('details') ? pacienteId : null;
    setExpandedPacienteId(newExpandedId);
    console.log(
      `[PacientesModal #${Date.now()}] Toggled expand for paciente ${pacienteId}: ${
        newExpandedId ? 'expanded' : 'collapsed'
      }`
    );

    if (newExpandedId) {
      const paciente = pacientesCentro.find((p) => p.id_paciente === pacienteId);
      await loadHistorialVacunas(pacienteId);
      await loadVacunasFaltantes(pacienteId);
      await loadTutorNombre(pacienteId, paciente?.tutores || []);
    }
  };

  const handleToggleStatus = async (e, pacienteId) => {
    e.stopPropagation();
    const paciente = pacientesCentro.find((p) => p.id_paciente === pacienteId);
    if (paciente) {
      const updatedPaciente = { ...paciente, activo: !paciente.activo };
      try {
        console.log(
          `[PacientesModal #${Date.now()}] Updating status for paciente ${pacienteId} to activo=${updatedPaciente.activo}`
        );
        const response = await fetch(`${API_URL}/patients/${pacienteId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ estado: updatedPaciente.activo ? 'Activo' : 'Inactivo' }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(
            `[PacientesModal #${Date.now()}] HTTP error updating status for paciente ${pacienteId}: Status ${response.status}, Response: ${errorText}`
          );
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        setPacientesCentro(
          pacientesCentro.map((p) => (p.id_paciente === pacienteId ? updatedPaciente : p))
        );
        console.log(
          `[PacientesModal #${Date.now()}] Toggled status for paciente ${pacienteId}: activo=${updatedPaciente.activo}`
        );
      } catch (error) {
        console.error(
          `[PacientesModal #${Date.now()}] Error updating status for paciente ${pacienteId}:`,
          error
        );
        setError('No se pudo actualizar el estado del paciente');
      }
    } else {
      console.warn(
        `[PacientesModal #${Date.now()}] Paciente ${pacienteId} not found for status toggle`
      );
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl">
      <ModalContent>
        <ModalHeader>Pacientes de {centro?.nombre_centro || 'Centro no especificado'}</ModalHeader>
        <ModalBody>
          <Input
            type="text"
            placeholder="Buscar paciente por nombre o ID..."
            value={searchTerm}
            onChange={handleSearch}
            className="mb-4"
            isClearable
            startContent={<span className="text-default-400 text-small">🔍</span>}
          />

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Spinner size="lg" label="Cargando pacientes..." />
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <Chip color="danger" variant="flat" size="lg">{error}</Chip>
            </div>
          ) : filteredPacientes.length > 0 ? (
            <div className="space-y-3">
              {filteredPacientes.map((paciente) => (
                <Card
                  key={paciente.id_paciente}
                  className={`${!paciente.activo ? 'opacity-70' : ''}`}
                  shadow="sm"
                >
                  <CardBody className="p-0">
                    <Accordion
                      variant="shadow"
                      selectionMode="single"
                      selectedKeys={expandedPacienteId === paciente.id_paciente ? ['details'] : []}
                      onSelectionChange={(keys) => handleToggleExpand(paciente.id_paciente, keys)}
                    >
                      <AccordionItem
                        key="details"
                        aria-label={`Detalles de ${paciente.nombre_completo}`}
                        title={
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{paciente.nombre_completo}</span>
                              {!paciente.activo && (
                                <Chip color="warning" size="sm" variant="flat">
                                  Inactivo
                                </Chip>
                              )}
                            </div>
                            <div className="text-small text-default-500">
                              ID: {paciente.id_paciente} | {tutoresNombres[paciente.id_paciente] || 'Cargando...'}
                            </div>
                          </div>
                        }
                        indicator={
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              color={paciente.activo ? 'danger' : 'success'}
                              variant="flat"
                              onClick={(e) => handleToggleStatus(e, paciente.id_paciente)}
                            >
                              {paciente.activo ? 'Desactivar' : 'Activar'}
                            </Button>
                          </div>
                        }
                      >
                        <div className="px-2 py-3 space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            <div>
                              <span className="font-semibold">Fecha de Nacimiento:</span>{' '}
                              {paciente.fecha_nacimiento || 'No especificada'}
                            </div>
                            <div>
                              <span className="font-semibold">Género:</span>{' '}
                              {paciente.genero || 'No especificado'}
                            </div>
                            <div>
                              <span className="font-semibold">Dirección:</span>{' '}
                              {paciente.direccion_residencia || 'No especificada'}
                            </div>
                          </div>

                          <Divider />

                          <div>
                            <h6 className="text-md font-semibold mb-2">Historial de Vacunación</h6>
                            {historialVacunas[paciente.id_paciente] ? (
                              historialVacunas[paciente.id_paciente].length > 0 ? (
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
                                    {historialVacunas[paciente.id_paciente].map((dosis, index) => (
                                      <TableRow key={index}>
                                        <TableCell>{dosis.nombre_vacuna || 'Desconocida'}</TableCell>
                                        <TableCell>
                                          {dosis.fecha_aplicacion || 'No especificada'}
                                        </TableCell>
                                        <TableCell>{dosis.id_lote || 'No especificado'}</TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              ) : (
                                <p className="text-default-500">No hay registros de vacunación</p>
                              )
                            ) : (
                              <Spinner size="sm" label="Cargando historial..." />
                            )}
                          </div>

                          <Divider />

                          <div>
                            <h6 className="text-md font-semibold mb-2">Vacunas Pendientes</h6>
                            {vacunasFaltantes[paciente.id_paciente] ? (
                              vacunasFaltantes[paciente.id_paciente].length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                  {vacunasFaltantes[paciente.id_paciente].map((vacuna, index) => (
                                    <Chip key={index} color="warning" variant="flat">
                                      {vacuna}
                                    </Chip>
                                  ))}
                                </div>
                              ) : (
                                <Chip color="success" variant="flat">
                                  Todas las vacunas aplicadas
                                </Chip>
                              )
                            ) : (
                              <Spinner size="sm" label="Cargando vacunas pendientes..." />
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
                  ? 'No se encontraron pacientes que coincidan con la búsqueda.'
                  : 'No hay pacientes registrados en este centro.'}
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