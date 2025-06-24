// src/components/ui/HelpTooltip.jsx
import React, { useState } from 'react';
import {
  Tooltip,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Card,
  CardBody,
  Divider
} from "@nextui-org/react";

const HelpTooltip = ({ 
  title, 
  content, 
  steps = [], 
  size = "sm",
  placement = "top",
  showModal = false 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  if (showModal) {
    return (
      <>
        <Tooltip content="Ver ayuda detallada" placement={placement}>
          <Button
            isIconOnly
            size={size}
            variant="light"
            color="primary"
            onClick={handleOpenModal}
            className="text-blue-500 hover:text-blue-700"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </Button>
        </Tooltip>

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          size="2xl"
          scrollBehavior="inside"
        >
          <ModalContent>
            <ModalHeader className="flex flex-col gap-1">
              <h3 className="text-xl font-bold">{title}</h3>
              <p className="text-sm text-gray-600">Guía paso a paso</p>
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <div className="text-gray-700">
                  {content}
                </div>
                
                {steps.length > 0 && (
                  <>
                    <Divider />
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">Pasos a seguir:</h4>
                      <div className="space-y-3">
                        {steps.map((step, index) => (
                          <Card key={index} className="bg-blue-50 border-l-4 border-blue-500">
                            <CardBody className="p-4">
                              <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                  {index + 1}
                                </div>
                                <div className="flex-1">
                                  <h5 className="font-medium text-gray-800 mb-1">{step.title}</h5>
                                  <p className="text-sm text-gray-600">{step.description}</p>
                                  {step.tip && (
                                    <div className="mt-2 p-2 bg-yellow-50 border-l-2 border-yellow-400 rounded">
                                      <p className="text-xs text-yellow-800">
                                        💡 <strong>Tip:</strong> {step.tip}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </CardBody>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </ModalBody>
            <ModalFooter>
              <Button
                color="primary"
                onClick={() => setIsModalOpen(false)}
              >
                Entendido
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </>
    );
  }

  return (
    <Tooltip 
      content={content} 
      placement={placement}
      className="max-w-xs"
    >
      <Button
        isIconOnly
        size={size}
        variant="light"
        color="primary"
        className="text-blue-500 hover:text-blue-700"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </Button>
    </Tooltip>
  );
};

// Componente de ayuda específico para diferentes secciones
export const AsignacionCentrosHelp = () => (
  <HelpTooltip
    title="Asignación de Centros a Doctores"
    content="Aprende cómo asignar centros de vacunación a doctores de manera eficiente."
    showModal={true}
    steps={[
      {
        title: "Buscar Doctor",
        description: "Utiliza la barra de búsqueda para encontrar el doctor al que deseas asignar centros.",
        tip: "Puedes buscar por nombre, email o usar los filtros avanzados."
      },
      {
        title: "Hacer Clic en Asignar",
        description: "Presiona el botón 'Asignar' junto al doctor seleccionado.",
        tip: "Verás los centros ya asignados marcados con chips azules."
      },
      {
        title: "Seleccionar Centros",
        description: "En el modal, haz clic en las tarjetas de los centros que deseas asignar.",
        tip: "Los centros seleccionados se marcarán con un borde azul y un ícono de check."
      },
      {
        title: "Guardar Cambios",
        description: "Presiona 'Guardar Asignación' para confirmar los cambios.",
        tip: "Los cambios se aplicarán inmediatamente y el doctor podrá acceder a esos centros."
      }
    ]}
  />
);

export const CalendarioCitasHelp = () => (
  <HelpTooltip
    title="Gestión de Citas"
    content="Aprende a gestionar eficientemente el calendario de citas."
    showModal={true}
    steps={[
      {
        title: "Filtrar Citas",
        description: "Usa las pestañas 'Todas', 'Hoy', 'Pendientes' o el filtro por fecha para encontrar citas específicas.",
        tip: "El filtro 'Hoy' es útil para ver tu agenda diaria."
      },
      {
        title: "Editar Cita",
        description: "Haz clic en 'Editar' para modificar fecha, hora, vacuna u observaciones.",
        tip: "Puedes cambiar el estado de la cita desde el modal de edición."
      },
      {
        title: "Acciones Rápidas",
        description: "Usa 'Completar' para marcar citas terminadas o 'Cancelar' para citas que no se realizarán.",
        tip: "Las citas completadas aparecerán en verde y las canceladas en rojo."
      },
      {
        title: "Exportar Datos",
        description: "Usa el botón 'Exportar' para descargar un archivo CSV con todas las citas filtradas.",
        tip: "Útil para reportes o respaldos de información."
      }
    ]}
  />
);

export const DashboardDoctorHelp = () => (
  <HelpTooltip
    title="Dashboard del Doctor"
    content="Tu panel principal con estadísticas y accesos rápidos."
    showModal={true}
    steps={[
      {
        title: "Métricas Principales",
        description: "Revisa las tarjetas superiores para ver estadísticas de tus citas.",
        tip: "El porcentaje de progreso te ayuda a ver tu rendimiento."
      },
      {
        title: "Próximas Citas",
        description: "La sección izquierda muestra tus próximas 5 citas programadas.",
        tip: "Haz clic en cualquier cita para ver más detalles."
      },
      {
        title: "Mis Centros",
        description: "La sección derecha muestra los centros asignados y estadísticas por centro.",
        tip: "Si no ves centros, contacta al administrador para que te asigne algunos."
      },
      {
        title: "Acciones Rápidas",
        description: "Usa los botones inferiores para navegar rápidamente a otras secciones.",
        tip: "El botón 'Actualizar' refresca todos los datos del dashboard."
      }
    ]}
  />
);

export default HelpTooltip;