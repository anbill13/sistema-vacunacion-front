import React from 'react';
<<<<<<< HEAD
import { Button, Chip, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, User } from "@nextui-org/react";
=======
>>>>>>> develop

const UserInfo = ({ user, onLogout, onShowLogin }) => {
  const getRoleIcon = (role) => {
    switch (role) {
      case 'administrador':
        return '👑';
      case 'doctor':
        return '🩺';
      case 'padre':
        return '👨‍👩‍👧‍👦';
      default:
        return '👤';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'administrador':
<<<<<<< HEAD
        return 'danger';
      case 'doctor':
        return 'primary';
      case 'padre':
        return 'success';
      default:
        return 'default';
=======
        return 'bg-gradient-to-r from-red-500 to-pink-500';
      case 'doctor':
        return 'bg-gradient-to-r from-blue-500 to-indigo-500';
      case 'padre':
        return 'bg-gradient-to-r from-green-500 to-emerald-500';
      default:
        return 'bg-gradient-to-r from-gray-500 to-slate-500';
>>>>>>> develop
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'administrador':
        return 'Administrador';
      case 'doctor':
        return 'Doctor';
      case 'padre':
        return 'Padre/Tutor';
      default:
        return role;
    }
  };

  if (!user) {
    return (
<<<<<<< HEAD
      <Button 
        color="primary" 
        variant="flat"
        startContent={<span>🔐</span>}
        onClick={onShowLogin}
      >
        Iniciar Sesión
      </Button>
=======
      <button 
        className="login-button"
        onClick={onShowLogin}
      >
        <span className="login-icon">🔐</span>
        <span>Iniciar Sesión</span>
      </button>
>>>>>>> develop
    );
  }

  return (
<<<<<<< HEAD
    <Dropdown placement="bottom-end">
      <DropdownTrigger>
        <User
          as="button"
          name={user.name}
          description={
            <Chip
              color={getRoleColor(user.role)}
              variant="flat"
              startContent={<span className="mr-1">{getRoleIcon(user.role)}</span>}
              size="sm"
            >
              {getRoleLabel(user.role)}
            </Chip>
          }
          avatarProps={{
            src: user.avatar,
            name: user.name.charAt(0).toUpperCase(),
            color: getRoleColor(user.role),
          }}
          className="transition-transform cursor-pointer"
        />
      </DropdownTrigger>
      <DropdownMenu aria-label="Acciones de usuario">
        <DropdownItem key="profile">Mi Perfil</DropdownItem>
        <DropdownItem key="settings">Configuración</DropdownItem>
        <DropdownItem key="logout" color="danger" onClick={onLogout}>
          Cerrar Sesión
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
=======
    <div className="user-info-container">
      <div className="user-avatar">
        {user.name.charAt(0).toUpperCase()}
      </div>
      <div className="user-details">
        <div className="user-name">{user.name}</div>
        <div className={`user-role-badge ${getRoleColor(user.role)}`}>
          <span className="role-icon">{getRoleIcon(user.role)}</span>
          <span className="role-text">{getRoleLabel(user.role)}</span>
        </div>
      </div>
      <button 
        className="logout-button"
        onClick={onLogout}
        aria-label="Cerrar sesión"
      >
        <span className="logout-icon">⎋</span>
      </button>
    </div>
>>>>>>> develop
  );
};

export default UserInfo;