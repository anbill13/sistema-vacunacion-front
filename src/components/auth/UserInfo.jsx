import React, { useState } from 'react';
import { Button, Chip, User, Popover, PopoverTrigger, PopoverContent } from '@nextui-org/react';
import { useData } from '../../context/DataContext';

const UserInfo = ({ user, onLogout, onShowLogin }) => {
  const { centrosVacunacion } = useData();

  let centrosDelDoctor = [];
  if (user && user.rol === 'doctor') { // Cambiado de role a rol
    if (Array.isArray(user.centrosAsignados) && user.centrosAsignados.length > 0) {
      centrosDelDoctor = centrosVacunacion.filter(c => user.centrosAsignados.includes(c.id_centro));
    } else if (user.id_centro) {
      centrosDelDoctor = centrosVacunacion.filter(c => String(c.id_centro) === String(user.id_centro));
    }
  }

  const [centrosPopoverOpen, setCentrosPopoverOpen] = useState(false);

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

  // Validación para el avatarProps usando username como fallback
  const getAvatarInitial = () => {
    if (!user) return '';
    return (user.name || user.username || '').charAt(0).toUpperCase();
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
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <User
        name={user.name || user.username || 'Invitado'} // Usa username como fallback
        description={
          <Chip
            color={getRoleColor(user.rol)} // Cambiado de role a rol
            variant="flat"
            startContent={<span className="mr-1">{getRoleIcon(user.rol)}</span>} // Cambiado de role a rol
            size="sm"
          >
            {getRoleLabel(user.rol)}
          </Chip>
        }
        avatarProps={{
          src: user.avatar || '', // Valor por defecto si avatar es undefined
          name: getAvatarInitial(), // Usa la función validada
          color: getRoleColor(user.rol), // Cambiado de role a rol
        }}
        className="transition-transform"
      />
      <Button color="danger" variant="flat" onClick={onLogout} size="sm">
        Cerrar Sesión
      </Button>
      {user && user.rol === 'doctor' && ( // Cambiado de role a rol
        <Popover
          isOpen={centrosPopoverOpen}
          onOpenChange={setCentrosPopoverOpen}
          placement="bottom"
        >
          <PopoverTrigger>
            <Button color="primary" variant="flat" size="sm">
              Ver centros donde trabajo
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-4 min-w-[250px]">
            <div className="font-bold mb-2">Centros donde trabajas</div>
            {centrosDelDoctor.length === 0 ? (
              <p className="text-default-500">No tienes centros asignados.</p>
            ) : (
              <ul className="list-disc ml-6">
                {centrosDelDoctor.map(centro => (
                  <li key={centro.id_centro}>
                    <span className="font-semibold">{centro.nombre_centro}</span>{' '}
                    <span className="text-default-400">({centro.direccion})</span>
                  </li>
                ))}
              </ul>
            )}
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};

export default UserInfo;