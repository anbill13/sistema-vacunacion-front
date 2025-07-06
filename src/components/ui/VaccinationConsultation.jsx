import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardBody, 
  CardHeader, 
  Input, 
  Button, 
  Chip, 
  Table, 
  TableHeader, 
  TableColumn, 
  TableBody, 
  TableRow, 
  TableCell,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Tooltip,
  Switch
} from "@nextui-org/react";
import { useData } from '../../context/DataContext';
import { getEsquemaVacunacion } from '../../services/esquemaService.js';
import usuariosService from '../../services/usuariosService';

const VaccinationConsultation = () => {
  const { vacunas } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientHistory, setPatientHistory] = useState([]);
  const [esquemaVacunacion, setEsquemaVacunacion] = useState([]);
  const [filteredVaccines, setFilteredVaccines] = useState([]);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hideApplied, setHideApplied] = useState(false);
  const [hideUnavailable, setHideUnavailable] = useState(false);

  // Cargar esquema de vacunación al montar
  useEffect(() => {
    const loadVaccinationSchedule = async () => {
      try {
        const schedule = await getEsquemaVacunacion();
        setEsquemaVacunacion(schedule);
      } catch (error) {
        console.error('Error loading vaccination schedule:', error);
      }
    };
    loadVaccinationSchedule();
  }, []);

  // Función para calcular edad en meses
  const calculateAgeInMonths = (birthDate) => {
    const birth = new Date(birthDate);
    const today = new Date();
    return (today.getFullYear() - birth.getFullYear()) * 12 + (today.getMonth() - birth.getMonth());
  };

  // Función para verificar si una vacuna ya fue aplicada
  const isVaccineApplied = React.useCallback(
    (vaccineName) => {
      return patientHistory.some(record => 
        record.nombre_vacuna === vaccineName && 
        record.estado === 'aplicada'
      );
    },
    [patientHistory]
  );

  // Función para verificar si una vacuna puede ser aplicada
  const canVaccineBeApplied = React.useCallback(
    (vaccine, patientAge) => {
      const scheduleInfo = esquemaVacunacion.find(s => s.nombre_vacuna === vaccine.nombre_vacuna);
      if (!scheduleInfo) return true; // Si no hay info del esquema, asumir que se puede aplicar
      
      const minAge = scheduleInfo.edad_minima_meses || 0;
      const maxAge = scheduleInfo.edad_maxima_meses || 1200;
      return patientAge >= minAge && patientAge <= maxAge;
    },
    [esquemaVacunacion]
  );

  // Filtrar vacunas basado en criterios
  useEffect(() => {
    let filtered = vacunas || [];

    // Filtro por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(vaccine =>
        vaccine.nombre_vacuna?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vaccine.fabricante?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vaccine.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Si hay un paciente seleccionado, aplicar filtros adicionales
    if (selectedPatient) {
      const patientAge = calculateAgeInMonths(selectedPatient.fecha_nacimiento);
      
      filtered = filtered.filter(vaccine => {
        const isApplied = isVaccineApplied(vaccine.nombre_vacuna);
        const canApply = canVaccineBeApplied(vaccine, patientAge);
        
        // Aplicar filtros de ocultación
        if (hideApplied && isApplied) return false;
        if (hideUnavailable && !canApply) return false;
        
        return true;
      });
    }

    setFilteredVaccines(filtered);
  }, [searchTerm, vacunas, selectedPatient, esquemaVacunacion, patientHistory, hideApplied, hideUnavailable, canVaccineBeApplied, isVaccineApplied]);

  // Función para buscar paciente
  const searchPatient = async (patientId) => {
    if (!patientId) return;
    
    setLoading(true);
    try {
      const patient = await usuariosService.getPatientById(patientId);
      const history = await usuariosService.getPatientVaccinationHistory(patientId);
      
      setSelectedPatient(patient);
      setPatientHistory(history || []);
      setShowPatientModal(true);
    } catch (error) {
      console.error('Error searching patient:', error);
      alert('No se encontró el paciente o error al cargar el historial');
    } finally {
      setLoading(false);
    }
  };

  const getVaccineStatus = (vaccine) => {
    if (!selectedPatient) return { status: 'default', text: 'Sin paciente', color: 'default' };
    
    const patientAge = calculateAgeInMonths(selectedPatient.fecha_nacimiento);
    const isApplied = isVaccineApplied(vaccine.nombre_vacuna);
    const canApply = canVaccineBeApplied(vaccine, patientAge);
    
    if (isApplied) {
      return { status: 'applied', text: '✅ Aplicada', color: 'success' };
    } else if (!canApply) {
      return { status: 'unavailable', text: '🚫 No disponible', color: 'danger' };
    } else {
      return { status: 'available', text: '💉 Disponible', color: 'primary' };
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6">
      <Card>
        <CardHeader className="flex flex-col gap-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
          <div className="flex justify-between items-center w-full">
            <div>
              <h2 className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                💉 Consulta de Vacunas
              </h2>
              <p className="text-blue-600 dark:text-blue-300">
                Sistema inteligente de consulta y seguimiento de vacunación
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Chip color="primary" variant="flat" size="sm">
                {filteredVaccines.length} vacunas
              </Chip>
              {selectedPatient && (
                <Chip color="success" variant="flat" size="sm">
                  Paciente seleccionado
                </Chip>
              )}
            </div>
          </div>
          
          {/* Controles de búsqueda */}
          <div className="w-full flex flex-col lg:flex-row gap-4">
            <Input
              placeholder="🔍 Buscar vacunas por nombre, fabricante o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
              variant="bordered"
              size="lg"
            />
            
            <div className="flex gap-2">
              <Input
                placeholder="👤 ID del Paciente"
                className="w-48"
                variant="bordered"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    searchPatient(e.target.value);
                  }
                }}
              />
              
              <Button 
                color="primary" 
                onClick={() => {
                  const input = document.querySelector('input[placeholder="👤 ID del Paciente"]');
                  searchPatient(input.value);
                }}
                isLoading={loading}
                size="lg"
              >
                Buscar
              </Button>
            </div>
          </div>
          
          {/* Información del paciente seleccionado */}
          {selectedPatient && (
            <div className="w-full p-4 bg-blue-100 dark:bg-blue-800/30 rounded-lg border border-blue-200 dark:border-blue-700">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-bold text-blue-900 dark:text-blue-100 text-lg">
                    👤 {selectedPatient.nombre_completo}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 text-sm">
                    <div>
                      <span className="font-medium text-blue-700 dark:text-blue-300">Edad:</span>
                      <p className="text-blue-800 dark:text-blue-200">
                        {calculateAgeInMonths(selectedPatient.fecha_nacimiento)} meses
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-blue-700 dark:text-blue-300">Género:</span>
                      <p className="text-blue-800 dark:text-blue-200">{selectedPatient.genero}</p>
                    </div>
                    <div>
                      <span className="font-medium text-blue-700 dark:text-blue-300">ID:</span>
                      <p className="text-blue-800 dark:text-blue-200">{selectedPatient.id_paciente}</p>
                    </div>
                    <div>
                      <span className="font-medium text-blue-700 dark:text-blue-300">Vacunas aplicadas:</span>
                      <p className="text-blue-800 dark:text-blue-200">{patientHistory.length}</p>
                    </div>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  color="danger" 
                  variant="flat"
                  onClick={() => {
                    setSelectedPatient(null);
                    setPatientHistory([]);
                    setHideApplied(false);
                    setHideUnavailable(false);
                  }}
                >
                  ✕ Limpiar
                </Button>
              </div>
              
              {/* Controles de filtrado para paciente */}
              {selectedPatient && (
                <div className="flex gap-4 mt-3 pt-3 border-t border-blue-300 dark:border-blue-600">
                  <Switch
                    isSelected={hideApplied}
                    onValueChange={setHideApplied}
                    size="sm"
                    color="success"
                  >
                    <span className="text-sm text-blue-700 dark:text-blue-300">
                      Ocultar vacunas aplicadas
                    </span>
                  </Switch>
                  
                  <Switch
                    isSelected={hideUnavailable}
                    onValueChange={setHideUnavailable}
                    size="sm"
                    color="danger"
                  >
                    <span className="text-sm text-blue-700 dark:text-blue-300">
                      Ocultar vacunas no disponibles
                    </span>
                  </Switch>
                </div>
              )}
            </div>
          )}
        </CardHeader>
        
        <CardBody>
          {filteredVaccines.length > 0 ? (
            <Table 
              aria-label="Tabla de vacunas"
              className="w-full"
              classNames={{
                wrapper: "min-h-[400px]",
              }}
            >
              <TableHeader>
                <TableColumn>VACUNA</TableColumn>
                <TableColumn>FABRICANTE</TableColumn>
                <TableColumn>TIPO</TableColumn>
                <TableColumn>DOSIS</TableColumn>
                <TableColumn>EDAD RECOMENDADA</TableColumn>
                <TableColumn>ESTADO</TableColumn>
              </TableHeader>
              <TableBody>
                {filteredVaccines.map((vaccine, index) => {
                  const status = getVaccineStatus(vaccine);
                  const scheduleInfo = esquemaVacunacion.find(s => s.nombre_vacuna === vaccine.nombre_vacuna);
                  
                  return (
                    <TableRow 
                      key={vaccine.id_vacuna || index}
                      className={`
                        ${status.status === 'unavailable' ? 'opacity-60' : ''}
                        ${status.status === 'applied' ? 'bg-green-50 dark:bg-green-900/10' : ''}
                        ${status.status === 'available' ? 'bg-blue-50 dark:bg-blue-900/10' : ''}
                        hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors
                      `}
                    >
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium text-lg">{vaccine.nombre_vacuna}</p>
                          {vaccine.descripcion && (
                            <p className="text-xs text-default-500 max-w-xs">
                              {vaccine.descripcion}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {vaccine.fabricante || 'No especificado'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Chip size="sm" variant="flat" color="secondary">
                          {vaccine.tipo || 'General'}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <div className="text-center">
                          <span className="text-lg font-bold">{vaccine.dosis_requeridas || 1}</span>
                          <p className="text-xs text-default-500">dosis</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {scheduleInfo ? (
                          <div className="text-sm">
                            <div className="font-medium">
                              {scheduleInfo.edad_minima_meses || 0} - {scheduleInfo.edad_maxima_meses || '∞'} meses
                            </div>
                            {scheduleInfo.intervalo_dosis && (
                              <div className="text-xs text-default-500">
                                Intervalo: {scheduleInfo.intervalo_dosis} días
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-default-400 text-sm">No especificada</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Tooltip 
                          content={
                            status.status === 'applied' ? 'Esta vacuna ya fue aplicada al paciente' :
                            status.status === 'unavailable' ? 'El paciente no está en la edad adecuada para esta vacuna' :
                            status.status === 'available' ? 'Esta vacuna puede ser aplicada al paciente' :
                            'Seleccione un paciente para ver el estado'
                          }
                        >
                          <Chip 
                            size="md" 
                            color={status.color} 
                            variant="flat"
                            className="cursor-help font-medium"
                          >
                            {status.text}
                          </Chip>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-xl text-default-400 mb-2">
                {searchTerm || selectedPatient ? 'No se encontraron vacunas' : 'Cargando vacunas...'}
              </p>
              {selectedPatient && (hideApplied || hideUnavailable) && (
                <p className="text-sm text-default-500">
                  Algunos filtros están activos. Las vacunas ocultas no se muestran.
                </p>
              )}
              {selectedPatient && !hideApplied && !hideUnavailable && (
                <p className="text-sm text-default-500">
                  Mostrando todas las vacunas para {selectedPatient.nombre_completo}
                </p>
              )}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Modal de detalles del paciente */}
      <Modal 
        isOpen={showPatientModal} 
        onClose={() => setShowPatientModal(false)}
        size="4xl"
        scrollBehavior="inside"
        backdrop="blur"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <h3 className="text-xl font-bold">
              📋 Historial de Vacunación - {selectedPatient?.nombre_completo}
            </h3>
            <p className="text-sm text-default-500">
              Registro completo de vacunas aplicadas
            </p>
          </ModalHeader>
          <ModalBody>
            {patientHistory.length > 0 ? (
              <Table aria-label="Historial de vacunación">
                <TableHeader>
                  <TableColumn>VACUNA</TableColumn>
                  <TableColumn>FECHA APLICADA</TableColumn>
                  <TableColumn>CENTRO</TableColumn>
                  <TableColumn>MÉDICO</TableColumn>
                  <TableColumn>DOSIS #</TableColumn>
                </TableHeader>
                <TableBody>
                  {patientHistory.map((record, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-green-500">✅</span>
                          <span className="font-medium">{record.nombre_vacuna}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {record.fecha_aplicacion ? 
                          new Date(record.fecha_aplicacion).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          }) : 
                          'No especificada'
                        }
                      </TableCell>
                      <TableCell>{record.centro || 'No especificado'}</TableCell>
                      <TableCell>{record.medico || 'No especificado'}</TableCell>
                      <TableCell>
                        <Chip size="sm" color="primary" variant="flat">
                          {record.numero_dosis || 1}
                        </Chip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">📋</div>
                <p className="text-lg text-default-400">
                  No hay historial de vacunación registrado para este paciente.
                </p>
                <p className="text-sm text-default-500 mt-2">
                  Las vacunas aplicadas aparecerán aquí una vez registradas en el sistema.
                </p>
              </div>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default VaccinationConsultation;
