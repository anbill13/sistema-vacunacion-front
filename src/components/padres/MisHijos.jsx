import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardBody,
  Chip,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@nextui-org/react";
import { useAuth } from "../../context/AuthContext";
import usuariosService from "../../services/usuariosService";
import { getEsquemaVacunacion } from "../../services/esquemaService.js";
import ResumenNotificaciones from "./ResumenNotificaciones";
import NotificacionesPadre from "./NotificacionesPadre";
import WidgetNotificaciones from "./WidgetNotificaciones";
import BannerNotificacionesUrgentes from "./BannerNotificacionesUrgentes";

function MisHijos() {
  const { currentUser } = useAuth();
  const [hijos, setHijos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [esquemaVacunacion, setEsquemaVacunacion] = useState([]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedChildId, setSelectedChildId] = useState(null);
  const [showNotificaciones, setShowNotificaciones] = useState(false);

  // Función para cargar el esquema de vacunación
  const loadVaccinationSchedule = useCallback(async () => {
    try {
      const schedule = await getEsquemaVacunacion();
      setEsquemaVacunacion(schedule);
    } catch (error) {
      console.error("[MisHijos] Error loading vaccination schedule:", error);
    }
  }, []);

  // Función para calcular la edad en meses
  const calculateAgeInMonths = (birthDate) => {
    const birth = new Date(birthDate);
    const today = new Date();
    const months =
      (today.getFullYear() - birth.getFullYear()) * 12 +
      (today.getMonth() - birth.getMonth());
    return months;
  };

  // Función para obtener las vacunas recomendadas para un niño
  const getRecommendedVaccines = (birthDate) => {
    const ageInMonths = calculateAgeInMonths(birthDate);
    return esquemaVacunacion.filter((vaccine) => {
      const minAge = vaccine.edad_minima_meses || 0;
      const maxAge = vaccine.edad_maxima_meses || 1200; // 100 años por defecto
      return ageInMonths >= minAge && ageInMonths <= maxAge;
    });
  };

  // Función para obtener la próxima vacuna recomendada
  const getNextRecommendedVaccine = (birthDate) => {
    const ageInMonths = calculateAgeInMonths(birthDate);
    const upcomingVaccines = esquemaVacunacion
      .filter((vaccine) => {
        const minAge = vaccine.edad_minima_meses || 0;
        return ageInMonths < minAge;
      })
      .sort((a, b) => (a.edad_minima_meses || 0) - (b.edad_minima_meses || 0));

    return upcomingVaccines.length > 0 ? upcomingVaccines[0] : null;
  };

  // Función para mostrar el calendario de vacunación
  const showVaccinationSchedule = (childId) => {
    setSelectedChildId(childId);
    setShowScheduleModal(true);
  };

  const getSelectedChild = () => {
    return hijos.find(
      (hijo) => (hijo.id_paciente || hijo.id_niño) === selectedChildId
    );
  };

  // Función para cargar los hijos del usuario con rol "padre"
  const loadChildren = useCallback(async () => {
    if (!currentUser || currentUser.role !== "padre") {
      console.log(
        "[MisHijos] User is not a padre or not authenticated:",
        currentUser
      );
      setHijos([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const userId = currentUser.id || currentUser.id_usuario;

      if (!userId) {
        throw new Error(
          "No se encontró ID de usuario. Verifica que tu sesión esté activa."
        );
      }

      console.log(`[MisHijos] Loading patients for user ID: ${userId}`);
      console.log(`[MisHijos] Current user data:`, currentUser);

      const children = await usuariosService.getPatientsByUser(userId);
      setHijos(children);

      console.log(`[MisHijos] Loaded ${children.length} children:`, children);

      if (children.length === 0) {
        setError("No tienes pacientes asociados a tu cuenta.");
      }
    } catch (err) {
      console.error("[MisHijos] Error loading patients:", err);
      setError(`Error al cargar los pacientes: ${err.message}`);
      setHijos([]);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // Cargar pacientes al montar el componente o cuando cambie el usuario
  useEffect(() => {
    loadChildren();
    loadVaccinationSchedule();
  }, [loadChildren, loadVaccinationSchedule]);

  const handleRefrescar = () => {
    loadChildren();
  };

  // Función para mostrar todas las notificaciones
  const handleVerNotificaciones = () => {
    setShowNotificaciones(true);
  };

  // Si se está mostrando las notificaciones, renderizar el componente completo
  if (showNotificaciones) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button
            size="sm"
            variant="light"
            onClick={() => setShowNotificaciones(false)}
          >
            ← Volver a Mis Hijos
          </Button>
        </div>
        <NotificacionesPadre />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-center">Mis Hijos</h2>
        <Button
          size="sm"
          color="primary"
          onClick={handleRefrescar}
          isLoading={loading}
          disabled={loading}
        >
          {loading ? "Cargando..." : "Refrescar"}
        </Button>
      </div>

      {/* Banner de Notificaciones Urgentes */}
      <BannerNotificacionesUrgentes onVerDetalles={handleVerNotificaciones} />

      {/* Widget de Notificaciones */}
      <div className="mb-6">
        <WidgetNotificaciones onVerTodas={handleVerNotificaciones} />
      </div>

      {error && (
        <div className="text-center text-red-500 py-4 mb-4 bg-red-50 rounded-lg">
          {error}
        </div>
      )}

      {loading && !error ? (
        <div className="text-center text-default-400 py-10">
          Cargando hijos...
        </div>
      ) : hijos.length === 0 ? (
        <div className="text-center py-10">
          <div className="text-default-400 mb-4">
            {error || "No tienes pacientes registrados."}
          </div>
          {/* Información de depuración para desarrollo */}
          {process.env.NODE_ENV === "development" && currentUser && (
            <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-small text-left max-w-md mx-auto">
              <div>
                <strong>Debug Info - Usuario Actual:</strong>
              </div>
              <div className="text-xs space-y-1 mt-2">
                <div>ID Usuario: {currentUser.id}</div>
                <div>ID Usuario Alt: {currentUser.id_usuario}</div>
                <div>Nombre: {currentUser.nombre}</div>
                <div>Role: {currentUser.role}</div>
                <div>Username: {currentUser.username}</div>
                <div className="pt-2 border-t border-gray-300">
                  <strong>Objeto completo:</strong>
                  <pre className="text-xs mt-1 whitespace-pre-wrap">
                    {JSON.stringify(currentUser, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {hijos.map((hijo) => {
            const recommendedVaccines = getRecommendedVaccines(
              hijo.fecha_nacimiento
            );
            const nextVaccine = getNextRecommendedVaccine(
              hijo.fecha_nacimiento
            );
            const ageInMonths = calculateAgeInMonths(hijo.fecha_nacimiento);

            return (
              <Card
                key={hijo.id_paciente || hijo.id_niño}
                shadow="sm"
                className="mb-6"
              >
                <CardBody>
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2">
                        {hijo.nombre_completo}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <p>
                          <span className="font-semibold">ID Paciente:</span>{" "}
                          {hijo.id_paciente || hijo.id_niño}
                        </p>
                        <p>
                          <span className="font-semibold">Identificación:</span>{" "}
                          {hijo.identificacion || "No registrada"}
                        </p>
                        <p>
                          <span className="font-semibold">
                            Fecha de Nacimiento:
                          </span>{" "}
                          {hijo.fecha_nacimiento}
                        </p>
                        <p>
                          <span className="font-semibold">Género:</span>{" "}
                          {hijo.genero}
                        </p>
                        <p>
                          <span className="font-semibold">Edad:</span>{" "}
                          {ageInMonths} meses
                        </p>
                        <p>
                          <span className="font-semibold">Nacionalidad:</span>{" "}
                          {hijo.nacionalidad || "No registrada"}
                        </p>
                        <p>
                          <span className="font-semibold">
                            País de Nacimiento:
                          </span>{" "}
                          {hijo.pais_nacimiento || "No registrado"}
                        </p>
                      </div>
                      <div className="mt-2">
                        <p>
                          <span className="font-semibold">Dirección:</span>{" "}
                          {hijo.direccion_residencia}
                        </p>
                      </div>
                      {hijo.tutor_relation && (
                        <div className="mt-2">
                          <Chip size="sm" color="primary" variant="flat">
                            Relación: {hijo.tutor_relation.relacion}
                          </Chip>
                        </div>
                      )}
                    </div>
                    <div className="w-full md:w-auto md:min-w-[350px]">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-semibold">Esquema de Vacunación</h4>
                        <Button
                          size="sm"
                          color="primary"
                          variant="flat"
                          onClick={() =>
                            showVaccinationSchedule(
                              hijo.id_paciente || hijo.id_niño
                            )
                          }
                        >
                          Ver Calendario Completo
                        </Button>
                      </div>

                      {/* Vacunas actuales recomendadas */}
                      {recommendedVaccines.length > 0 && (
                        <div className="mb-3">
                          <p className="text-sm font-medium text-green-600 mb-2">
                            Vacunas recomendadas para su edad:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {recommendedVaccines
                              .slice(0, 3)
                              .map((vaccine, index) => (
                                <Chip
                                  key={index}
                                  size="sm"
                                  color="success"
                                  variant="flat"
                                  className="text-xs"
                                >
                                  {vaccine.nombre_vacuna}
                                </Chip>
                              ))}
                            {recommendedVaccines.length > 3 && (
                              <Chip
                                size="sm"
                                color="success"
                                variant="flat"
                                className="text-xs"
                              >
                                +{recommendedVaccines.length - 3} más
                              </Chip>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Próxima vacuna */}
                      {nextVaccine && (
                        <div className="mb-3">
                          <p className="text-sm font-medium text-blue-600 mb-2">
                            Próxima vacuna:
                          </p>
                          <Chip
                            size="sm"
                            color="primary"
                            variant="flat"
                            className="text-xs"
                          >
                            {nextVaccine.nombre_vacuna} -{" "}
                            {nextVaccine.edad_minima_meses} meses
                          </Chip>
                        </div>
                      )}

                      {recommendedVaccines.length === 0 && !nextVaccine && (
                        <div className="text-default-400 text-sm">
                          <p>No hay vacunas pendientes</p>
                          <p className="text-xs">Consulte con su pediatra</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal del calendario de vacunación */}
      <Modal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        size="4xl"
        scrollBehavior="inside"
        backdrop="blur"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <h3 className="text-xl font-bold">Calendario de Vacunación</h3>
            {getSelectedChild() && (
              <p className="text-medium text-default-500">
                {getSelectedChild().nombre_completo} -{" "}
                {calculateAgeInMonths(getSelectedChild().fecha_nacimiento)}{" "}
                meses
              </p>
            )}
          </ModalHeader>
          <ModalBody>
            {getSelectedChild() && esquemaVacunacion.length > 0 && (
              <div className="space-y-4">
                <Table aria-label="Calendario de vacunación">
                  <TableHeader>
                    <TableColumn>VACUNA</TableColumn>
                    <TableColumn>EDAD MÍNIMA</TableColumn>
                    <TableColumn>EDAD MÁXIMA</TableColumn>
                    <TableColumn>DOSIS</TableColumn>
                    <TableColumn>ESTADO</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {esquemaVacunacion
                      .sort(
                        (a, b) =>
                          (a.edad_minima_meses || 0) -
                          (b.edad_minima_meses || 0)
                      )
                      .map((vaccine, index) => {
                        const ageInMonths = calculateAgeInMonths(
                          getSelectedChild().fecha_nacimiento
                        );
                        const minAge = vaccine.edad_minima_meses || 0;
                        const maxAge = vaccine.edad_maxima_meses || 1200;

                        let statusColor = "default";
                        let statusText = "Pendiente";

                        if (ageInMonths >= minAge && ageInMonths <= maxAge) {
                          statusColor = "success";
                          statusText = "Recomendada";
                        } else if (ageInMonths < minAge) {
                          statusColor = "primary";
                          statusText = "Próxima";
                        } else if (ageInMonths > maxAge) {
                          statusColor = "warning";
                          statusText = "Atrasada";
                        }

                        return (
                          <TableRow key={index}>
                            <TableCell>
                              <div>
                                <p className="font-medium">
                                  {vaccine.nombre_vacuna}
                                </p>
                                {vaccine.descripcion && (
                                  <p className="text-xs text-default-400">
                                    {vaccine.descripcion}
                                  </p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{minAge} meses</TableCell>
                            <TableCell>
                              {maxAge === 1200
                                ? "Sin límite"
                                : `${maxAge} meses`}
                            </TableCell>
                            <TableCell>{vaccine.numero_dosis || 1}</TableCell>
                            <TableCell>
                              <Chip
                                size="sm"
                                color={statusColor}
                                variant="flat"
                              >
                                {statusText}
                              </Chip>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>

                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="font-semibold mb-2 text-blue-800 dark:text-blue-200">
                    📅 Recomendaciones importantes:
                  </h4>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                    <li>
                      • Consulte con su pediatra antes de aplicar cualquier
                      vacuna
                    </li>
                    <li>• Mantenga actualizado el carnet de vacunación</li>
                    <li>
                      • Las fechas son aproximadas, el médico determinará el
                      momento exacto
                    </li>
                    <li>• Reporte cualquier reacción adversa a las vacunas</li>
                  </ul>
                </div>
              </div>
            )}

            {esquemaVacunacion.length === 0 && (
              <div className="text-center py-8 text-default-400">
                <p>No se pudo cargar el esquema de vacunación.</p>
                <p className="text-sm">Inténtelo de nuevo más tarde.</p>
              </div>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
}

export default MisHijos;
