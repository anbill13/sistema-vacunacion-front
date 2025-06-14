import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import UserInfo from '../auth/UserInfo';

const Header = ({ onShowLogin }) => {
  const { darkMode, toggleDarkMode } = useTheme();
  const { currentUser, handleLogout } = useAuth();

  return (
    <div className="modern-header">
      <div className="header-content">
        <div className="header-title-group">
          <div className="header-logo">
            <span className="logo-icon">💉</span>
          </div>
          <div className="header-text">
            <h1>Sistema de Vacunación</h1>
            <p>Gestión integral de centros de vacunación y pacientes</p>
          </div>
        </div>
        <div className="header-actions">
          <UserInfo 
            user={currentUser}
            onLogout={handleLogout}
            onShowLogin={onShowLogin}
          />
          <button
            onClick={toggleDarkMode}
            className="dark-mode-toggle"
            title={darkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            aria-label={darkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          >
            {darkMode ? "☀️" : "🌙"}
          </button>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="header-decoration header-decoration-1"></div>
      <div className="header-decoration header-decoration-2"></div>
    </div>
  );
};

export default Header;