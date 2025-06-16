import React from "react";
import RegistroForm from "./forms/RegistroForm";
import { useData } from '../../contexts/DataContext';
import { Card, CardBody } from "@nextui-org/react";

function NinosList() {
  const { handleNinoAdd, handleTutorAdd, centrosVacunacion } = useData();
  
  return (
    <div className="max-w-4xl mx-auto py-8">
      <h2 className="text-2xl font-bold text-center mb-6">Registro de Niños</h2>
      <Card shadow="sm">
        <CardBody className="p-6">
          <RegistroForm 
            tipo="nino" 
            onClose={() => {}} 
            onNinoAdd={handleNinoAdd} 
            onTutorAdd={handleTutorAdd} 
            centros={centrosVacunacion} 
          />
        </CardBody>
      </Card>
    </div>
  );
}

export default NinosList;