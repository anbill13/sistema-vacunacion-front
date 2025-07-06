import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardBody, 
  CardHeader, 
  Table, 
  TableHeader, 
  TableColumn, 
  TableBody, 
  TableRow, 
  TableCell,
  Chip,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Progress,
  Tooltip
} from "@nextui-org/react";
import { getEsquemaVacunacion } from '../../services/esquemaService.js';

const VaccinationScheduleViewer = ({ 
  patientBirthDate, 
  patientVaccines = [], 
  isVisible = true, 
  showGeneralSchedule = false 
}) => {
  const [esquemaVacunacion, setEsquemaVacunacion] = useState([]);
  const [showFullSchedule, setShowFullSchedule] = useState(false);
  const [loading, setLoading] = useState(true);

  // Cargar esquema de vacunación
  useEffect(() => {
    const loadVaccinationSchedule = async () => {
      try {
        setLoading(true);
        const schedule = await getEsquemaVacunacion();
        setEsquemaVacunacion(schedule);
      } catch (error) {
        console.error('Error loading vaccination schedule:', error);
      } finally {
        setLoading(false);
      }
    };
    loadVaccinationSchedule();
  }, []);

  // Función para calcular edad en meses
  const calculateAgeInMonths = (birthDate) => {
    if (!birthDate) return 0;
    const birth = new Date(birthDate);
    const today = new Date();
    return (today.getFullYear() - birth.getFullYear()) * 12 + (today.getMonth() - birth.getMonth());
  };

  // Función para obtener el estado de una vacuna
  const getVaccineStatus = (vaccine, currentAge) => {
    const minAge = vaccine.edad_minima_meses || 0;
    const maxAge = vaccine.edad_maxima_meses || 1200;
    const isApplied = patientVaccines.some(v => v.nombre_vacuna === vaccine.nombre_vacuna);

    if (isApplied) {
      return { 
        status: 'applied', 
        text: '✅ Aplicada', 
        color: 'success',
        priority: 4
      };
    } else if (currentAge >= minAge && currentAge <= maxAge) {
      return { 
        status: 'recommended', 
        text: '⏰ Recomendada', 
        color: 'warning',
        priority: 1
      };
    } else if (currentAge < minAge) {
      const monthsUntil = minAge - currentAge;
      return { 
        status: 'upcoming', 
        text: `📅 En ${monthsUntil} mes${monthsUntil !== 1 ? 'es' : ''}`, 
        color: 'primary',
        priority: 2
      };
    } else {
      return { 
        status: 'overdue', 
        text: '⚠️ Atrasada', 
        color: 'danger',
        priority: 3
      };
    }
  };

  // Función para calcular progreso de vacunación
  const calculateProgress = () => {
    if (!patientBirthDate || esquemaVacunacion.length === 0) return 0;
    
    const currentAge = calculateAgeInMonths(patientBirthDate);
    const applicableVaccines = esquemaVacunacion.filter(v => 
      currentAge >= (v.edad_minima_meses || 0)
    );
    
    const appliedCount = applicableVaccines.filter(v => 
      patientVaccines.some(pv => pv.nombre_vacuna === v.nombre_vacuna)
    ).length;
    
    return applicableVaccines.length > 0 ? (appliedCount / applicableVaccines.length) * 100 : 0;
  };

  // Obtener vacunas por prioridad
  const getVaccinesByPriority = () => {
    if (!patientBirthDate && !showGeneralSchedule) return [];
    
    const currentAge = patientBirthDate ? calculateAgeInMonths(patientBirthDate) : null;
    
    if (showGeneralSchedule) {
      // Para el esquema general, mostrar todas las vacunas organizadas por edad
      return esquemaVacunacion
        .map(vaccine => ({
          ...vaccine,
          statusInfo: {
            status: 'general',
            text: `${vaccine.edad_recomendada || vaccine.edad_minima_meses + ' meses'}`,
            color: 'primary',
            priority: 1
          }
        }))
        .sort((a, b) => (a.edad_minima_meses || 0) - (b.edad_minima_meses || 0));
    }
    
    return esquemaVacunacion
      .map(vaccine => ({
        ...vaccine,
        statusInfo: getVaccineStatus(vaccine, currentAge)
      }))
      .sort((a, b) => {
        // Ordenar por prioridad y luego por edad
        if (a.statusInfo.priority !== b.statusInfo.priority) {
          return a.statusInfo.priority - b.statusInfo.priority;
        }
        return (a.edad_minima_meses || 0) - (b.edad_minima_meses || 0);
      });
  };

  const progress = calculateProgress();
  const vaccinesByPriority = getVaccinesByPriority();
  const currentAge = patientBirthDate ? calculateAgeInMonths(patientBirthDate) : 0;

  if (!isVisible) return null;

  return (
    <div className="w-full space-y-4">
      <Card className="border-2 border-blue-200 dark:border-blue-700">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
          <div className="flex justify-between items-center w-full">
            <div>
              <h3 className="text-xl font-bold">📅 Esquema de Vacunación</h3>
              <p className="text-blue-100">Plan personalizado de inmunización</p>
            </div>
            <Button
              color="secondary"
              variant="bordered"
              size="sm"
              onClick={() => setShowFullSchedule(true)}
              className="text-white border-white hover:bg-white hover:text-blue-600"
            >
              Ver Calendario Completo
            </Button>
          </div>
        </CardHeader>

        <CardBody className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">⏳</div>
              <p>Cargando esquema de vacunación...</p>
            </div>
          ) : !patientBirthDate && !showGeneralSchedule ? (
            <div className="text-center py-8 text-default-400">
              <div className="text-4xl mb-4">👶</div>
              <p>Seleccione un paciente para ver su esquema de vacunación</p>
            </div>
          ) : (
            <>
              {/* Mostrar esquema general o personalizado */}
              {showGeneralSchedule ? (
                <>
                  {/* Vista del esquema general */}
                  <div className="space-y-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                        📋 Esquema Nacional de Vacunación
                      </h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        Calendario completo de vacunas recomendadas desde el nacimiento hasta los 18 años
                      </p>
                    </div>

                    {/* Tabla del esquema general */}
                    <div className="space-y-4">
                      <h4 className="font-semibold mb-3 text-blue-700 dark:text-blue-300">
                        💉 Vacunas por Edad
                      </h4>
                      <div className="grid grid-cols-1 gap-3">
                        {vaccinesByPriority.map((vaccine, index) => (
                          <div 
                            key={vaccine.id || index}
                            className="p-4 border border-default-200 rounded-lg hover:shadow-md transition-shadow"
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h5 className="font-medium text-lg">{vaccine.nombre_vacuna}</h5>
                                <p className="text-sm text-default-600 mb-2">{vaccine.descripcion || 'Sin descripción'}</p>
                                <div className="flex gap-2 text-xs text-default-500">
                                  <span>📅 {vaccine.edad_recomendada || `${vaccine.edad_minima_meses || 0} meses`}</span>
                                  {vaccine.dosis && <span>💉 {vaccine.dosis}</span>}
                                  {vaccine.via_administracion && <span>🔹 {vaccine.via_administracion}</span>}
                                </div>
                              </div>
                              <Chip 
                                size="sm" 
                                color="primary"
                                variant="flat"
                                className="text-xs"
                              >
                                {vaccine.statusInfo.text}
                              </Chip>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Vista personalizada para paciente específico */}
                  {/* Barra de progreso */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Progreso de Vacunación</span>
                      <span className="text-sm text-default-500">{Math.round(progress)}%</span>
                    </div>
                    <Progress 
                      value={progress} 
                      color={progress >= 80 ? "success" : progress >= 50 ? "warning" : "danger"}
                      className="w-full"
                      size="lg"
                    />
                    <p className="text-xs text-default-500 text-center">
                      Basado en vacunas aplicables para {currentAge} meses de edad
                    </p>
                  </div>

                  {/* Resumen rápido */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { 
                        key: 'recommended', 
                        label: 'Recomendadas', 
                        count: vaccinesByPriority.filter(v => v.statusInfo.status === 'recommended').length,
                        color: 'warning',
                        icon: '⏰'
                      },
                      { 
                        key: 'applied', 
                        label: 'Aplicadas', 
                        count: vaccinesByPriority.filter(v => v.statusInfo.status === 'applied').length,
                        color: 'success',
                        icon: '✅'
                      },
                      { 
                        key: 'upcoming', 
                        label: 'Próximas', 
                        count: vaccinesByPriority.filter(v => v.statusInfo.status === 'upcoming').length,
                        color: 'primary',
                        icon: '📅'
                      },
                      { 
                        key: 'overdue', 
                        label: 'Atrasadas', 
                        count: vaccinesByPriority.filter(v => v.statusInfo.status === 'overdue').length,
                        color: 'danger',
                        icon: '⚠️'
                      }
                    ].map(item => (
                      <div key={item.key} className="text-center p-3 bg-default-50 dark:bg-default-100/10 rounded-lg">
                        <div className="text-2xl mb-1">{item.icon}</div>
                        <div className="text-lg font-bold">{item.count}</div>
                        <div className="text-xs text-default-500">{item.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Top 6 vacunas prioritarias */}
                  <div>
                    <h4 className="font-semibold mb-3 text-blue-700 dark:text-blue-300">
                      🎯 Vacunas Prioritarias
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {vaccinesByPriority.slice(0, 6).map((vaccine, index) => (
                        <div 
                          key={index}
                          className={`
                            p-3 rounded-lg border-l-4 
                            ${vaccine.statusInfo.status === 'recommended' ? 'border-warning bg-warning-50 dark:bg-warning-900/20' : ''}
                            ${vaccine.statusInfo.status === 'applied' ? 'border-success bg-success-50 dark:bg-success-900/20' : ''}
                            ${vaccine.statusInfo.status === 'upcoming' ? 'border-primary bg-primary-50 dark:bg-primary-900/20' : ''}
                            ${vaccine.statusInfo.status === 'overdue' ? 'border-danger bg-danger-50 dark:bg-danger-900/20' : ''}
                          `}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h5 className="font-medium text-sm">{vaccine.nombre_vacuna}</h5>
                              <p className="text-xs text-default-500 mt-1">
                                {vaccine.edad_minima_meses || 0} - {vaccine.edad_maxima_meses || '∞'} meses
                              </p>
                            </div>
                            <Chip 
                              size="sm" 
                              color={vaccine.statusInfo.color}
                              variant="flat"
                              className="text-xs"
                            >
                              {vaccine.statusInfo.text}
                            </Chip>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Información adicional */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                      💡 Recomendaciones Importantes
                    </h4>
                    <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                      <li>• Consulte con su pediatra antes de aplicar cualquier vacuna</li>
                      <li>• Mantenga actualizado el carnet de vacunación</li>
                      <li>• Las fechas son aproximadas, el médico determina el momento exacto</li>
                      <li>• Reporte cualquier reacción adversa a las vacunas</li>
                    </ul>
                  </div>
                </>
              )}
            </>
          )}
        </CardBody>
      </Card>

      {/* Modal del calendario completo */}
      <Modal 
        isOpen={showFullSchedule} 
        onClose={() => setShowFullSchedule(false)}
        size="5xl"
        scrollBehavior="inside"
        backdrop="blur"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <h3 className="text-xl font-bold">📅 Calendario Completo de Vacunación</h3>
            <p className="text-medium text-default-500">
              Esquema nacional de inmunización - Edad actual: {currentAge} meses
            </p>
          </ModalHeader>
          <ModalBody>
            {vaccinesByPriority.length > 0 ? (
              <Table aria-label="Calendario completo de vacunación">
                <TableHeader>
                  <TableColumn>VACUNA</TableColumn>
                  <TableColumn>EDAD MÍNIMA</TableColumn>
                  <TableColumn>EDAD MÁXIMA</TableColumn>
                  <TableColumn>DOSIS</TableColumn>
                  <TableColumn>INTERVALO</TableColumn>
                  <TableColumn>ESTADO</TableColumn>
                </TableHeader>
                <TableBody>
                  {vaccinesByPriority.map((vaccine, index) => (
                    <TableRow 
                      key={index}
                      className={`
                        ${vaccine.statusInfo.status === 'applied' ? 'bg-success-50 dark:bg-success-900/10' : ''}
                        ${vaccine.statusInfo.status === 'recommended' ? 'bg-warning-50 dark:bg-warning-900/10' : ''}
                        ${vaccine.statusInfo.status === 'overdue' ? 'bg-danger-50 dark:bg-danger-900/10' : ''}
                      `}
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
                      <TableCell>
                        <span className="font-medium">
                          {vaccine.edad_minima_meses || 0} meses
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {vaccine.edad_maxima_meses === 1200 ? "Sin límite" : `${vaccine.edad_maxima_meses || 0} meses`}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Chip size="sm" color="secondary" variant="flat">
                          {vaccine.numero_dosis || 1}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {vaccine.intervalo_dosis ? `${vaccine.intervalo_dosis} días` : 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Tooltip content={`Estado para paciente de ${currentAge} meses`}>
                          <Chip 
                            size="sm" 
                            color={vaccine.statusInfo.color} 
                            variant="flat"
                          >
                            {vaccine.statusInfo.text}
                          </Chip>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-default-400">
                <p>No se pudo cargar el esquema de vacunación.</p>
              </div>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default VaccinationScheduleViewer;
