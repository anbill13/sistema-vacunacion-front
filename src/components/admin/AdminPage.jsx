// src/components/admin/AdminPage.jsx
import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  Button,
  Card,
  CardBody,
  Tabs,
  Tab,
  Modal,
  ModalHeader,
  ModalBody,
  ModalContent,
  ModalFooter,
  Tooltip
} from "@nextui-org/react";
import usuariosService from '../../services/usuariosService.jsx';
import centrosService from '../../services/centrosService.jsx';
import vacunasService from '../../services/vacunasService.jsx';
import AsignacionCentros from './AsignacionCentros.jsx';

// Estilos CSS para los botones flotantes
const floatingButtonStyles = `
  .floating-action-btn {
    transition: all 0.2s ease;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  }
  
  .floating-action-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.15);
  }
  
  .relative {
    position: relative;
  }
  
  .action-menu {
    position: absolute;
    top: 100%;
    right: 0;
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10;
    min-width: 150px;
    overflow: hidden;
  }
  
  .action-menu-item {
    padding: 8px 16px;
    cursor: pointer;
    transition: background 0.2s;
    display: flex;
    align-items: center;
  }
  
  .action-menu-item:hover {
    background: #f5f5f5;
  }
`;

const AdminPage = () => {
  const {
    centrosVacunacion,
    directores,
    setDirectores,
    vacunas,
    lotesVacunas,
    // Forzar recarga de datos global
    reloadData: globalReloadData
  } = useData();

  const { currentUser } = useAuth();

  // DEPURACIÓN: logs para entender el estado real
  console.log('[DEBUG] currentUser:', currentUser);
  console.log('[DEBUG] currentUser.role:', currentUser?.role);
  console.log('[DEBUG] directores:', directores);
  console.log('[DEBUG] centrosVacunacion:', centrosVacunacion);
  console.log('[DEBUG] centrosVacunacion.length:', centrosVacunacion?.length);

  // Filtrar centros basado en el rol del usuario
  const centrosFiltrados = React.useMemo(() => {
    console.log('[DEBUG] useMemo centrosFiltrados ejecutándose...');
    console.log('[DEBUG] currentUser en useMemo:', currentUser);
    console.log('[DEBUG] centrosVacunacion en useMemo:', centrosVacunacion);
    
    if (!currentUser) {
      console.log('[DEBUG] No hay currentUser, retornando array vacío');
      return [];
    }

    // Para administrador, mostrar todos los centros
    if (currentUser.role === 'administrador') {
      console.log('[DEBUG] Admin user detectado, centrosVacunacion:', centrosVacunacion);
      console.log('[DEBUG] Array.isArray(centrosVacunacion):', Array.isArray(centrosVacunacion));
      const result = Array.isArray(centrosVacunacion) ? centrosVacunacion : [];
      console.log('[DEBUG] Resultado para admin:', result);
      return result;
    }

    // Para directores, mostrar solo sus centros asignados
    if (currentUser.role === 'director') {
      // Buscar al director en el contexto
      const director = (Array.isArray(directores) ? directores : []).find(d => String(d.id_usuario) === String(currentUser.id));
      let centrosAsignados = director?.centrosAsignados || [];

      // Fallback: si el usuario tiene centrosAsignados directamente
      if ((!centrosAsignados || centrosAsignados.length === 0) && Array.isArray(currentUser.centrosAsignados)) {
        centrosAsignados = currentUser.centrosAsignados;
      }

      // Fallback: si el usuario tiene id_centro único
      if ((!centrosAsignados || centrosAsignados.length === 0) && currentUser.id_centro) {
        centrosAsignados = [currentUser.id_centro];
      }

      console.log('[DEBUG] Director user, centrosAsignados usados:', centrosAsignados);

      // Filtrar por id_centro (como string y número), o por nombre de director
      const filtrados = (Array.isArray(centrosVacunacion) ? centrosVacunacion : []).filter(centro =>
        centro.director === currentUser.name ||
        String(centro.id_centro) === String(currentUser.centroId) ||
        centrosAsignados.map(String).includes(String(centro.id_centro))
      );
      console.log('[DEBUG] Centros filtrados para director:', filtrados);
      return filtrados;
    }

    // Fallback: si el role no es reconocido pero tenemos centrosVacunacion, mostrar todos
    console.log('[DEBUG] Role no reconocido o no detectado, aplicando fallback');
    console.log('[DEBUG] Mostrando todos los centros como fallback:', centrosVacunacion);
    return Array.isArray(centrosVacunacion) ? centrosVacunacion : [];
  }, [currentUser, centrosVacunacion, directores]);

  // Log adicional para verificar el resultado final
  console.log('[DEBUG] centrosFiltrados final:', centrosFiltrados);
  console.log('[DEBUG] centrosFiltrados.length:', centrosFiltrados?.length);

  const [activeSection, setActiveSection] = useState('centros');
  const [showAddCentroModal, setShowAddCentroModal] = useState(false);
  const [showAddVacunaModal, setShowAddVacunaModal] = useState(false);
  const [showAddLoteModal, setShowAddLoteModal] = useState(false);
  const [showAddUsuarioModal, setShowAddUsuarioModal] = useState(false);
  const [editingCentro, setEditingCentro] = useState(null);
  const [editingVacuna, setEditingVacuna] = useState(null);
  const [editingLote, setEditingLote] = useState(null);
  const [editingUsuario, setEditingUsuario] = useState(null);

  // Estado para formularios
  const [centroForm, setCentroForm] = useState({
    nombre_centro: '',
    nombre_corto: '',
    direccion: '',
    latitud: '',
    longitud: '',
    telefono: '',
    director: '',
    sitio_web: '',
    estado: 'Activo' // Nuevo campo
  });

  const [vacunaForm, setVacunaForm] = useState({
    nombre_vacuna: '',
    fabricante: '',
    tipo: '',
    dosis_requeridas: 1,
    intervalo_dosis: 0,
    edad_minima: 0,
    edad_maxima: 100,
    descripcion: ''
  });

  const [loteForm, setLoteForm] = useState({
    id_vacuna: '',
    numero_lote: '',
    cantidad_total: 0,
    cantidad_disponible: 0,
    fecha_fabricacion: '',
    fecha_vencimiento: '',
    id_centro: '',
    condiciones_almacenamiento: ''
  });

  const [usuarioForm, setUsuarioForm] = useState({
    name: '',
    username: '',
    email: '',
    telefono: '',
    id_centro: '',
    password: '',
    confirmPassword: '',
    role: 'director',
    active: true
  });

  const [usuarios, setUsuarios] = useState([]);

  // Protecciones para arrays en formularios y acciones
  const safeCentrosVacunacion = Array.isArray(centrosVacunacion) ? centrosVacunacion : [];
  const safeVacunas = Array.isArray(vacunas) ? vacunas : [];

  // Handlers para centros
  const handleAddCentro = () => {
    setEditingCentro(null);
    setCentroForm({
      nombre_centro: '',
      nombre_corto: '',
      direccion: '',
      latitud: '',
      longitud: '',
      telefono: '',
      director: '',
      sitio_web: '',
      estado: 'Activo' // Nuevo campo
    });
    setShowAddCentroModal(true);
  };

  const handleEditCentro = (centro) => {
    setEditingCentro(centro);
    setCentroForm({
      nombre_centro: centro.nombre_centro || '',
      nombre_corto: centro.nombre_corto || '',
      direccion: centro.direccion || '',
      latitud: centro.latitud || '',
      longitud: centro.longitud || '',
      telefono: centro.telefono || '',
      director: centro.director || '',
      sitio_web: centro.sitio_web || '',
      estado: centro.estado || 'Activo' // Usar valor existente o por defecto 'Activo'
    });
    setShowAddCentroModal(true);
  };

  const handleCentroFormChange = (e) => {
    const { name, value } = e.target;
    setCentroForm({
      ...centroForm,
      [name]: value
    });
  };

  const handleDeleteCentro = async (centro) => {
    if (window.confirm(`¿Está seguro que desea eliminar el centro ${centro.nombre_centro}?`)) {
      try {
        await centrosService.deleteCentro(centro.id_centro);

        if (typeof globalReloadData === 'function') {
          await globalReloadData();
        }

        if (centro.director) {
          const directorUser = directores.find(d => d.name === centro.director);
          if (directorUser) {
            await usuariosService.desasignarCentroDeDirector(directorUser.id);
            const usuariosActualizados = await usuariosService.getUsuarios();
            setDirectores(usuariosActualizados.filter(u => u.role === 'director'));
          }
        }

        alert('Centro eliminado correctamente');
      } catch (error) {
        console.error('Error al eliminar centro:', error);
        alert('Error al eliminar el centro. Por favor intente nuevamente.');
      }
    }
  };

  const handleSubmitCentro = async (e) => {
    e.preventDefault();
    try {
      // Construir el objeto SOLO con los campos que espera el backend
      const newCentro = {
        nombre_centro: centroForm.nombre_centro,
        nombre_corto: centroForm.nombre_corto,
        direccion: centroForm.direccion,
        latitud: centroForm.latitud !== '' ? parseFloat(centroForm.latitud) : null,
        longitud: centroForm.longitud !== '' ? parseFloat(centroForm.longitud) : null,
        telefono: centroForm.telefono,
        director: centroForm.director,
        sitio_web: centroForm.sitio_web
      };
      // NO enviar id_centro en el body

      if (!newCentro.nombre_centro || !newCentro.direccion) {
        alert('Nombre del centro y dirección son obligatorios');
        return;
      }

      await centrosService.saveCentro(newCentro);

      if (typeof globalReloadData === 'function') {
        globalReloadData();
      }

      alert(`Centro ${editingCentro ? 'actualizado' : 'creado'} correctamente`);

      setShowAddCentroModal(false);
      setCentroForm({
        nombre_centro: '',
        nombre_corto: '',
        direccion: '',
        latitud: '',
        longitud: '',
        telefono: '',
        director: '',
        sitio_web: '',
        estado: 'Activo'
      });
      setEditingCentro(null);
    } catch (error) {
      console.error('Error al guardar centro:', error);
      alert(error.message || 'Error al guardar el centro. Por favor intente nuevamente.');
    }
  };

  // Handlers para vacunas
  const handleAddVacuna = () => {
    setEditingVacuna(null);
    setVacunaForm({
      nombre_vacuna: '',
      fabricante: '',
      tipo: '',
      dosis_requeridas: 1,
      intervalo_dosis: 0,
      edad_minima: 0,
      edad_maxima: 100,
      descripcion: ''
    });
    setShowAddVacunaModal(true);
  };

  const handleEditVacuna = (vacuna) => {
    setEditingVacuna(vacuna);
    setVacunaForm({
      nombre_vacuna: vacuna.nombre_vacuna || '',
      fabricante: vacuna.fabricante || '',
      tipo: vacuna.tipo || '',
      dosis_requeridas: vacuna.dosis_requeridas || 1,
      intervalo_dosis: vacuna.intervalo_dosis || 0,
      edad_minima: vacuna.edad_minima || 0,
      edad_maxima: vacuna.edad_maxima || 100,
      descripcion: vacuna.descripcion || ''
    });
    setShowAddVacunaModal(true);
  };

  const handleVacunaFormChange = (e) => {
    const { name, value } = e.target;
    setVacunaForm({
      ...vacunaForm,
      [name]: name === 'dosis_requeridas' || name === 'intervalo_dosis' ||
        name === 'edad_minima' || name === 'edad_maxima'
        ? parseInt(value, 10)
        : value
    });
  };

  const handleVacunaSubmit = async (e) => {
    e.preventDefault();
    try {
      const newVacuna = {
        ...vacunaForm,
        id_vacuna: editingVacuna ? editingVacuna.id_vacuna : undefined
      };

      if (!newVacuna.nombre_vacuna || !newVacuna.fabricante) {
        alert('El nombre de la vacuna y el fabricante son obligatorios');
        return;
      }

      await vacunasService.saveVacuna(newVacuna);

      if (typeof globalReloadData === 'function') {
        await globalReloadData();
      }

      alert(`Vacuna ${editingVacuna ? 'actualizada' : 'creada'} correctamente`);
      setShowAddVacunaModal(false);
      setVacunaForm({
        nombre_vacuna: '',
        fabricante: '',
        tipo: '',
        dosis_requeridas: 1,
        intervalo_dosis: 0,
        edad_minima: 0,
        edad_maxima: 100,
        descripcion: ''
      });
      setEditingVacuna(null);
    } catch (error) {
      console.error('Error al guardar vacuna:', error);
      alert(error.message || 'Error al guardar la vacuna. Por favor intente nuevamente.');
    }
  };

  // Handlers para lotes
  const handleAddLote = () => {
    setEditingLote(null);
    setLoteForm({
      id_vacuna: '',
      numero_lote: '',
      cantidad_total: 0,
      cantidad_disponible: 0,
      fecha_fabricacion: '',
      fecha_vencimiento: '',
      id_centro: '',
      condiciones_almacenamiento: ''
    });
    setShowAddLoteModal(true);
  };

  const handleEditLote = (lote) => {
    setEditingLote(lote);
    setLoteForm({
      id_vacuna: lote.id_vacuna || '',
      numero_lote: lote.numero_lote || '',
      cantidad_total: lote.cantidad_total || 0,
      cantidad_disponible: lote.cantidad_disponible || 0,
      fecha_fabricacion: lote.fecha_fabricacion ? lote.fecha_fabricacion.split('T')[0] : '',
      fecha_vencimiento: lote.fecha_vencimiento ? lote.fecha_vencimiento.split('T')[0] : '',
      id_centro: lote.id_centro || '',
      condiciones_almacenamiento: lote.condiciones_almacenamiento || ''
    });
    setShowAddLoteModal(true);
  };

  const handleLoteFormChange = (e) => {
    const { name, value } = e.target;
    setLoteForm({
      ...loteForm,
      [name]:
        name === 'cantidad_total' || name === 'cantidad_disponible'
          ? parseInt(value, 10)
          : value
    });
  };

  const handleLoteSubmit = async (e) => {
    e.preventDefault();
    try {
      const newLote = {
        ...loteForm,
        id_lote: editingLote ? editingLote.id_lote : undefined
      };

      if (!newLote.id_vacuna || !newLote.numero_lote) {
        alert('La vacuna y el número de lote son obligatorios');
        return;
      }

      await vacunasService.saveLote(newLote);

      if (typeof globalReloadData === 'function') {
        await globalReloadData();
      }

      alert(`Lote ${editingLote ? 'actualizado' : 'creado'} correctamente`);
      setShowAddLoteModal(false);
      setLoteForm({
        id_vacuna: '',
        numero_lote: '',
        cantidad_total: 0,
        cantidad_disponible: 0,
        fecha_fabricacion: '',
        fecha_vencimiento: '',
        id_centro: '',
        condiciones_almacenamiento: ''
      });
      setEditingLote(null);
    } catch (error) {
      console.error('Error al guardar lote:', error);
      alert(error.message || 'Error al guardar el lote. Por favor intente nuevamente.');
    }
  };

  // Handlers para usuarios
  const handleAddUsuario = () => {
    setEditingUsuario(null);
    setUsuarioForm({
      name: '',
      username: '',
      email: '',
      telefono: '',
      id_centro: '',
      password: '',
      confirmPassword: '',
      role: 'director',
      active: true
    });
    setShowAddUsuarioModal(true);
  };

  const handleEditUsuario = (usuario) => {
    console.log('[DEBUG] Editando usuario:', usuario);
    console.log('[DEBUG] Usuario actual es:', currentUser.role);
    
    setEditingUsuario(usuario);
    setUsuarioForm({
      name: usuario.name || '',
      username: usuario.username || '',
      email: usuario.email || '',
      telefono: usuario.telefono || '',
      id_centro: '', // Siempre vacío ya que se quitó el campo
      password: '',
      confirmPassword: '',
      role: usuario.role || 'director',
      active: usuario.active !== undefined ? usuario.active : true
    });
    setShowAddUsuarioModal(true);
    
    console.log('[DEBUG] Formulario cargado para edición (sin campo id_centro):', {
      userRole: usuario.role,
      currentUserRole: currentUser.role
    });
  };

  // Helper function para determinar si un usuario está activo
  const isUsuarioActive = (usuario) => {
    if (usuario.estado) {
      return usuario.estado === 'Activo';
    } else if (usuario.active !== undefined) {
      return usuario.active === true;
    }
    return true; // Por defecto activo
  };

  const toggleUsuarioStatus = async (usuario) => {
    try {
      console.log('[DEBUG] toggleUsuarioStatus - Usuario original:', usuario);
      
      // Determinar el estado actual del usuario
      const currentActive = isUsuarioActive(usuario);
      const newActive = !currentActive;
      
      console.log('[DEBUG] toggleUsuarioStatus - Estado actual:', currentActive);
      console.log('[DEBUG] toggleUsuarioStatus - Nuevo estado:', newActive);
      console.log('[DEBUG] toggleUsuarioStatus - Usuario ID:', usuario.id || usuario.id_usuario);

      // Usar el método específico para cambiar solo el estado
      const userId = usuario.id || usuario.id_usuario;
      const result = await usuariosService.updateUsuarioStatus(userId, newActive);

      console.log('[DEBUG] toggleUsuarioStatus - Resultado:', result);

      // Recargar la lista de usuarios
      const usuariosActualizados = await usuariosService.getUsuarios();
      setUsuarios(usuariosActualizados);
      setDirectores(usuariosActualizados.filter(u => u.role === 'director'));

      alert(`✅ Usuario ${usuario.name || usuario.nombre} ${newActive ? 'activado' : 'desactivado'} correctamente`);
    } catch (error) {
      console.error('Error al actualizar estado del usuario:', error);
      console.error('Error details:', error.message);
      alert(`Error al actualizar el estado del usuario: ${error.message}`);
    }
  };



  const handleUsuarioFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setUsuarioForm({
      ...usuarioForm,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleUsuarioSubmit = async (e) => {
    e.preventDefault();

    // Validaciones básicas
    if (!usuarioForm.name || usuarioForm.name.trim() === '') {
      alert('El nombre completo es requerido');
      return;
    }

    if (!usuarioForm.username || usuarioForm.username.trim() === '') {
      alert('El nombre de usuario es requerido');
      return;
    }

    if (!usuarioForm.password || usuarioForm.password.trim() === '') {
      alert('La contraseña es requerida');
      return;
    }

    if (usuarioForm.password.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (usuarioForm.password !== usuarioForm.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    // Validar email si se proporciona
    if (usuarioForm.email && usuarioForm.email.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(usuarioForm.email)) {
        alert('Por favor ingrese un email válido');
        return;
      }
    }

    try {
      // Construir el objeto con los nombres y valores que espera el backend
      const usuarioData = {
        nombre: usuarioForm.name.trim(),
        username: usuarioForm.username.trim(),
        password: usuarioForm.password,
        rol: usuarioForm.role,
        email: usuarioForm.email && usuarioForm.email.trim() !== '' ? usuarioForm.email.trim() : null,
        telefono: usuarioForm.telefono && usuarioForm.telefono.trim() !== '' ? usuarioForm.telefono.trim() : null,
        id_centro: null // Siempre null ya que se quitó el campo del formulario
      };
      
      // Debug: verificar los datos que se van a enviar
      console.log('\n=== DEBUG USUARIO SUBMIT ===');
      console.log('[DEBUG] Usuario actual que modifica:', currentUser.role);
      console.log('[DEBUG] Formulario completo:', usuarioForm);
      console.log('[DEBUG] Datos del usuario a enviar:', usuarioData);
      console.log('[DEBUG] Rol del usuario objetivo:', usuarioForm.role);
      console.log('[DEBUG] id_centro siempre null (campo removido):', usuarioData.id_centro, typeof usuarioData.id_centro);
      console.log('[DEBUG] Es edición?:', !!editingUsuario);
      console.log('============================\n');
      
      // Si es edición, agregar el ID
      if (editingUsuario && editingUsuario.id) {
        usuarioData.id = editingUsuario.id;
      }

      await usuariosService.saveUsuario(usuarioData);

      const usuariosActualizados = await usuariosService.getUsuarios();
      setUsuarios(usuariosActualizados);
      setDirectores(usuariosActualizados.filter(u => u.rol === 'director'));

      alert(`Usuario ${usuarioForm.name} ${editingUsuario ? 'actualizado' : 'creado'} correctamente`);

      setShowAddUsuarioModal(false);
      setUsuarioForm({
        name: '',
        username: '',
        email: '',
        telefono: '',
        id_centro: '',
        password: '',
        confirmPassword: '',
        role: 'director',
        active: true
      });
      setEditingUsuario(null);
    } catch (error) {
      console.error('Error al guardar usuario:', error);
      
      // Mejorar el manejo de errores para mostrar mensajes más específicos
      let errorMessage = 'Error al guardar el usuario. Por favor, inténtelo de nuevo.';
      
      if (error.message) {
        if (error.message.includes('username') || error.message.includes('usuario')) {
          errorMessage = 'El nombre de usuario ya existe. Por favor, elija otro.';
        } else if (error.message.includes('email') || error.message.includes('correo')) {
          errorMessage = 'El email ya está registrado. Por favor, use otro email.';
        } else if (error.message.includes('validación') || error.message.includes('Validación')) {
          errorMessage = 'Los datos ingresados no son válidos. Verifique todos los campos.';
        } else if (error.message.includes('servidor') || error.message.includes('conexión')) {
          errorMessage = 'Error de conexión con el servidor. Verifique su conexión a internet.';
        } else {
          errorMessage = error.message;
        }
      }
      
      alert(errorMessage);
    }
  };

  const handleDeleteVacuna = async (vacuna) => {
    const confirmed = window.confirm(`¿Está seguro de eliminar la vacuna ${vacuna.nombre_vacuna}?\nEsta acción no se puede deshacer y eliminará también los lotes asociados.`);
    if (confirmed) {
      try {
        // Verificar si hay lotes asociados
        const lotesAsociados = Array.isArray(lotesVacunas) ? lotesVacunas.filter(lote => lote.id_vacuna === vacuna.id_vacuna) : [];
        if (lotesAsociados.length > 0) {
          alert('No se puede eliminar la vacuna porque tiene lotes asociados. Elimine primero los lotes.');
          return;
        }

        await vacunasService.deleteVacuna(vacuna.id_vacuna);

        if (typeof globalReloadData === 'function') {
          await globalReloadData();
        }

        alert('Vacuna eliminada correctamente');
      } catch (error) {
        console.error('Error al eliminar la vacuna:', error);
        alert(error.message || 'Error al eliminar la vacuna');
      }
    }
  };

  const handleDeleteLote = async (lote) => {
    const confirmed = window.confirm(`¿Está seguro de eliminar el lote ${lote.numero_lote}?\nEsta acción no se puede deshacer.`);
    if (confirmed) {
      try {
        await vacunasService.deleteLote(lote.id_lote);

        if (typeof globalReloadData === 'function') {
          await globalReloadData();
        }

        alert('Lote eliminado correctamente');
      } catch (error) {
        console.error('Error al eliminar el lote:', error);
        alert(error.message || 'Error al eliminar el lote');
      }
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const usuariosCargados = await usuariosService.getUsuarios();
        setUsuarios(usuariosCargados);
      } catch (error) {
        console.error('Error al cargar datos:', error);
        setUsuarios([]);
      }
    };
    loadData();
  }, []); // Eliminar dependencias innecesarias

  return (
    <div className="space-y-6 p-4 relative">
      <style>{floatingButtonStyles}</style>

      <Card shadow="sm" className="bg-gradient-to-r from-primary-100 to-secondary-100 dark:from-primary-900/40 dark:to-secondary-900/40">
        <CardBody>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold">Panel de Administración</h2>
              <p className="text-default-500">Gestiona centros, vacunas, lotes y usuarios del sistema</p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Card shadow="sm" className="w-32 h-24 bg-white/90 dark:bg-white/10">
                <CardBody className="flex flex-col items-center justify-center p-2">
                  <span className="text-2xl">🏥</span>
                  <span className="text-xl font-bold">{centrosVacunacion.length}</span>
                  <span className="text-small text-default-500">Centros</span>
                </CardBody>
              </Card>
              <Card shadow="sm" className="w-32 h-24 bg-white/90 dark:bg-white/10">
                <CardBody className="flex flex-col items-center justify-center p-2">
                  <span className="text-2xl">💉</span>
                  <span className="text-xl font-bold">{vacunas.length}</span>
                  <span className="text-small text-default-500">Vacunas</span>
                </CardBody>
              </Card>
              <Card shadow="sm" className="w-32 h-24 bg-white/90 dark:bg-white/10">
                <CardBody className="flex flex-col items-center justify-center p-2">
                  <span className="text-2xl">📦</span>
                  <span className="text-xl font-bold">{lotesVacunas.length}</span>
                  <span className="text-small text-default-500">Lotes</span>
                </CardBody>
              </Card>
            </div>
          </div>
        </CardBody>
      </Card>

      <Tabs
        selectedKey={activeSection}
        onSelectionChange={setActiveSection}
        variant="underlined"
        color="primary"
        classNames={{
          tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
          cursor: "w-full bg-primary",
          tab: "max-w-fit px-2 h-12",
          tabContent: "group-data-[selected=true]:text-primary"
        }}
      >
        <Tab
          key="centros"
          title={
            <div className="flex items-center space-x-2">
              <span className="text-lg">🏥</span>
              <span>Centros de Vacunación</span>
            </div>
          }
        />
        <Tab
          key="vacunas"
          title={
            <div className="flex items-center space-x-2">
              <span className="text-lg">💉</span>
              <span>Vacunas</span>
            </div>
          }
        />
        <Tab
          key="lotes"
          title={
            <div className="flex items-center space-x-2">
              <span className="text-lg">📦</span>
              <span>Lotes de Vacunas</span>
            </div>
          }
        />
        <Tab
          key="usuarios"
          title={
            <div className="flex items-center space-x-2">
              <span className="text-lg">👥</span>
              <span>Usuarios</span>
            </div>
          }
        />
        <Tab
          key="asignaciones"
          title={
            <div className="flex items-center space-x-2">
              <span className="text-lg">🏥👨‍⚕️</span>
              <span>Asignar Centros</span>
            </div>
          }
        />
      </Tabs>

      <div className="space-y-4">
        {/* Sección de Centros */}
        {activeSection === 'centros' && (
          <div className="admin-section animate-fadeIn">
            <div className="section-header">
              <div className="section-title">
                <h3>Centros de Vacunación</h3>
                <p className="section-description">Gestiona los centros de vacunación del sistema</p>
              </div>
              <button className="btn-primary" onClick={handleAddCentro}>
                <span className="btn-icon">+</span>
                <span>Añadir Centro</span>
              </button>
            </div>

            <div className="data-table-container">
              <div className="modern-table-wrapper">
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Dirección</th>
                      <th>Teléfono</th>
                      <th>Director</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {centrosFiltrados.map(centro => (
                      <tr key={centro.id_centro}>
                        <td>
                          <div className="cell-content">
                            <span className="cell-icon">🏥</span>
                            <span>{centro.nombre_centro}</span>
                          </div>
                        </td>
                        <td>{centro.direccion}</td>
                        <td>{centro.telefono}</td>
                        <td>
                          <div className="cell-content">
                            <span className="cell-icon">👤</span>
                            <span>{centro.director || 'No asignado'}</span>
                          </div>
                        </td>
                        <td>
                          <div className="relative flex gap-2">
                            <Tooltip content="Editar centro" placement="top">
                              <Button
                                color="primary"
                                variant="shadow"
                                size="sm"
                                className="floating-action-btn"
                                onClick={() => handleEditCentro(centro)}
                              >
                                <span className="mr-1">✏️</span> Editar
                              </Button>
                            </Tooltip>
                            <Tooltip content="Eliminar centro" placement="top">
                              <Button
                                color="danger"
                                variant="shadow"
                                size="sm"
                                className="floating-action-btn"
                                onClick={() => handleDeleteCentro(centro)}
                              >
                                <span className="mr-1">🗑️</span> Eliminar
                              </Button>
                            </Tooltip>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Sección de Vacunas */}
        {activeSection === 'vacunas' && (
          <div className="admin-section animate-fadeIn">
            <div className="section-header">
              <div className="section-title">
                <h3>Vacunas</h3>
                <p className="section-description">Gestiona el catálogo de vacunas disponibles</p>
              </div>
              <button className="btn-primary" onClick={handleAddVacuna}>
                <span className="btn-icon">+</span>
                <span>Añadir Vacuna</span>
              </button>
            </div>

            <div className="data-table-container">
              <div className="modern-table-wrapper">
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Fabricante</th>
                      <th>Tipo</th>
                      <th>Dosis Requeridas</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vacunas.map(vacuna => (
                      <tr key={vacuna.id_vacuna}>
                        <td>
                          <div className="cell-content">
                            <span className="cell-icon">💉</span>
                            <span>{vacuna.nombre_vacuna}</span>
                          </div>
                        </td>
                        <td>{vacuna.fabricante}</td>
                        <td>
                          <span className="badge">{vacuna.tipo}</span>
                        </td>
                        <td>
                          <span className="badge badge-info">{vacuna.dosis_requeridas}</span>
                        </td>
                        <td>
                          <div className="relative flex gap-2">
                            <Tooltip content="Editar vacuna" placement="top">
                              <Button
                                color="primary"
                                variant="shadow"
                                size="sm"
                                className="floating-action-btn"
                                onClick={() => handleEditVacuna(vacuna)}
                              >
                                <span className="mr-1">✏️</span> Editar
                              </Button>
                            </Tooltip>
                            <Tooltip content="Eliminar vacuna" placement="top">
                              <Button
                                color="danger"
                                variant="shadow"
                                size="sm"
                                className="floating-action-btn"
                                onClick={() => handleDeleteVacuna(vacuna)}
                              >
                                <span className="mr-1">🗑️</span> Eliminar
                              </Button>
                            </Tooltip>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Sección de Lotes */}
        {activeSection === 'lotes' && (
          <div className="admin-section animate-fadeIn">
            <div className="section-header">
              <div className="section-title">
                <h3>Lotes de Vacunas</h3>
                <p className="section-description">Gestiona los lotes de vacunas y su distribución</p>
              </div>
              <button className="btn-primary" onClick={handleAddLote}>
                <span className="btn-icon">+</span>
                <span>Añadir Lote</span>
              </button>
            </div>

            <div className="data-table-container">
              <div className="modern-table-wrapper">
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th>Vacuna</th>
                      <th>Número de Lote</th>
                      <th>Fecha Vencimiento</th>
                      <th>Cantidad Total</th>
                      <th>Cantidad Disponible</th>
                      <th>Centro Asignado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(Array.isArray(lotesVacunas) ? lotesVacunas : []).map(lote => {
                      const vacuna = Array.isArray(vacunas) ? vacunas.find(v => v.id_vacuna === lote.id_vacuna) : null;
                      const centro = Array.isArray(centrosVacunacion) ? centrosVacunacion.find(c => c.id_centro === lote.id_centro) : null;

                      const fechaVencimiento = lote.fecha_vencimiento ? new Date(lote.fecha_vencimiento) : null;
                      const hoy = new Date();
                      const diasParaVencer = fechaVencimiento ? Math.floor((fechaVencimiento - hoy) / (1000 * 60 * 60 * 24)) : null;
                      const estadoLote = !fechaVencimiento ? 'normal' :
                        diasParaVencer < 0 ? 'vencido' :
                          diasParaVencer < 30 ? 'proximo' : 'normal';

                      return (
                        <tr key={lote.id_lote} className={`lote-row ${estadoLote}`}>
                          <td>
                            <div className="cell-content">
                              <span className="cell-icon">💉</span>
                              <span>{vacuna ? vacuna.nombre_vacuna : 'Desconocida'}</span>
                            </div>
                          </td>
                          <td>{lote.numero_lote}</td>
                          <td>
                            <div className={`fecha-vencimiento ${estadoLote}`}>
                              {lote.fecha_vencimiento ? new Date(lote.fecha_vencimiento).toLocaleDateString() : 'No especificada'}
                              {estadoLote === 'proximo' && <span className="badge badge-warning">Próximo a vencer</span>}
                              {estadoLote === 'vencido' && <span className="badge badge-danger">Vencido</span>}
                            </div>
                          </td>
                          <td>
                            <span className="badge badge-success">{lote.cantidad_total}</span>
                          </td>
                          <td>
                            <span className="badge badge-info">{lote.cantidad_disponible}</span>
                          </td>
                          <td>
                            <div className="cell-content">
                              <span className="cell-icon">🏥</span>
                              <span>{centro ? centro.nombre_centro : 'No asignado'}</span>
                            </div>
                          </td>
                          <td>
                            <div className="relative flex gap-2">
                              <Tooltip content="Editar lote" placement="top">
                                <Button
                                  color="primary"
                                  variant="shadow"
                                  size="sm"
                                  className="floating-action-btn"
                                  onClick={() => handleEditLote(lote)}
                                >
                                  <span className="mr-1">✏️</span> Editar
                                </Button>
                              </Tooltip>
                              <Tooltip content="Eliminar lote" placement="top">
                                <Button
                                  color="danger"
                                  variant="shadow"
                                  size="sm"
                                  className="floating-action-btn"
                                  onClick={() => handleDeleteLote(lote)}
                                >
                                  <span className="mr-1">🗑️</span> Eliminar
                                </Button>
                              </Tooltip>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Sección de Usuarios */}
        {activeSection === 'usuarios' && (
          <div className="admin-section animate-fadeIn">
            <div className="section-header">
              <div className="section-title">
                <h3>Usuarios del Sistema</h3>
                <p className="section-description">Gestiona los usuarios y sus permisos</p>
              </div>
              <button className="btn-primary" onClick={handleAddUsuario}>
                <span className="btn-icon">+</span>
                <span>Añadir Usuario</span>
              </button>
            </div>

            <div className="data-table-container">
              <div className="modern-table-wrapper">
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Usuario</th>
                      <th>Rol</th>
                      <th>Email</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <div className="cell-content">
                          <span className="cell-icon">👤</span>
                          <span>Administrador Sistema</span>
                        </div>
                      </td>
                      <td>admin</td>
                      <td><span className="badge badge-primary">Administrador</span></td>
                      <td>admin@sistema.com</td>
                      <td>
                        <Button
                          color="success"
                          variant="flat"
                          size="sm"
                          disabled
                          className="min-w-20 opacity-80"
                          title="El administrador principal no puede ser desactivado"
                        >
                          ✅ Activo
                        </Button>
                      </td>
                      <td>
                        <div className="relative flex gap-2">
                          <Tooltip content="Editar administrador" placement="top">
                            <Button
                              color="primary"
                              variant="shadow"
                              size="sm"
                              className="floating-action-btn"
                              onClick={() => handleEditUsuario({
                                id: 'admin',
                                name: 'Administrador Sistema',
                                username: 'admin',
                                email: 'admin@sistema.com',
                                role: 'administrador',
                                active: true
                              })}
                            >
                              <span className="mr-1">✏️</span> Editar
                            </Button>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                    {usuarios.filter(user => user.id !== 'admin-1').map(usuario => (
                      <tr key={usuario.id}>
                        <td>
                          <div className="cell-content">
                            <span className="cell-icon">👤</span>
                            <span>{usuario.name}</span>
                          </div>
                        </td>
                        <td>{usuario.username}</td>
                        <td>
                          <span className={`badge ${usuario.role === 'director' ? 'badge-info' :
                              usuario.role === 'padre' ? 'badge-warning' :
                                'badge-secondary'
                            }`}>
                            {usuario.role.charAt(0).toUpperCase() + usuario.role.slice(1)}
                          </span>
                        </td>
                        <td>{usuario.email}</td>
                        <td>
                          <Button
                            color={isUsuarioActive(usuario) ? 'success' : 'danger'}
                            variant="flat"
                            size="sm"
                            onClick={() => toggleUsuarioStatus(usuario)}
                            className="min-w-20"
                            title={isUsuarioActive(usuario) ? 'Clic para desactivar' : 'Clic para activar'}
                          >
                            {isUsuarioActive(usuario) ? '✅ Activo' : '❌ Inactivo'}
                          </Button>
                        </td>
                        <td>
                          <div className="relative flex gap-2">
                            <Tooltip content="Editar usuario" placement="top">
                              <Button
                                color="primary"
                                variant="shadow"
                                size="sm"
                                className="floating-action-btn"
                                onClick={() => handleEditUsuario(usuario)}
                              >
                                <span className="mr-1">✏️</span> Editar
                              </Button>
                            </Tooltip>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Sección de Asignación de Centros */}
        {activeSection === 'asignaciones' && (
          <div className="admin-section animate-fadeIn">
            <AsignacionCentros />
          </div>
        )}
      </div>

      {/* Modal para añadir/editar centro */}
      <Modal
        isOpen={showAddCentroModal}
        onClose={() => setShowAddCentroModal(false)}
        size="2xl"
        scrollBehavior="inside"
        backdrop="blur"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h3 className="text-xl font-bold">{editingCentro ? 'Editar Centro' : 'Añadir Nuevo Centro'}</h3>
                <p className="text-small text-default-500">
                  {editingCentro
                    ? 'Modifica la información del centro de vacunación'
                    : 'Completa la información para crear un nuevo centro de vacunación'}
                </p>
              </ModalHeader>
              <ModalBody className="px-6">
                <form onSubmit={handleSubmitCentro} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-group">
                      <label className="flex items-center gap-1 text-sm font-medium mb-1">
                        Nombre del Centro
                        <span className="text-red-500 text-lg">*</span>
                      </label>
                      <input
                        type="text"
                        name="nombre_centro"
                        value={centroForm.nombre_centro}
                        onChange={handleCentroFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                        placeholder="Ej: Centro de Salud Santo Domingo"
                      />
                    </div>
                    <div className="form-group">
                      <label className="block text-sm font-medium mb-1">Nombre Corto</label>
                      <input
                        type="text"
                        name="nombre_corto"
                        value={centroForm.nombre_corto}
                        onChange={handleCentroFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Ej: CSSD"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="flex items-center gap-1 text-sm font-medium mb-1">
                      Dirección
                      <span className="text-red-500 text-lg">*</span>
                    </label>
                    <input
                      type="text"
                      name="direccion"
                      value={centroForm.direccion}
                      onChange={handleCentroFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                      placeholder="Ej: Calle 1, Santo Domingo"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-group">
                      <label className="flex items-center gap-1 text-sm font-medium mb-1">
                        Latitud
                        <span className="text-red-500 text-lg">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.0001"
                        name="latitud"
                        value={centroForm.latitud}
                        onChange={handleCentroFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                        placeholder="Ej: 18.4861"
                      />
                    </div>
                    <div className="form-group">
                      <label className="flex items-center gap-1 text-sm font-medium mb-1">
                        Longitud
                        <span className="text-red-500 text-lg">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.0001"
                        name="longitud"
                        value={centroForm.longitud}
                        onChange={handleCentroFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                        placeholder="Ej: -69.9312"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-group">
                      <label className="block text-sm font-medium mb-1">Teléfono</label>
                      <input
                        type="tel"
                        name="telefono"
                        value={centroForm.telefono}
                        onChange={handleCentroFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Ej: 8098765432"
                      />
                    </div>
                    <div className="form-group">
                      <label className="block text-sm font-medium mb-1">Director</label>
                      <select
                        name="director"
                        value={centroForm.director}
                        onChange={handleCentroFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="">-- Seleccionar Director --</option>
                        {directores
                          .filter(director => director.active && director.role === 'director')
                          .map(director => (
                            <option key={director.id} value={director.name}>
                              {director.name}
                            </option>
                          ))
                        }
                        {directores.filter(director => director.active && director.role === 'director').length === 0 && (
                          <option value="" disabled>No hay directores disponibles</option>
                        )}
                      </select>
                      {directores.filter(director => director.active && director.role === 'director').length === 0 && (
                        <div className="text-warning text-xs mt-1">
                          No hay directores disponibles. Cree uno en la sección "Usuarios".
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="block text-sm font-medium mb-1">Sitio Web</label>
                    <input
                      type="url"
                      name="sitio_web"
                      value={centroForm.sitio_web}
                      onChange={handleCentroFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="https://..."
                    />
                  </div>

                  <div className="form-group">
                    <label className="block text-sm font-medium mb-1">Estado</label>
                    <select
                      name="estado"
                      value={centroForm.estado}
                      onChange={handleCentroFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    >
                      <option value="Activo">Activo</option>
                      <option value="Inactivo">Inactivo</option>
                    </select>
                  </div>
                </form>
              </ModalBody>
              <ModalFooter>
                <Button
                  type="button"
                  color="default"
                  variant="flat"
                  onClick={onClose}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  className="font-semibold"
                  onClick={handleSubmitCentro}
                >
                  {editingCentro ? 'Guardar Cambios' : 'Crear Centro'}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Modal para añadir/editar vacuna */}
      <Modal
        isOpen={showAddVacunaModal}
        onClose={() => setShowAddVacunaModal(false)}
        size="2xl"
        scrollBehavior="inside"
        backdrop="blur"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h3 className="text-xl font-bold">{editingVacuna ? 'Editar Vacuna' : 'Añadir Nueva Vacuna'}</h3>
                <p className="text-small text-default-500">
                  {editingVacuna
                    ? 'Modifica la información de la vacuna'
                    : 'Completa la información para crear una nueva vacuna'}
                </p>
              </ModalHeader>
              <ModalBody className="px-6">
                <form onSubmit={handleVacunaSubmit} className="modern-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Nombre de la Vacuna</label>
                      <input
                        type="text"
                        name="nombre_vacuna"
                        value={vacunaForm.nombre_vacuna}
                        onChange={handleVacunaFormChange}
                        className="form-control"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Fabricante</label>
                      <input
                        type="text"
                        name="fabricante"
                        value={vacunaForm.fabricante}
                        onChange={handleVacunaFormChange}
                        className="form-control"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Tipo de Vacuna</label>
                    <select
                      name="tipo"
                      value={vacunaForm.tipo}
                      onChange={handleVacunaFormChange}
                      className="form-control"
                      required
                    >
                      <option value="">Seleccione un tipo</option>
                      <option value="ARNm">ARNm</option>
                      <option value="Vector viral">Vector viral</option>
                      <option value="Subunidad proteica">Subunidad proteica</option>
                      <option value="Virus inactivado">Virus inactivado</option>
                      <option value="Virus atenuado">Virus atenuado</option>
                      <option value="Toxoide">Toxoide</option>
                    </select>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Dosis Requeridas</label>
                      <input
                        type="number"
                        min="1"
                        name="dosis_requeridas"
                        value={vacunaForm.dosis_requeridas}
                        onChange={handleVacunaFormChange}
                        className="form-control"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Intervalo entre Dosis (días)</label>
                      <input
                        type="number"
                        min="0"
                        name="intervalo_dosis"
                        value={vacunaForm.intervalo_dosis}
                        onChange={handleVacunaFormChange}
                        className="form-control"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Edad Mínima (meses)</label>
                      <input
                        type="number"
                        min="0"
                        name="edad_minima"
                        value={vacunaForm.edad_minima}
                        onChange={handleVacunaFormChange}
                        className="form-control"
                      />
                    </div>
                    <div className="form-group">
                      <label>Edad Máxima (meses)</label>
                      <input
                        type="number"
                        min="0"
                        name="edad_maxima"
                        value={vacunaForm.edad_maxima}
                        onChange={handleVacunaFormChange}
                        className="form-control"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Descripción</label>
                    <textarea
                      name="descripcion"
                      value={vacunaForm.descripcion}
                      onChange={handleVacunaFormChange}
                      className="form-control"
                      rows="3"
                    ></textarea>
                  </div>
                </form>
              </ModalBody>
              <ModalFooter>
                <Button
                  type="button"
                  color="default"
                  variant="flat"
                  onClick={onClose}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  className="font-semibold"
                  onClick={handleVacunaSubmit}
                >
                  {editingVacuna ? 'Guardar Cambios' : 'Crear Vacuna'}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Modal para añadir/editar lote */}
      <Modal
        isOpen={showAddLoteModal}
        onClose={() => setShowAddLoteModal(false)}
        size="2xl"
        scrollBehavior="inside"
        backdrop="blur"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h3 className="text-xl font-bold">{editingLote ? 'Editar Lote' : 'Añadir Nuevo Lote'}</h3>
                <p className="text-small text-default-500">
                  {editingLote
                    ? 'Modifica la información del lote de vacunas'
                    : 'Completa la información para registrar un nuevo lote de vacunas'}
                </p>
              </ModalHeader>
              <ModalBody className="px-6">
                <form onSubmit={handleLoteSubmit} className="modern-form">
                  <div className="form-group">
                    <label>Vacuna</label>
                    <select
                      name="id_vacuna"
                      value={loteForm.id_vacuna}
                      onChange={handleLoteFormChange}
                      className="form-control"
                      required
                    >
                      <option value="">Seleccione una vacuna</option>
                      {safeVacunas.map(vacuna => (
                        <option key={vacuna.id_vacuna} value={vacuna.id_vacuna}>
                          {vacuna.nombre_vacuna} - {vacuna.fabricante}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Número de Lote</label>
                    <input
                      type="text"
                      name="numero_lote"
                      value={loteForm.numero_lote}
                      onChange={handleLoteFormChange}
                      className="form-control"
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Fecha de Fabricación</label>
                      <input
                        type="date"
                        name="fecha_fabricacion"
                        value={loteForm.fecha_fabricacion}
                        onChange={handleLoteFormChange}
                        className="form-control"
                      />
                    </div>
                    <div className="form-group">
                      <label>Fecha de Vencimiento</label>
                      <input
                        type="date"
                        name="fecha_vencimiento"
                        value={loteForm.fecha_vencimiento}
                        onChange={handleLoteFormChange}
                        className="form-control"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Cantidad Total</label>
                      <input
                        type="number"
                        min="1"
                        name="cantidad_total"
                        value={loteForm.cantidad_total}
                        onChange={handleLoteFormChange}
                        className="form-control"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Cantidad Disponible</label>
                      <input
                        type="number"
                        min="0"
                        name="cantidad_disponible"
                        value={loteForm.cantidad_disponible}
                        onChange={handleLoteFormChange}
                        className="form-control"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Centro Asignado</label>
                    <select
                      name="id_centro"
                      value={loteForm.id_centro}
                      onChange={handleLoteFormChange}
                      className="form-control"
                    >
                      <option value="">Seleccione un centro</option>
                      {safeCentrosVacunacion.map(centro => (
                        <option key={centro.id_centro} value={centro.id_centro}>
                          {centro.nombre_centro}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Condiciones de Almacenamiento</label>
                    <input
                      type="text"
                      name="condiciones_almacenamiento"
                      value={loteForm.condiciones_almacenamiento}
                      onChange={handleLoteFormChange}
                      className="form-control"
                      placeholder="Ej: 2-8°C, proteger de la luz"
                    />
                  </div>
                </form>
              </ModalBody>
              <ModalFooter>
                <Button
                  type="button"
                  color="default"
                  variant="flat"
                  onClick={onClose}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  className="font-semibold"
                  onClick={handleLoteSubmit}
                >
                  {editingLote ? 'Guardar Cambios' : 'Crear Lote'}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Modal para añadir/editar usuario */}
      <Modal
        isOpen={showAddUsuarioModal}
        onClose={() => setShowAddUsuarioModal(false)}
        size="2xl"
        scrollBehavior="inside"
        backdrop="blur"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h3 className="text-xl font-bold">{editingUsuario ? 'Editar Usuario' : 'Añadir Nuevo Usuario'}</h3>
                <p className="text-small text-default-500">
                  {editingUsuario
                    ? 'Modifica la información del usuario'
                    : 'Completa la información para crear un nuevo usuario'}
                </p>
              </ModalHeader>
              <ModalBody className="px-6">
                <form onSubmit={handleUsuarioSubmit} className="modern-form">
                  <div className="form-group">
                    <label>Nombre Completo</label>
                    <input
                      type="text"
                      name="name"
                      value={usuarioForm.name}
                      onChange={handleUsuarioFormChange}
                      className="form-control"
                      required
                      placeholder="Nombre y apellidos"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Nombre de Usuario</label>
                      <input
                        type="text"
                        name="username"
                        value={usuarioForm.username}
                        onChange={handleUsuarioFormChange}
                        className="form-control"
                        required
                        placeholder="Nombre de usuario"
                      />
                    </div>
                    <div className="form-group">
                      <label>Correo Electrónico (Opcional)</label>
                      <input
                        type="email"
                        name="email"
                        value={usuarioForm.email}
                        onChange={handleUsuarioFormChange}
                        className="form-control"
                        placeholder="correo@ejemplo.com"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Teléfono</label>
                    <input
                      type="tel"
                      name="telefono"
                      value={usuarioForm.telefono}
                      onChange={handleUsuarioFormChange}
                      className="form-control"
                      placeholder="+1-809-532-0001"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Contraseña</label>
                      <input
                        type="password"
                        name="password"
                        value={usuarioForm.password}
                        onChange={handleUsuarioFormChange}
                        className="form-control"
                        placeholder={editingUsuario ? 'Ingrese nueva contraseña' : 'Mínimo 6 caracteres'}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Confirmar Contraseña</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={usuarioForm.confirmPassword}
                        onChange={handleUsuarioFormChange}
                        className="form-control"
                        placeholder={editingUsuario ? 'Confirme nueva contraseña' : 'Repetir contraseña'}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Rol</label>
                    <select
                      name="role"
                      value={usuarioForm.role}
                      onChange={handleUsuarioFormChange}
                      className="form-control"
                      required
                    >
                      <option value="director">Director</option>
                      <option value="padre">Padre</option>
                      <option value="doctor">Doctor</option>
                      {currentUser.role === 'administrador' && (
                        <option value="administrador">Administrador</option>
                      )}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="active"
                        checked={usuarioForm.active}
                        onChange={handleUsuarioFormChange}
                        className="mr-2"
                      />
                      Usuario Activo
                    </label>
                  </div>
                </form>
              </ModalBody>
              <ModalFooter>
                <Button
                  type="button"
                  color="default"
                  variant="flat"
                  onClick={onClose}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  className="font-semibold"
                  onClick={handleUsuarioSubmit}
                >
                  {editingUsuario ? 'Guardar Cambios' : 'Crear Usuario'}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default AdminPage;