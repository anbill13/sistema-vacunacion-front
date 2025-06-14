import React from 'react';

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
        return 'bg-gradient-to-r from-red-500 to-pink-500';
      case 'doctor':
        return 'bg-gradient-to-r from-blue-500 to-indigo-500';
      case 'padre':
        return 'bg-gradient-to-r from-green-500 to-emerald-500';
      default:
        return 'bg-gradient-to-r from-gray-500 to-slate-500';
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
      <button 
        className="login-button"
        onClick={onShowLogin}
      >
        <span className="login-icon">🔐</span>
        <span>Iniciar Sesión</span>
      </button>
    );
  }

  return (
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
  );
};

export default UserInfo;