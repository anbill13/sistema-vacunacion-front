import React from "react";
import RegistroForm from "./forms/RegistroForm";
import { useData } from '../../contexts/DataContext';
<<<<<<< HEAD
import { Card, CardBody } from "@nextui-org/react";
=======
>>>>>>> develop

function NinosList() {
  const { handleNinoAdd, handleTutorAdd, centrosVacunacion } = useData();
  
  return (
<<<<<<< HEAD
    <div className="max-w-4xl mx-auto py-8">
      <h2 className="text-2xl font-bold text-center mb-6">Registro de Niños</h2>
      <Card shadow="sm">
        <CardBody className="p-6">
=======
    <div className="container mt-4">
      <h2 className="text-center mb-4">Registro de Niños</h2>
      <div className="row justify-content-center">
        <div className="col-md-8">
>>>>>>> develop
          <RegistroForm 
            tipo="nino" 
            onClose={() => {}} 
            onNinoAdd={handleNinoAdd} 
            onTutorAdd={handleTutorAdd} 
            centros={centrosVacunacion} 
          />
<<<<<<< HEAD
        </CardBody>
      </Card>
=======
        </div>
      </div>
>>>>>>> develop
    </div>
  );
}

export default NinosList;