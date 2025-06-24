// src/components/doctores/DashboardDoctor.jsx
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Progress,
  Chip,
  Avatar,
  Button,
  Divider
} from "@nextui-org/react";
import { useData } from '../../context/DataContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import citasService from '../../services/citasService.jsx';
import { DashboardDoctorHelp } from '../ui/HelpTooltip.jsx';

const DashboardDoctor = () => {
  const { centrosVacunacion, ninos } = useData();
  const { currentUser } = useAuth();
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [estadisticas, setEstadisticas] = useState({
    totalCitas: 0,
    citasHoy: 0,
    citasPendientes: 0,
    citasCompletadas: 0,
    proximasCitas: []
  });

  useEffect(() => {
    cargarDatos();
  }, [currentUser]);

  const cargarDatos = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      const centrosAsignados = currentUser.centrosAsignados || [currentUser.id_centro].filter(Boolean);
      const citasDoctor = await citasService.getCitasPorDoctor(currentUser.id, centrosAsignados);
      setCitas(citasDoctor);
      calcularEstadisticas(citasDoctor);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const calcularEstadisticas = (citasData) => {
    const hoy = new Date();
    const inicioHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
    const finHoy = new Date(inicioHoy.getTime() + 24 * 60 * 60 * 1000);

    const citasHoy = citasData.filter(cita => {
      const fechaCita = new Date(cita.fecha_cita);
      return fechaCita >= inicioHoy && fechaCita < finHoy;
    });

    const citasPendientes = citasData.filter(c => c.estado === 'Pendiente');
    const citasCompletadas = citasData.filter(c => c.estado === 'Completada');

    // Próximas 5 citas
    const proximasCitas = citasData
      .filter(c => new Date(c.fecha_cita) > hoy && c.estado !== 'Cancelada')
      .sort((a, b) => new Date(a.fecha_cita) - new Date(b.fecha_cita))
      .slice(0, 5);

    setEstadisticas({
      totalCitas: citasData.length,
      citasHoy: citasHoy.length,
      citasPendientes: citasPendientes.length,
      citasCompletadas: citasCompletadas.length,
      proximasCitas
    });
  };

  const getNombrePaciente = (idNino) => {
    const nino = ninos.find(n => n.id_niño === idNino);
    return nino ? `${nino.nombre} ${nino.apellido}` : 'Paciente no encontrado';
  };

  const getNombreCentro = (idCentro) => {
    const centro = centrosVacunacion.find(c => c.id_centro === idCentro);
    return centro ? centro.nombre_corto || centro.nombre_centro : 'Centro no encontrado';
  };

  const getColorEstado = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'pendiente': return 'warning';
      case 'confirmada': return 'primary';
      case 'completada': return 'success';
      case 'cancelada': return 'danger';
      default: return 'default';
    }
  };

  const porcentajeCompletado = estadisticas.totalCitas > 0 
    ? Math.round((estadisticas.citasCompletadas / estadisticas.totalCitas) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header con saludo personalizado */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div>
              <h1 className="text-2xl font-bold mb-2">
                ¡Buen día, Dr. {currentUser?.name?.split(' ')[0] || 'Doctor'}! 👋
              </h1>
              <p className="text-blue-100">
                Tienes {estadisticas.citasHoy} citas programadas para hoy
              </p>
            </div>
            <div className="text-white">
              <DashboardDoctorHelp />
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{estadisticas.citasHoy}</div>
            <div className="text-sm text-blue-100">Citas hoy</div>
          </div>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-l-4 border-blue-500">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total de Citas</p>
                <p className="text-2xl font-bold text-blue-600">{estadisticas.totalCitas}</p>
              </div>
              <div className="text-3xl">📅</div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-l-4 border-yellow-500">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pendientes</p>
                <p className="text-2xl font-bold text-yellow-600">{estadisticas.citasPendientes}</p>
              </div>
              <div className="text-3xl">⏳</div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-l-4 border-green-500">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Completadas</p>
                <p className="text-2xl font-bold text-green-600">{estadisticas.citasCompletadas}</p>
              </div>
              <div className="text-3xl">✅</div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-l-4 border-purple-500">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Progreso</p>
                <p className="text-2xl font-bold text-purple-600">{porcentajeCompletado}%</p>
              </div>
              <div className="text-3xl">📊</div>
            </div>
            <Progress 
              value={porcentajeCompletado} 
              color="secondary" 
              className="mt-2"
              size="sm"
            />
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Próximas citas */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between w-full">
              <h3 className="text-lg font-semibold text-gray-800">🗓️ Próximas Citas</h3>
              <Chip size="sm" color="primary" variant="flat">
                {estadisticas.proximasCitas.length} programadas
              </Chip>
            </div>
          </CardHeader>
          <Divider />
          <CardBody className="pt-4">
            {estadisticas.proximasCitas.length > 0 ? (
              <div className="space-y-3">
                {estadisticas.proximasCitas.map((cita, index) => (
                  <div key={cita.id_cita} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <Avatar
                      name={getNombrePaciente(cita.id_niño)}
                      size="sm"
                      color="primary"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 truncate">
                        {getNombrePaciente(cita.id_niño)}
                      </p>
                      <p className="text-sm text-gray-600 truncate">
                        {cita.vacuna_programada}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-gray-500">
                          📅 {new Date(cita.fecha_cita).toLocaleDateString()}
                        </span>
                        <span className="text-xs text-gray-500">
                          🕐 {new Date(cita.fecha_cita).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                    </div>
                    <Chip
                      size="sm"
                      color={getColorEstado(cita.estado)}
                      variant="flat"
                    >
                      {cita.estado}
                    </Chip>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">📅</div>
                <p>No hay citas próximas programadas</p>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Resumen de centros asignados */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between w-full">
              <h3 className="text-lg font-semibold text-gray-800">🏥 Mis Centros</h3>
              <Chip size="sm" color="secondary" variant="flat">
                {(currentUser?.centrosAsignados || []).length} asignados
              </Chip>
            </div>
          </CardHeader>
          <Divider />
          <CardBody className="pt-4">
            {currentUser?.centrosAsignados && currentUser.centrosAsignados.length > 0 ? (
              <div className="space-y-3">
                {currentUser.centrosAsignados.map((centroId) => {
                  const centro = centrosVacunacion.find(c => String(c.id_centro) === String(centroId));
                  const citasCentro = citas.filter(c => c.id_centro === centroId);
                  
                  return (
                    <div key={centroId} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-800">
                          {centro ? centro.nombre_corto || centro.nombre_centro : 'Centro no encontrado'}
                        </h4>
                        <Chip size="sm" color="primary" variant="flat">
                          {citasCentro.length} citas
                        </Chip>
                      </div>
                      {centro && (
                        <p className="text-sm text-gray-600">📍 {centro.direccion}</p>
                      )}
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span>✅ {citasCentro.filter(c => c.estado === 'Completada').length} completadas</span>
                        <span>⏳ {citasCentro.filter(c => c.estado === 'Pendiente').length} pendientes</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">🏥</div>
                <p>No tienes centros asignados</p>
                <p className="text-sm mt-1">Contacta al administrador</p>
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Acciones rápidas */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-800">⚡ Acciones Rápidas</h3>
        </CardHeader>
        <Divider />
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              color="primary"
              variant="flat"
              size="lg"
              startContent={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              }
              className="h-16"
            >
              <div className="text-left">
                <div className="font-semibold">Ver Calendario</div>
                <div className="text-xs opacity-70">Gestionar todas las citas</div>
              </div>
            </Button>

            <Button
              color="success"
              variant="flat"
              size="lg"
              startContent={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              }
              className="h-16"
            >
              <div className="text-left">
                <div className="font-semibold">Mis Pacientes</div>
                <div className="text-xs opacity-70">Gestionar pacientes</div>
              </div>
            </Button>

            <Button
              color="warning"
              variant="flat"
              size="lg"
              startContent={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              }
              className="h-16"
              onClick={cargarDatos}
              isLoading={loading}
            >
              <div className="text-left">
                <div className="font-semibold">Actualizar</div>
                <div className="text-xs opacity-70">Recargar datos</div>
              </div>
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default DashboardDoctor;