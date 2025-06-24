// src/components/admin/AsignacionCentros.jsx
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
  Chip,
  Avatar,
  Tooltip
} from "@nextui-org/react";
import { useData } from '../../context/DataContext.jsx';
import usuariosService from '../../services/usuariosService.jsx';
import AdvancedSearch from '../ui/AdvancedSearch.jsx';
import { AsignacionCentrosHelp } from '../ui/HelpTooltip.jsx';

const AsignacionCentros = () => {
  const { centrosVacunacion, reloadData } = useData();
  const [doctores, setDoctores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAsignacionModal, setShowAsignacionModal] = useState(false);
  const [doctorSeleccionado, setDoctorSeleccionado] = useState(null);
  const [centrosSeleccionados, setCentrosSeleccionados] = useState(new Set());
  const [doctoresFiltrados, setDoctoresFiltrados] = useState([]);

  // Cargar doctores al montar el componente
  useEffect(() => {
    cargarDoctores();
  }, []);

  const cargarDoctores = async () => {
    try {
      setLoading(true);
      const usuarios = await usuariosService.getUsuarios();
      const doctoresFiltrados = usuarios.filter(u => u.role === 'doctor');
      setDoctores(doctoresFiltrados);
    } catch (error) {
      console.error('Error cargando doctores:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAsignarCentros = (doctor) => {
    setDoctorSeleccionado(doctor);
    // Pre-seleccionar centros ya asignados
    const centrosAsignados = doctor.centrosAsignados || [];
    setCentrosSeleccionados(new Set(centrosAsignados.map(String)));
    setShowAsignacionModal(true);
  };

  const handleGuardarAsignacion = async () => {
    if (!doctorSeleccionado) return;

    try {
      setLoading(true);
      
      // Convertir Set a Array
      const centrosArray = Array.from(centrosSeleccionados);
      
      // Actualizar el doctor con los nuevos centros asignados
      await usuariosService.updateUsuario(doctorSeleccionado.id, {
        ...doctorSeleccionado,
        centrosAsignados: centrosArray
      });

      // Recargar datos
      await cargarDoctores();
      if (typeof reloadData === 'function') {
        await reloadData();
      }

      setShowAsignacionModal(false);
      setDoctorSeleccionado(null);
      setCentrosSeleccionados(new Set());
      
      alert('Centros asignados correctamente');
    } catch (error) {
      console.error('Error asignando centros:', error);
      alert('Error al asignar centros. Por favor intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const getCentroNombre = (centroId) => {
    const centro = centrosVacunacion.find(c => String(c.id_centro) === String(centroId));
    return centro ? centro.nombre_corto || centro.nombre_centro : 'Centro no encontrado';
  };

  // Configuración para búsqueda avanzada
  const searchFields = ['name', 'email', 'telefono'];
  const searchFilters = [
    {
      key: 'active',
      label: 'Estado',
      type: 'select',
      options: [
        { value: true, label: 'Activo' },
        { value: false, label: 'Inactivo' }
      ]
    },
    {
      key: 'centrosAsignados.length',
      label: 'Asignación',
      type: 'select',
      options: [
        { value: 0, label: 'Sin centros asignados' },
        { value: 'hasAssignments', label: 'Con centros asignados' }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Asignación de Centros a Doctores</h2>
            <p className="text-gray-600 mt-1">Gestiona qué centros pueden administrar cada doctor</p>
          </div>
          <AsignacionCentrosHelp />
        </div>
        <Button
          color="primary"
          onClick={cargarDoctores}
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

      {/* Búsqueda avanzada */}
      <AdvancedSearch
        data={doctores}
        onResults={setDoctoresFiltrados}
        searchFields={searchFields}
        filters={searchFilters}
        placeholder="Buscar doctores por nombre, email o teléfono..."
        className="mb-6"
      />

      {/* Lista de doctores */}
      <div className="grid gap-4">
        {doctoresFiltrados.map((doctor) => (
          <Card key={doctor.id} className="hover:shadow-lg transition-shadow">
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar
                    name={doctor.name}
                    className="w-12 h-12"
                    color="primary"
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{doctor.name}</h3>
                    <p className="text-gray-600">{doctor.email}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Chip
                        size="sm"
                        color={doctor.active ? "success" : "danger"}
                        variant="flat"
                      >
                        {doctor.active ? "Activo" : "Inactivo"}
                      </Chip>
                      <span className="text-sm text-gray-500">
                        {doctor.telefono || 'Sin teléfono'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-500 mb-1">Centros asignados:</p>
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {doctor.centrosAsignados && doctor.centrosAsignados.length > 0 ? (
                        doctor.centrosAsignados.map((centroId) => (
                          <Chip
                            key={centroId}
                            size="sm"
                            color="primary"
                            variant="flat"
                          >
                            {getCentroNombre(centroId)}
                          </Chip>
                        ))
                      ) : (
                        <Chip size="sm" color="warning" variant="flat">
                          Sin centros asignados
                        </Chip>
                      )}
                    </div>
                  </div>

                  <Tooltip content="Asignar centros">
                    <Button
                      color="primary"
                      variant="flat"
                      size="sm"
                      onClick={() => handleAsignarCentros(doctor)}
                      startContent={
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      }
                    >
                      Asignar
                    </Button>
                  </Tooltip>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {doctoresFiltrados.length === 0 && !loading && (
        <Card>
          <CardBody className="text-center py-8">
            <p className="text-gray-500">No se encontraron doctores</p>
          </CardBody>
        </Card>
      )}

      {/* Modal de asignación */}
      <Modal
        isOpen={showAsignacionModal}
        onClose={() => setShowAsignacionModal(false)}
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <h3>Asignar Centros</h3>
            <p className="text-sm text-gray-600">
              {doctorSeleccionado?.name}
            </p>
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Selecciona los centros que este doctor podrá administrar:
              </p>
              
              <div className="grid gap-3">
                {centrosVacunacion.map((centro) => (
                  <Card
                    key={centro.id_centro}
                    className={`cursor-pointer transition-all ${
                      centrosSeleccionados.has(String(centro.id_centro))
                        ? 'ring-2 ring-primary bg-primary-50'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => {
                      const newSelection = new Set(centrosSeleccionados);
                      const centroIdStr = String(centro.id_centro);
                      
                      if (newSelection.has(centroIdStr)) {
                        newSelection.delete(centroIdStr);
                      } else {
                        newSelection.add(centroIdStr);
                      }
                      
                      setCentrosSeleccionados(newSelection);
                    }}
                  >
                    <CardBody className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">{centro.nombre_centro}</h4>
                          <p className="text-sm text-gray-600">{centro.direccion}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Director: {centro.director || 'Sin asignar'}
                          </p>
                        </div>
                        <div className="flex items-center">
                          {centrosSeleccionados.has(String(centro.id_centro)) && (
                            <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>

              {centrosSeleccionados.size > 0 && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-800 mb-2">
                    Centros seleccionados ({centrosSeleccionados.size}):
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {Array.from(centrosSeleccionados).map((centroId) => (
                      <Chip
                        key={centroId}
                        size="sm"
                        color="primary"
                        variant="solid"
                      >
                        {getCentroNombre(centroId)}
                      </Chip>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              color="danger"
              variant="light"
              onClick={() => setShowAsignacionModal(false)}
            >
              Cancelar
            </Button>
            <Button
              color="primary"
              onClick={handleGuardarAsignacion}
              isLoading={loading}
            >
              Guardar Asignación
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default AsignacionCentros;