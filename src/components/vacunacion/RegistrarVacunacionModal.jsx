import React, { useEffect, useState, useMemo } from 'react';
import { 
  Modal, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  ModalFooter, 
  Button, 
  Input, 
  Chip, 
  Card, 
  CardBody, 
  Checkbox,
  Divider,
  Badge,
  Select,
  SelectItem
} from '@nextui-org/react';
import { isWeekend, addDays, format } from 'date-fns';
import { agregarCitaVacuna, registrarVacunacionesMultiples, getVacunas, getLotesVacunas} from '../../services/pacientesService';
import { useAuth } from '../../context/AuthContext';
import centrosService from '../../services/centrosService';

// Utilidad para convertir "4 meses", "9-14 años", etc. a meses
function edadRecomendadaAMeses(edad) {
  if (edad.includes('mes')) return parseInt(edad);
  if (edad.includes('año')) {
    const [min] = edad.split('-').map(e => parseInt(e));
    return min ? min * 12 : parseInt(edad) * 12;
  }
  if (edad === 'Al nacer') return 0;
  return 0;
}

function getEdadEnMeses(fechaNacimiento) {
  const hoy = new Date();
  const nacimiento = new Date(fechaNacimiento);
  return (hoy.getFullYear() - nacimiento.getFullYear()) * 12 + (hoy.getMonth() - nacimiento.getMonth());
}

function siguienteDiaHabil(fecha, feriados=[]) {
  let nuevaFecha = new Date(fecha);
  while (isWeekend(nuevaFecha) || feriados.includes(format(nuevaFecha, 'yyyy-MM-dd'))) {
    nuevaFecha = addDays(nuevaFecha, 1);
  }
  return nuevaFecha;
}

// Feriados nacionales de RD (fijos y móviles)
function getFeriadosRD(year) {
  // Feriados fijos
  const feriados = [
    `${year}-01-01`, // Año Nuevo
    `${year}-01-06`, // Reyes
    `${year}-01-21`, // Virgen de la Altagracia
    `${year}-02-27`, // Independencia
    `${year}-05-01`, // Día del Trabajo
    `${year}-08-16`, // Restauración
    `${year}-09-24`, // Mercedes
    `${year}-12-25`, // Navidad
  ];
  // Viernes Santo (móvil, depende de la Pascua)
  const easter = getEasterDate(year);
  const viernesSanto = new Date(easter);
  viernesSanto.setDate(easter.getDate() - 2);
  feriados.push(format(viernesSanto, 'yyyy-MM-dd'));
  return feriados;
}
// Algoritmo de computus para calcular la Pascua
function getEasterDate(year) {
  const f = Math.floor,
    G = year % 19,
    C = f(year / 100),
    H = (C - f(C / 4) - f((8 * C + 13) / 25) + 19 * G + 15) % 30,
    I = H - f(H / 28) * (1 - f(29 / (H + 1)) * f((21 - G) / 11)),
    J = (year + f(year / 4) + I + 2 - C + f(C / 4)) % 7,
    L = I - J,
    month = 3 + f((L + 40) / 44),
    day = L + 28 - 31 * f(month / 4);
  return new Date(year, month - 1, day);
}

