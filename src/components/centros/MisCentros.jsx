import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardBody, 
  CardHeader, 
  Divider, 
  Button, 
  Modal, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  ModalFooter, 
  Tabs, 
  Tab,
  Tooltip
} from "@nextui-org/react";
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';

const MisCentros = () => {
  const { centrosVacunacion } = useData();
  const { currentUser } = useAuth();
  const [centrosDirector, setCentrosDirector] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedCentro, setSelectedCentro] = useState(null);
  const [doctores, setDoctores] = useState([]);
  const [checkedDoctors, setCheckedDoctors] = useState([]);
  const [centrosConDoctores, setCentrosConDoctores] = useState({});
  
  const [activeTab, setActiveTab] = useState("vacunas");
  const [vacunas, setVacunas] = useState([]);
  const [lotesVacunas, setLotesVacunas] = useState([]);
  const [showVacunaModal, setShowVacunaModal] = useState(false);
  const [showLoteModal, setShowLoteModal] = useState(false);
  const [editingVacuna, setEditingVacuna] = useState(null);
  const [editingLote, setEditingLote] = useState(null);
  const [vacunaForm, setVacunaForm] = useState({
    nombre_vacuna: '', fabricante: '', tipo: '', dosis_requeridas: 1, intervalo_dosis: 0, edad_minima: 0, edad_maxima: 100, descripcion: ''
  });
  const [loteForm, setLoteForm] = useState({
    id_vacuna: '', numero_lote: '', fecha_fabricacion: '', fecha_vencimiento: '', cantidad_dosis: 0, temperatura_almacenamiento: '', id_centro: ''
  });

  // Solo los centros del director actual
  const centrosDirectorOptions = centrosDirector.map(c => ({ value: c.id_centro, label: c.nombre_centro }));

  // Handlers vacuna
  const handleAddVacuna = () => {
    setEditingVacuna(null);
    setVacunaForm({ nombre_vacuna: '', fabricante: '', tipo: '', dosis_requeridas: 1, intervalo_dosis: 0, edad_minima: 0, edad_maxima: 100, descripcion: '' });
    setShowVacunaModal(true);
  };
  const handleEditVacuna = (vac) => {
    setEditingVacuna(vac);
    setVacunaForm({ ...vac });
    setShowVacunaModal(true);
  };
  const handleDeleteVacuna = (vac) => {
    if(window.confirm(`¿Eliminar la vacuna ${vac.nombre_vacuna}?`)) setVacunas(vacunas.filter(v => v !== vac));
  };
  const handleVacunaFormChange = e => {
    const { name, value } = e.target;
    setVacunaForm({ ...vacunaForm, [name]: ['dosis_requeridas','intervalo_dosis','edad_minima','edad_maxima'].includes(name) ? parseInt(value,10) : value });
  };
  const handleVacunaSubmit = e => {
    e.preventDefault();
    if(editingVacuna) setVacunas(vacunas.map(v => v === editingVacuna ? { ...vacunaForm } : v));
    else setVacunas([...vacunas, { ...vacunaForm, id_vacuna: `temp-${Math.random()}` }]);
    setShowVacunaModal(false);
  };

  // Handlers lote
  const handleAddLote = () => {
    setEditingLote(null);
    setLoteForm({ id_vacuna: '', numero_lote: '', fecha_fabricacion: '', fecha_vencimiento: '', cantidad_dosis: 0, temperatura_almacenamiento: '', id_centro: '' });
    setShowLoteModal(true);
  };
  const handleEditLote = (lote) => {
    setEditingLote(lote);
    setLoteForm({ ...lote });
    setShowLoteModal(true);
  };
  const handleDeleteLote = (lote) => {
    if(window.confirm(`¿Eliminar el lote ${lote.numero_lote}?`)) setLotesVacunas(lotesVacunas.filter(l => l !== lote));
  };
  const handleLoteFormChange = e => {
    const { name, value } = e.target;
    setLoteForm({ ...loteForm, [name]: name === 'cantidad_dosis' ? parseInt(value,10) : value });
  };
  const handleLoteSubmit = e => {
    e.preventDefault();
    if(editingLote) setLotesVacunas(lotesVacunas.map(l => l === editingLote ? { ...loteForm } : l));
    else setLotesVacunas([...lotesVacunas, { ...loteForm, id_lote: `temp-${Math.random()}` }]);
    setShowLoteModal(false);
  };

  useEffect(() => {
    if (currentUser && currentUser.role === 'director') {
      // Filtrar los centros donde el director es el usuario actual
      const filtrados = centrosVacunacion.filter(
        c => c.director && c.director.trim().toLowerCase() === currentUser.name.trim().toLowerCase()
      );
      setCentrosDirector(filtrados);
    }
  }, [centrosVacunacion, currentUser]);

  // Obtener todos los usuarios doctores (simulación, normalmente vendría de un servicio)
  useEffect(() => {
    // Simulación: doctores hardcodeados
    const doctoresDemo = [
      { id: 'doc1', name: 'Dr. Juan Pérez' },
      { id: 'doc2', name: 'Dra. Ana Ruiz' },
      { id: 'doc3', name: 'Dr. Pedro López' }
    ];
    setDoctores(doctoresDemo);
  }, []);

  const handleOpenModal = (centro) => {
    setSelectedCentro(centro);
    // Cargar doctores ya asignados a este centro
    setShowModal(true);
  };

  // Devuelve el nombre de la vacuna por id
  function getVacunaNombreById(id) {
    const vacuna = vacunas.find(v => v.id_vacuna === id);
    return vacuna ? vacuna.nombre_vacuna : 'Sin vacuna';
  }
  // Devuelve el nombre del centro por id
  function getCentroNombreById(id) {
    const centro = centrosDirectorOptions.find(c => c.value === id);
    return centro ? centro.label : 'Sin centro';
  }
  // Formatea la fecha a string legible
  function formatFecha(fecha) {
    if (!fecha) return '';
    try {
      return new Date(fecha).toLocaleDateString();
    } catch {
      return fecha;
    }
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {centrosDirector.length === 0 && (
          <div className="col-span-full text-center text-default-500 py-10">
            No tienes centros asignados.
          </div>
        )}
        {centrosDirector.map((centro) => (
          <div key={centro.id_centro} className="h-full flex flex-col">
            <Card className="flex-grow" shadow="sm">
              <CardHeader className="flex gap-3 bg-primary-50 dark:bg-primary-900/20">
                <div className="flex flex-col">
                  <p className="text-lg font-semibold">{centro.nombre_centro}</p>
                  <p className="text-small text-default-500">{centro.nombre_corto || "Sin nombre corto"}</p>
                </div>
              </CardHeader>
              <Divider />
              <CardBody>
                <div className="space-y-2">
                  <p><span className="font-semibold">Dirección:</span> {centro.direccion}</p>
                  <p><span className="font-semibold">Teléfono:</span> {centro.telefono}</p>
                  <p><span className="font-semibold">Doctores asignados:</span></p>
                  <ul className="list-disc ml-6">
                    {(centrosConDoctores[centro.id_centro] || []).length === 0 && (
                      <li className="text-default-400">Ninguno</li>
                    )}
                    {(centrosConDoctores[centro.id_centro] || []).map(id => {
                      const doc = doctores.find(d => d.id === id);
                      return (
                        <li key={id} className="flex items-center gap-2">
                          <span>{doc ? doc.name : id}</span>
                          <Button
                            isIconOnly
                            size="sm"
                            color="danger"
                            variant="light"
                            aria-label="Quitar doctor"
                            className="ml-2"
                            onClick={() => {
                              setCentrosConDoctores(prev => ({
                                ...prev,
                                [centro.id_centro]: (prev[centro.id_centro] || []).filter(docId => docId !== id)
                              }));
                              setCheckedDoctors(prev => prev.filter(docId => docId !== id));
                            }}
                          >
                            <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M6 7h12M10 11v6m4-6v6M5 7l1 12a2 2 0 002 2h8a2 2 0 002-2l1-12M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2" stroke="#e00" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          </Button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </CardBody>
            </Card>
            <div className="mt-2">
              <Button color="primary" fullWidth onClick={() => handleOpenModal(centro)} className="font-semibold flex items-center gap-2 text-base">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="#06b6d4"/></svg>
                Asignar doctores
              </Button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8">
        <Tabs
          selectedKey={activeTab}
          onSelectionChange={setActiveTab}
          aria-label="Vacunas y Lotes"
          variant="underlined"
          className="max-w-3xl mx-auto"
        >
          <Tab key="vacunas" title="Vacunas">
            <div className="flex flex-col gap-4">
              {vacunas.length === 0 && <div className="text-default-400 text-center py-10">No hay vacunas registradas.</div>}
              <div className="modern-table-wrapper">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-bold text-lg">Vacunas</div>
                  <Button color="primary" size="md" className="btn-primary" onClick={handleAddVacuna}>
                    <span className="btn-icon">+</span>
                    <span>Añadir Vacuna</span>
                  </Button>
                </div>
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
                    {vacunas.map(vac => (
                      <tr key={vac.id_vacuna}>
                        <td>
                          <div className="cell-content">
                            <span className="cell-icon">💉</span>
                            <span>{vac.nombre_vacuna}</span>
                          </div>
                        </td>
                        <td>{vac.fabricante}</td>
                        <td>
                          <span className="badge">{vac.tipo}</span>
                        </td>
                        <td>
                          <span className="badge badge-info">{vac.dosis_requeridas}</span>
                        </td>
                        <td>
                          <div className="relative flex gap-2">
                            <Tooltip content="Editar vacuna" placement="top">
                              <Button color="primary" variant="shadow" size="sm" className="floating-action-btn" onClick={() => handleEditVacuna(vac)}>
                                <span className="mr-1">✏️</span> Editar
                              </Button>
                            </Tooltip>
                            <Tooltip content="Eliminar vacuna" placement="top">
                              <Button color="danger" variant="shadow" size="sm" className="floating-action-btn" onClick={() => handleDeleteVacuna(vac)}>
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
          </Tab>
          <Tab key="lotes" title="Lotes">
            <div className="flex flex-col gap-4">
              {lotesVacunas.filter(l => centrosDirectorOptions.some(c => c.value === l.id_centro)).length === 0 && (
                <div className="text-default-400 text-center py-10">No hay lotes registrados.</div>
              )}
              <div className="modern-table-wrapper">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-bold text-lg">Lotes</div>
                  <Button color="primary" size="md" className="btn-primary" onClick={handleAddLote}>
                    <span className="btn-icon">+</span>
                    <span>Añadir Lote</span>
                  </Button>
                </div>
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th>Vacuna</th>
                      <th>Número de Lote</th>
                      <th>Centro</th>
                      <th>Dosis</th>
                      <th>Vencimiento</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lotesVacunas.filter(l => centrosDirectorOptions.some(c => c.value === l.id_centro)).map(lote => (
                      <tr key={lote.id_lote}>
                        <td>{getVacunaNombreById(lote.id_vacuna)}</td>
                        <td>{lote.numero_lote}</td>
                        <td>{getCentroNombreById(lote.id_centro)}</td>
                        <td>{lote.dosis}</td>
                        <td>{formatFecha(lote.fecha_vencimiento)}</td>
                        <td>
                          <div className="relative flex gap-2">
                            <Tooltip content="Editar lote" placement="top">
                              <Button color="primary" variant="shadow" size="sm" className="floating-action-btn" onClick={() => handleEditLote(lote)}>
                                <span className="mr-1">✏️</span> Editar
                              </Button>
                            </Tooltip>
                            <Tooltip content="Eliminar lote" placement="top">
                              <Button color="danger" variant="shadow" size="sm" className="floating-action-btn" onClick={() => handleDeleteLote(lote)}>
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
          </Tab>
        </Tabs>
      </div>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} placement="center" backdrop="blur">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 items-center">
                <span className="flex items-center gap-2 text-primary-700 dark:text-primary-300">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="currentColor"/></svg>
                  Asignar doctor al centro
                </span>
                <span className="text-small text-default-500 mt-1">Selecciona un doctor para asignar al centro</span>
              </ModalHeader>
              <ModalBody className="px-6">
                <ul className="divide-y divide-default-200">
                  {doctores.map(doc => (
                    <li
                      key={doc.id}
                      className="px-4 py-3 flex items-center gap-3 transition-colors hover:bg-primary-50"
                    >
                      <input
                        type="checkbox"
                        checked={checkedDoctors.includes(doc.id)}
                        onChange={e => {
                          if (e.target.checked) {
                            setCheckedDoctors(prev => [...prev, doc.id]);
                          } else {
                            setCheckedDoctors(prev => prev.filter(id => id !== doc.id));
                          }
                        }}
                        className="form-checkbox accent-primary-600"
                      />
                      <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="#06b6d4"/></svg>
                      <span className="text-base">{doc.name}</span>
                      {centrosConDoctores[selectedCentro?.id_centro]?.includes(doc.id) && (
                        <span className="ml-auto text-primary-600 font-semibold">Ya asignado</span>
                      )}
                    </li>
                  ))}
                </ul>
              </ModalBody>
              <ModalFooter className="justify-center gap-4 pt-0">
                <Button color="danger" variant="flat" onClick={onClose}>Cancelar</Button>
                <Button
                  color="primary"
                  variant="solid"
                  className="font-semibold"
                  isDisabled={checkedDoctors.length === 0}
                  onClick={() => {
                    setCentrosConDoctores(prev => ({
                      ...prev,
                      [selectedCentro.id_centro]: checkedDoctors
                    }));
                    setShowModal(false);
                  }}
                >
                  Asignar seleccionados
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <Modal isOpen={showVacunaModal} onClose={() => setShowVacunaModal(false)} size="2xl" scrollBehavior="inside" backdrop="blur">
  <ModalContent>
    {(onClose) => (
      <>
        <ModalHeader className="flex flex-col gap-1">
          <h3 className="text-xl font-bold">{editingVacuna ? 'Editar Vacuna' : 'Añadir Nueva Vacuna'}</h3>
          <p className="text-small text-default-500">
            {editingVacuna ? 'Modifica la información de la vacuna' : 'Completa la información para crear una nueva vacuna'}
          </p>
        </ModalHeader>
        <ModalBody className="px-6">
          <form onSubmit={handleVacunaSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Nombre de la Vacuna</label>
                <input type="text" name="nombre_vacuna" value={vacunaForm.nombre_vacuna} onChange={handleVacunaFormChange} className="form-control" required />
              </div>
              <div className="form-group">
                <label>Fabricante</label>
                <input type="text" name="fabricante" value={vacunaForm.fabricante} onChange={handleVacunaFormChange} className="form-control" required />
              </div>
            </div>
            <div className="form-group">
              <label>Tipo de Vacuna</label>
              <select name="tipo" value={vacunaForm.tipo} onChange={handleVacunaFormChange} className="form-control" required>
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
                <input type="number" min="1" name="dosis_requeridas" value={vacunaForm.dosis_requeridas} onChange={handleVacunaFormChange} className="form-control" required />
              </div>
              <div className="form-group">
                <label>Intervalo entre Dosis (días)</label>
                <input type="number" min="0" name="intervalo_dosis" value={vacunaForm.intervalo_dosis} onChange={handleVacunaFormChange} className="form-control" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Edad Mínima (meses)</label>
                <input type="number" min="0" name="edad_minima" value={vacunaForm.edad_minima} onChange={handleVacunaFormChange} className="form-control" />
              </div>
              <div className="form-group">
                <label>Edad Máxima (meses)</label>
                <input type="number" min="0" name="edad_maxima" value={vacunaForm.edad_maxima} onChange={handleVacunaFormChange} className="form-control" />
              </div>
            </div>
            <div className="form-group">
              <label>Descripción</label>
              <textarea name="descripcion" value={vacunaForm.descripcion} onChange={handleVacunaFormChange} className="form-control" rows="3"></textarea>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button type="button" color="default" variant="flat" onClick={onClose}>Cancelar</Button>
              <Button type="submit" color="primary" className="font-semibold">{editingVacuna ? 'Guardar Cambios' : 'Crear Vacuna'}</Button>
            </div>
          </form>
        </ModalBody>
      </>
    )}
  </ModalContent>
</Modal>
      <Modal isOpen={showLoteModal} onClose={() => setShowLoteModal(false)} size="2xl" scrollBehavior="inside" backdrop="blur">
  <ModalContent>
    {(onClose) => (
      <>
        <ModalHeader className="flex flex-col gap-1">
          <h3 className="text-xl font-bold">{editingLote ? 'Editar Lote' : 'Añadir Nuevo Lote'}</h3>
          <p className="text-small text-default-500">
            {editingLote ? 'Modifica la información del lote de vacunas' : 'Completa la información para registrar un nuevo lote de vacunas'}
          </p>
        </ModalHeader>
        <ModalBody className="px-6">
          <form onSubmit={handleLoteSubmit}>
            <div className="form-group">
              <label>Vacuna</label>
              <select name="id_vacuna" value={loteForm.id_vacuna} onChange={handleLoteFormChange} className="form-control" required>
                <option value="">Seleccione una vacuna</option>
                {vacunas.map(v => (
                  <option key={v.id_vacuna} value={v.id_vacuna}>{v.nombre_vacuna}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Número de Lote</label>
              <input type="text" name="numero_lote" value={loteForm.numero_lote} onChange={handleLoteFormChange} className="form-control" required />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Fecha de Fabricación</label>
                <input type="date" name="fecha_fabricacion" value={loteForm.fecha_fabricacion} onChange={handleLoteFormChange} className="form-control" />
              </div>
              <div className="form-group">
                <label>Fecha de Vencimiento</label>
                <input type="date" name="fecha_vencimiento" value={loteForm.fecha_vencimiento} onChange={handleLoteFormChange} className="form-control" required />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Cantidad de Dosis</label>
                <input type="number" min="1" name="cantidad_dosis" value={loteForm.cantidad_dosis} onChange={handleLoteFormChange} className="form-control" required />
              </div>
              <div className="form-group">
                <label>Temperatura de Almacenamiento</label>
                <input type="text" name="temperatura_almacenamiento" value={loteForm.temperatura_almacenamiento} onChange={handleLoteFormChange} className="form-control" placeholder="Ej: 2-8°C" />
              </div>
            </div>
            <div className="form-group">
              <label>Centro Asignado</label>
              <select name="id_centro" value={loteForm.id_centro} onChange={handleLoteFormChange} className="form-control" required>
                <option value="">Seleccione un centro</option>
                {centrosDirectorOptions.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button type="button" color="default" variant="flat" onClick={onClose}>Cancelar</Button>
              <Button type="submit" color="primary" className="font-semibold">{editingLote ? 'Guardar Cambios' : 'Crear Lote'}</Button>
            </div>
          </form>
        </ModalBody>
      </>
    )}
  </ModalContent>
</Modal>
    </>
  );
};

export default MisCentros;
