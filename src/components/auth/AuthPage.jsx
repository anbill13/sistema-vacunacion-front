import React, { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader } from '../ui/Card';
import Button from '../ui/Button';
import { usuariosService } from '../../services/usuariosService';

const AuthPage = ({ isOpen = true, onClose, onLogin, onBack }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    name: '',
    email: '',
    role: 'padre',
    cedula: '',
    telefono: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Dark mode effects
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('publicDarkMode');
    if (savedDarkMode) {
      setDarkMode(JSON.parse(savedDarkMode));
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    localStorage.setItem('publicDarkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // Proceso de login usando usuariosService
        const user = await usuariosService.validateLogin(formData.username, formData.password);

        if (user) {
          if (typeof onLogin === 'function') {
            onLogin(user);
          } else {
            console.error('onLogin is not a function');
          }
        } else {
          setError('Usuario o contraseña incorrectos');
        }
      } else {
        // Proceso de registro
        if (formData.password !== formData.confirmPassword) {
          setError('Las contraseñas no coinciden');
          return;
        }

        if (formData.password.length < 6) {
          setError('La contraseña debe tener al menos 6 caracteres');
          return;
        }

        // Verificar si el usuario ya existe usando el servicio
        const existingUsers = await usuariosService.getUsuarios();
        if (existingUsers.find(u => u.username === formData.username)) {
          setError('El nombre de usuario ya existe');
          return;
        }

        try {
          // Crear nuevo usuario y guardarlo usando usuariosService
          const newUser = {
            username: formData.username,
            password: formData.password,
            role: formData.role,
            name: formData.name,
            email: formData.email,
            cedula: formData.cedula,
            telefono: formData.telefono,
            id: `user-${Date.now()}`
          };

          // Guardar usuario en localStorage
          const savedUser = await usuariosService.saveUsuario(newUser);
          
          // Auto-login después del registro exitoso
          onLogin(savedUser);
        } catch (err) {
          setError('Error al guardar el usuario. Intenta nuevamente.');
          console.error('Error en registro:', err);
        }
      }
    } catch (err) {
      setError('Error en el servidor. Intenta nuevamente.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Limpiar mensajes de error cuando el usuario comienza a escribir
    setError('');
  };


  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <button 
            onClick={onBack}
            className="back-button"
            title="Volver a la página principal"
          >
            ← Volver
          </button>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="dark-mode-toggle-auth"
            title={darkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          >
            {darkMode ? "☀️" : "🌙"}
          </button>
          <h1>Sistema de Vacunación</h1>
          <p>Gestión integral de centros de vacunación y pacientes</p>
        </div>

        <div className="auth-content">
          <Card className="auth-card">
            <CardHeader>
              <div className="auth-tabs">
                <button
                  className={`auth-tab ${isLogin ? 'active' : ''}`}
                  onClick={() => {
                    setIsLogin(true);
                    setError('');
                    setFormData({ ...formData, username: '', password: '' });
                  }}
                >
                  Iniciar Sesión
                </button>
                <button
                  className={`auth-tab ${!isLogin ? 'active' : ''}`}
                  onClick={() => {
                    setIsLogin(false);
                    setError('');
                    setFormData({
                      username: '',
                      password: '',
                      confirmPassword: '',
                      name: '',
                      email: '',
                      role: 'padre', // Mantener como padre
                      cedula: '',
                      telefono: ''
                    });
                  }}
                >
                  Registrarse
                </button>
              </div>
            </CardHeader>

            <CardBody>
              <form onSubmit={handleSubmit} className="auth-form">
                {error && (
                  <div className="error-message">
                    {error}
                  </div>
                )}

                {isLogin ? (
                  // Formulario de Login
                  <>
                    <div className="form-group">
                      <label>Usuario</label>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="Ingresa tu nombre de usuario"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Contraseña</label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Ingresa tu contraseña"
                        required
                      />
                    </div>

                    <div className="demo-users">
                      <h4>Usuarios de prueba:</h4>
                      <div className="demo-user-list">
                        <div><strong>Admin:</strong> admin / admin123</div>
                        <div><strong>Director:</strong> director1 / director123 (Centros 1,2)</div>
                        <div><strong>Doctor:</strong> doctor1 / doctor123</div>
                        <div><strong>Padre:</strong> padre1 / padre123</div>
                      </div>
                    </div>
                  </>
                ) : (
                  // Formulario de Registro
                  <>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Nombre Completo</label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Tu nombre completo"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Cédula</label>
                        <input
                          type="text"
                          name="cedula"
                          value={formData.cedula}
                          onChange={handleChange}
                          placeholder="000-0000000-0"
                          required
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Email</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="tu@email.com"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Teléfono</label>
                        <input
                          type="tel"
                          name="telefono"
                          value={formData.telefono}
                          onChange={handleChange}
                          placeholder="(809) 000-0000"
                          required
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Usuario</label>
                        <input
                          type="text"
                          name="username"
                          value={formData.username}
                          onChange={handleChange}
                          placeholder="Nombre de usuario único"
                          required
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Contraseña</label>
                        <input
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="Mínimo 6 caracteres"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Confirmar Contraseña</label>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          placeholder="Repite tu contraseña"
                          required
                        />
                      </div>
                    </div>
                  </>
                )}

                <Button
                  type="submit"
                  className="auth-submit-btn"
                  disabled={loading}
                >
                  {loading ? 'Procesando...' : (isLogin ? 'Iniciar Sesión' : 'Registrarse')}
                </Button>
              </form>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;