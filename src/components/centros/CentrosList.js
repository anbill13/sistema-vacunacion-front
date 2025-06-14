import React from 'react';
import { Card, CardBody, CardHeader } from "../ui/Card";
import Button from "../ui/Button";

const CentrosList = ({ 
  filteredCentros, 
  handleCentroClick, 
  handleVerPacientes, 
  currentUser 
}) => {
  return (
    <div className="centros-list">
      <div className="row">
        {filteredCentros.map((centro) => (
          <div
            key={centro.id_centro}
            className="col-md-6 col-lg-4 mb-4"
            onClick={() => handleCentroClick(centro)}
          >
            <Card className="h-100 centro-card">
              <CardHeader>
                <h5 className="card-title">{centro.nombre_centro}</h5>
              </CardHeader>
              <CardBody>
                <p>
                  <strong>Dirección:</strong> {centro.direccion}
                </p>
                <p>
                  <strong>Teléfono:</strong> {centro.telefono}
                </p>
                <p>
                  <strong>Director:</strong> {centro.director || "No asignado"}
                </p>
                {(currentUser?.role === 'doctor' || 
                  currentUser?.role === 'administrador' || 
                  currentUser?.role === 'director') && (
                  <Button
                    className="btn-primary w-100 mt-2"
                    onClick={(e) => handleVerPacientes(e, centro)}
                  >
                    Ver Pacientes
                  </Button>
                )}
              </CardBody>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CentrosList;