import React, { useState, useEffect } from "react";
import NinoForm from "./NinoForm";
import PadreForm from "./PadreForm";
import { Button, Divider, Card, CardBody, Tabs, Tab, Input } from "@nextui-org/react";
import jsonService from "../../../services/jsonService";
import * as pacientesService from "../../../services/pacientesService";
import tutorsService from "../../../services/tutorsService";

export default function RegistroForm({
  onClose,
  onNinoAdd,
  onTutorAdd,
  ninoToEdit,
  onUpdateNino,
  onUpdateTutor,
  tutores: initialTutores = [], // Default to empty array if undefined
  centros,
}) {
  const [loading, setLoading] = useState(false);
  const [loadingTutors, setLoadingTutors] = useState(false); // Renamed for clarity
  const isEditMode = !!ninoToEdit;
  const [paso, setPaso] = useState(1); // Start with Tutor info
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
    latitud: 0,
    longitud: 0,
    id_salud_nacional: "",
  });

  // Log para monitorear cambios en formData
  useEffect(() => {
    console.log("[RegistroForm] formData actualizado:", formData);
  }, [formData]);
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
  const [busquedaCedula, setBusquedaCedula] = useState("");
  const [tutoresFiltrados, setTutoresFiltrados] = useState([]); // Initialize as empty array
  const [error, setError] = useState("");
  const [tutores, setTutores] = useState(initialTutores); // Initialize with prop, default to empty array

  // Log para monitorear cambios en tutorExistente
  useEffect(() => {
    console.log("[RegistroForm] tutorExistente actualizado:", tutorExistente);
    console.log("[RegistroForm] Tipo de tutorExistente:", typeof tutorExistente);
  }, [tutorExistente]);

  // Log para monitorear cambios en usarTutorExistente
  useEffect(() => {
    console.log("[RegistroForm] usarTutorExistente actualizado:", usarTutorExistente);
  }, [usarTutorExistente]);

  // Fetch tutors from /api/tutors when usarTutorExistente becomes true
  useEffect(() => {
    let isMounted = true;

    const fetchTutors = async () => {
      if (usarTutorExistente && isMounted) {
        setLoadingTutors(true); // Start loading
        try {
          const data = await jsonService.getData("Padres"); // Use jsonService
          console.log("[RegistroForm] Parsed Tutor Data:", data); // Log parsed data
          setTutores(data || []);
        } catch (err) {
          console.error("[RegistroForm] Error fetching tutors:", err);
          setTutores([]); // Fallback to empty array on error
          setError("Error al cargar los tutores. Intenta de nuevo.");
        } finally {
          setLoadingTutors(false); // End loading
        }
      }
    };

    fetchTutors();

    return () => {
      isMounted = false; // Cleanup to prevent state updates on unmounted component
    };
  }, [usarTutorExistente]); // Trigger on usarTutorExistente change

  useEffect(() => {
    const filtrados = busquedaCedula.trim() === ""
      ? tutores
      : tutores.filter((tutor) =>
          (tutor.identificacion || "").toLowerCase().includes(busquedaCedula.toLowerCase())
        );
    setTutoresFiltrados(filtrados);
  }, [busquedaCedula, tutores]);

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
        latitud: ninoToEdit.latitud || 0,
        longitud: ninoToEdit.longitud || 0,
        id_salud_nacional: ninoToEdit.id_salud_nacional || "",
      });
      if (ninoToEdit.id_tutor) {
        setUsarTutorExistente(true);
        setTutorExistente(ninoToEdit.id_tutor);
      }
    }
  }, [isEditMode, ninoToEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log("[RegistroForm] handleChange:", name, "=", value);
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (name, selectedKeys) => {
    const selectedValue = Array.from(selectedKeys)[0] || "";
    console.log("[RegistroForm] handleSelectChange:", name, "=", selectedValue);
    setFormData({ ...formData, [name]: selectedValue });
  };

  const handlePadreChange = (e) => {
    const { name, value } = e.target;
    setPadreData({ ...padreData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (paso === 1) {
      setPaso(2);
    } else {
      try {
        console.log("[RegistroForm] Estado completo de formData antes de enviar:", formData);
        
        // Obtener información del tutor seleccionado si se usa tutor existente
        let tutorSeleccionado = null;
        let tutorCreado = null;
        
        if (usarTutorExistente && tutorExistente) {
          tutorSeleccionado = tutores.find(t => t.id_tutor === tutorExistente);
          console.log("[RegistroForm] Tutor seleccionado encontrado:", tutorSeleccionado);
        } else if (!usarTutorExistente) {
          // Crear nuevo tutor con el formato específico requerido
          console.log("[RegistroForm] === CREANDO NUEVO TUTOR ===");
          const tutorData = {
            id_niño: null,
            nombre: padreData.nombre_completo?.trim() || null,
            relacion: padreData.relacion?.trim() || "Madre",
            nacionalidad: formData.nacionalidad?.trim() || null,
            identificacion: padreData.identificacion?.trim() || null,
            telefono: padreData.telefono?.trim() || null,
            email: padreData.correo_electronico?.trim() || null,
            direccion: padreData.direccion?.trim() || null
          };
          
          console.log("[RegistroForm] Datos del tutor a crear:", JSON.stringify(tutorData, null, 2));
          
          try {
            tutorCreado = await tutorsService.createTutor(tutorData);
            console.log("[RegistroForm] ✅ Tutor creado exitosamente:", tutorCreado);
          } catch (tutorError) {
            console.error("[RegistroForm] ❌ Error creando tutor:", tutorError);
            throw new Error(`Error al crear el tutor: ${tutorError.message}`);
          }
        }
        
        const dataToSave = {
          nombre_completo: formData.nombre_completo?.trim() || null,
          identificacion: formData.identificacion?.trim() || null,
          nacionalidad: formData.nacionalidad?.trim() || null,
          pais_nacimiento: formData.pais_nacimiento?.trim() || null,
          fecha_nacimiento: formData.fecha_nacimiento?.trim() || null,
          genero: formData.genero?.trim() || null,
          direccion_residencia: formData.direccion_residencia?.trim() || null,
          latitud: formData.latitud || 0,
          longitud: formData.longitud || 0,
          id_centro_salud: formData.id_centro_salud?.trim() || null,
          contacto_principal: formData.contacto_principal?.trim() || null,
          id_salud_nacional: formData.id_salud_nacional?.trim() || null,
          tutor_ids: usarTutorExistente ? [tutorExistente] : tutorCreado ? [tutorCreado.id_tutor || tutorCreado.id] : [],
        };

        console.log("[RegistroForm] Datos que se enviarán al backend:", dataToSave);

        let response;
        if (isEditMode && ninoToEdit) {
          // Usar pacientesService para actualización
          const patientId = ninoToEdit.id_niño || ninoToEdit.id_paciente;
          response = await pacientesService.updatePatient(patientId, dataToSave);
        } else {
          // Usar jsonService para creación
          response = await jsonService.saveData("Ninos", dataToSave, 'POST');
        }
        
        // Manejar diferentes tipos de respuesta
        const data = response?.data || response;
        
        // Manejar respuesta exitosa
        if (isEditMode) {
          // Para edición, verificar si fue exitoso
          if (response?.success || response?.status === 200 || data) {
            onUpdateNino({ 
              ...formData, 
              id_niño: ninoToEdit.id_niño || ninoToEdit.id_paciente, 
              id_paciente: ninoToEdit.id_niño || ninoToEdit.id_paciente,
              id_tutor: tutorExistente || tutorCreado?.id_tutor || tutorCreado?.id || data?.tutores?.[0]?.id_tutor 
            });
            onClose();
          } else {
            throw new Error(data?.message || "Error al actualizar paciente");
          }
        } else {
          // Para creación, verificar status code o ID
          if ((response?.status && response.status === 201) || data?.id_niño || data?.id_paciente) {
            onNinoAdd({ 
              ...formData, 
              id_niño: data.id_paciente || data.id_niño, 
              id_paciente: data.id_paciente || data.id_niño,
              id_tutor: tutorExistente || tutorCreado?.id_tutor || tutorCreado?.id || data?.tutores?.[0]?.id_tutor 
            });
            onClose();
          } else {
            throw new Error(data?.message || "Error al crear paciente");
          }
        }
      } catch (err) {
        setError(err.message || "Error al procesar el registro. Intenta nuevamente.");
        console.error("Error en handleSubmit:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div>
      <Tabs
        selectedKey={paso.toString()}
        onSelectionChange={(key) => setPaso(parseInt(key))}
        variant="underlined"
        classNames={{
          tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
          cursor: "w-full bg-primary",
          tab: "max-w-fit px-2 h-12",
          tabContent: "group-data-[selected=true]:text-primary",
        }}
      >
        <Tab
          key="1"
          title={
            <div className="flex items-center space-x-2">
              <span className="text-lg">1</span>
              <span>Información del Tutor</span>
            </div>
          }
        />
        <Tab
          key="2"
          title={
            <div className="flex items-center space-x-2">
              <span className="text-lg">2</span>
              <span>Información del Paciente</span>
            </div>
          }
          isDisabled={paso < 2 || (usarTutorExistente && !tutorExistente)}
        />
      </Tabs>
      <form onSubmit={handleSubmit} className="space-y-6">
        {paso === 1 ? (
          <div className="space-y-4">
            <h4 className="text-xl font-semibold">Información del Tutor</h4>
            <Card shadow="sm">
              <CardBody className="space-y-4">
                <div className="flex gap-2">
                  <Button
                    color={usarTutorExistente ? "primary" : "default"}
                    variant="bordered"
                    onClick={() => setUsarTutorExistente(true)} // Set to true on click
                  >
                    Usar tutor existente
                  </Button>
                  <Button
                    color={!usarTutorExistente ? "primary" : "default"}
                    variant="bordered"
                    onClick={() => {
                      setUsarTutorExistente(false);
                      setTutorExistente(""); // Clear existing tutor selection
                    }}
                  >
                    Crear nuevo tutor
                  </Button>
                </div>
                {usarTutorExistente && (
                  <div>
                    {loadingTutors ? (
                      <div className="text-center py-4">Cargando tutores...</div>
                    ) : (
                      <>
                        <Input
                          type="text"
                          label="Buscar tutor por cédula"
                          placeholder="Ingrese la cédula del tutor"
                          value={busquedaCedula || ""}
                          onChange={(e) => setBusquedaCedula(e.target.value)}
                          variant="bordered"
                          className="mb-4"
                          startContent={
                            <span className="text-default-400 text-small">🔍</span>
                          }
                        />
                        {tutoresFiltrados && tutoresFiltrados.length > 0 ? (
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                            {tutoresFiltrados.map((tutor, idx) => {
                              console.log(`[RegistroForm] Renderizando tutor ${tutor.nombre}: id=${tutor.id_tutor}`);
                              const isSelected = tutorExistente === tutor.id_tutor;
                              console.log(`[RegistroForm] ¿Está seleccionado? ${isSelected} (${tutorExistente} === ${tutor.id_tutor})`);
                              return (
                                <div
                                  key={tutor.id_tutor + "_" + idx}
                                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                                    isSelected 
                                      ? "border-success-500 bg-success-50 dark:bg-success-900/20" 
                                      : "border-gray-200 hover:border-primary-200 bg-white dark:bg-gray-800"
                                  }`}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    console.log("[RegistroForm] Clic en tutor:", tutor.id_tutor, tutor.nombre);
                                    setTutorExistente(tutor.id_tutor);
                                  }}
                                >
                                  <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                      <div className="font-semibold text-lg">{tutor.nombre}</div>
                                      <div className="text-small text-gray-600 dark:text-gray-400">
                                        <span className="font-medium">Cédula:</span> {tutor.identificacion}
                                      </div>
                                      {tutor.telefono && (
                                        <div className="text-small text-gray-600 dark:text-gray-400">
                                          <span className="font-medium">Teléfono:</span> {tutor.telefono}
                                        </div>
                                      )}
                                    </div>
                                    {isSelected && (
                                      <div className="flex items-center gap-2 bg-success-100 text-success-800 px-2 py-1 rounded text-small font-medium">
                                        <span>✓</span>
                                        Seleccionado
                                      </div>
                                    )}
                                    {!isSelected && (
                                      <Button
                                        size="sm"
                                        color="primary"
                                        variant="bordered"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          console.log("[RegistroForm] Botón seleccionar tutor:", tutor.id_tutor);
                                          setTutorExistente(tutor.id_tutor);
                                        }}
                                      >
                                        Seleccionar
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : busquedaCedula?.trim() ? (
                          <div className="text-center py-4 text-default-500">
                            No se encontraron tutores con esa cédula.
                          </div>
                        ) : (
                          <div className="text-center py-4 text-default-500">
                            Ingrese una cédula para buscar tutores.
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
                {!usarTutorExistente && (
                  <PadreForm formData={padreData} handleChange={handlePadreChange} />
                )}
              </CardBody>
            </Card>
          </div>
        ) : (
          <div className="space-y-4">
            <h4 className="text-xl font-semibold">
              {isEditMode ? "Editar Información del Paciente" : "Información del Paciente"}
            </h4>
            <NinoForm
              formData={formData}
              handleChange={handleChange}
              handleSelectChange={handleSelectChange}
              centros={centros}
            />
          </div>
        )}
        <Divider />
        <div className="flex justify-between">
          {paso === 2 && (
            <Button variant="flat" color="default" onClick={() => setPaso(1)}>
              Atrás
            </Button>
          )}
          <div className="flex gap-2 ml-auto">
            <Button variant="flat" color="danger" onClick={onClose}>
              Cancelar
            </Button>
            {paso === 1 ? (
              <Button
                color="primary"
                onClick={(e) => {
                  e.preventDefault();
                  setPaso(2);
                }}
                isDisabled={loading || (usarTutorExistente && !tutorExistente)}
              >
                Siguiente
              </Button>
            ) : (
              <Button
                type="submit"
                color="primary"
                isDisabled={loading}
              >
                {isEditMode ? "Guardar Cambios" : "Registrar"}
              </Button>
            )}
          </div>
        </div>
        {error && <div className="text-danger-500 mt-2">{error}</div>}
        
        {/* Debug info para desarrollo */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-small">
            <div><strong>Debug Info:</strong></div>
            <div>Usar tutor existente: {usarTutorExistente ? 'Sí' : 'No'}</div>
            <div>Tutor seleccionado: {tutorExistente || 'Ninguno'}</div>
            <div>Tutores cargados: {tutores.length}</div>
            <div>Paso actual: {paso}</div>
          </div>
        )}
      </form>
    </div>
  );
}