export default function RegistrarVacunacionModal({
  isOpen,
  onClose,
  paciente,
  esquema,
  vacunas,
  lotesVacunas,
  onVacunacionRegistrada
}) {
  const { currentUser } = useAuth(); // Obtener usuario loggeado

  // Calcula feriados para el año actual y el próximo (por si la cita es a futuro)
  const year = new Date().getFullYear();
  const feriadosRD = useMemo(() => [
    ...getFeriadosRD(year),
    ...getFeriadosRD(year + 1)
  ], [year]);

  const [vacunasParaEdad, setVacunasParaEdad] = useState([]);
  const [aplicadas, setAplicadas] = useState({});
  const [proximaCita, setProximaCita] = useState('');
  const [editandoCita, setEditandoCita] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [search, setSearch] = useState("");
  const [centroSeleccionado, setCentroSeleccionado] = useState("");

  // Estado local para simular historial y próxima cita
  const [historialLocal, setHistorialLocal] = useState([]);
  const [citaLocal, setCitaLocal] = useState(null);

  // Backend data
  const [centrosDisponibles, setCentrosDisponibles] = useState([]);
  // Note: vacunasDisponibles and lotesDisponibles are used in useEffect for data fetching

  // Fetch backend data when modal opens (for validation purposes)
  useEffect(() => {
    if (isOpen) {
      const fetchBackendData = async () => {
        try {
          console.log('[RegistrarVacunacionModal] Cargando datos del backend...');
          
          // Si se reciben vacunas y lotes como props, usarlos, sino cargarlos del backend
          if (vacunas && vacunas.length > 0) {
            console.log('[RegistrarVacunacionModal] Usando vacunas de props:', vacunas);
            // setVacunasDisponibles(vacunas); // Not used in current implementation
          } else {
            console.log('[RegistrarVacunacionModal] Cargando vacunas del backend...');
            await getVacunas();
            // setVacunasDisponibles(vacunasData || []); // Not used in current implementation
          }
          
          if (lotesVacunas && lotesVacunas.length > 0) {
            console.log('[RegistrarVacunacionModal] Usando lotes de props:', lotesVacunas);
            // setLotesDisponibles(lotesVacunas); // Not used in current implementation
          } else {
            console.log('[RegistrarVacunacionModal] Cargando lotes del backend...');
            await getLotesVacunas();
            // setLotesDisponibles(lotesData || []); // Not used in current implementation
          }
          
          // Siempre cargar centros del backend
          const centros = await centrosService.getCentros();
          setCentrosDisponibles(centros || []);
          
          console.log('[RegistrarVacunacionModal] Datos cargados exitosamente');
        } catch (error) {
          console.error('[RegistrarVacunacionModal] Error fetching backend data:', error);
          setCentrosDisponibles([]);
          // setVacunasDisponibles([]); // Not used in current implementation
          // setLotesDisponibles([]); // Not used in current implementation
        }
      };
      fetchBackendData();
    }
  }, [isOpen, vacunas, lotesVacunas]);

  useEffect(() => {
    if (isOpen && paciente && esquema) {
      // Verificar que el paciente tenga fecha de nacimiento
      if (!paciente.fecha_nacimiento) {
        console.warn('Paciente sin fecha de nacimiento:', paciente);
        setVacunasParaEdad([]);
        setAplicadas({});
        setSuccess(false);
        setHistorialLocal([]);
        setCitaLocal(null);
        return;
      }
      
      const edadMeses = getEdadEnMeses(paciente.fecha_nacimiento);
      const vacunas = esquema.filter(vac => {
        const minEdad = edadRecomendadaAMeses(vac.edad_recomendada);
        return edadMeses >= minEdad;
      });
      setVacunasParaEdad(vacunas);
      setAplicadas(Object.fromEntries(vacunas.map(v => [v.id_esquema, false])));
      setSuccess(false);
      setHistorialLocal([]);
      setCitaLocal(null);
      // Establecer centro por defecto si el paciente ya tiene uno asignado
      setCentroSeleccionado(paciente.id_centro_salud || "");
    }
  }, [isOpen, paciente, esquema]);


  useEffect(() => {
    if (vacunasParaEdad.length > 0 && paciente?.fecha_nacimiento) {
      const edadMeses = getEdadEnMeses(paciente.fecha_nacimiento);
      const siguientes = esquema
        .filter(vac => edadRecomendadaAMeses(vac.edad_recomendada) > edadMeses)
        .sort((a, b) => edadRecomendadaAMeses(a.edad_recomendada) - edadRecomendadaAMeses(b.edad_recomendada));
      if (siguientes.length > 0) {
        const mesesFaltan = edadRecomendadaAMeses(siguientes[0].edad_recomendada) - edadMeses;
        let sugerida = addDays(new Date(), mesesFaltan * 30);
        sugerida = siguienteDiaHabil(sugerida, feriadosRD);
        setProximaCita(format(sugerida, 'yyyy-MM-dd'));
      } else {
        setProximaCita('');
      }
    }
  }, [vacunasParaEdad, paciente, esquema, feriadosRD]);

  const handleCheck = (id_esquema) => {
    setAplicadas(prev => ({ ...prev, [id_esquema]: !prev[id_esquema] }));
  };

  // Registro real en backend
  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Obtener las vacunas seleccionadas
      const nuevasVacunas = vacunasParaEdad.filter(v => aplicadas[v.id_esquema]);
      const idPaciente = paciente?.id_niño || paciente?.id_paciente;
      if (nuevasVacunas.length === 0) {
        alert('Por favor selecciona al menos una vacuna para aplicar.');
        setLoading(false);
        return;
      }
      if (!idPaciente) {
        alert('Error: ID de paciente no válido.');
        setLoading(false);
        return;
      }
      // Obtener ID del usuario loggeado (admin, director, doctor)
      const idUsuarioLoggeado = currentUser?.id || currentUser?.id_usuario;
      if (!idUsuarioLoggeado) {
        alert('Error: Usuario no identificado. Debe estar autenticado para registrar vacunaciones.');
        setLoading(false);
        return;
      }
      // Validar que se haya seleccionado un centro
      if (!centroSeleccionado && !paciente.id_centro_salud) {
        alert('Error: Debe seleccionar un centro de salud para registrar la vacunación.');
        setLoading(false);
        return;
      }
      // Usar la función robusta para registrar todas
      await registrarVacunacionesMultiples({
        vacunas: nuevasVacunas,
        id_paciente: idPaciente,
        fecha_aplicacion: new Date().toISOString(),
        id_centro: centroSeleccionado || paciente.id_centro_salud,
        sitio_aplicacion: 'Brazo izquierdo',
        notas: '',
        id_usuario: idUsuarioLoggeado // <-- ID del usuario loggeado
      });
      // Actualizar historial local para mostrar feedback inmediato
      const fechaFormateada = format(new Date(), 'yyyy-MM-dd');
      setHistorialLocal(prev => [
        ...prev,
        ...nuevasVacunas.map(v => ({ 
          ...v, 
          fecha_aplicacion: fechaFormateada,
          registrado: true 
        }))
      ]);
      // Registrar próxima cita en backend si hay próxima cita
      if (proximaCita && paciente && idPaciente) {
        try {
          const citaData = {
            fecha: proximaCita,
            id_centro: centroSeleccionado || paciente.id_centro_salud,
            estado: 'Pendiente'
          };
          await agregarCitaVacuna(idPaciente, citaData);
          setCitaLocal({ fecha: proximaCita });
        } catch (e) {
          setCitaLocal({ fecha: proximaCita, error: true });
        }
      }
      setLoading(false);
      setSuccess(true);
      if (onVacunacionRegistrada) onVacunacionRegistrada();
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);
    } catch (error) {
      alert('Error al registrar la vacunación: ' + error.message);
      setLoading(false);
    }
  };

  // Ordenar vacunas por edad recomendada (de menor a mayor)
  const vacunasFiltradas = useMemo(() => {
    let lista = [...vacunasParaEdad];
    if (search.trim()) {
      lista = lista.filter(v =>
        v.descripcion.toLowerCase().includes(search.toLowerCase())
      );
    }
    // Ordenar por edad recomendada en meses
    return lista.sort((a, b) =>
      edadRecomendadaAMeses(a.edad_recomendada) - edadRecomendadaAMeses(b.edad_recomendada)
    );
  }, [vacunasParaEdad, search]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader className="text-xl font-bold text-gray-800 border-b border-gray-200">
          💉 Registrar Vacunación
        </ModalHeader>
        <ModalBody className="py-6">
          {success ? (
            <div className="text-center py-8">
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
                <CardBody className="p-8">
                  <div className="space-y-4">
                    <div className="text-4xl">🎉</div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-green-800">
                        ¡Registro Exitoso!
                      </h3>
                      <p className="text-green-700">
                        Las vacunas han sido registradas y la próxima cita ha sido programada
                      </p>
                    </div>
                    <div className="flex justify-center">
                      <Chip 
                        color="success" 
                        size="lg" 
                        variant="flat"
                        startContent={<span>✓</span>}
                        className="text-green-800 font-semibold"
                      >
                        Proceso Completado
                      </Chip>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>
          ) : (
            <>
              {/* Header con información del paciente */}
              {paciente && (
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
                  <CardBody className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-blue-900">
                          {paciente.nombre} {paciente.apellido}
                        </h4>
                        <p className="text-sm text-blue-700">
                          Edad: {Math.floor(getEdadEnMeses(paciente.fecha_nacimiento) / 12)} años, {getEdadEnMeses(paciente.fecha_nacimiento) % 12} meses
                        </p>
                      </div>
                      <Badge content={vacunasParaEdad.filter(v => aplicadas[v.id_esquema]).length} color="primary" className="text-white">
                        <Chip color="primary" variant="flat" size="lg">
                          Vacunas Seleccionadas
                        </Chip>
                      </Badge>
                    </div>
                  </CardBody>
                </Card>
              )}

              <Divider className="my-4" />

              {/* Selección de Centro de Salud */}
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
                <CardBody className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">🏥</span>
                    <h3 className="text-md font-semibold text-purple-900">Centro de Salud</h3>
                  </div>
                  
                  <Select
                    label="Seleccionar Centro de Salud"
                    placeholder="Seleccione un centro de salud"
                    selectedKeys={centroSeleccionado ? [centroSeleccionado] : []}
                    onSelectionChange={(keys) => {
                      const selected = Array.from(keys)[0];
                      setCentroSeleccionado(selected || "");
                    }}
                    variant="bordered"
                    className="max-w-full"
                  >
                    {centrosDisponibles.map((centro) => (
                      <SelectItem key={centro.id_centro} value={centro.id_centro}>
                        {centro.nombre_centro} - {centro.provincia}
                      </SelectItem>
                    ))}
                  </Select>
                  
                  {centroSeleccionado && (
                    <div className="mt-3">
                      <Chip 
                        color="success" 
                        variant="flat" 
                        size="sm"
                        startContent={<span>✓</span>}
                        className="text-green-800"
                      >
                        Centro seleccionado
                      </Chip>
                    </div>
                  )}
                </CardBody>
              </Card>

              <Divider className="my-4" />

              {/* Barra de búsqueda y lista de vacunas disponibles */}
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-md font-semibold text-gray-800">
                    💉 Vacunas disponibles para aplicar
                  </h3>
                  <div className="flex items-center gap-2">
                    <Input
                      type="text"
                      placeholder="Buscar vacuna..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      size="sm"
                      className="max-w-xs"
                    />
                    <Chip 
                      size="sm" 
                      color="default" 
                      variant="flat"
                      className="text-gray-600"
                    >
                      Total: {vacunasFiltradas.length}
                    </Chip>
                    {vacunasFiltradas.filter(v => aplicadas[v.id_esquema]).length > 0 && (
                      <Chip 
                        size="sm" 
                        color="primary" 
                        variant="flat"
                        className="text-primary-700"
                      >
                        Seleccionadas: {vacunasFiltradas.filter(v => aplicadas[v.id_esquema]).length}
                      </Chip>
                    )}
                  </div>
                </div>
                {vacunasFiltradas.map((vac, index) => (
                  <Card 
                    key={vac.id_esquema} 
                    className={`transition-all duration-200 hover:shadow-md cursor-pointer border-2 ${
                      aplicadas[vac.id_esquema] 
                        ? 'border-green-300 bg-green-50 shadow-green-100' 
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                    isPressable
                    onPress={() => handleCheck(vac.id_esquema)}
                  >
                    <CardBody className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge 
                              content={index + 1} 
                              color="primary" 
                              size="sm"
                              className="text-white font-bold"
                            >
                              <div className="w-2 h-2"></div>
                            </Badge>
                            <h4 className={`text-md font-semibold ${
                              aplicadas[vac.id_esquema] ? 'text-green-800' : 'text-gray-800'
                            }`}>
                              {vac.descripcion}
                            </h4>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Chip 
                              size="sm" 
                              color="default" 
                              variant="flat"
                              className="text-xs"
                            >
                              📅 {vac.edad_recomendada}
                            </Chip>
                            {vac.via_administracion && (
                              <Chip 
                                size="sm" 
                                color="secondary" 
                                variant="flat"
                                className="text-xs"
                              >
                                💉 {vac.via_administracion}
                              </Chip>
                            )}
                          </div>
                          
                          {vac.notas && (
                            <p className="text-xs text-gray-500 mt-1 italic">
                              {vac.notas}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex items-center">
                          <Checkbox
                            isSelected={aplicadas[vac.id_esquema]}
                            onChange={() => handleCheck(vac.id_esquema)}
                            color="success"
                            size="lg"
                            className="ml-4"
                          />
                        </div>
                      </div>
                      
                      {aplicadas[vac.id_esquema] && (
                        <div className="mt-3 pt-3 border-t border-green-200">
                          <Chip 
                            color="success" 
                            variant="flat" 
                            size="sm"
                            className="text-green-800"
                            startContent={<span>✓</span>}
                          >
                            Seleccionada para aplicar
                          </Chip>
                        </div>
                      )}
                    </CardBody>
                  </Card>
                ))}
                {vacunasFiltradas.length === 0 && (
                  <Card className="border-dashed border-2 border-gray-300">
                    <CardBody className="p-6 text-center">
                      <div className="text-gray-500">
                        <div className="text-2xl mb-2">💉</div>
                        <p className="text-sm">No hay vacunas que coincidan con la búsqueda</p>
                      </div>
                    </CardBody>
                  </Card>
                )}
              </div>
              <Divider className="my-6" />
              
              {/* Sección de próxima cita */}
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
                <CardBody className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">📅</span>
                    <h3 className="text-md font-semibold text-purple-900">Programar próxima cita</h3>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                    <Input
                      type="date"
                      value={proximaCita}
                      onChange={e => setProximaCita(e.target.value)}
                      disabled={!editandoCita}
                      className="flex-1 max-w-[200px]"
                      variant="bordered"
                      color={editandoCita ? "primary" : "default"}
                    />
                    
                    <Button 
                      size="sm" 
                      onClick={() => setEditandoCita(!editandoCita)}
                      color={editandoCita ? "success" : "primary"}
                      variant={editandoCita ? "solid" : "flat"}
                      className="min-w-[100px]"
                    >
                      {editandoCita ? '✓ Confirmar' : '✏️ Editar'}
                    </Button>
                  </div>

                  {proximaCita && (isWeekend(new Date(proximaCita)) || feriadosRD.includes(proximaCita)) && (
                    <div className="mt-3">
                      <Chip 
                        color="warning" 
                        variant="flat" 
                        size="sm"
                        startContent={<span>⚠️</span>}
                        className="text-warning-800"
                      >
                        Esta fecha cae en fin de semana o feriado
                      </Chip>
                    </div>
                  )}
                  
                  {proximaCita && !isWeekend(new Date(proximaCita)) && !feriadosRD.includes(proximaCita) && (
                    <div className="mt-3">
                      <Chip 
                        color="success" 
                        variant="flat" 
                        size="sm"
                        startContent={<span>✓</span>}
                        className="text-green-800"
                      >
                        Fecha válida para cita médica
                      </Chip>
                    </div>
                  )}
                </CardBody>
              </Card>
              {/* Feedback de vacunas aplicadas en esta sesión */}
              {historialLocal.length > 0 && (
                <>
                  <Divider className="my-4" />
                  <Card className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
                    <CardBody className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg">✅</span>
                        <h4 className="text-md font-semibold text-green-900">
                          Vacunas aplicadas en esta sesión
                        </h4>
                      </div>
                      
                      <div className="space-y-2">
                        {historialLocal.map((v, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <Chip 
                              color="success" 
                              variant="flat" 
                              size="sm"
                              startContent={<span>💉</span>}
                            >
                              {v.descripcion}
                            </Chip>
                            <span className="text-xs text-green-700">
                              {format(new Date(v.fecha_aplicacion), 'dd/MM/yyyy')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardBody>
                  </Card>
                </>
              )}
              
              {/* Feedback de próxima cita registrada */}
              {citaLocal && (
                <>
                  <Divider className="my-4" />
                  <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
                    <CardBody className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">📅</span>
                        <h4 className="text-md font-semibold text-blue-900">
                          Próxima cita registrada
                        </h4>
                        {citaLocal.error && (
                          <Chip color="warning" size="sm" variant="flat">
                            ⚠️ Error en registro
                          </Chip>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Chip 
                          color={citaLocal.error ? "warning" : "primary"} 
                          variant="flat"
                          className="font-medium"
                        >
                          {format(new Date(citaLocal.fecha), 'dd/MM/yyyy')}
                        </Chip>
                        {!citaLocal.error && (
                          <span className="text-xs text-blue-700">
                            Cita programada exitosamente
                          </span>
                        )}
                      </div>
                    </CardBody>
                  </Card>
                </>
              )}
            </>
          )}
        </ModalBody>
        <ModalFooter className="border-t border-gray-200 pt-4">
          <div className="flex items-center justify-between w-full">
            <div className="flex-1">
              {!success && vacunasParaEdad.filter(v => aplicadas[v.id_esquema]).length === 0 && (
                <p className="text-sm text-gray-500 italic">
                  ⚠️ Selecciona al menos una vacuna para continuar
                </p>
              )}
              {!success && vacunasParaEdad.filter(v => aplicadas[v.id_esquema]).length > 0 && !centroSeleccionado && !paciente?.id_centro_salud && (
                <p className="text-sm text-orange-500 italic">
                  ⚠️ Selecciona un centro de salud para continuar
                </p>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              {!success && (
                <Button 
                  color="primary" 
                  onClick={handleSubmit} 
                  isLoading={loading} 
                  disabled={loading || vacunasParaEdad.filter(v => aplicadas[v.id_esquema]).length === 0 || (!centroSeleccionado && !paciente?.id_centro_salud)}
                  className="font-semibold"
                  size="lg"
                >
                  {loading ? 'Registrando...' : '💉 Registrar Vacunación'}
                </Button>
              )}
              <Button 
                color="default" 
                variant="flat" 
                onClick={onClose} 
                disabled={loading}
                size="lg"
              >
                {success ? 'Cerrar' : 'Cancelar'}
              </Button>
            </div>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
