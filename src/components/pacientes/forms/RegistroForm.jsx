import React, { useState, useEffect } from "react";
import NinoForm from "./NinoForm";
import PadreForm from "./PadreForm";
<<<<<<< HEAD
import { 
  Button, 
  Checkbox, 
  Select, 
  SelectItem, 
  Divider,
  Card,
  CardBody,
  Tabs,
  Tab
} from "@nextui-org/react";
=======
>>>>>>> develop

export default function RegistroForm({ 
  onClose, 
  onNinoAdd, 
  onTutorAdd, 
  ninoToEdit, 
  onUpdateNino, 
  onUpdateTutor, 
  tutores,
  centros
}) {
  const isEditMode = !!ninoToEdit;
  const [paso, setPaso] = useState(1);
  const [formData, setFormData] = useState({
    nombre_completo: "",
    identificacion: "",
    fecha_nacimiento: "",
    genero: "",
    direccion_residencia: "",
    nacionalidad: "",
    pais_nacimiento: "",
    id_centro_salud: "",
    contacto_principal: "",
    id_salud_nacional: "",
  });
  const [padreData, setPadreData] = useState({
    nombre_completo: "",
    identificacion: "",
    telefono: "",
    correo_electronico: "",
    direccion: "",
    relacion: "",
  });
  const [tutorExistente, setTutorExistente] = useState("");
  const [usarTutorExistente, setUsarTutorExistente] = useState(false);

  // Cargar datos si estamos en modo edición
  useEffect(() => {
    if (isEditMode && ninoToEdit) {
      setFormData({
        nombre_completo: ninoToEdit.nombre_completo || "",
        identificacion: ninoToEdit.identificacion || "",
        fecha_nacimiento: ninoToEdit.fecha_nacimiento || "",
        genero: ninoToEdit.genero || "",
        direccion_residencia: ninoToEdit.direccion_residencia || "",
        nacionalidad: ninoToEdit.nacionalidad || "",
        pais_nacimiento: ninoToEdit.pais_nacimiento || "",
        id_centro_salud: ninoToEdit.id_centro_salud || "",
        contacto_principal: ninoToEdit.contacto_principal || "",
        id_salud_nacional: ninoToEdit.id_salud_nacional || "",
      });
      
      // Si hay un tutor asociado, marcamos para usar tutor existente
      if (ninoToEdit.id_tutor) {
        setUsarTutorExistente(true);
        setTutorExistente(ninoToEdit.id_tutor);
      }
    }
  }, [isEditMode, ninoToEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handlePadreChange = (e) => {
    const { name, value } = e.target;
    setPadreData({
      ...padreData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (paso === 1) {
      // Validar datos del niño
      setPaso(2);
    } else {
      // Procesar el formulario completo
      if (isEditMode) {
        // Actualizar niño existente
        const updatedNino = {
          ...ninoToEdit,
          ...formData,
          id_tutor: usarTutorExistente ? tutorExistente : ninoToEdit.id_tutor,
          fecha_actualizacion: new Date().toISOString(),
        };
        onUpdateNino(updatedNino);
        
        // Si se cambió el tutor, actualizar relación
        if (usarTutorExistente && tutorExistente !== ninoToEdit.id_tutor) {
          // Aquí se podría actualizar la relación con el tutor
        }
      } else {
        // Crear nuevo registro
        let tutorId;
        
        if (usarTutorExistente) {
          // Usar tutor existente
          tutorId = tutorExistente;
        } else {
          // Crear nuevo tutor
          const newTutor = {
            ...padreData,
            id_tutor: `temp-${Math.random()}`,
            fecha_creacion: new Date().toISOString(),
            fecha_actualizacion: new Date().toISOString(),
          };
          onTutorAdd(newTutor);
          tutorId = newTutor.id_tutor;
        }
        
        // Crear nuevo niño
        const newNino = {
          ...formData,
          id_niño: `temp-${Math.random()}`,
          id_tutor: tutorId,
          fecha_creacion: new Date().toISOString(),
          fecha_actualizacion: new Date().toISOString(),
          activo: true,
        };
        onNinoAdd(newNino);
      }
      
      // Cerrar el formulario
      onClose();
    }
  };

  const handleBack = () => {
    setPaso(1);
  };

  return (
<<<<<<< HEAD
    <div className="space-y-4">
      <Tabs 
        selectedKey={paso.toString()} 
        onSelectionChange={(key) => setPaso(parseInt(key))}
        variant="underlined"
        classNames={{
          tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
          cursor: "w-full bg-primary",
          tab: "max-w-fit px-2 h-12",
          tabContent: "group-data-[selected=true]:text-primary"
        }}
      >
        <Tab 
          key="1" 
          title={
            <div className="flex items-center space-x-2">
              <span className="text-lg">1</span>
              <span>Información del Paciente</span>
            </div>
          }
        />
        <Tab 
          key="2" 
          title={
            <div className="flex items-center space-x-2">
              <span className="text-lg">2</span>
              <span>Información del Tutor</span>
            </div>
          }
          isDisabled={paso < 2}
        />
      </Tabs>

      <form onSubmit={handleSubmit} className="space-y-6">
        {paso === 1 ? (
          <div className="space-y-4">
            <h4 className="text-xl font-semibold">
              {isEditMode ? "Editar Información del Paciente" : "Información del Paciente"}
            </h4>
            <NinoForm formData={formData} handleChange={handleChange} centros={centros} />
          </div>
        ) : (
          <div className="space-y-4">
            <h4 className="text-xl font-semibold">Información del Tutor</h4>
            
            {tutores && tutores.length > 0 && (
              <Card shadow="sm">
                <CardBody className="space-y-4">
                  <Checkbox
                    isSelected={usarTutorExistente}
                    onValueChange={setUsarTutorExistente}
                  >
                    Usar un tutor existente
                  </Checkbox>
                  
                  {usarTutorExistente && (
                    <Select
                      label="Seleccione un tutor"
                      placeholder="Seleccione un tutor"
                      selectedKeys={tutorExistente ? [tutorExistente] : []}
                      onChange={(e) => setTutorExistente(e.target.value)}
                      isRequired
                    >
                      {tutores.map((tutor) => (
                        <SelectItem key={tutor.id_tutor} value={tutor.id_tutor}>
                          {tutor.nombre} {tutor.apellido} - {tutor.identificacion}
                        </SelectItem>
                      ))}
                    </Select>
                  )}
                </CardBody>
              </Card>
=======
    <div className="registro-form">
      <form onSubmit={handleSubmit}>
        {paso === 1 ? (
          <>
            <h4 className="mb-4">
              {isEditMode ? "Editar Información del Paciente" : "Información del Paciente"}
            </h4>
            <NinoForm formData={formData} handleChange={handleChange} centros={centros} />
          </>
        ) : (
          <>
            <h4 className="mb-4">Información del Tutor</h4>
            
            {tutores && tutores.length > 0 && (
              <div className="form-group mb-4">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="usarTutorExistente"
                    checked={usarTutorExistente}
                    onChange={(e) => setUsarTutorExistente(e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="usarTutorExistente">
                    Usar un tutor existente
                  </label>
                </div>
                
                {usarTutorExistente && (
                  <div className="mt-3">
                    <select
                      className="form-select"
                      value={tutorExistente}
                      onChange={(e) => setTutorExistente(e.target.value)}
                      required
                    >
                      <option value="">Seleccione un tutor</option>
                      {tutores.map((tutor) => (
                        <option key={tutor.id_tutor} value={tutor.id_tutor}>
                          {tutor.nombre} {tutor.apellido} - {tutor.identificacion}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
>>>>>>> develop
            )}
            
            {!usarTutorExistente && (
              <PadreForm formData={padreData} handleChange={handlePadreChange} />
            )}
<<<<<<< HEAD
          </div>
        )}
        
        <Divider />
        
        <div className="flex justify-between">
          {paso === 2 && (
            <Button
              variant="flat"
              color="default"
              onClick={handleBack}
            >
              Atrás
            </Button>
          )}
          
          <div className="flex gap-2 ml-auto">
            <Button
              variant="flat"
              color="danger"
              onClick={onClose}
            >
              Cancelar
            </Button>
            
            <Button 
              color="primary" 
              type="submit"
            >
              {paso === 1 ? "Siguiente" : isEditMode ? "Guardar Cambios" : "Registrar"}
            </Button>
=======
          </>
        )}
        
        <div className="d-flex justify-content-between mt-4">
          {paso === 2 && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleBack}
            >
              Atrás
            </button>
          )}
          
          <div className="ms-auto">
            <button
              type="button"
              className="btn btn-outline-secondary me-2"
              onClick={onClose}
            >
              Cancelar
            </button>
            
            <button type="submit" className="btn btn-primary">
              {paso === 1 ? "Siguiente" : isEditMode ? "Guardar Cambios" : "Registrar"}
            </button>
>>>>>>> develop
          </div>
        </div>
      </form>
    </div>
  );
}