// src/components/layout/Navigation.jsx
import React from "react";
import { useAuth } from "../../context/AuthContext";
import { Tabs, Tab, Badge } from "@nextui-org/react";
import useNotificaciones from "../../hooks/useNotificaciones";

const Navigation = ({ activeTab, setActiveTab }) => {
  const { currentUser } = useAuth();
  const { resumen: notificacionesResumen } = useNotificaciones();

  // Define all possible tabs
  const tabs = [
    {
      id: "centros",
      label: "Centros de Vacunación",
      icon: "🏥",
      roles: ["all"],
    },
    {
      id: "pacientes",
      label: "Gestión de Pacientes",
      icon: "👥",
      roles: ["administrador", "director"],
    },
    {
      id: "doctor",
      label: "Panel del Doctor",
      icon: "👨‍⚕️",
      roles: ["doctor"],
    },
    {
      id: "mis-centros",
      label: "Mis Centros",
      icon: "🏥",
      roles: ["director"],
    },
    {
      id: "mis-hijos",
      label: "Mis Hijos",
      icon: "👶",
      roles: ["padre"],
    },
    {
      id: "admin",
      label: "Administración",
      icon: "⚙️",
      roles: ["administrador"],
    },
  ];

  // Filter tabs based on user role
  const filteredTabs = tabs.filter(
    (tab) =>
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
          tabList:
            "gap-6 w-full relative rounded-none p-0 border-b border-divider",
          cursor: "w-full bg-primary",
          tab: "max-w-fit px-2 h-12",
          tabContent: "group-data-[selected=true]:text-primary",
        }}
      >
        {filteredTabs.map((tab) => (
          <Tab
            key={tab.id}
            title={
              <div className="flex items-center space-x-2">
                <span className="text-lg">{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.id === "mis-hijos" &&
                  notificacionesResumen.noLeidas > 0 && (
                    <Badge
                      color="danger"
                      content={notificacionesResumen.noLeidas}
                      size="sm"
                      className="ml-1"
                    />
                  )}
              </div>
            }
          />
        ))}
      </Tabs>
    </div>
  );
};

export default Navigation;
