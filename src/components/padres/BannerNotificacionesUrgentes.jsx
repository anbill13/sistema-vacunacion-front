import React, { useState, useEffect, useCallback } from "react";
import { Card, CardBody, Chip, Button, Badge } from "@nextui-org/react";
import { useAuth } from "../../context/AuthContext";
import notificacionesService from "../../services/notificacionesService";

function BannerNotificacionesUrgentes({ onVerDetalles }) {
  const { currentUser } = useAuth();
  const [notificacionesUrgentes, setNotificacionesUrgentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  // Función para cargar notificaciones urgentes
  const loadNotificacionesUrgentes = useCallback(async () => {
    if (!currentUser || currentUser.role !== "padre") {
      setNotificacionesUrgentes([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const userId = currentUser.id || currentUser.id_usuario;

      if (!userId) {
        throw new Error("No se encontró ID de usuario");
      }

      const notificaciones =
        await notificacionesService.getTodasLasNotificaciones(userId);

      // Filtrar solo notificaciones urgentes (alta prioridad y próximas)
      const urgentes = notificaciones.filter((n) => {
        if (n.prioridad === "alta") return true;
        if (n.tipo === "cita_proxima" && n.diasRestantes <= 2) return true;
        return false;
      });

      setNotificacionesUrgentes(urgentes.slice(0, 2)); // Solo mostrar las 2 más urgentes
    } catch (err) {
      console.error(
        "[BannerNotificacionesUrgentes] Error loading notifications:",
        err
      );
      setNotificacionesUrgentes([]);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // Cargar notificaciones al montar el componente
  useEffect(() => {
    loadNotificacionesUrgentes();
  }, [loadNotificacionesUrgentes]);

  // No mostrar si está cargando, no hay notificaciones urgentes, o fue descartado
  if (loading || notificacionesUrgentes.length === 0 || dismissed) {
    return null;
  }

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

  return (
    <Card className="mb-6 border-l-4 border-l-danger bg-gradient-to-r from-danger-50 to-warning-50">
      <CardBody>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">⚠️</span>
              <h4 className="font-bold text-danger">Notificaciones Urgentes</h4>
              <Badge color="danger" size="sm">
                {notificacionesUrgentes.length}
              </Badge>
            </div>

            <div className="space-y-2">
              {notificacionesUrgentes.map((notificacion) => (
                <div
                  key={notificacion.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-white/70 border border-danger-200"
                >
                  <div className="text-lg">
                    {getTypeIcon(notificacion.tipo)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="font-semibold text-sm">
                        {notificacion.titulo}
                      </h5>
                      <Chip
                        size="sm"
                        color="danger"
                        variant="flat"
                        className="text-xs"
                      >
                        URGENTE
                      </Chip>
                    </div>
                    <p className="text-sm text-default-700 mb-1">
                      {notificacion.mensaje}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-default-600">
                      <span>👶 {notificacion.hijo.nombre}</span>
                      {notificacion.diasRestantes !== undefined && (
                        <span className="text-danger font-semibold">
                          • ⏰{" "}
                          {notificacion.diasRestantes === 0
                            ? "HOY"
                            : `En ${notificacion.diasRestantes} día(s)`}
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
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2 ml-4">
            <Button size="sm" color="danger" onClick={onVerDetalles}>
              Ver Detalles
            </Button>
            <Button
              size="sm"
              variant="light"
              onClick={() => setDismissed(true)}
            >
              Descartar
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

export default BannerNotificacionesUrgentes;
