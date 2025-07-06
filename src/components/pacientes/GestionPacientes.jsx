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
import * as pacientesService from '../../services/pacientesService'; // Único servicio usado
import centrosService from '../../services/centrosService'; // Importar el servicio de centros
import { getEsquemaVacunacion } from '../../services/esquemaService.js'; // Importar el servicio de esquema

// Utilidades para calcular próximas vacunaciones
function edadRecomendadaAMeses(edad) {
  if (!edad) return 0;
  if (edad.includes('mes')) return parseInt(edad);
  if (edad.includes('año')) {
    const [min] = edad.split('-').map(e => parseInt(e));
    return min ? min * 12 : parseInt(edad) * 12;
  }
  if (edad === 'Al nacer') return 0;
  return 0;
}

function getEdadEnMeses(fechaNacimiento) {
  if (!fechaNacimiento) return 0;
  const hoy = new Date();
  const nacimiento = new Date(fechaNacimiento);
  return (hoy.getFullYear() - nacimiento.getFullYear()) * 12 + (hoy.getMonth() - nacimiento.getMonth());
}

function calcularProximaVacunacion(fechaNacimiento, historialVacunas = [], esquemaVacunacion = []) {
  if (!fechaNacimiento || !Array.isArray(esquemaVacunacion)) {
    return null;
  }

  const edadMeses = getEdadEnMeses(fechaNacimiento);
  
  // Obtener vacunas ya aplicadas
  const vacunasAplicadas = historialVacunas.map(h => h.nombre_vacuna || h.descripcion).filter(Boolean);
  
  // Encontrar próximas vacunas pendientes
  const proximasVacunas = esquemaVacunacion
    .filter(vac => {
      const edadRecomendada = edadRecomendadaAMeses(vac.edad_recomendada);
      const yaAplicada = vacunasAplicadas.includes(vac.descripcion || vac.nombre_vacuna);
      return edadRecomendada >= edadMeses && !yaAplicada;
    })
    .sort((a, b) => edadRecomendadaAMeses(a.edad_recomendada) - edadRecomendadaAMeses(b.edad_recomendada));

  if (proximasVacunas.length > 0) {
    const proxima = proximasVacunas[0];
    const edadRecomendada = edadRecomendadaAMeses(proxima.edad_recomendada);
    const mesesFaltantes = Math.max(0, edadRecomendada - edadMeses);
    
    const fechaEstimada = new Date();
    fechaEstimada.setMonth(fechaEstimada.getMonth() + mesesFaltantes);
    
    return {
      vacuna: proxima.descripcion || proxima.nombre_vacuna,
      edadRecomendada: proxima.edad_recomendada,
      fechaEstimada: fechaEstimada.toLocaleDateString('es-ES'),
      mesesFaltantes
    };
  }

  return null;
}

