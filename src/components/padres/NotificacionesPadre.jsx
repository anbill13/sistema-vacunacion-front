import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Chip,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Badge,
  Divider,
  Spinner,
} from "@nextui-org/react";
import { useAuth } from "../../context/AuthContext";
import notificacionesService from "../../services/notificacionesService";

function NotificacionesPadre() {
  const { currentUser } = useAuth();
  const [notificaciones, setNotificaciones] = useState([]);
  const [resumen, setResumen] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);

  // Función para cargar notificaciones
  const loadNotificaciones = useCallback(async () => {
    if (!currentUser || currentUser.role !== "padre") {
      setNotificaciones([]);
      setResumen({});
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const userId = currentUser.id || currentUser.id_usuario;

      if (!userId) {
        throw new Error("No se encontró ID de usuario");
      }

      const [notificacionesData, resumenData] = await Promise.all([
        notificacionesService.getTodasLasNotificaciones(userId),
        notificacionesService.getResumenNotificaciones(userId),
      ]);

      setNotificaciones(notificacionesData);
      setResumen(resumenData);
    } catch (err) {
      console.error("[NotificacionesPadre] Error loading notifications:", err);
      setError(`Error al cargar las notificaciones: ${err.message}`);
      setNotificaciones([]);
      setResumen({});
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // Cargar notificaciones al montar el componente
  useEffect(() => {
    loadNotificaciones();
  }, [loadNotificaciones]);

  // Función para obtener el color del chip según la prioridad
  const getPriorityColor = (prioridad) => {
    switch (prioridad) {
      case "alta":
        return "danger";
      case "media":
        return "warning";
      case "baja":
        return "primary";
      default:
        return "default";
    }
  };

  // Función para obtener el icono según el tipo
  const getTypeIcon = (tipo) => {
    switch (tipo) {
      case "cita_proxima":
        return "📅";
      case "vacuna_recomendada":
        return "💉";
      default:
        return "🔔";
    }
  };

  // Función para formatear la fecha
  const formatearFecha = (fechaString) => {
    const fecha = new Date(fechaString);
    return fecha.toLocaleDateString("es-DO", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Función para mostrar detalles de la notificación
  const mostrarDetalles = (notificacion) => {
    setSelectedNotification(notificacion);
    setShowModal(true);
  };

  // Función para marcar como leída
  const marcarComoLeida = async (notificacionId) => {
    try {
      await notificacionesService.marcarComoLeida(notificacionId);
      // Actualizar el estado local
      setNotificaciones((prev) =>
        prev.map((n) => (n.id === notificacionId ? { ...n, leida: true } : n))
      );
      // Actualizar resumen
      loadNotificaciones();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <div className="flex justify-center items-center py-10">
          <Spinner size="lg" />
          <span className="ml-2">Cargando notificaciones...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Notificaciones</h2>
        <Button
          size="sm"
          color="primary"
          onClick={loadNotificaciones}
          isLoading={loading}
        >
          Actualizar
        </Button>
      </div>

      {/* Resumen de notificaciones */}
      <Card className="mb-6">
        <CardHeader>
          <h3 className="text-lg font-semibold">Resumen</h3>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {resumen.total || 0}
              </div>
              <div className="text-sm text-default-500">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-danger">
                {resumen.alta || 0}
              </div>
              <div className="text-sm text-default-500">Alta Prioridad</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-warning">
                {resumen.citasProximas || 0}
              </div>
              <div className="text-sm text-default-500">Citas Próximas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success">
                {resumen.vacunasRecomendadas || 0}
              </div>
              <div className="text-sm text-default-500">
                Vacunas Recomendadas
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {error && (
        <Card className="mb-6">
          <CardBody>
            <div className="text-center text-red-500 py-4">{error}</div>
          </CardBody>
        </Card>
      )}

      {/* Lista de notificaciones */}
      {notificaciones.length === 0 ? (
        <Card>
          <CardBody>
            <div className="text-center py-10">
              <div className="text-6xl mb-4">🎉</div>
              <div className="text-xl font-semibold mb-2">¡Todo al día!</div>
              <div className="text-default-500">
                No tienes notificaciones pendientes en este momento.
              </div>
            </div>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-4">
          {notificaciones.map((notificacion) => (
            <Card
              key={notificacion.id}
              className={`${
                !notificacion.leida ? "border-l-4 border-l-primary" : ""
              }`}
              shadow="sm"
            >
              <CardBody>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="text-2xl">
                      {getTypeIcon(notificacion.tipo)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{notificacion.titulo}</h4>
                        {!notificacion.leida && (
                          <Badge color="primary" size="sm">
                            Nuevo
                          </Badge>
                        )}
                      </div>
                      <p className="text-default-600 mb-2">
                        {notificacion.mensaje}
                      </p>

                      <div className="flex items-center gap-2 text-sm text-default-500">
                        <span>👶 {notificacion.hijo.nombre}</span>
                        {notificacion.diasRestantes !== undefined && (
                          <span>
                            • ⏰ En {notificacion.diasRestantes} día(s)
                          </span>
                        )}
                        {notificacion.mesesRestantes !== undefined && (
                          <span>
                            • ⏰ En {notificacion.mesesRestantes} mes(es)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Chip
                      size="sm"
                      color={getPriorityColor(notificacion.prioridad)}
                      variant="flat"
                    >
                      {notificacion.prioridad.toUpperCase()}
                    </Chip>
                    <Button
                      size="sm"
                      variant="flat"
                      onClick={() => mostrarDetalles(notificacion)}
                    >
                      Ver Detalles
                    </Button>
                    {!notificacion.leida && (
                      <Button
                        size="sm"
                        color="primary"
                        variant="light"
                        onClick={() => marcarComoLeida(notificacion.id)}
                      >
                        Marcar Leída
                      </Button>
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de detalles */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        size="2xl"
        backdrop="blur"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl">
                {selectedNotification && getTypeIcon(selectedNotification.tipo)}
              </span>
              <h3 className="text-xl font-bold">Detalles de la Notificación</h3>
            </div>
          </ModalHeader>
          <ModalBody className="pb-6">
            {selectedNotification && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-lg mb-2">
                    {selectedNotification.titulo}
                  </h4>
                  <p className="text-default-600">
                    {selectedNotification.mensaje}
                  </p>
                </div>

                <Divider />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-semibold mb-2">Información del Niño</h5>
                    <p>
                      <strong>Nombre:</strong>{" "}
                      {selectedNotification.hijo.nombre}
                    </p>
                    <p>
                      <strong>ID:</strong> {selectedNotification.hijo.id}
                    </p>
                    {selectedNotification.hijo.edadMeses && (
                      <p>
                        <strong>Edad:</strong>{" "}
                        {selectedNotification.hijo.edadMeses} meses
                      </p>
                    )}
                  </div>

                  <div>
                    <h5 className="font-semibold mb-2">Detalles</h5>
                    <p>
                      <strong>Prioridad:</strong>
                      <Chip
                        size="sm"
                        color={getPriorityColor(selectedNotification.prioridad)}
                        variant="flat"
                        className="ml-2"
                      >
                        {selectedNotification.prioridad.toUpperCase()}
                      </Chip>
                    </p>
                    {selectedNotification.fechaCita && (
                      <p>
                        <strong>Fecha de Cita:</strong>{" "}
                        {formatearFecha(selectedNotification.fechaCita)}
                      </p>
                    )}
                    {selectedNotification.diasRestantes !== undefined && (
                      <p>
                        <strong>Días Restantes:</strong>{" "}
                        {selectedNotification.diasRestantes}
                      </p>
                    )}
                    {selectedNotification.mesesRestantes !== undefined && (
                      <p>
                        <strong>Meses Restantes:</strong>{" "}
                        {selectedNotification.mesesRestantes}
                      </p>
                    )}
                  </div>
                </div>

                {selectedNotification.cita && (
                  <>
                    <Divider />
                    <div>
                      <h5 className="font-semibold mb-2">
                        Información de la Cita
                      </h5>
                      <p>
                        <strong>Vacuna:</strong>{" "}
                        {selectedNotification.cita.vacuna}
                      </p>
                      {selectedNotification.cita.observaciones && (
                        <p>
                          <strong>Observaciones:</strong>{" "}
                          {selectedNotification.cita.observaciones}
                        </p>
                      )}
                    </div>
                  </>
                )}

                {selectedNotification.vacuna && (
                  <>
                    <Divider />
                    <div>
                      <h5 className="font-semibold mb-2">
                        Información de la Vacuna
                      </h5>
                      <p>
                        <strong>Vacuna:</strong>{" "}
                        {selectedNotification.vacuna.nombre}
                      </p>
                      <p>
                        <strong>Edad Mínima:</strong>{" "}
                        {selectedNotification.vacuna.edadMinima} meses
                      </p>
                      <p>
                        <strong>Edad Máxima:</strong>{" "}
                        {selectedNotification.vacuna.edadMaxima} meses
                      </p>
                    </div>
                  </>
                )}

                <div className="flex justify-end gap-2 pt-4">
                  {!selectedNotification.leida && (
                    <Button
                      color="primary"
                      onClick={() => {
                        marcarComoLeida(selectedNotification.id);
                        setShowModal(false);
                      }}
                    >
                      Marcar como Leída
                    </Button>
                  )}
                  <Button variant="light" onClick={() => setShowModal(false)}>
                    Cerrar
                  </Button>
                </div>
              </div>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
}

export default NotificacionesPadre;
