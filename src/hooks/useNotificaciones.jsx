import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import notificacionesService from "../services/notificacionesService";

export const useNotificaciones = () => {
  const { currentUser } = useAuth();
  const [resumen, setResumen] = useState({
    total: 0,
    noLeidas: 0,
    alta: 0,
    media: 0,
    baja: 0,
    citasProximas: 0,
    vacunasRecomendadas: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadResumen = useCallback(async () => {
    if (!currentUser || currentUser.role !== "padre") {
      setResumen({
        total: 0,
        noLeidas: 0,
        alta: 0,
        media: 0,
        baja: 0,
        citasProximas: 0,
        vacunasRecomendadas: 0,
      });
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const userId = currentUser.id || currentUser.id_usuario;

      if (!userId) {
        throw new Error("No se encontró ID de usuario");
      }

      const resumenData = await notificacionesService.getResumenNotificaciones(
        userId
      );
      setResumen(resumenData);
    } catch (err) {
      console.error("[useNotificaciones] Error loading resumen:", err);
      setError(err.message);
      setResumen({
        total: 0,
        noLeidas: 0,
        alta: 0,
        media: 0,
        baja: 0,
        citasProximas: 0,
        vacunasRecomendadas: 0,
      });
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    loadResumen();

    // Actualizar cada 5 minutos
    const interval = setInterval(loadResumen, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [loadResumen]);

  return {
    resumen,
    loading,
    error,
    refresh: loadResumen,
  };
};

export default useNotificaciones;
