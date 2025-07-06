// src/components/doctores/DoctorPage.jsx
import React from 'react';
import GestionPacientes from '../pacientes/GestionPacientes';

const DoctorPage = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          👨‍⚕️ Panel del Doctor
        </h1>
        <p className="text-gray-600">
          Gestión integral de pacientes y seguimiento de vacunación
        </p>
      </div>

      {/* Componente de gestión de pacientes directamente */}
      <GestionPacientes />
    </div>
  );
};

export default DoctorPage;