export default function GestionPacientes() {
  const { currentUser } = useAuth();
  const [ninos, setNinos] = useState([]);
  const [tutores, setTutores] = useState([]); // Temporal hasta integrar usuariosService si es necesario
  const [centros, setCentros] = useState([]); // Estado para los centros
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
  const [citasPaciente, setCitasPaciente] = useState([]);

  // Cargar pacientes, tutores y centros al montar
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log('[GestionPacientes] Fetching all children at', new Date().toISOString());
        const fetchedNinos = await pacientesService.getAllChildren();
        
        // Mapeo para asegurar que todos los pacientes tengan id_niño
        const ninosConIdNino = fetchedNinos.map(n => ({
          ...n,
          id_niño: n.id_paciente // Siempre usar id_paciente, nunca n.id
        }));
        setNinos(ninosConIdNino);
        console.log('[GestionPacientes] Niños loaded:', ninosConIdNino);

        // Cargar todos los centros de salud
        const fetchedCentros = await centrosService.getCentros();
        setCentros(fetchedCentros);
        console.log('[GestionPacientes] Centros loaded:', fetchedCentros);

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
  }, [currentUser]);

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

  const handleOpenVacunacionModal = async (nino) => {
    setPacienteVacunacion(nino);
    const idPaciente = nino?.id_niño || nino?.id_paciente;
    
    if (!nino || !idPaciente) {
      setCitasPaciente([]);
      setVacunacionModalOpen(true);
      alert('No se puede cargar citas: paciente o ID de niño inválido.');
      return;
    }
    
    try {
      const citas = await pacientesService.getCitasVacunas(idPaciente);
      await cargarHistorialVacunacion(idPaciente);
      
      setCitasPaciente(citas || []);
    } catch (e) {
      setCitasPaciente([]);
      alert('Error al cargar datos: ' + (e.message || e));
      console.error('[GestionPacientes] Error fetching data:', e);
    }
    setVacunacionModalOpen(true);
  };

  const getTutorNombre = (idTutor) => {
    const tutor = (tutores || []).find((t) => t.id_tutor === idTutor);
    return tutor ? `${tutor.nombre} ${tutor.apellido}` : "No especificado";
  };

  // Estados para datos de vacunas y lotes
  const [vacunas, setVacunas] = useState([]);
  const [lotesVacunas, setLotesVacunas] = useState([]);

  // Estado para esquema de vacunación
  const [esquemaVacunacion, setEsquemaVacunacion] = useState([]);

  // Cargar vacunas y lotes al inicio
  useEffect(() => {
    const cargarDatosVacunacion = async () => {
      try {
        const [vacunasData, lotesData, esquemaData] = await Promise.all([
          pacientesService.getVacunas(),
          pacientesService.getLotesVacunas(),
          getEsquemaVacunacion()
        ]);
        
        setVacunas(vacunasData || []);
        setLotesVacunas(lotesData || []);
        setEsquemaVacunacion(esquemaData || []);
      } catch (error) {
        console.error('[GestionPacientes] Error cargando datos de vacunación:', error);
        setVacunas([]);
        setLotesVacunas([]);
        setEsquemaVacunacion([]);
      }
    };

    cargarDatosVacunacion();
  }, []);

  // Estados para historial de vacunación
  const [historialVacunacion, setHistorialVacunacion] = useState({});

  const getHistorialVacunas = (ninoId) => {
    return historialVacunacion[ninoId] || [];
  };

  const cargarHistorialVacunacion = async (ninoId) => {
    try {
      const historial = await pacientesService.getHistorialVacunacion(ninoId);
      setHistorialVacunacion(prev => ({
        ...prev,
        [ninoId]: historial
      }));
      return historial;
    } catch (error) {
      console.error('[GestionPacientes] Error cargando historial de vacunación:', error);
      
      if (error.message && error.message.includes('id_personal')) {
        console.warn('[GestionPacientes] Error conocido del backend: usar id_usuario en lugar de id_personal');
        setHistorialVacunacion(prev => ({
          ...prev,
          [ninoId]: []
        }));
        return [];
      }
      
      return [];
    }
  };

  const getCentroNombre = (idCentro) => {
    // Nota: Esto requiere centrosVacunacion, que no se carga aquí. Podrías necesitar integrarlo.
    return "No especificado"; // Placeholder; ajusta según tu lógica
  };

  const getProximaVacunacion = (nino) => {
    const historial = getHistorialVacunas(nino.id_niño);
    return calcularProximaVacunacion(nino.fecha_nacimiento, historial, esquemaVacunacion);
  };

  // Función auxiliar para obtener el ID correcto del paciente
  const getPacienteId = (paciente) => {
    return paciente?.id_niño || paciente?.id_paciente;
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
                <div className="flex items-center gap-3">
                  <h5 className="text-lg font-semibold">{nino.nombre_completo}</h5>
                  {(() => {
                    const proximaVacuna = getProximaVacunacion(nino);
                    if (proximaVacuna?.mesesFaltantes === 0) {
                      return (
                        <Chip 
                          color="warning" 
                          variant="flat" 
                          size="sm"
                          startContent={<span>⚠️</span>}
                        >
                          Vacuna pendiente
                        </Chip>
                      );
                    } else if (proximaVacuna?.mesesFaltantes > 0 && proximaVacuna?.mesesFaltantes <= 1) {
                      return (
                        <Chip 
                          color="primary" 
                          variant="flat" 
                          size="sm"
                          startContent={<span>📅</span>}
                        >
                          Próxima vacuna pronto
                        </Chip>
                      );
                    }
                    return null;
                  })()}
                </div>
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
                    <Button size="sm" color="success" variant="flat" onClick={async () => await handleOpenVacunacionModal(nino)}>
                      Registrar Vacunación
                    </Button>
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
                      
                      {/* Información de próxima vacunación */}
                      <div className="mt-4">
                        <h6 className="text-md font-semibold mb-2">Próxima Vacunación</h6>
                        {(() => {
                          const proximaVacuna = getProximaVacunacion(nino);
                          if (proximaVacuna) {
                            return (
                              <div className="p-3 rounded-lg bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-700">
                                <div className="space-y-1">
                                  <p><span className="font-semibold text-success-800 dark:text-success-200">Vacuna:</span> {proximaVacuna.vacuna}</p>
                                  <p><span className="font-semibold text-success-800 dark:text-success-200">Edad recomendada:</span> {proximaVacuna.edadRecomendada}</p>
                                  <p><span className="font-semibold text-success-800 dark:text-success-200">Fecha estimada:</span> {proximaVacuna.fechaEstimada}</p>
                                  {proximaVacuna.mesesFaltantes > 0 && (
                                    <p className="text-sm text-success-700 dark:text-success-300">
                                      Faltan aproximadamente {proximaVacuna.mesesFaltantes} mes{proximaVacuna.mesesFaltantes !== 1 ? 'es' : ''}
                                    </p>
                                  )}
                                  {proximaVacuna.mesesFaltantes === 0 && (
                                    <p className="text-sm font-semibold text-warning-700 dark:text-warning-300">
                                      ⚠️ Vacuna pendiente - Edad recomendada alcanzada
                                    </p>
                                  )}
                                </div>
                              </div>
                            );
                          } else {
                            return (
                              <div className="p-3 rounded-lg bg-default-100 dark:bg-default-800/50 border border-default-200 dark:border-default-700">
                                <p className="text-default-600 dark:text-default-400">
                                  ✅ Esquema de vacunación al día o información no disponible
                                </p>
                              </div>
                            );
                          }
                        })()}
                      </div>
                      
                      {/* Las citas se mostrarán cuando se abra el modal de vacunación */}
                      <div className="mt-4 p-3 rounded-lg bg-info-100 dark:bg-info-900/40 border border-info-300 dark:border-info-700">
                        <span className="font-semibold text-info-800 dark:text-info-200">
                          Haz clic en "Registrar Vacunación" para ver el historial y próximas citas
                        </span>
                      </div>
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
              centros={centros || []} // Pasar centros al formulario
            />
          </ModalBody>
        </ModalContent>
      </Modal>

      <VacunacionModal
        open={vacunacionModalOpen}
        onClose={() => {
          setVacunacionModalOpen(false);
          if (pacienteVacunacion) {
            const idPaciente = getPacienteId(pacienteVacunacion);
            cargarHistorialVacunacion(idPaciente).catch(error => {
              console.error('[GestionPacientes] Error actualizando historial al cerrar modal:', error);
            });
          }
        }}
        paciente={pacienteVacunacion}
        lotesVacunas={lotesVacunas}
        vacunas={vacunas}
        historialVacunas={pacienteVacunacion ? getHistorialVacunas(getPacienteId(pacienteVacunacion)) : []}
        citas={citasPaciente}
        onRefreshHistorial={async () => {
          if (pacienteVacunacion) {
            const idPaciente = getPacienteId(pacienteVacunacion);
            await cargarHistorialVacunacion(idPaciente);
          }
        }}
        onRegistrarVacuna={async (data) => {
          try {
            if (!data.id_vacuna || !data.id_lote) {
              alert('Debes seleccionar vacuna y lote.');
              return;
            }
            
            if (pacienteVacunacion) {
              const idPaciente = getPacienteId(pacienteVacunacion);
              
              await pacientesService.registrarVacunacion({
                ...data,
                id_paciente: idPaciente,
                fecha_aplicacion: new Date().toISOString()
              });
              
              // Esperar un momento antes de recargar para dar tiempo al backend
              await new Promise(resolve => setTimeout(resolve, 2000));
              
              // Refrescar el historial de vacunación
              await cargarHistorialVacunacion(idPaciente);
              
              // Mostrar mensaje de éxito
              alert('Vacunación registrada exitosamente. El historial se ha actualizado.');
            }
          } catch (e) {
            console.error('[GestionPacientes] Error al registrar vacuna:', e);
            alert('Error al registrar la vacunación: ' + e.message);
          }
        }}
        onRegistrarCita={async (cita) => {
          try {
            if (pacienteVacunacion) {
              const idPaciente = getPacienteId(pacienteVacunacion);
              await pacientesService.agregarCitaVacuna(idPaciente, cita);
              const citasActualizadas = await pacientesService.getCitasVacunas(idPaciente);
              setCitasPaciente(citasActualizadas || []);
            }
          } catch (e) {
            console.error('Error al registrar cita:', e);
          }
        }}
        onEditarCita={async (citaId, datos) => {
          try {
            if (pacienteVacunacion) {
              const idPaciente = getPacienteId(pacienteVacunacion);
              await pacientesService.editarCitaVacuna(idPaciente, citaId, datos);
              const citasActualizadas = await pacientesService.getCitasVacunas(idPaciente);
              setCitasPaciente(citasActualizadas || []);
            }
          } catch (e) {
            console.error('Error al editar cita:', e);
          }
        }}
        onEliminarCita={async (citaId) => {
          try {
            if (pacienteVacunacion) {
              const idPaciente = getPacienteId(pacienteVacunacion);
              
              await pacientesService.eliminarCitaVacuna(idPaciente, citaId);
              
              const citasActualizadas = await pacientesService.getCitasVacunas(idPaciente);
              setCitasPaciente(citasActualizadas || []);
              
              alert('Cita eliminada exitosamente.');
            }
          } catch (e) {
            console.error('[GestionPacientes] Error al eliminar cita:', e);
            alert('Error al eliminar la cita: ' + e.message);
          }
        }}
      />
    </div>
  );
}