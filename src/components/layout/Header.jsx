import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import UserInfo from '../auth/UserInfo';
import { Navbar, NavbarBrand, NavbarContent, Switch } from "@nextui-org/react";
import { SunIcon, MoonIcon } from './Icons';

const Header = ({ onShowLogin }) => {
  const { darkMode, toggleDarkMode } = useTheme();
  const { currentUser, handleLogout } = useAuth();

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