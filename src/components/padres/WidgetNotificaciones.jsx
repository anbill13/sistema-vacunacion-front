import React from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Chip,
  Button,
  Badge,
  Divider,
} from "@nextui-org/react";
import useNotificaciones from "../../hooks/useNotificaciones";

function WidgetNotificaciones({ onVerTodas, compact = false }) {
  const { resumen, loading } = useNotificaciones();

  if (loading) {
    return (
      <Card className={compact ? "w-full" : "w-full max-w-md"}>
        <CardBody>
          <div className="flex items-center justify-center py-4">
            <div className="animate-pulse flex items-center gap-2">
              <div className="w-4 h-4 bg-default-300 rounded-full"></div>
              <span className="text-sm text-default-500">Cargando...</span>
            </div>
          </div>
        </CardBody>
      </Card>
    );
  }

  if (resumen.total === 0) {
    return (
      <Card className={compact ? "w-full" : "w-full max-w-md"}>
        <CardBody>
          <div className="text-center py-4">
            <div className="text-3xl mb-2">🎉</div>
            <div className="text-sm font-semibold">¡Todo al día!</div>
            <div className="text-xs text-default-500">
              No hay notificaciones
            </div>
          </div>
        </CardBody>
      </Card>
    );
  }

  if (compact) {
    return (
      <Card className="w-full" isPressable onClick={onVerTodas}>
        <CardBody>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-2xl">🔔</div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">Notificaciones</span>
                  {resumen.noLeidas > 0 && (
                    <Badge color="danger" size="sm">
                      {resumen.noLeidas}
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-default-500">
                  {resumen.alta > 0 &&
                    `${resumen.alta} urgente${resumen.alta > 1 ? "s" : ""}`}
                  {resumen.alta > 0 && resumen.citasProximas > 0 && " • "}
                  {resumen.citasProximas > 0 &&
                    `${resumen.citasProximas} cita${
                      resumen.citasProximas > 1 ? "s" : ""
                    }`}
                </div>
              </div>
            </div>
            <Button size="sm" variant="light" color="primary">
              Ver →
            </Button>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <span className="text-lg">🔔</span>
            <h4 className="font-semibold">Notificaciones</h4>
            {resumen.noLeidas > 0 && (
              <Badge color="danger" size="sm">
                {resumen.noLeidas}
              </Badge>
            )}
          </div>
          <Button size="sm" color="primary" variant="flat" onClick={onVerTodas}>
            Ver Todas
          </Button>
        </div>
      </CardHeader>
      <CardBody className="pt-0">
        <div className="space-y-3">
          {/* Resumen por prioridad */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-lg bg-danger-50">
              <div className="text-lg font-bold text-danger">
                {resumen.alta}
              </div>
              <div className="text-xs text-danger-600">Alta</div>
            </div>
            <div className="p-2 rounded-lg bg-warning-50">
              <div className="text-lg font-bold text-warning">
                {resumen.media}
              </div>
              <div className="text-xs text-warning-600">Media</div>
            </div>
            <div className="p-2 rounded-lg bg-primary-50">
              <div className="text-lg font-bold text-primary">
                {resumen.baja}
              </div>
              <div className="text-xs text-primary-600">Baja</div>
            </div>
          </div>

          <Divider />

          {/* Resumen por tipo */}
          <div className="space-y-2">
            {resumen.citasProximas > 0 && (
              <div className="flex items-center justify-between p-2 rounded-lg bg-blue-50">
                <div className="flex items-center gap-2">
                  <span className="text-sm">📅</span>
                  <span className="text-sm font-medium">Citas Próximas</span>
                </div>
                <Chip size="sm" color="primary" variant="flat">
                  {resumen.citasProximas}
                </Chip>
              </div>
            )}

            {resumen.vacunasRecomendadas > 0 && (
              <div className="flex items-center justify-between p-2 rounded-lg bg-green-50">
                <div className="flex items-center gap-2">
                  <span className="text-sm">💉</span>
                  <span className="text-sm font-medium">
                    Vacunas Recomendadas
                  </span>
                </div>
                <Chip size="sm" color="success" variant="flat">
                  {resumen.vacunasRecomendadas}
                </Chip>
              </div>
            )}
          </div>

          {(resumen.citasProximas > 0 || resumen.vacunasRecomendadas > 0) && (
            <Button size="sm" color="primary" fullWidth onClick={onVerTodas}>
              Ver Detalles de Todas las Notificaciones
            </Button>
          )}
        </div>
      </CardBody>
    </Card>
  );
}

export default WidgetNotificaciones;
