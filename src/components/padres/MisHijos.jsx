import React from "react";
import { Card, CardBody, Chip, Button } from "@nextui-org/react";
import { useData } from "../../context/DataContext";
import { useAuth } from "../../context/AuthContext";

function MisHijos() {
  const { ninos } = useData();
  const { currentUser } = useAuth();

  // Filtrar hijos del responsable logueado
  const hijos = currentUser && currentUser.role === "responsable"
    ? ninos.filter(n => n.id_tutor === (currentUser.id_tutor || currentUser.id))
    : [];

  const { setNinos } = useData();
  const handleRefrescar = () => {
    // Forzar recarga desde el backend simulado
    const { jsonService } = require("../../services/jsonService.jsx");
    const ninosData = jsonService.getData('Niños', 'GET') || [];
    setNinos(ninosData);
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-center">Mis Hijos</h2>
        <Button size="sm" color="primary" onClick={handleRefrescar}>Refrescar</Button>
      </div>
      {hijos.length === 0 ? (
        <div className="text-center text-default-400 py-10">
          No tienes hijos registrados.
        </div>
      ) : (
        hijos.map((hijo) => (
          <Card key={hijo.id_niño} shadow="sm" className="mb-6">
            <CardBody>
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">{hijo.nombre_completo}</h3>
                  <p><span className="font-semibold">ID:</span> {hijo.id_niño}</p>
                  <p><span className="font-semibold">Fecha de Nacimiento:</span> {hijo.fecha_nacimiento}</p>
                  <p><span className="font-semibold">Género:</span> {hijo.genero}</p>
                  <p><span className="font-semibold">Dirección:</span> {hijo.direccion_residencia}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Próximas Citas</h4>
                  <ProximasCitas nino={hijo} />
                </div>
              </div>
            </CardBody>
          </Card>
        ))
      )}
    </div>
  );
}

function TodasLasCitas({ nino }) {
  let citas = [];
  try {
    const { getCitasVacunas } = require('../../services/pacientesService');
    citas = getCitasVacunas(nino.id_niño);
  } catch {
    citas = [];
  }
  if (!Array.isArray(citas) || citas.length === 0) {
    return <p className="text-default-400">No hay citas registradas.</p>;
  }
  return (
    <ul className="space-y-2">
      {citas.sort((a, b) => new Date(a.fecha) - new Date(b.fecha)).map((cita, idx) => (
        <li key={cita.id || idx}>
          <Chip color={new Date(cita.fecha) > new Date() ? 'primary' : 'default'} variant="flat">
            {new Date(cita.fecha).toLocaleString()} - Vacuna: {(() => {
              const vacunas = require('../../context/DataContext').useData().vacunas;
              const vacuna = vacunas.find(v => v.id_vacuna === cita.vacunaId);
              return vacuna ? vacuna.nombre_vacuna : cita.vacunaId || "-";
            })()}
          </Chip>
        </li>
      ))}
    </ul>
  );
}

function ProximasCitas({ nino }) {
  // Deprecated: ahora usamos TodasLasCitas
  return <TodasLasCitas nino={nino} />;
}


export default MisHijos;
