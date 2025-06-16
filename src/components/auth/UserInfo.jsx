import React from 'react';
import { Button, Chip, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, User } from "@nextui-org/react";

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
        return 'danger';
      case 'doctor':
        return 'primary';
      case 'padre':
        return 'success';
      default:
        return 'default';
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
      <Button 
        color="primary" 
        variant="flat"
        startContent={<span>🔐</span>}
        onClick={onShowLogin}
      >
        Iniciar Sesión
      </Button>
    );
  }

  return (
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
  );
};

export default UserInfo;