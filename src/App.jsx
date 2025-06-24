// src/App.jsx
import React, { useState, Suspense, Component } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import "./App.css";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Contexts
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { DataProvider } from "./context/DataContext";

// Components
import Header from "./components/layout/Header";
import Navigation from "./components/layout/Navigation";
import CentrosPage from "./components/centros/CentrosPage";
import MisCentros from "./components/centros/MisCentros";
import GestionPacientes from "./components/pacientes/GestionPacientes";
import PublicPage from "./components/public/PublicPage";
import AuthPage from "./components/auth/AuthPage";
import AdminPage from "./components/admin/AdminPage";
import DoctorPage from "./components/doctores/DoctorPage";
import { Modal } from "./components/ui/Modal";

class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div>
          <h1>Algo salió mal.</h1>
          <p>{this.state.error.message}</p>
          <button onClick={() => this.setState({ hasError: false, error: null })}>
            Intentar de nuevo
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function AppContent({ activeTab, setActiveTab }) {
  const { currentUser, currentPage, handleLogin, showAuthPage, showPublicPage } = useAuth();
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = useState(false);

  React.useEffect(() => {
    if (currentPage === 'public' && window.location.pathname !== '/') navigate('/');
    if (currentPage === 'auth' && window.location.pathname !== '/auth') navigate('/auth');
    if (currentUser && window.location.pathname === '/auth') {
      const newTab = currentUser.role === 'administrador' ? 'admin' :
                     currentUser.role === 'director' ? 'mis-centros' :
                     currentUser.role === 'doctor' ? 'doctor' :
                     currentUser.role === 'padre' ? 'mis-hijos' : 'centros';
      setActiveTab(newTab);
      navigate('/dashboard');
    }
  }, [currentPage, currentUser, navigate, setActiveTab]);

  return (
    <Routes>
      <Route
        path="/"
        element={
          currentUser ? <Navigate to="/dashboard" replace /> : <PublicPage onShowAuth={showAuthPage} />
        }
      />
      <Route
        path="/auth"
        element={
          currentUser ? <Navigate to="/dashboard" replace /> : <AuthPage onBack={showPublicPage} onLogin={handleLogin} />
        }
      />
      <Route
        path="/dashboard"
        element={
          currentUser ? (
            <div className="container-fluid">
              <Header onShowLogin={() => setShowLoginModal(true)} />
              <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
              <div className="content-wrapper animate-fadeIn">
                {activeTab === "centros" && <CentrosPage />}
                {activeTab === "pacientes" && <GestionPacientes />}
                {activeTab === "mis-centros" && <MisCentros />}
                {activeTab === "admin" && <AdminPage />}
                {activeTab === "doctor" && <DoctorPage />}
                {activeTab === "mis-hijos" && (
                  <Suspense fallback={<div>Cargando...</div>}>
                    {require("./components/padres/MisHijos").default()}
                  </Suspense>
                )}
              </div>
              {showLoginModal && (
                <Modal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)}>
                  <AuthPage
                    isOpen={showLoginModal}
                    onClose={() => setShowLoginModal(false)}
                    onLogin={handleLogin}
                  />
                </Modal>
              )}
            </div>
          ) : (
            <Navigate to="/auth" replace />
          )
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  const [activeTab, setActiveTab] = useState("centros");

  return (
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <ErrorBoundary>
            <AppContent activeTab={activeTab} setActiveTab={setActiveTab} />
          </ErrorBoundary>
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;