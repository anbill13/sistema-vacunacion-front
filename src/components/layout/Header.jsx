import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import UserInfo from '../auth/UserInfo';
<<<<<<< HEAD
import { Navbar, NavbarBrand, NavbarContent, Switch } from "@nextui-org/react";
import { SunIcon, MoonIcon } from './Icons';
=======
>>>>>>> develop

const Header = ({ onShowLogin }) => {
  const { darkMode, toggleDarkMode } = useTheme();
  const { currentUser, handleLogout } = useAuth();

  return (
<<<<<<< HEAD
    <Navbar 
      className="shadow-md" 
      maxWidth="full" 
      position="static"
      isBordered
    >
      <NavbarBrand>
        <div className="flex items-center gap-3">
          <span className="text-2xl">💉</span>
          <div>
            <p className="font-bold text-inherit text-xl">Sistema de Vacunación</p>
            <p className="text-sm text-default-500">Gestión integral de centros de vacunación y pacientes</p>
          </div>
        </div>
      </NavbarBrand>

      <NavbarContent justify="end">
        <UserInfo 
          user={currentUser}
          onLogout={handleLogout}
          onShowLogin={onShowLogin}
        />
        <Switch
          checked={darkMode}
          onChange={toggleDarkMode}
          size="lg"
          color="secondary"
          startContent={<SunIcon />}
          endContent={<MoonIcon />}
        />
      </NavbarContent>
    </Navbar>
=======
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
>>>>>>> develop
  );
};

export default Header;