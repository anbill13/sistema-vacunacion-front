import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import Button from '../ui/Button';
import { Modal, ModalHeader, ModalBody } from '../ui/Modal';

const AdminPage = () => {
  const { 
    centrosVacunacion, 
    setCentrosVacunacion,
    directores,
    setDirectores,
    vacunas,
    setVacunas,
    lotesVacunas,
    setLotesVacunas
  } = useData();

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
    sitio_web: ''
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
    fecha_fabricacion: '',
    fecha_vencimiento: '',
    cantidad_dosis: 0,
    temperatura_almacenamiento: '',
    id_centro: ''
  });

  const [usuarioForm, setUsuarioForm] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'director', // Por defecto, director
    active: true
  });

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
      sitio_web: ''
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
      sitio_web: centro.sitio_web || ''
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

  const handleCentroSubmit = (e) => {
    e.preventDefault();
    
    if (editingCentro) {
      // Actualizar centro existente
      const updatedCentros = centrosVacunacion.map(centro => 
        centro.id_centro === editingCentro.id_centro 
          ? { 
              ...centro, 
              ...centroForm,
              fecha_actualizacion: new Date().toISOString()
            } 
          : centro
      );
      setCentrosVacunacion(updatedCentros);
    } else {
      // Crear nuevo centro
      const newCentro = {
        ...centroForm,
        id_centro: `temp-${Math.random()}`,
        fecha_creacion: new Date().toISOString(),
        fecha_actualizacion: new Date().toISOString()
      };
      setCentrosVacunacion([...centrosVacunacion, newCentro]);
    }
    
    setShowAddCentroModal(false);
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

  const handleVacunaSubmit = (e) => {
    e.preventDefault();
    
    if (editingVacuna) {
      // Actualizar vacuna existente
      const updatedVacunas = vacunas.map(vacuna => 
        vacuna.id_vacuna === editingVacuna.id_vacuna 
          ? { 
              ...vacuna, 
              ...vacunaForm,
              fecha_actualizacion: new Date().toISOString()
            } 
          : vacuna
      );
      setVacunas(updatedVacunas);
    } else {
      // Crear nueva vacuna
      const newVacuna = {
        ...vacunaForm,
        id_vacuna: `temp-${Math.random()}`,
        fecha_creacion: new Date().toISOString(),
        fecha_actualizacion: new Date().toISOString()
      };
      setVacunas([...vacunas, newVacuna]);
    }
    
    setShowAddVacunaModal(false);
  };

  // Handlers para lotes
  const handleAddLote = () => {
    setEditingLote(null);
    setLoteForm({
      id_vacuna: '',
      numero_lote: '',
      fecha_fabricacion: '',
      fecha_vencimiento: '',
      cantidad_dosis: 0,
      temperatura_almacenamiento: '',
      id_centro: ''
    });
    setShowAddLoteModal(true);
  };

  const handleEditLote = (lote) => {
    setEditingLote(lote);
    setLoteForm({
      id_vacuna: lote.id_vacuna || '',
      numero_lote: lote.numero_lote || '',
      fecha_fabricacion: lote.fecha_fabricacion ? lote.fecha_fabricacion.split('T')[0] : '',
      fecha_vencimiento: lote.fecha_vencimiento ? lote.fecha_vencimiento.split('T')[0] : '',
      cantidad_dosis: lote.cantidad_dosis || 0,
      temperatura_almacenamiento: lote.temperatura_almacenamiento || '',
      id_centro: lote.id_centro || ''
    });
    setShowAddLoteModal(true);
  };

  const handleLoteFormChange = (e) => {
    const { name, value } = e.target;
    setLoteForm({
      ...loteForm,
      [name]: name === 'cantidad_dosis' ? parseInt(value, 10) : value
    });
  };

  const handleLoteSubmit = (e) => {
    e.preventDefault();
    
    if (editingLote) {
      // Actualizar lote existente
      const updatedLotes = lotesVacunas.map(lote => 
        lote.id_lote === editingLote.id_lote 
          ? { 
              ...lote, 
              ...loteForm,
              fecha_actualizacion: new Date().toISOString()
            } 
          : lote
      );
      setLotesVacunas(updatedLotes);
    } else {
      // Crear nuevo lote
      const newLote = {
        ...loteForm,
        id_lote: `temp-${Math.random()}`,
        fecha_creacion: new Date().toISOString(),
        fecha_actualizacion: new Date().toISOString()
      };
      setLotesVacunas([...lotesVacunas, newLote]);
    }
    
    setShowAddLoteModal(false);
  };

  // Handlers para usuarios
  const handleAddUsuario = () => {
    setEditingUsuario(null);
    setUsuarioForm({
      name: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'director',
      active: true
    });
    setShowAddUsuarioModal(true);
  };

  const handleEditUsuario = (usuario) => {
    setEditingUsuario(usuario);
    setUsuarioForm({
      name: usuario.name || '',
      username: usuario.username || '',
      email: usuario.email || '',
      password: '',
      confirmPassword: '',
      role: usuario.role || 'director',
      active: usuario.active !== undefined ? usuario.active : true
    });
    setShowAddUsuarioModal(true);
  };
  
  const toggleUsuarioStatus = (usuario) => {
    // No permitir desactivar al administrador principal
    if (usuario.id === 'admin') {
      alert('No se puede desactivar al administrador principal del sistema.');
      return;
    }
    
    const updatedDirectores = directores.map(dir => 
      dir.id === usuario.id 
        ? { ...dir, active: !dir.active } 
        : dir
    );
    
    setDirectores(updatedDirectores);
    
    // Mostrar mensaje de confirmación
    const statusMessage = !usuario.active ? 'activado' : 'desactivado';
    alert(`Usuario ${usuario.name} ${statusMessage} correctamente.`);
  };
  
  const handleDeleteUsuario = (usuario) => {
    // No permitir eliminar al administrador principal
    if (usuario.id === 'admin') {
      alert('No se puede eliminar al administrador principal del sistema.');
      return;
    }
    
    // Pedir confirmación antes de eliminar
    if (window.confirm(`¿Estás seguro de que deseas eliminar al usuario ${usuario.name}? Esta acción no se puede deshacer.`)) {
      // Filtrar el usuario a eliminar
      const updatedDirectores = directores.filter(dir => dir.id !== usuario.id);
      
      // Actualizar el estado
      setDirectores(updatedDirectores);
      
      // Mostrar mensaje de confirmación
      alert(`Usuario ${usuario.name} eliminado correctamente.`);
    }
  };

  const handleUsuarioFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUsuarioForm({
      ...usuarioForm,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleUsuarioSubmit = (e) => {
    e.preventDefault();
    
    // Validar que las contraseñas coincidan
    if (usuarioForm.password !== usuarioForm.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }
    
    if (editingUsuario) {
      // Actualizar usuario existente
      const updatedDirectores = directores.map(usuario => 
        usuario.id === editingUsuario.id 
          ? { 
              ...usuario, 
              name: usuarioForm.name,
              username: usuarioForm.username,
              email: usuarioForm.email,
              role: usuarioForm.role,
              active: usuarioForm.active,
              // Solo actualizar la contraseña si se proporcionó una nueva
              ...(usuarioForm.password ? { password: usuarioForm.password } : {})
            } 
          : usuario
      );
      
      // Actualizar el contexto
      setDirectores(updatedDirectores);
      alert(`Usuario ${usuarioForm.name} actualizado correctamente`);
    } else {
      // Crear nuevo usuario
      const newUsuario = {
        id: `user-${Math.random().toString(36).substr(2, 9)}`,
        name: usuarioForm.name,
        username: usuarioForm.username,
        email: usuarioForm.email,
        password: usuarioForm.password, // En una app real, esto se encriptaría en el backend
        role: usuarioForm.role,
        active: usuarioForm.active,
        centrosAsignados: [], // Por defecto sin centros asignados
        createdAt: new Date().toISOString()
      };
      
      // Actualizar el contexto
      setDirectores([...directores, newUsuario]);
      alert(`Usuario ${usuarioForm.name} creado correctamente`);
    }
    
    setShowAddUsuarioModal(false);
  };

  return (
    <div className="admin-page">
      <div className="admin-dashboard-header">
        <div className="admin-header-content">
          <div className="admin-title-group">
            <h2>Panel de Administración</h2>
            <p className="admin-subtitle">Gestiona centros, vacunas, lotes y usuarios del sistema</p>
          </div>
          <div className="admin-stats">
            <div className="stat-card">
              <div className="stat-icon">🏥</div>
              <div className="stat-info">
                <div className="stat-value">{centrosVacunacion.length}</div>
                <div className="stat-label">Centros</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">💉</div>
              <div className="stat-info">
                <div className="stat-value">{vacunas.length}</div>
                <div className="stat-label">Vacunas</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📦</div>
              <div className="stat-info">
                <div className="stat-value">{lotesVacunas.length}</div>
                <div className="stat-label">Lotes</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="modern-admin-tabs">
        <button 
          className={`modern-admin-tab ${activeSection === 'centros' ? 'active' : ''}`}
          onClick={() => setActiveSection('centros')}
        >
          <span className="tab-icon">🏥</span>
          <span className="tab-text">Centros de Vacunación</span>
        </button>
        <button 
          className={`modern-admin-tab ${activeSection === 'vacunas' ? 'active' : ''}`}
          onClick={() => setActiveSection('vacunas')}
        >
          <span className="tab-icon">💉</span>
          <span className="tab-text">Vacunas</span>
        </button>
        <button 
          className={`modern-admin-tab ${activeSection === 'lotes' ? 'active' : ''}`}
          onClick={() => setActiveSection('lotes')}
        >
          <span className="tab-icon">📦</span>
          <span className="tab-text">Lotes de Vacunas</span>
        </button>
        <button 
          className={`modern-admin-tab ${activeSection === 'usuarios' ? 'active' : ''}`}
          onClick={() => setActiveSection('usuarios')}
        >
          <span className="tab-icon">👥</span>
          <span className="tab-text">Usuarios</span>
        </button>
      </div>

      <div className="admin-content">
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
                    {centrosVacunacion.map(centro => (
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
                          <button 
                            className="btn-edit"
                            onClick={() => handleEditCentro(centro)}
                          >
                            Editar
                          </button>
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
                          <button 
                            className="btn-edit"
                            onClick={() => handleEditVacuna(vacuna)}
                          >
                            Editar
                          </button>
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
                      <th>Cantidad Dosis</th>
                      <th>Centro Asignado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lotesVacunas.map(lote => {
                      const vacuna = vacunas.find(v => v.id_vacuna === lote.id_vacuna);
                      const centro = centrosVacunacion.find(c => c.id_centro === lote.id_centro);
                      
                      // Calcular si está próximo a vencer (30 días)
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
                            <span className="badge badge-success">{lote.cantidad_dosis}</span>
                          </td>
                          <td>
                            <div className="cell-content">
                              <span className="cell-icon">🏥</span>
                              <span>{centro ? centro.nombre_centro : 'No asignado'}</span>
                            </div>
                          </td>
                          <td>
                            <button 
                              className="btn-edit"
                              onClick={() => handleEditLote(lote)}
                            >
                             Editar
                             </button>
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
                        <button 
                          className="badge badge-success"
                          style={{ cursor: 'not-allowed', border: 'none', opacity: '0.8' }}
                          title="El administrador principal no puede ser desactivado"
                          disabled
                        >
                          Activo
                        </button>
                      </td>
                      <td className="action-buttons">
                        <button 
                          className="btn-edit"
                          onClick={() => handleEditUsuario({
                            id: 'admin',
                            name: 'Administrador Sistema',
                            username: 'admin',
                            email: 'admin@sistema.com',
                            role: 'admin',
                            active: true
                          })}
                          title="Editar usuario"
                        >
                          Editar
                        </button>
                        <button 
                          className="btn-delete"
                          disabled
                          style={{ opacity: '0.5', cursor: 'not-allowed' }}
                          title="El administrador principal no puede ser eliminado"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                    {directores.map(director => (
                      <tr key={director.id}>
                        <td>
                          <div className="cell-content">
                            <span className="cell-icon">👤</span>
                            <span>{director.name}</span>
                          </div>
                        </td>
                        <td>{director.username}</td>
                        <td><span className="badge badge-info">Director</span></td>
                        <td>{director.email}</td>
                        <td>
                          <button 
                            className={`badge ${director.active !== false ? 'badge-success' : 'badge-danger'}`}
                            onClick={() => toggleUsuarioStatus(director)}
                            style={{ cursor: 'pointer', border: 'none' }}
                            title={director.active !== false ? 'Clic para desactivar' : 'Clic para activar'}
                          >
                            {director.active !== false ? 'Activo' : 'Inactivo'}
                          </button>
                        </td>
                        <td className="action-buttons">
                          <button 
                            className="btn-edit"
                            onClick={() => handleEditUsuario(director)}
                            title="Editar usuario"
                          >
                            Editar
                          </button>
                          <button 
                            className="btn-delete"
                            onClick={() => handleDeleteUsuario(director)}
                            title="Eliminar usuario"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal para añadir/editar centro */}
      {showAddCentroModal && (
        <Modal isOpen={showAddCentroModal} onClose={() => setShowAddCentroModal(false)}>
          <ModalHeader>
            <div className="modal-header-content">
              <h4>{editingCentro ? 'Editar Centro' : 'Añadir Nuevo Centro'}</h4>
              <button 
                className="modal-close-btn"
                onClick={() => setShowAddCentroModal(false)}
                aria-label="Cerrar modal"
              >
                ✕
              </button>
            </div>
          </ModalHeader>
          <ModalBody>
            <form onSubmit={handleCentroSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Nombre del Centro</label>
                  <input
                    type="text"
                    name="nombre_centro"
                    value={centroForm.nombre_centro}
                    onChange={handleCentroFormChange}
                    className="form-control"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Nombre Corto</label>
                  <input
                    type="text"
                    name="nombre_corto"
                    value={centroForm.nombre_corto}
                    onChange={handleCentroFormChange}
                    className="form-control"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Dirección</label>
                <input
                  type="text"
                  name="direccion"
                  value={centroForm.direccion}
                  onChange={handleCentroFormChange}
                  className="form-control"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Latitud</label>
                  <input
                    type="number"
                    step="0.0001"
                    name="latitud"
                    value={centroForm.latitud}
                    onChange={handleCentroFormChange}
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label>Longitud</label>
                  <input
                    type="number"
                    step="0.0001"
                    name="longitud"
                    value={centroForm.longitud}
                    onChange={handleCentroFormChange}
                    className="form-control"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Teléfono</label>
                  <input
                    type="tel"
                    name="telefono"
                    value={centroForm.telefono}
                    onChange={handleCentroFormChange}
                    className="form-control"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Director</label>
                  <select
                    name="director"
                    value={centroForm.director}
                    onChange={handleCentroFormChange}
                    className="form-select"
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
                    <div className="form-text text-warning mt-1">
                      <small>No hay directores disponibles. Cree uno en la sección "Usuarios".</small>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>Sitio Web</label>
                <input
                  type="url"
                  name="sitio_web"
                  value={centroForm.sitio_web}
                  onChange={handleCentroFormChange}
                  className="form-control"
                  placeholder="https://..."
                />
              </div>

              <div className="form-actions">
                <Button
                  type="button"
                  className="btn-secondary me-2"
                  onClick={() => setShowAddCentroModal(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="btn-primary">
                  {editingCentro ? 'Guardar Cambios' : 'Crear Centro'}
                </Button>
              </div>
            </form>
          </ModalBody>
        </Modal>
      )}

      {/* Modal para añadir/editar vacuna */}
      {showAddVacunaModal && (
        <Modal isOpen={showAddVacunaModal} onClose={() => setShowAddVacunaModal(false)}>
          <ModalHeader>
            <div className="modal-header-content">
              <h4>{editingVacuna ? 'Editar Vacuna' : 'Añadir Nueva Vacuna'}</h4>
              <button 
                className="modal-close-btn"
                onClick={() => setShowAddVacunaModal(false)}
                aria-label="Cerrar modal"
              >
                ✕
              </button>
            </div>
          </ModalHeader>
          <ModalBody>
            <form onSubmit={handleVacunaSubmit}>
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

              <div className="form-actions">
                <Button
                  type="button"
                  className="btn-secondary me-2"
                  onClick={() => setShowAddVacunaModal(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="btn-primary">
                  {editingVacuna ? 'Guardar Cambios' : 'Crear Vacuna'}
                </Button>
              </div>
            </form>
          </ModalBody>
        </Modal>
      )}

      {/* Modal para añadir/editar lote */}
      {showAddLoteModal && (
        <Modal isOpen={showAddLoteModal} onClose={() => setShowAddLoteModal(false)}>
          <ModalHeader>
            <div className="modal-header-content">
              <h4>{editingLote ? 'Editar Lote' : 'Añadir Nuevo Lote'}</h4>
              <button 
                className="modal-close-btn"
                onClick={() => setShowAddLoteModal(false)}
                aria-label="Cerrar modal"
              >
                ✕
              </button>
            </div>
          </ModalHeader>
          <ModalBody>
            <form onSubmit={handleLoteSubmit}>
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
                  {vacunas.map(vacuna => (
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
                  <label>Cantidad de Dosis</label>
                  <input
                    type="number"
                    min="1"
                    name="cantidad_dosis"
                    value={loteForm.cantidad_dosis}
                    onChange={handleLoteFormChange}
                    className="form-control"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Temperatura de Almacenamiento</label>
                  <input
                    type="text"
                    name="temperatura_almacenamiento"
                    value={loteForm.temperatura_almacenamiento}
                    onChange={handleLoteFormChange}
                    className="form-control"
                    placeholder="Ej: 2-8°C"
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
                  {centrosVacunacion.map(centro => (
                    <option key={centro.id_centro} value={centro.id_centro}>
                      {centro.nombre_centro}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-actions">
                <Button
                  type="button"
                  className="btn-secondary me-2"
                  onClick={() => setShowAddLoteModal(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="btn-primary">
                  {editingLote ? 'Guardar Cambios' : 'Crear Lote'}
                </Button>
              </div>
            </form>
          </ModalBody>
        </Modal>
      )}

      {/* Modal para añadir/editar usuario */}
      {showAddUsuarioModal && (
        <Modal isOpen={showAddUsuarioModal} onClose={() => setShowAddUsuarioModal(false)}>
          <ModalHeader>
            <div className="modal-header-content">
              <h4>{editingUsuario ? 'Editar Usuario' : 'Añadir Nuevo Usuario'}</h4>
              <button 
                className="modal-close-btn"
                onClick={() => setShowAddUsuarioModal(false)}
                aria-label="Cerrar modal"
              >
                ✕
              </button>
            </div>
          </ModalHeader>
          <ModalBody>
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
                  <label>Correo Electrónico</label>
                  <input
                    type="email"
                    name="email"
                    value={usuarioForm.email}
                    onChange={handleUsuarioFormChange}
                    className="form-control"
                    required
                    placeholder="correo@ejemplo.com"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Contraseña {editingUsuario && '(Dejar en blanco para mantener)'}</label>
                  <input
                    type="password"
                    name="password"
                    value={usuarioForm.password}
                    onChange={handleUsuarioFormChange}
                    className="form-control"
                    placeholder="Contraseña"
                    {...(!editingUsuario ? { required: true } : {})}
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
                    placeholder="Confirmar contraseña"
                    {...(!editingUsuario ? { required: true } : {})}
                  />
                </div>
              </div>

              <div className="form-row">
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
                    <option value="admin">Administrador</option>
                    <option value="staff">Personal</option>
                  </select>
                </div>
                <div className="form-group checkbox-group">
                  <label className="checkbox-container">
                    <input
                      type="checkbox"
                      name="active"
                      checked={usuarioForm.active}
                      onChange={handleUsuarioFormChange}
                    />
                    <span className="checkbox-label">Usuario Activo</span>
                  </label>
                </div>
              </div>

              <div className="form-actions">
                <Button
                  type="button"
                  className="btn-secondary me-2"
                  onClick={() => setShowAddUsuarioModal(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="btn-primary">
                  {editingUsuario ? 'Guardar Cambios' : 'Crear Usuario'}
                </Button>
              </div>
            </form>
          </ModalBody>
        </Modal>
      )}
    </div>
  );
};

export default AdminPage;