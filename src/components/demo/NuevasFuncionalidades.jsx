// src/components/demo/NuevasFuncionalidades.jsx
import React from 'react';
import { Card, CardBody, CardHeader, Chip, Divider } from "@nextui-org/react";

const NuevasFuncionalidades = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">🎉 Nuevas Funcionalidades Implementadas</h1>
        <p className="text-gray-600">Sistema de asignación de centros y gestión de citas mejorado</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Funcionalidad 1: Asignación de Centros */}
        <Card className="h-full">
          <CardHeader className="pb-2">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🏥👨‍⚕️</span>
              <div>
                <h3 className="text-xl font-bold text-gray-800">Asignación de Centros a Doctores</h3>
                <p className="text-sm text-gray-600">Para Directores y Administradores</p>
              </div>
            </div>
          </CardHeader>
          <Divider />
          <CardBody className="pt-4">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">✨ Características:</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start space-x-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>Interfaz intuitiva para asignar múltiples centros a doctores</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>Vista de tarjetas con información completa de cada doctor</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>Búsqueda y filtrado de doctores por nombre o email</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>Visualización clara de centros ya asignados</span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-700 mb-2">🎯 Cómo usar:</h4>
                <ol className="space-y-1 text-sm text-gray-600">
                  <li>1. Ve al panel de Administración</li>
                  <li>2. Selecciona la pestaña "Asignar Centros"</li>
                  <li>3. Haz clic en "Asignar" junto al doctor deseado</li>
                  <li>4. Selecciona los centros haciendo clic en las tarjetas</li>
                  <li>5. Guarda los cambios</li>
                </ol>
              </div>

              <div className="flex flex-wrap gap-2">
                <Chip size="sm" color="primary" variant="flat">Administradores</Chip>
                <Chip size="sm" color="secondary" variant="flat">Directores</Chip>
                <Chip size="sm" color="success" variant="flat">Multi-selección</Chip>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Funcionalidad 2: Calendario de Citas */}
        <Card className="h-full">
          <CardHeader className="pb-2">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">📅✏️</span>
              <div>
                <h3 className="text-xl font-bold text-gray-800">Calendario de Citas para Doctores</h3>
                <p className="text-sm text-gray-600">Panel completo de gestión de citas</p>
              </div>
            </div>
          </CardHeader>
          <Divider />
          <CardBody className="pt-4">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">✨ Características:</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Vista de calendario con todas las citas programadas</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Edición completa: fecha, hora, vacuna y observaciones</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Filtros por estado: Todas, Hoy, Pendientes</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Estadísticas rápidas en tiempo real</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Cancelación y reprogramación de citas</span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-700 mb-2">🎯 Funciones disponibles:</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <span className="text-yellow-500">📝</span>
                    <span>Editar citas</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-red-500">❌</span>
                    <span>Cancelar citas</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-green-500">✅</span>
                    <span>Cambiar estado</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-purple-500">🔄</span>
                    <span>Reprogramar</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Chip size="sm" color="primary" variant="flat">Doctores</Chip>
                <Chip size="sm" color="warning" variant="flat">Tiempo Real</Chip>
                <Chip size="sm" color="success" variant="flat">Filtros Avanzados</Chip>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Sección de acceso rápido */}
      <Card className="mt-6">
        <CardHeader>
          <h3 className="text-xl font-bold text-gray-800">🚀 Acceso Rápido</h3>
        </CardHeader>
        <Divider />
        <CardBody>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl mb-2">👨‍💼</div>
              <h4 className="font-semibold text-gray-800">Administradores</h4>
              <p className="text-sm text-gray-600 mt-1">
                Accede a "Administración" → "Asignar Centros"
              </p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl mb-2">👨‍⚕️</div>
              <h4 className="font-semibold text-gray-800">Doctores</h4>
              <p className="text-sm text-gray-600 mt-1">
                Tu nuevo "Panel del Doctor" está disponible
              </p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl mb-2">👥</div>
              <h4 className="font-semibold text-gray-800">Directores</h4>
              <p className="text-sm text-gray-600 mt-1">
                Gestiona asignaciones desde Administración
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Notas técnicas */}
      <Card className="mt-6">
        <CardHeader>
          <h3 className="text-xl font-bold text-gray-800">🔧 Notas Técnicas</h3>
        </CardHeader>
        <Divider />
        <CardBody>
          <div className="space-y-3 text-sm text-gray-600">
            <p>
              <strong>Servicios creados:</strong> citasService.jsx para gestión de citas, métodos adicionales en usuariosService.jsx
            </p>
            <p>
              <strong>Componentes nuevos:</strong> AsignacionCentros.jsx, CalendarioCitas.jsx, DoctorPage.jsx
            </p>
            <p>
              <strong>Navegación actualizada:</strong> Nueva pestaña "Panel del Doctor" para usuarios con rol de doctor
            </p>
            <p>
              <strong>Contexto mejorado:</strong> DataContext ahora incluye gestión de citas en tiempo real
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default NuevasFuncionalidades;