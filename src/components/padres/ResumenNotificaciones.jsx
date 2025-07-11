import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardBody,
  Chip,
  Button,
  Badge,
  Spinner,
} from "@nextui-org/react";
import { useAuth } from "../../context/AuthContext";
import notificacionesService from "../../services/notificacionesService";

function ResumenNotificaciones({ onVerTodas }) {
  const { currentUser } = useAuth();
  const [notificaciones, setNotificaciones] = useState([]);
  const [resumen, setResumen] = useState({});
  const [loading, setLoading] = useState(true);

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

      const userId = currentUser.id || currentUser.id_usuario;

      if (!userId) {
        throw new Error("No se encontró ID de usuario");
      }

      const [notificacionesData, resumenData] = await Promise.all([
        notificacionesService.getTodasLasNotificaciones(userId),
        notificacionesService.getResumenNotificaciones(userId),
      ]);

      // Solo mostrar las 3 más importantes
      const notificacionesImportantes = notificacionesData.slice(0, 3);

      setNotificaciones(notificacionesImportantes);
      setResumen(resumenData);
    } catch (err) {
      console.error(
        "[ResumenNotificaciones] Error loading notifications:",
        err
      );
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

  if (loading) {
    return (
      <Card className="mb-6">
        <CardBody>
          <div className="flex items-center justify-center py-4">
            <Spinner size="sm" />
            <span className="ml-2 text-sm">Cargando notificaciones...</span>
          </div>
        </CardBody>
      </Card>
    );
  }

  if (notificaciones.length === 0) {
    return (
      <Card className="mb-6">
        <CardBody>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-2xl">🎉</div>
              <div>
                <h4 className="font-semibold">¡Todo al día!</h4>
                <p className="text-sm text-default-500">
                  No hay notificaciones pendientes
                </p>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardBody>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold">🔔 Notificaciones</h4>
            {resumen.noLeidas > 0 && (
              <Badge color="danger" size="sm">
                {resumen.noLeidas}
              </Badge>
            )}
          </div>
          <Button size="sm" color="primary" variant="flat" onClick={onVerTodas}>
            Ver Todas ({resumen.total || 0})
          </Button>
        </div>

        <div className="space-y-3">
          {notificaciones.map((notificacion) => (
            <div
              key={notificacion.id}
              className={`flex items-start gap-3 p-3 rounded-lg ${
                !notificacion.leida
                  ? "bg-primary-50 border border-primary-200"
                  : "bg-default-50"
              }`}
            >
              <div className="text-lg">{getTypeIcon(notificacion.tipo)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h5 className="font-medium text-sm truncate">
                    {notificacion.titulo}
                  </h5>
                  <Chip
                    size="sm"
                    color={getPriorityColor(notificacion.prioridad)}
                    variant="flat"
                    className="text-xs"
                  >
                    {notificacion.prioridad}
                  </Chip>
                </div>
                <p className="text-xs text-default-600 mb-1 line-clamp-2">
                  {notificacion.mensaje}
                </p>
                <div className="flex items-center gap-2 text-xs text-default-500">
                  <span>👶 {notificacion.hijo.nombre}</span>
                  {notificacion.diasRestantes !== undefined && (
                    <span>• ⏰ {notificacion.diasRestantes}d</span>
                  )}
                  {notificacion.mesesRestantes !== undefined && (
                    <span>• ⏰ {notificacion.mesesRestantes}m</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {resumen.total > 3 && (
          <div className="text-center mt-3">
            <Button
              size="sm"
              variant="light"
              color="primary"
              onClick={onVerTodas}
            >
              Ver {resumen.total - 3} notificaciones más
            </Button>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

export default ResumenNotificaciones;
