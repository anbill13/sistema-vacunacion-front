import React, { useState } from "react";
import "./App.css";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Contexts
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { DataProvider } from "./contexts/DataContext";

// Components
import Header from "./components/layout/Header";
import Navigation from "./components/layout/Navigation";
import CentrosPage from "./components/centros/CentrosPage";
import MisCentros from "./components/centros/MisCentros";
import GestionPacientes from "./components/pacientes/GestionPacientes";
import PublicPage from "./components/public/PublicPage";
import AuthPage from "./components/auth/AuthPage";
import Login from "./components/auth/Login";
import AdminPage from "./components/admin/AdminPage";
import { Modal } from "./components/ui/Modal";

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function AppContent() {
  const [activeTab, setActiveTab] = useState("centros");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { currentPage, showAuthPage, showPublicPage, handleLogin } = useAuth();

  // Renderizado condicional basado en la página actual
  if (currentPage === 'public') {
    return (
      <PublicPage onShowAuth={showAuthPage} />
    );
  }

  if (currentPage === 'auth') {
    return (
      <AuthPage 
        onBack={showPublicPage}
        onLogin={handleLogin}
      />
    );
  }

  // Dashboard principal (solo para usuarios autenticados)
  return (
    <div className="container-fluid">
      {/* Header */}
      <Header onShowLogin={() => setShowLoginModal(true)} />

      {/* Navigation */}
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Content */}
      <div className="content-wrapper animate-fadeIn">
        {activeTab === "centros" && <CentrosPage />}
        
        {activeTab === "pacientes" && (
          <GestionPacientes />
        )}
        
        {activeTab === "mis-centros" && (
          <MisCentros />
        )}
        
        {activeTab === "admin" && (
          <AdminPage />
        )}

        {activeTab === "mis-hijos" && (
          <React.Suspense fallback={<div>Cargando...</div>}>
            {require("./components/padres/MisHijos").default()}
          </React.Suspense>
        )}
      </div>

      {/* Modal de Login */}
      {showLoginModal && (
        <Modal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)}>
          <Login 
            onClose={() => setShowLoginModal(false)} 
            onLogin={handleLogin}
          />
        </Modal>
      )}
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <AppContent />
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;