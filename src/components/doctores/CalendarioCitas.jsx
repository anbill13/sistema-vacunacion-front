// src/components/doctores/CalendarioCitas.jsx
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardBody,

  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Select,
  SelectItem,
  Input,
  Textarea,
  DatePicker,
  TimeInput,
  Chip,
  Tabs,
  Tab,
  Avatar,

  Tooltip
} from "@nextui-org/react";
import { useData } from '../../context/DataContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import citasService from '../../services/citasService.jsx';
import { CalendarioCitasHelp } from '../ui/HelpTooltip.jsx';

const CalendarioCitas = () => {
  const { centrosVacunacion, ninos } = useData();
  const { currentUser } = useAuth();
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);
  const [vistaActual, setVistaActual] = useState('todas');
  const [filtroFecha, setFiltroFecha] = useState('');

  // Estados del formulario de edición
  const [formData, setFormData] = useState({
    fecha_cita: null,
    hora_cita: null,
    vacuna_programada: '',
    observaciones: '',
    estado: 'Pendiente'
  });

  useEffect(() => {
    cargarCitas();
  }, [currentUser]);

  const cargarCitas = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      
      // Obtener centros asignados al doctor
      const centrosAsignados = currentUser.centrosAsignados || [currentUser.id_centro].filter(Boolean);
      
      // Cargar citas del doctor
      const citasDoctor = await citasService.getCitasPorDoctor(currentUser.id, centrosAsignados);
      setCitas(citasDoctor);
    } catch (error) {
      console.error('Error cargando citas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditarCita = (cita) => {
    setCitaSeleccionada(cita);
    
    // Parsear fecha y hora
    const fechaCita = new Date(cita.fecha_cita);
    const fecha = {
      year: fechaCita.getFullYear(),
      month: fechaCita.getMonth() + 1,
      day: fechaCita.getDate()
    };
    const hora = {
      hour: fechaCita.getHours(),
      minute: fechaCita.getMinutes()
    };

    setFormData({
      fecha_cita: fecha,
      hora_cita: hora,
      vacuna_programada: cita.vacuna_programada || '',
      observaciones: cita.observaciones || '',
      estado: cita.estado || 'Pendiente'
    });
    
    setShowEditModal(true);
  };

  const handleGuardarCambios = async () => {
    if (!citaSeleccionada || !formData.fecha_cita || !formData.hora_cita) {
      alert('Por favor complete todos los campos obligatorios');
      return;
    }

    try {
      setLoading(true);

      // Construir fecha completa
      const { year, month, day } = formData.fecha_cita;
      const { hour, minute } = formData.hora_cita;
      const fechaCompleta = new Date(year, month - 1, day, hour, minute);

      const datosActualizados = {
        fecha_cita: fechaCompleta.toISOString(),
        vacuna_programada: formData.vacuna_programada,
        observaciones: formData.observaciones,
        estado: formData.estado
      };

      await citasService.updateCita(citaSeleccionada.id_cita, datosActualizados);
      
      // Recargar citas
      await cargarCitas();
      
      setShowEditModal(false);
      setCitaSeleccionada(null);
      alert('Cita actualizada correctamente');
    } catch (error) {
      console.error('Error actualizando cita:', error);
      alert('Error al actualizar la cita. Por favor intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelarCita = async (cita) => {
    if (!window.confirm('¿Está seguro que desea cancelar esta cita?')) return;

    try {
      setLoading(true);
      await citasService.cambiarEstadoCita(cita.id_cita, 'Cancelada');
      await cargarCitas();
      alert('Cita cancelada correctamente');
    } catch (error) {
      console.error('Error cancelando cita:', error);
      alert('Error al cancelar la cita. Por favor intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportarCitas = () => {
    const citasParaExportar = citasOrdenadas.map(cita => ({
      Paciente: getNombrePaciente(cita.id_niño),
      Fecha: new Date(cita.fecha_cita).toLocaleDateString(),
      Hora: new Date(cita.fecha_cita).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      Vacuna: cita.vacuna_programada,
      Estado: cita.estado,
      Centro: getNombreCentro(cita.id_centro),
      Observaciones: cita.observaciones || ''
    }));

    const csvContent = [
      Object.keys(citasParaExportar[0]).join(','),
      ...citasParaExportar.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `citas_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleMarcarCompletada = async (cita) => {
    try {
      setLoading(true);
      await citasService.cambiarEstadoCita(cita.id_cita, 'Completada');
      await cargarCitas();
      alert('Cita marcada como completada');
    } catch (error) {
      console.error('Error marcando cita como completada:', error);
      alert('Error al actualizar la cita. Por favor intente nuevamente.');
    } finally {
      setLoading(false);
    }
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
      case 'reprogramada': return 'secondary';
      default: return 'default';
    }
  };

  const citasFiltradas = citas.filter(cita => {
    if (vistaActual === 'pendientes' && cita.estado !== 'Pendiente') return false;
    if (vistaActual === 'hoy') {
      const hoy = new Date().toDateString();
      const fechaCita = new Date(cita.fecha_cita).toDateString();
      return hoy === fechaCita;
    }
    if (filtroFecha) {
      const fechaCita = new Date(cita.fecha_cita).toDateString();
      const fechaFiltro = new Date(filtroFecha).toDateString();
      return fechaCita === fechaFiltro;
    }
    return true;
  });

  const citasOrdenadas = citasFiltradas.sort((a, b) => new Date(a.fecha_cita) - new Date(b.fecha_cita));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Calendario de Citas</h2>
            <p className="text-gray-600 mt-1">Gestiona y edita las citas programadas</p>
          </div>
          <CalendarioCitasHelp />
        </div>
        <div className="flex space-x-2">
          <Button
            color="success"
            variant="flat"
            onClick={handleExportarCitas}
            startContent={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
            isDisabled={citasOrdenadas.length === 0}
          >
            Exportar
          </Button>
          <Button
            color="primary"
            onClick={cargarCitas}
            isLoading={loading}
            startContent={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            }
          >
            Actualizar
          </Button>
        </div>
      </div>

      {/* Filtros y tabs */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <Tabs
          selectedKey={vistaActual}
          onSelectionChange={setVistaActual}
          color="primary"
          variant="underlined"
        >
          <Tab key="todas" title="Todas las citas" />
          <Tab key="hoy" title="Hoy" />
          <Tab key="pendientes" title="Pendientes" />
        </Tabs>

        <Input
          type="date"
          label="Filtrar por fecha"
          value={filtroFecha}
          onChange={(e) => setFiltroFecha(e.target.value)}
          className="max-w-xs"
          size="sm"
        />
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardBody className="text-center">
            <p className="text-2xl font-bold text-blue-600">{citas.length}</p>
            <p className="text-sm text-gray-600">Total de citas</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <p className="text-2xl font-bold text-yellow-600">
              {citas.filter(c => c.estado === 'Pendiente').length}
            </p>
            <p className="text-sm text-gray-600">Pendientes</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {citas.filter(c => c.estado === 'Completada').length}
            </p>
            <p className="text-sm text-gray-600">Completadas</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <p className="text-2xl font-bold text-purple-600">
              {citas.filter(c => {
                const hoy = new Date().toDateString();
                const fechaCita = new Date(c.fecha_cita).toDateString();
                return hoy === fechaCita;
              }).length}
            </p>
            <p className="text-sm text-gray-600">Hoy</p>
          </CardBody>
        </Card>
      </div>

      {/* Lista de citas */}
      <div className="space-y-4">
        {citasOrdenadas.map((cita) => (
          <Card key={cita.id_cita} className="hover:shadow-lg transition-shadow">
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar
                    name={getNombrePaciente(cita.id_niño)}
                    className="w-12 h-12"
                    color="primary"
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {getNombrePaciente(cita.id_niño)}
                    </h3>
                    <p className="text-gray-600">{cita.vacuna_programada}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-sm text-gray-500">
                        📍 {getNombreCentro(cita.id_centro)}
                      </span>
                      <span className="text-sm text-gray-500">
                        📅 {new Date(cita.fecha_cita).toLocaleDateString()}
                      </span>
                      <span className="text-sm text-gray-500">
                        🕐 {new Date(cita.fecha_cita).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <Chip
                      size="sm"
                      color={getColorEstado(cita.estado)}
                      variant="flat"
                      className="mb-2"
                    >
                      {cita.estado}
                    </Chip>
                    {cita.observaciones && (
                      <p className="text-xs text-gray-500 max-w-xs">
                        {cita.observaciones}
                      </p>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <Tooltip content="Editar cita">
                      <Button
                        color="primary"
                        variant="flat"
                        size="sm"
                        onClick={() => handleEditarCita(cita)}
                        startContent={
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        }
                      >
                        Editar
                      </Button>
                    </Tooltip>

                    {cita.estado === 'Pendiente' && (
                      <Tooltip content="Marcar como completada">
                        <Button
                          color="success"
                          variant="flat"
                          size="sm"
                          onClick={() => handleMarcarCompletada(cita)}
                          startContent={
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          }
                        >
                          Completar
                        </Button>
                      </Tooltip>
                    )}

                    {cita.estado !== 'Cancelada' && cita.estado !== 'Completada' && (
                      <Tooltip content="Cancelar cita">
                        <Button
                          color="danger"
                          variant="flat"
                          size="sm"
                          onClick={() => handleCancelarCita(cita)}
                          startContent={
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          }
                        >
                          Cancelar
                        </Button>
                      </Tooltip>
                    )}
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {citasOrdenadas.length === 0 && !loading && (
        <Card>
          <CardBody className="text-center py-8">
            <p className="text-gray-500">No se encontraron citas para mostrar</p>
          </CardBody>
        </Card>
      )}

      {/* Modal de edición */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <h3>Editar Cita</h3>
            <p className="text-sm text-gray-600">
              {citaSeleccionada && getNombrePaciente(citaSeleccionada.id_niño)}
            </p>
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DatePicker
                  label="Fecha de la cita"
                  value={formData.fecha_cita}
                  onChange={(fecha) => setFormData({...formData, fecha_cita: fecha})}
                  isRequired
                />
                <TimeInput
                  label="Hora de la cita"
                  value={formData.hora_cita}
                  onChange={(hora) => setFormData({...formData, hora_cita: hora})}
                  isRequired
                />
              </div>

              <Input
                label="Vacuna programada"
                value={formData.vacuna_programada}
                onChange={(e) => setFormData({...formData, vacuna_programada: e.target.value})}
                placeholder="Nombre de la vacuna"
              />

              <Select
                label="Estado de la cita"
                selectedKeys={[formData.estado]}
                onChange={(e) => setFormData({...formData, estado: e.target.value})}
              >
                <SelectItem key="Pendiente" value="Pendiente">Pendiente</SelectItem>
                <SelectItem key="Confirmada" value="Confirmada">Confirmada</SelectItem>
                <SelectItem key="Completada" value="Completada">Completada</SelectItem>
                <SelectItem key="Reprogramada" value="Reprogramada">Reprogramada</SelectItem>
                <SelectItem key="Cancelada" value="Cancelada">Cancelada</SelectItem>
              </Select>

              <Textarea
                label="Observaciones"
                value={formData.observaciones}
                onChange={(e) => setFormData({...formData, observaciones: e.target.value})}
                placeholder="Notas adicionales sobre la cita..."
                rows={3}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              color="danger"
              variant="light"
              onClick={() => setShowEditModal(false)}
            >
              Cancelar
            </Button>
            <Button
              color="primary"
              onClick={handleGuardarCambios}
              isLoading={loading}
            >
              Guardar Cambios
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default CalendarioCitas;