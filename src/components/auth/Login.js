import React, { useState } from 'react';
import { ModalHeader, ModalBody } from '../ui/Modal';

const Login = ({ isOpen, onClose, onLogin }) => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
    role: 'doctor'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Usuarios predefinidos para el demo
  const users = [
    { username: 'admin', password: 'admin123', role: 'administrador', name: 'Administrador Sistema' },
    { username: 'director1', password: 'director123', role: 'director', name: 'Dr. Roberto Méndez' },
    { username: 'doctor1', password: 'doctor123', role: 'doctor', name: 'Dr. Juan Pérez' },
    { username: 'doctor2', password: 'doctor123', role: 'doctor', name: 'Dra. María González' },
    { username: 'padre1', password: 'padre123', role: 'padre', name: 'Carlos Rodríguez' },
    { username: 'padre2', password: 'padre123', role: 'padre', name: 'Ana Martínez' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simular un pequeño retraso para mostrar el estado de carga
    setTimeout(() => {
      const user = users.find(u => 
        u.username === credentials.username && 
        u.password === credentials.password
      );

      if (user) {
        if (typeof onLogin === 'function') {
          onLogin(user);
          if (onClose) onClose();
        } else {
          console.error('onLogin is not a function');
          setError('Error en el sistema. Intente nuevamente.');
        }
      } else {
        setError('Usuario o contraseña incorrectos');
      }
      setLoading(false);
    }, 800);
  };

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  return (
    <>
      <ModalHeader>
        <div className="modal-header-content">
          <h4>Iniciar Sesión</h4>
          {onClose && (
            <button 
              className="modal-close-btn"
              onClick={onClose}
              aria-label="Cerrar modal"
            >
              ✕
            </button>
          )}
        </div>
      </ModalHeader>
      <ModalBody>
        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="username">Usuario</label>
            <input
              type="text"
              id="username"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              placeholder="Ingresa tu nombre de usuario"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              placeholder="Ingresa tu contraseña"
              required
            />
          </div>
          
          <div className="demo-users">
            <h4>Usuarios de prueba:</h4>
            <div className="demo-user-list">
              <div><strong>Admin:</strong> admin / admin123</div>
              <div><strong>Director:</strong> director1 / director123</div>
              <div><strong>Doctor:</strong> doctor1 / doctor123</div>
              <div><strong>Padre:</strong> padre1 / padre123</div>
            </div>
          </div>
          
          <button 
            type="submit" 
            className="auth-submit-btn"
            disabled={loading}
          >
            {loading ? 'Procesando...' : 'Iniciar Sesión'}
          </button>
        </form>
      </ModalBody>
    </>
  );
};

export default Login;