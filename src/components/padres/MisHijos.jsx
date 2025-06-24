import React, { useState, useEffect, useCallback } from "react";
import { Card, CardBody, Chip, Button } from "@nextui-org/react";
import { useAuth } from "../../context/AuthContext";
import usuariosService from "../../services/usuariosService";

function MisHijos() {
  const { currentUser } = useAuth();
  const [hijos, setHijos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Función para cargar los hijos del usuario con rol "padre"
  const loadChildren = useCallback(async () => {
    if (!currentUser || currentUser.role !== "padre") {
      console.log('[MisHijos] User is not a padre or not authenticated:', currentUser);
      setHijos([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const userId = currentUser.id || currentUser.id_usuario;
      
      if (!userId) {
        throw new Error('No se encontró ID de usuario. Verifica que tu sesión esté activa.');
      }
      
      console.log(`[MisHijos] Loading patients for user ID: ${userId}`);
      console.log(`[MisHijos] Current user data:`, currentUser);
      
      const children = await usuariosService.getPatientsByUser(userId);
      setHijos(children);
      
      console.log(`[MisHijos] Loaded ${children.length} children:`, children);
      
      if (children.length === 0) {
        setError('No tienes pacientes asociados a tu cuenta.');
      }
    } catch (err) {
      console.error('[MisHijos] Error loading patients:', err);
      setError(`Error al cargar los pacientes: ${err.message}`);
      setHijos([]);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // Cargar pacientes al montar el componente o cuando cambie el usuario
  useEffect(() => {
    loadChildren();
  }, [loadChildren]);

  const handleRefrescar = () => {
    loadChildren();
  };

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
          {loading ? 'Cargando...' : 'Refrescar'}
        </Button>
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
            {error || 'No tienes pacientes registrados.'}
          </div>
          {/* Información de depuración para desarrollo */}
          {process.env.NODE_ENV === 'development' && currentUser && (
            <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-small text-left max-w-md mx-auto">
              <div><strong>Debug Info - Usuario Actual:</strong></div>
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
          {hijos.map((hijo) => (
            <Card key={hijo.id_paciente || hijo.id_niño} shadow="sm" className="mb-6">
              <CardBody>
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">{hijo.nombre_completo}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <p><span className="font-semibold">ID Paciente:</span> {hijo.id_paciente || hijo.id_niño}</p>
                      <p><span className="font-semibold">Identificación:</span> {hijo.identificacion || 'No registrada'}</p>
                      <p><span className="font-semibold">Fecha de Nacimiento:</span> {hijo.fecha_nacimiento}</p>
                      <p><span className="font-semibold">Género:</span> {hijo.genero}</p>
                      <p><span className="font-semibold">Nacionalidad:</span> {hijo.nacionalidad || 'No registrada'}</p>
                      <p><span className="font-semibold">País de Nacimiento:</span> {hijo.pais_nacimiento || 'No registrado'}</p>
                    </div>
                    <div className="mt-2">
                      <p><span className="font-semibold">Dirección:</span> {hijo.direccion_residencia}</p>
                    </div>
                    {hijo.tutor_relation && (
                      <div className="mt-2">
                        <Chip size="sm" color="primary" variant="flat">
                          Relación: {hijo.tutor_relation.relacion}
                        </Chip>
                      </div>
                    )}
                  </div>
                  <div className="w-full md:w-auto md:min-w-[300px]">
                    <h4 className="font-semibold mb-2">Información de Vacunación</h4>
                    <div className="text-default-400">
                      <p>Información disponible</p>
                      <p className="text-xs">ID: {hijo.id_paciente || hijo.id_niño}</p>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}


export default MisHijos;
