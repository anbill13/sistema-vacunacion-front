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
  Tooltip
} from "@nextui-org/react";
import { useData } from '../../context/DataContext';
import { getEsquemaVacunacion } from '../../services/esquemaService.js';
import usuariosService from '../../services/usuariosService';

const ConsultaVacunas = () => {
  const { vacunas } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientHistory, setPatientHistory] = useState([]);
  const [esquemaVacunacion, setEsquemaVacunacion] = useState([]);
  const [filteredVaccines, setFilteredVaccines] = useState([]);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [loading, setLoading] = useState(false);

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
  const isVaccineApplied = (vaccineName, patientId) => {
    return patientHistory.some(record => 
      record.nombre_vacuna === vaccineName && 
      record.estado === 'aplicada'
    );
  };

  // Función para verificar si una vacuna puede ser aplicada
  const canVaccineBeApplied = (vaccine, patientAge) => {
    const minAge = vaccine.edad_minima_meses || 0;
    const maxAge = vaccine.edad_maxima_meses || 1200;
    return patientAge >= minAge && patientAge <= maxAge;
  };

  // Filtrar vacunas basado en criterios
  useEffect(() => {
    const getRecommendedVaccinesForAge = (ageInMonths) => {
      return esquemaVacunacion.filter(vaccine => {
        const minAge = vaccine.edad_minima_meses || 0;
        const maxAge = vaccine.edad_maxima_meses || 1200;
        return ageInMonths >= minAge && ageInMonths <= maxAge;
      });
    };

    let filtered = vacunas || [];

    // Filtro por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(vaccine =>
        vaccine.nombre_vacuna?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vaccine.fabricante?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vaccine.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Si hay un paciente seleccionado, filtrar por recomendaciones
    if (selectedPatient) {
      const patientAge = calculateAgeInMonths(selectedPatient.fecha_nacimiento);
      const recommendedVaccines = getRecommendedVaccinesForAge(patientAge);
      const recommendedNames = recommendedVaccines.map(v => v.nombre_vacuna);
      
      filtered = filtered.filter(vaccine => 
        recommendedNames.includes(vaccine.nombre_vacuna)
      );
    }

    setFilteredVaccines(filtered);
  }, [searchTerm, vacunas, selectedPatient, esquemaVacunacion]);

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
    const isApplied = isVaccineApplied(vaccine.nombre_vacuna, selectedPatient.id_paciente);
    const canApply = canVaccineBeApplied(vaccine, patientAge);
    
    if (isApplied) {
      return { status: 'applied', text: 'Aplicada', color: 'success' };
    } else if (!canApply) {
      return { status: 'unavailable', text: 'No disponible', color: 'danger' };
    } else {
      return { status: 'available', text: 'Disponible', color: 'primary' };
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-6">
      <Card>
        <CardHeader className="flex flex-col gap-3">
          <h2 className="text-2xl font-bold">Consulta de Vacunas</h2>
          
          {/* Controles de búsqueda */}
          <div className="w-full flex flex-col md:flex-row gap-4">
            <Input
              placeholder="Buscar vacunas por nombre, fabricante o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
              startContent={<span className="text-default-400">🔍</span>}
            />
            
            <div className="flex gap-2">
              <Input
                placeholder="ID del Paciente"
                className="w-40"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    searchPatient(e.target.value);
                  }
                }}
                startContent={<span className="text-default-400">👤</span>}
              />
              
              <Button 
                color="primary" 
                onClick={() => {
                  const input = document.querySelector('input[placeholder="ID del Paciente"]');
                  searchPatient(input.value);
                }}
                isLoading={loading}
              >
                Buscar Paciente
              </Button>
            </div>
          </div>
          
          {/* Información del paciente seleccionado */}
          {selectedPatient && (
            <div className="w-full p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold text-blue-800 dark:text-blue-200">
                    Paciente: {selectedPatient.nombre_completo}
                  </p>
                  <p className="text-sm text-blue-600 dark:text-blue-300">
                    Edad: {calculateAgeInMonths(selectedPatient.fecha_nacimiento)} meses
                  </p>
                </div>
                <Button 
                  size="sm" 
                  color="danger" 
                  variant="flat"
                  onClick={() => setSelectedPatient(null)}
                >
                  Limpiar
                </Button>
              </div>
            </div>
          )}
        </CardHeader>
        
        <CardBody>
          {filteredVaccines.length > 0 ? (
            <Table aria-label="Tabla de vacunas">
              <TableHeader>
                <TableColumn>VACUNA</TableColumn>
                <TableColumn>FABRICANTE</TableColumn>
                <TableColumn>TIPO</TableColumn>
                <TableColumn>DOSIS REQUERIDAS</TableColumn>
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
                      className={status.status === 'unavailable' ? 'opacity-50' : ''}
                    >
                      <TableCell>
                        <div>
                          <p className="font-medium">{vaccine.nombre_vacuna}</p>
                          {vaccine.descripcion && (
                            <p className="text-xs text-default-400 mt-1">
                              {vaccine.descripcion}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{vaccine.fabricante || 'No especificado'}</TableCell>
                      <TableCell>
                        <Chip size="sm" variant="flat">
                          {vaccine.tipo || 'General'}
                        </Chip>
                      </TableCell>
                      <TableCell>{vaccine.dosis_requeridas || 1}</TableCell>
                      <TableCell>
                        {scheduleInfo ? (
                          <div className="text-sm">
                            <p>{scheduleInfo.edad_minima_meses || 0} - {scheduleInfo.edad_maxima_meses || '∞'} meses</p>
                          </div>
                        ) : (
                          <span className="text-default-400">No especificada</span>
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
                            size="sm" 
                            color={status.color} 
                            variant="flat"
                            className="cursor-help"
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
            <div className="text-center py-8 text-default-400">
              <p className="text-lg mb-2">
                {searchTerm || selectedPatient ? 'No se encontraron vacunas' : 'Cargando vacunas...'}
              </p>
              {selectedPatient && (
                <p className="text-sm">
                  Mostrando solo vacunas recomendadas para la edad del paciente
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
        size="3xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader>
            <h3 className="text-xl font-bold">
              Historial de Vacunación - {selectedPatient?.nombre_completo}
            </h3>
          </ModalHeader>
          <ModalBody>
            {patientHistory.length > 0 ? (
              <Table aria-label="Historial de vacunación">
                <TableHeader>
                  <TableColumn>VACUNA</TableColumn>
                  <TableColumn>FECHA APLICADA</TableColumn>
                  <TableColumn>CENTRO</TableColumn>
                  <TableColumn>MÉDICO</TableColumn>
                  <TableColumn>DOSIS</TableColumn>
                </TableHeader>
                <TableBody>
                  {patientHistory.map((record, index) => (
                    <TableRow key={index}>
                      <TableCell>{record.nombre_vacuna}</TableCell>
                      <TableCell>
                        {record.fecha_aplicacion ? 
                          new Date(record.fecha_aplicacion).toLocaleDateString() : 
                          'No especificada'
                        }
                      </TableCell>
                      <TableCell>{record.centro || 'No especificado'}</TableCell>
                      <TableCell>{record.medico || 'No especificado'}</TableCell>
                      <TableCell>{record.numero_dosis || 1}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-default-400">
                <p>No hay historial de vacunación registrado para este paciente.</p>
              </div>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default ConsultaVacunas;
