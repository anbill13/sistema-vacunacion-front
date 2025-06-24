import React, { useState, useEffect } from "react";
import VacunacionModal from './VacunacionModal';
import { useAuth } from '../../context/AuthContext';
import { 
  Button, 
  Card, 
  CardBody, 
  CardHeader, 
  Input, 
  Select, 
  SelectItem, 
  Table, 
  TableHeader, 
  TableBody, 
  TableColumn, 
  TableRow, 
  TableCell,
  Modal, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  Chip,
} from "@nextui-org/react";
import RegistroForm from './forms/RegistroForm';
import CitaModal from './CitaModal';
import * as pacientesService from '../../services/pacientesService'; // Único servicio usado

export default function GestionPacientes() {
  const { currentUser } = useAuth();
  const [ninos, setNinos] = useState([]);
  const [tutores, setTutores] = useState([]); // Temporal hasta integrar usuariosService si es necesario
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("nombre");
  const [searchResults, setSearchResults] = useState([]);

  const mostrarPacientes = searchTerm.trim() === "" ? ninos : searchResults;

  const [expandedNinoId, setExpandedNinoId] = useState(null);
  const [editingNino, setEditingNino] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Estados para VacunacionModal
  const [vacunacionModalOpen, setVacunacionModalOpen] = useState(false);
  const [pacienteVacunacion, setPacienteVacunacion] = useState(null);
  const [loadingVacunacion, setLoadingVacunacion] = useState(false);
  const [citasPaciente, setCitasPaciente] = useState([]);

  const [citaModalOpen, setCitaModalOpen] = useState(false);

  // Cargar pacientes y tutores al montar
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log('[GestionPacientes] Fetching all children at', new Date().toISOString());
        const fetchedNinos = await pacientesService.getAllChildren();
        setNinos(fetchedNinos);
        console.log('[GestionPacientes] Niños loaded:', fetchedNinos);

        // Nota: Si necesitas tutores, deberías integrarlo desde usuariosService o una fuente similar
        // Por ahora, dejamos setTutores([]) como placeholder
        setTutores([]);
      } catch (err) {
        console.error('[GestionPacientes] Error loading data:', err);
        setError(err.message || 'Error al cargar pacientes');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Filtrado por centro: solo el doctor ve pacientes de sus centros asignados
  const getCentrosDoctor = () => {
    if (!currentUser || currentUser.role !== 'doctor') return [];
    if (Array.isArray(currentUser.centrosAsignados) && currentUser.centrosAsignados.length > 0) {
      return currentUser.centrosAsignados;
    } else if (currentUser.id_centro) {
      return [currentUser.id_centro];
    }
    return [];
  };

  let pacientesFiltrados = ninos || [];
  if (currentUser && currentUser.role === 'doctor') {
    const centrosDoctor = getCentrosDoctor();
    console.log('[GestionPacientes] centrosDoctor:', centrosDoctor);
    if (centrosDoctor.length > 0) {
      pacientesFiltrados = (ninos || []).filter(n => centrosDoctor.includes(n.id_centro_salud));
    } else {
      console.warn('[GestionPacientes] No centros asignados para el doctor, showing all patients');
    }
  }
  console.log('[GestionPacientes] pacientesFiltrados:', pacientesFiltrados);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    if (term.trim() === "") {
      setSearchResults([]);
      return;
    }

    let results = [];
    switch (filterType) {
      case "nombre":
        results = pacientesFiltrados.filter((nino) =>
          nino.nombre_completo.toLowerCase().includes(term)
        );
        break;
      case "id":
        results = pacientesFiltrados.filter(
          (nino) => nino.id_niño.toString().includes(term)
        );
        break;
      case "tutor":
        // Nota: Esto requiere tutores cargados; por ahora, será vacío
        const tutoresFiltered = (tutores || []).filter(
          (tutor) =>
            tutor.nombre.toLowerCase().includes(term) ||
            tutor.apellido.toLowerCase().includes(term)
        );
        const tutorIds = tutoresFiltered.map((tutor) => tutor.id_tutor);
        results = pacientesFiltrados.filter((nino) => tutorIds.includes(nino.id_tutor));
        break;
      default:
        results = [];
    }
    if (currentUser && currentUser.role === 'doctor') {
      const centrosDoctor = getCentrosDoctor();
      if (centrosDoctor.length > 0) {
        results = results.filter(n => centrosDoctor.includes(n.id_centro_salud));
      } else {
        results = [];
      }
    }

    console.log('[GestionPacientes] searchResults:', results);
    setSearchResults(results);
  };

  const handleToggleExpand = (ninoId) => {
    setExpandedNinoId(expandedNinoId === ninoId ? null : ninoId);
  };

  const handleEditNino = (nino) => {
    setEditingNino(nino);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingNino(null);
  };

  const handleOpenVacunacionModal = (nino) => {
    setPacienteVacunacion(nino);
    try {
      setCitasPaciente(pacientesService.getCitasVacunas(nino.id_niño) || []);
    } catch (e) {
      setCitasPaciente([]);
      console.error('[GestionPacientes] Error fetching citas:', e);
    }
    setVacunacionModalOpen(true);
  };

  const getTutorNombre = (idTutor) => {
    const tutor = (tutores || []).find((t) => t.id_tutor === idTutor);
    return tutor ? `${tutor.nombre} ${tutor.apellido}` : "No especificado";
  };

  const getHistorialVacunas = (ninoId) => {
    // Nota: Esto requiere dosisAplicadas y vacunas, que no se cargan aquí. Podrías necesitar integrarlos si es necesario.
    return []; // Placeholder; ajusta según tu lógica
  };

  const getCentroNombre = (idCentro) => {
    // Nota: Esto requiere centrosVacunacion, que no se carga aquí. Podrías necesitar integrarlo.
    return "No especificado"; // Placeholder; ajusta según tu lógica
  };

  const handleNinoAdd = (newNino) => {
    setNinos([...ninos, newNino]);
  };

  const handleTutorAdd = (newTutor) => {
    setTutores([...tutores, newTutor]);
  };

  const handleUpdateNino = (updatedNino) => {
    setNinos(ninos.map(n => n.id_niño === updatedNino.id_niño ? updatedNino : n));
  };

  const handleUpdateTutor = (updatedTutor) => {
    setTutores(tutores.map(t => t.id_tutor === updatedTutor.id_tutor ? updatedTutor : t));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Pacientes</h2>
          <p className="text-default-500">
            Busca, visualiza y edita información de pacientes
          </p>
        </div>
        <Button
          color="success"
          onClick={() => setIsModalOpen(true)}
          startContent={<span>+</span>}
        >
          Registrar Nuevo Paciente
        </Button>
      </div>

      <Card shadow="sm">
        <CardBody>
          <div className="flex flex-col md:flex-row gap-4">
            <Select
              label="Tipo de búsqueda"
              selectedKeys={[filterType]}
              onChange={(e) => setFilterType(e.target.value)}
              className="md:max-w-xs"
            >
              <SelectItem key="nombre" value="nombre">Buscar por Nombre</SelectItem>
              <SelectItem key="id" value="id">Buscar por ID</SelectItem>
              <SelectItem key="tutor" value="tutor">Buscar por Tutor</SelectItem>
            </Select>
            
            <Input
              type="text"
              label="Buscar"
              placeholder={`Ingrese ${
                filterType === "nombre"
                  ? "nombre del paciente"
                  : filterType === "id"
                  ? "ID del paciente"
                  : "nombre del tutor"
              }`}
              value={searchTerm}
              onChange={handleSearch}
              className="flex-grow"
              isClearable
              startContent={<span className="text-default-400 text-small">🔍</span>}
            />
          </div>
        </CardBody>
      </Card>

      {loading ? (
        <div className="text-center text-default-400 py-10">Cargando pacientes...</div>
      ) : error ? (
        <div className="text-center text-danger-500 py-10">{error}</div>
      ) : mostrarPacientes.length > 0 ? (
        <div className="space-y-4">
          {mostrarPacientes.map((nino) => (
            <Card key={nino.id_niño} shadow="sm">
              <CardHeader className="flex justify-between items-center bg-primary-50 dark:bg-primary-900/20">
                <h5 className="text-lg font-semibold">{nino.nombre_completo}</h5>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="flat"
                    onClick={() => handleToggleExpand(nino.id_niño)}
                  >
                    {expandedNinoId === nino.id_niño ? "Ocultar" : "Ver Detalles"}
                  </Button>
                  <Button
                    size="sm"
                    color="primary"
                    onClick={() => handleEditNino(nino)}
                  >
                    Editar
                  </Button>
                  {currentUser && ['doctor', 'administrador', 'director'].includes(currentUser.role) && (
                    <>
                      <Button size="sm" color="success" variant="flat" onClick={() => handleOpenVacunacionModal(nino)}>
                        Registrar Vacunación
                      </Button>
                      <Button size="sm" color="secondary" variant="flat" onClick={() => { setPacienteVacunacion(nino); setCitaModalOpen(true); }}>
                        Registrar Próxima Cita
                      </Button>
                    </>
                  )}
                </div>
              </CardHeader>
              
              {expandedNinoId === nino.id_niño && (
                <CardBody>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h6 className="text-md font-semibold mb-3">Información Personal</h6>
                      <div className="space-y-2">
                        <p><span className="font-semibold">ID:</span> {nino.id_niño}</p>
                        <p><span className="font-semibold">Fecha de Nacimiento:</span> {nino.fecha_nacimiento}</p>
                        <p><span className="font-semibold">Género:</span> {nino.genero}</p>
                        <p><span className="font-semibold">Dirección:</span> {nino.direccion_residencia}</p>
                        <p><span className="font-semibold">Tutor:</span> {getTutorNombre(nino.id_tutor)}</p>
                        <p><span className="font-semibold">Centro de Salud:</span> {getCentroNombre(nino.id_centro_salud)}</p>
                      </div>
                      {(() => {
                        try {
                          const citas = pacientesService.getCitasVacunas(nino.id_niño) || [];
                          if (citas.length > 0) {
                            const proximaCita = citas.sort((a, b) => new Date(a.fecha) - new Date(b.fecha))[0];
                            return (
                              <div className="mt-4 p-3 rounded-lg bg-primary-100 dark:bg-primary-900/40 border border-primary-300 dark:border-primary-700">
                                <span className="font-semibold text-primary-800 dark:text-primary-200">Próxima cita:</span>{" "}
                                <span className="font-medium">{new Date(proximaCita.fecha).toLocaleString()}</span>{" "}
                                <span className="font-medium">Vacuna: {proximaCita.vacunaId ? 'Sin nombre' : ''}</span>
                              </div>
                            );
                          }
                          return null;
                        } catch {
                          return null;
                        }
                      })()}
                    </div>
                    
                    <div>
                      <h6 className="text-md font-semibold mb-3">Historial de Vacunación</h6>
                      {getHistorialVacunas(nino.id_niño).length > 0 ? (
                        <Table aria-label="Historial de vacunación" isStriped isCompact removeWrapper>
                          <TableHeader>
                            <TableColumn>VACUNA</TableColumn>
                            <TableColumn>FECHA</TableColumn>
                            <TableColumn>LOTE</TableColumn>
                          </TableHeader>
                          <TableBody>
                            {getHistorialVacunas(nino.id_niño).map((dosis, index) => (
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
                  </div>
                </CardBody>
              )}
            </Card>
          ))}
        </div>
      ) : searchTerm.trim() !== "" ? (
        <Card>
          <CardBody className="text-center py-8">
            <Chip color="warning" variant="flat" size="lg">
              No se encontraron resultados para la búsqueda.
            </Chip>
          </CardBody>
        </Card>
      ) : currentUser && currentUser.role === 'doctor' ? (
        <div className="text-center text-default-400 py-10">
          No hay pacientes registrados en tu(s) centro(s) asignado(s).
        </div>
      ) : (
        <div className="text-center text-default-400 py-10">
          No hay pacientes registrados.
        </div>
      )}

      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal}
        size="3xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader>
            {editingNino ? "Editar Paciente" : "Registrar Nuevo Paciente"}
          </ModalHeader>
          <ModalBody>
            <RegistroForm
              onClose={handleCloseModal}
              onNinoAdd={handleNinoAdd}
              onTutorAdd={handleTutorAdd}
              ninoToEdit={editingNino}
              onUpdateNino={handleUpdateNino}
              onUpdateTutor={handleUpdateTutor}
              tutores={tutores || []}
              centros={[]} // Placeholder; integra centros si es necesario
            />
          </ModalBody>
        </ModalContent>
      </Modal>

      <VacunacionModal
        open={vacunacionModalOpen}
        onClose={() => setVacunacionModalOpen(false)}
        paciente={pacienteVacunacion}
        lotesVacunas={[]} // Placeholder; integra lotesVacunas si es necesario
        vacunas={[]} // Placeholder; integra vacunas si es necesario
        historialVacunas={pacienteVacunacion ? getHistorialVacunas(pacienteVacunacion.id_niño) : []}
        citas={citasPaciente}
        onRegistrarVacuna={async (data) => {
          setLoadingVacunacion(true);
          try {
            if (!data.id_vacuna || !data.id_lote) {
              alert('Debes seleccionar vacuna y lote.');
              setLoadingVacunacion(false);
              return;
            }
            const nuevaDosis = {
              ...data,
              id_vacuna: String(data.id_vacuna),
              id_lote: String(data.id_lote),
              fecha_aplicacion: new Date().toISOString(),
            };
            // Nota: Esto requiere jsonService y lógica de actualización; ajusta según tu implementación
            setLoadingVacunacion(false);
          } catch (e) {
            alert('Error al registrar la vacunación');
            console.error('Error al registrar vacuna:', e);
            setLoadingVacunacion(false);
          }
        }}
        onRegistrarCita={async (cita) => {
          setLoadingVacunacion(true);
          try {
            if (pacienteVacunacion) {
              await pacientesService.agregarCitaVacuna(pacienteVacunacion.id_niño, cita);
              setCitasPaciente(pacientesService.getCitasVacunas(pacienteVacunacion.id_niño) || []);
            }
            setCitaModalOpen(false);
          } catch (e) {
            console.error('Error al registrar cita:', e);
          }
          setLoadingVacunacion(false);
        }}
      />

      <CitaModal
        open={citaModalOpen}
        onClose={() => setCitaModalOpen(false)}
        paciente={pacienteVacunacion}
        vacunas={[]} // Placeholder; integra vacunas si es necesario
        loading={loadingVacunacion}
        onRegistrarCita={async (cita) => {
          setLoadingVacunacion(true);
          try {
            if (pacienteVacunacion) {
              await pacientesService.agregarCitaVacuna(pacienteVacunacion.id_niño, cita);
              setCitasPaciente(pacientesService.getCitasVacunas(pacienteVacunacion.id_niño) || []);
            }
            setCitaModalOpen(false);
          } catch (e) {
            console.error('Error al registrar cita:', e);
          }
          setLoadingVacunacion(false);
        }}
        onEditarCita={async (citaId, datos) => {
          setLoadingVacunacion(true);
          try {
            if (pacienteVacunacion) {
              await pacientesService.editarCitaVacuna(pacienteVacunacion.id_niño, citaId, datos);
              setCitasPaciente(pacientesService.getCitasVacunas(pacienteVacunacion.id_niño) || []);
            }
          } catch (e) {
            console.error('Error al editar cita:', e);
          }
          setLoadingVacunacion(false);
        }}
        onEliminarCita={async (citaId) => {
          setLoadingVacunacion(true);
          try {
            if (pacienteVacunacion) {
              await pacientesService.eliminarCitaVacuna(pacienteVacunacion.id_niño, citaId);
              setCitasPaciente(pacientesService.getCitasVacunas(pacienteVacunacion.id_niño) || []);
            }
          } catch (e) {
            console.error('Error al eliminar cita:', e);
          }
          setLoadingVacunacion(false);
        }}
      />
    </div>
  );
}