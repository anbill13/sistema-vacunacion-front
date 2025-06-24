import React, { useState, useEffect } from "react";
import NinoForm from "./NinoForm";
import PadreForm from "./PadreForm";
import { Button, Divider, Card, CardBody, Tabs, Tab } from "@nextui-org/react";
import jsonService from "../../../services/jsonService";

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
  const [busquedaCedula, setBusquedaCedula] = useState("");
  const [tutoresFiltrados, setTutoresFiltrados] = useState([]); // Initialize as empty array
  const [error, setError] = useState("");
  const [tutores, setTutores] = useState(initialTutores); // Initialize with prop, default to empty array

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
      });
      if (ninoToEdit.id_tutor) {
        setUsarTutorExistente(true);
        setTutorExistente(ninoToEdit.id_tutor);
      }
    }
  }, [isEditMode, ninoToEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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
        const response = await jsonService.saveData("Ninos", {
          nombre_completo: formData.nombre_completo,
          identificacion: formData.identificacion,
          nacionalidad: formData.nacionalidad,
          pais_nacimiento: formData.pais_nacimiento,
          fecha_nacimiento: formData.fecha_nacimiento,
          genero: formData.genero,
          direccion_residencia: formData.direccion_residencia,
          id_centro_salud: formData.id_centro_salud,
          contacto_principal: formData.contacto_principal,
          tutores: !usarTutorExistente ? [{
            nombre: padreData.nombre_completo,
            relacion: padreData.relacion,
            nacionalidad: formData.nacionalidad,
            identificacion: padreData.identificacion,
            telefono: padreData.telefono,
            email: padreData.correo_electronico,
            direccion: padreData.direccion,
            tipo_relacion: "TutorLegal",
          }] : [],
          tutor_ids: usarTutorExistente ? [tutorExistente] : [],
        }, isEditMode ? 'PUT' : 'POST');
        const data = response.data || response;
        if ((response.status && response.status === 201) || response.id_niño) {
          if (!isEditMode) {
            onNinoAdd({ ...formData, id_niño: data.id_paciente || data.id_niño, id_tutor: tutorExistente || data.tutores?.[0]?.id_tutor });
          } else {
            onUpdateNino({ ...formData, id_niño: ninoToEdit.id_niño, id_tutor: tutorExistente || data.tutores?.[0]?.id_tutor });
          }
          onClose();
        } else {
          throw new Error(data.message || "Error al crear paciente");
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
          isDisabled={paso < 2 || !tutorExistente}
        />
      </Tabs>
      <form onSubmit={handleSubmit} className="space-y-6">
        {paso === 1 ? (
          <div className="space-y-4">
            <h4 className="text-xl font-semibold">Información del Tutor</h4>
            <Card shadow="sm">
              <CardBody className="space-y-4">
                <Button
                  color={usarTutorExistente ? "primary" : "default"}
                  variant="bordered"
                  onClick={() => setUsarTutorExistente(true)} // Set to true on click
                  className="mb-2"
                >
                  El tutor existe
                </Button>
                {usarTutorExistente && (
                  <div>
                    {loadingTutors ? (
                      <div>Cargando tutores...</div> // Loading indicator
                    ) : (
                      <>
                        <input
                          type="text"
                          placeholder="Ingrese la cédula del tutor"
                          className="input input-bordered w-full mb-2"
                          value={busquedaCedula || ""}
                          onChange={(e) => setBusquedaCedula(e.target.value)}
                        />
                        {tutoresFiltrados && tutoresFiltrados.length > 0 ? (
                          <div className="space-y-2">
                            {tutoresFiltrados.map((tutor, idx) => {
                              const isSelected = tutorExistente === tutor.id_tutor;
                              return (
                                <Card
                                  shadow={isSelected ? "md" : "xs"}
                                  className={`mb-2 cursor-pointer ${isSelected ? "border-2 border-success-500" : ""}`}
                                  key={tutor.id_tutor + "_" + idx}
                                  onClick={() => setTutorExistente(tutor.id_tutor)}
                                >
                                  <CardBody>
                                    <div className="mb-2 font-semibold">Tutor encontrado:</div>
                                    <div><b>Nombre:</b> {tutor.nombre}</div>
                                    <div><b>Cédula:</b> {tutor.identificacion}</div>
                                    {isSelected && <div className="text-success-600 font-bold mt-1">Seleccionado</div>}
                                  </CardBody>
                                </Card>
                              );
                            })}
                          </div>
                        ) : (
                          <div>No se encontraron tutores.</div> // No results message
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
      </form>
    </div>
  );
}