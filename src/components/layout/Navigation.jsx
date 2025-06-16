import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
<<<<<<< HEAD
import { Tabs, Tab } from "@nextui-org/react";
=======
>>>>>>> develop

const Navigation = ({ activeTab, setActiveTab }) => {
  const { currentUser } = useAuth();

<<<<<<< HEAD
  // Define all possible tabs
  const tabs = [
    {
      id: "centros",
      label: "Centros de Vacunación",
      icon: "🏥",
      roles: ["all"] // Available for all users
    },
    {
      id: "pacientes",
      label: "Gestión de Pacientes",
      icon: "👥",
      roles: ["doctor", "administrador", "director"]
    },
    {
      id: "mis-centros",
      label: "Mis Centros",
      icon: "🏥",
      roles: ["director"]
    },
    {
      id: "mis-hijos",
      label: "Mis Hijos",
      icon: "👶",
      roles: ["padre"]
    },
    {
    id: "admin",
      label: "Administración",
      icon: "⚙️",
      roles: ["administrador"]
    }
  ];

  // Filter tabs based on user role
  const filteredTabs = tabs.filter(tab => 
    tab.roles.includes("all") || 
    (currentUser?.role && tab.roles.includes(currentUser.role))
  );

  return (
    <div className="w-full px-4 py-2">
      <Tabs 
        aria-label="Navegación principal"
        selectedKey={activeTab}
        onSelectionChange={setActiveTab}
        color="primary"
        variant="underlined"
          classNames={{
          tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
          cursor: "w-full bg-primary",
          tab: "max-w-fit px-2 h-12",
          tabContent: "group-data-[selected=true]:text-primary"
        }}
      >
        {filteredTabs.map((tab) => (
          <Tab
            key={tab.id}
            title={
              <div className="flex items-center space-x-2">
                <span className="text-lg">{tab.icon}</span>
                <span>{tab.label}</span>
              </div>
            }
          />
        ))}
      </Tabs>
=======
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
>>>>>>> develop
    </div>
  );
};

export default Navigation;