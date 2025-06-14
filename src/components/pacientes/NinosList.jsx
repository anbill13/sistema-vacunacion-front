import React from "react";
import RegistroForm from "./forms/RegistroForm";
import { useData } from '../../contexts/DataContext';

function NinosList() {
  const { handleNinoAdd, handleTutorAdd, centrosVacunacion } = useData();
  
  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">Registro de Niños</h2>
      <div className="row justify-content-center">
        <div className="col-md-8">
          <RegistroForm 
            tipo="nino" 
            onClose={() => {}} 
            onNinoAdd={handleNinoAdd} 
            onTutorAdd={handleTutorAdd} 
            centros={centrosVacunacion} 
          />
        </div>
      </div>
    </div>
  );
}

export default NinosList;