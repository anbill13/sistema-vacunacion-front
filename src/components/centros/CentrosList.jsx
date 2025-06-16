import React from 'react';
<<<<<<< HEAD
import { Card, CardBody, CardHeader, Button, Divider } from "@nextui-org/react";
=======
import { Card, CardBody, CardHeader } from "../ui/Card";
import Button from "../ui/Button";
>>>>>>> develop

const CentrosList = ({ 
  filteredCentros, 
  handleCentroClick, 
  handleVerPacientes, 
  currentUser 
}) => {
  return (
<<<<<<< HEAD
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredCentros.map((centro) => (
        <div key={centro.id_centro} className="h-full flex flex-col">
          <Card 
            isPressable
            onPress={() => handleCentroClick(centro)}
            className="flex-grow"
            shadow="sm"
          >
            <CardHeader className="flex gap-3 bg-primary-50 dark:bg-primary-900/20">
              <div className="flex flex-col">
                <p className="text-lg font-semibold">{centro.nombre_centro}</p>
                <p className="text-small text-default-500">{centro.nombre_corto || "Sin nombre corto"}</p>
              </div>
            </CardHeader>
            <Divider />
            <CardBody>
              <div className="space-y-2">
                <p>
                  <span className="font-semibold">Dirección:</span> {centro.direccion}
                </p>
                <p>
                  <span className="font-semibold">Teléfono:</span> {centro.telefono}
                </p>
                <p>
                  <span className="font-semibold">Director:</span> {centro.director || "No asignado"}
                </p>
              </div>
            </CardBody>
          </Card>
          
          {(currentUser?.role === 'doctor' || 
            currentUser?.role === 'administrador' || 
            currentUser?.role === 'director') && (
            <div className="mt-2">
              <Button
                color="primary"
                fullWidth
                onClick={() => handleVerPacientes(null, centro)}
              >
                Ver Pacientes
              </Button>
            </div>
          )}
        </div>
      ))}
=======
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
>>>>>>> develop
    </div>
  );
};

export default CentrosList;