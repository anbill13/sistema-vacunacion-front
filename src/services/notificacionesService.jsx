// src/services/notificacionesService.jsx
import citasService from "./citasService.jsx";
import usuariosService from "./usuariosService.jsx";
import { getEsquemaVacunacion } from "./esquemaService.js";

const notificacionesService = {
  // Obtener notificaciones de próximas citas para un padre
  async getNotificacionesCitas(padreId) {
    try {
      // Obtener los hijos del padre
      const hijos = await usuariosService.getPatientsByUser(padreId);

      if (!hijos || hijos.length === 0) {
        return [];
      }

      // Obtener todas las citas
      const todasLasCitas = await citasService.getCitas();

      // Filtrar citas de los hijos del padre
      const citasHijos = todasLasCitas.filter((cita) =>
        hijos.some(
          (hijo) => (hijo.id_paciente || hijo.id_niño) === cita.id_niño
        )
      );

      // Filtrar solo citas pendientes y próximas (próximos 30 días)
      const ahora = new Date();
      const en30Dias = new Date();
      en30Dias.setDate(ahora.getDate() + 30);

      const citasProximas = citasHijos.filter((cita) => {
        const fechaCita = new Date(cita.fecha_cita);
        return (
          cita.estado === "Pendiente" &&
          fechaCita >= ahora &&
          fechaCita <= en30Dias
        );
      });

      // Crear notificaciones con información completa
      const notificaciones = citasProximas.map((cita) => {
        const hijo = hijos.find(
          (h) => (h.id_paciente || h.id_niño) === cita.id_niño
        );
        const fechaCita = new Date(cita.fecha_cita);
        const diasRestantes = Math.ceil(
          (fechaCita - ahora) / (1000 * 60 * 60 * 24)
        );

        let prioridad = "baja";
        if (diasRestantes <= 3) prioridad = "alta";
        else if (diasRestantes <= 7) prioridad = "media";

        return {
          id: `cita-${cita.id_cita}`,
          tipo: "cita_proxima",
          titulo: `Cita de vacunación próxima`,
          mensaje: `${hijo?.nombre_completo || "Su hijo"} tiene una cita para ${
            cita.vacuna_programada
          }`,
          fechaCita: cita.fecha_cita,
          diasRestantes,
          prioridad,
          hijo: {
            id: hijo?.id_paciente || hijo?.id_niño,
            nombre: hijo?.nombre_completo,
          },
          cita: {
            id: cita.id_cita,
            vacuna: cita.vacuna_programada,
            observaciones: cita.observaciones,
            centro: cita.id_centro,
          },
          leida: false,
          fechaCreacion: new Date().toISOString(),
        };
      });

      return notificaciones.sort((a, b) => a.diasRestantes - b.diasRestantes);
    } catch (error) {
      console.error(
        "[notificacionesService] Error getting notificaciones citas:",
        error
      );
      return [];
    }
  },

  // Obtener notificaciones de vacunas recomendadas por edad
  async getNotificacionesVacunasRecomendadas(padreId) {
    try {
      // Obtener los hijos del padre
      const hijos = await usuariosService.getPatientsByUser(padreId);

      if (!hijos || hijos.length === 0) {
        return [];
      }

      // Obtener esquema de vacunación
      const esquemaVacunacion = await getEsquemaVacunacion();

      const notificaciones = [];

      hijos.forEach((hijo) => {
        const fechaNacimiento = new Date(hijo.fecha_nacimiento);
        const ahora = new Date();
        const edadMeses =
          (ahora.getFullYear() - fechaNacimiento.getFullYear()) * 12 +
          (ahora.getMonth() - fechaNacimiento.getMonth());

        // Buscar vacunas próximas (en los próximos 2 meses)
        const vacunasProximas = esquemaVacunacion.filter((vacuna) => {
          const edadMinima = vacuna.edad_minima_meses || 0;
          return edadMinima > edadMeses && edadMinima <= edadMeses + 2;
        });

        vacunasProximas.forEach((vacuna) => {
          const mesesRestantes = (vacuna.edad_minima_meses || 0) - edadMeses;

          notificaciones.push({
            id: `vacuna-${hijo.id_paciente || hijo.id_niño}-${
              vacuna.id_vacuna
            }`,
            tipo: "vacuna_recomendada",
            titulo: "Vacuna próxima por edad",
            mensaje: `${hijo.nombre_completo} necesitará ${vacuna.nombre_vacuna} en ${mesesRestantes} mes(es)`,
            mesesRestantes,
            prioridad: mesesRestantes <= 1 ? "media" : "baja",
            hijo: {
              id: hijo.id_paciente || hijo.id_niño,
              nombre: hijo.nombre_completo,
              edadMeses,
            },
            vacuna: {
              id: vacuna.id_vacuna,
              nombre: vacuna.nombre_vacuna,
              edadMinima: vacuna.edad_minima_meses,
              edadMaxima: vacuna.edad_maxima_meses,
            },
            leida: false,
            fechaCreacion: new Date().toISOString(),
          });
        });
      });

      return notificaciones.sort((a, b) => a.mesesRestantes - b.mesesRestantes);
    } catch (error) {
      console.error(
        "[notificacionesService] Error getting notificaciones vacunas:",
        error
      );
      return [];
    }
  },

  // Obtener todas las notificaciones para un padre
  async getTodasLasNotificaciones(padreId) {
    try {
      const [notificacionesCitas, notificacionesVacunas] = await Promise.all([
        this.getNotificacionesCitas(padreId),
        this.getNotificacionesVacunasRecomendadas(padreId),
      ]);

      const todasLasNotificaciones = [
        ...notificacionesCitas,
        ...notificacionesVacunas,
      ];

      // Ordenar por prioridad y fecha
      return todasLasNotificaciones.sort((a, b) => {
        const prioridadOrder = { alta: 3, media: 2, baja: 1 };
        const prioridadDiff =
          prioridadOrder[b.prioridad] - prioridadOrder[a.prioridad];

        if (prioridadDiff !== 0) return prioridadDiff;

        // Si tienen la misma prioridad, ordenar por proximidad
        if (a.diasRestantes !== undefined && b.diasRestantes !== undefined) {
          return a.diasRestantes - b.diasRestantes;
        }
        if (a.mesesRestantes !== undefined && b.mesesRestantes !== undefined) {
          return a.mesesRestantes - b.mesesRestantes;
        }

        return new Date(b.fechaCreacion) - new Date(a.fechaCreacion);
      });
    } catch (error) {
      console.error(
        "[notificacionesService] Error getting todas las notificaciones:",
        error
      );
      return [];
    }
  },

  // Marcar notificación como leída
  async marcarComoLeida(notificacionId) {
    try {
      // En una implementación real, esto se guardaría en el backend
      // Por ahora, solo simulamos la acción
      console.log(
        `[notificacionesService] Marcando notificación ${notificacionId} como leída`
      );
      return true;
    } catch (error) {
      console.error(
        "[notificacionesService] Error marking notification as read:",
        error
      );
      return false;
    }
  },

  // Obtener resumen de notificaciones (contadores)
  async getResumenNotificaciones(padreId) {
    try {
      const notificaciones = await this.getTodasLasNotificaciones(padreId);

      return {
        total: notificaciones.length,
        noLeidas: notificaciones.filter((n) => !n.leida).length,
        alta: notificaciones.filter((n) => n.prioridad === "alta").length,
        media: notificaciones.filter((n) => n.prioridad === "media").length,
        baja: notificaciones.filter((n) => n.prioridad === "baja").length,
        citasProximas: notificaciones.filter((n) => n.tipo === "cita_proxima")
          .length,
        vacunasRecomendadas: notificaciones.filter(
          (n) => n.tipo === "vacuna_recomendada"
        ).length,
      };
    } catch (error) {
      console.error(
        "[notificacionesService] Error getting resumen notificaciones:",
        error
      );
      return {
        total: 0,
        noLeidas: 0,
        alta: 0,
        media: 0,
        baja: 0,
        citasProximas: 0,
        vacunasRecomendadas: 0,
      };
    }
  },
};

export default notificacionesService;
