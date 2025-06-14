import React, { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader } from '../ui/Card';
import Button from '../ui/Button';

const AuthPage = ({ onLogin, onBack }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    name: '',
    email: '',
    role: 'padre', // Siempre será padre
    cedula: '',
    telefono: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Usuarios predefinidos para el demo
  const users = [
    { username: 'admin', password: 'admin123', role: 'administrador', name: 'Administrador Sistema', email: 'admin@sistema.com' },
    { username: 'director1', password: 'director123', role: 'director', name: 'Dr. Roberto Méndez', email: 'roberto.mendez@centros.com', centrosAsignados: [1, 2] },
    { username: 'director2', password: 'director123', role: 'director', name: 'Dra. Carmen Jiménez', email: 'carmen.jimenez@centros.com', centrosAsignados: [3, 4, 5] },
    { username: 'director3', password: 'director123', role: 'director', name: 'Dr. Luis Fernández', email: 'luis.fernandez@centro.com', centrosAsignados: [6] },
    { username: 'doctor1', password: 'doctor123', role: 'doctor', name: 'Dr. Juan Pérez', email: 'juan.perez@hospital.com', centroTrabajo: 1 },
    { username: 'doctor2', password: 'doctor123', role: 'doctor', name: 'Dra. María González', email: 'maria.gonzalez@clinica.com', centroTrabajo: 2 },
    { username: 'doctor3', password: 'doctor123', role: 'doctor', name: 'Dr. Pedro Ramírez', email: 'pedro.ramirez@centro.com', centroTrabajo: 1 },
    { username: 'doctor4', password: 'doctor123', role: 'doctor', name: 'Dra. Ana Morales', email: 'ana.morales@centro.com', centroTrabajo: 3 },
    { username: 'doctor5', password: 'doctor123', role: 'doctor', name: 'Dr. Carlos Vega', email: 'carlos.vega@centro.com', centroTrabajo: 4 },
    { username: 'doctor6', password: 'doctor123', role: 'doctor', name: 'Dra. Laura Díaz', email: 'laura.diaz@centro.com', centroTrabajo: 5 },
    { username: 'padre1', password: 'padre123', role: 'padre', name: 'Carlos Rodríguez', email: 'carlos.rodriguez@email.com' },
    { username: 'padre2', password: 'padre123', role: 'padre', name: 'Ana Martínez', email: 'ana.martinez@email.com' }
  ];

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
        // Proceso de login
        const user = users.find(u => 
          u.username === formData.username && 
          u.password === formData.password
        );

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

        if (users.find(u => u.username === formData.username)) {
          setError('El nombre de usuario ya existe');
          return;
        }

        // Simular registro exitoso
        const newUser = {
          username: formData.username,
          password: formData.password,
          role: formData.role,
          name: formData.name,
          email: formData.email,
          cedula: formData.cedula,
          telefono: formData.telefono
        };

        // En una aplicación real, aquí enviarías los datos al servidor
        console.log('Nuevo usuario registrado:', newUser);
        
        // Auto-login después del registro
        onLogin(newUser);
      }
    } catch (err) {
      setError('Error en el servidor. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'administrador':
        return 'Administrador del Sistema - Acceso completo';
      case 'director':
        return 'Director de Centro - Gestiona un centro específico';
      case 'doctor':
        return 'Doctor/Médico - Gestiona pacientes';
      case 'padre':
        return 'Padre/Tutor - Ve información de sus hijos';
      default:
        return role;
    }
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
{/*
                    <div className="form-group">
                      <input
                        type="hidden"
                        name="role"
                        value="padre"
                     />
                      <div className="role-info-box">
                        <div className="role-info-header">
                          <span className="role-icon">👨‍👩‍👧‍👦</span>
                           <h4>Registro como {getRoleLabel(formData.role).split(' - ')[0]}</h4>
                        </div>
                        <p className="role-description">
                          {getRoleLabel(formData.role).includes(' - ') 
                            ? getRoleLabel(formData.role).split(' - ')[1] 
                            : 'Al registrarte como padre o tutor, podrás gestionar la información de vacunación de tus hijos, recibir recordatorios de vacunas pendientes y acceder al historial médico.'}
                        </p>
                      </div>
                    </div>
*/}
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