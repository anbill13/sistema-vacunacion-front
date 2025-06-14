import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const Navigation = ({ activeTab, setActiveTab }) => {
  const { currentUser } = useAuth();

  return (
    <div className="modern-navigation mb-4">
      <div className="nav-container">
        <button
          className={`nav-item ${activeTab === "centros" ? "active" : ""}`}
          onClick={() => setActiveTab("centros")}
        >
          <span className="nav-icon">🏥</span>
          <span className="nav-text">Centros de Vacunación</span>
        </button>
        
        {(currentUser?.role === 'doctor' || currentUser?.role === 'administrador' || currentUser?.role === 'director') && (
          <button
            className={`nav-item ${activeTab === "pacientes" ? "active" : ""}`}
            onClick={() => setActiveTab("pacientes")}
          >
            <span className="nav-icon">👥</span>
            <span className="nav-text">Gestión de Pacientes</span>
          </button>
        )}
        
        {currentUser?.role === 'director' && (
          <button
            className={`nav-item ${activeTab === "mis-centros" ? "active" : ""}`}
            onClick={() => setActiveTab("mis-centros")}
          >
            <span className="nav-icon">🏥</span>
            <span className="nav-text">Mis Centros</span>
          </button>
        )}
        
        {currentUser?.role === 'padre' && (
          <button
            className={`nav-item ${activeTab === "mis-hijos" ? "active" : ""}`}
            onClick={() => setActiveTab("mis-hijos")}
          >
            <span className="nav-icon">👶</span>
            <span className="nav-text">Mis Hijos</span>
          </button>
        )}
        
        {currentUser?.role === 'administrador' && (
          <button
            className={`nav-item ${activeTab === "admin" ? "active" : ""}`}
            onClick={() => setActiveTab("admin")}
          >
            <span className="nav-icon">⚙️</span>
            <span className="nav-text">Administración</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default Navigation;