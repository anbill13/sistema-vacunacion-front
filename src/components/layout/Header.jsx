import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import UserInfo from '../auth/UserInfo';
import { Navbar, NavbarBrand, NavbarContent, Switch, Tooltip } from "@nextui-org/react";
import { SunIcon, MoonIcon } from './Icons';

const Header = ({ onShowLogin }) => {
  const { darkMode, toggleDarkMode } = useTheme();
  const { currentUser, handleLogout } = useAuth();
  
  // Estado para controlar si estamos online o no
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // Efecto para detectar cambios en la conexión
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
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
        <Tooltip content={isOnline ? "Conectado a internet" : "Sin conexión"}>
  <div className="flex items-center gap-2 mr-4 select-none">
    <span
      className={`inline-block w-2.5 h-2.5 rounded-full border border-gray-300 ${isOnline ? "bg-green-500" : "bg-gray-400"}`}
      aria-label={isOnline ? "Online" : "Offline"}
    />
    <span className={`text-xs font-medium ${isOnline ? "text-green-700" : "text-gray-500"}`}
      style={{ letterSpacing: "0.5px", textTransform: "lowercase" }}
    >
      {isOnline ? "online" : "offline"}
    </span>
  </div>
</Tooltip>
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
  );
};

export default Header;