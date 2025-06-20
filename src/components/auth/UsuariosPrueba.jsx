// src/components/auth/UsuariosPrueba.jsx
import React, { useState } from 'react';
import authService from '../../services/authService';

const UsuariosPrueba = ({ onLoginSelect }) => {
  const [mostrarUsuarios, setMostrarUsuarios] = useState(false);
  
  const usuariosPrueba = authService.getTestUsers();

  const handleUsuarioClick = (usuario) => {
    if (onLoginSelect) {
      onLoginSelect(usuario.username, usuario.password);
    }
  };

  return (
    <div className="usuarios-prueba">
      <button
        onClick={() => setMostrarUsuarios(!mostrarUsuarios)}
        className="btn btn-sm btn-outline-info mb-3"
        type="button"
      >
        {mostrarUsuarios ? 'Ocultar' : 'Mostrar'} Usuarios de Prueba
      </button>
      
      {mostrarUsuarios && (
        <div className="card mb-3">
          <div className="card-header">
            <h6 className="mb-0">Usuarios de Prueba Disponibles</h6>
          </div>
          <div className="card-body">
            <div className="row">
              {usuariosPrueba.map((usuario, index) => (
                <div key={index} className="col-md-6 mb-2">
                  <div 
                    className="card bg-light cursor-pointer hover-shadow"
                    onClick={() => handleUsuarioClick(usuario)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="card-body p-2">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <strong>{usuario.username}</strong>
                          <br />
                          <small className="text-muted">
                            Rol: {usuario.rol}
                          </small>
                        </div>
                        <div className="text-end">
                          <small className="text-muted">
                            Click para usar
                          </small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="alert alert-info mt-3">
              <small>
                <strong>Nota:</strong> Haz click en cualquier usuario para llenar automáticamente 
                los campos de login. Estos son usuarios de prueba con datos del archivo JSON.
              </small>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsuariosPrueba;