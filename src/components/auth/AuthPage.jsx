// src/components/auth/AuthPage.jsx
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardBody, 
  CardHeader, 
  Input, 
  Button, 
  Tabs, 
  Tab, 
  Select, 
  SelectItem,
  Divider,
  Link,
  Checkbox
} from "@nextui-org/react";
import { EyeIcon, EyeSlashIcon } from './Icons';
import usuariosService from '../../services/usuariosService';

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
    telefono: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

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
    
    if (!isLogin && !acceptTerms) {
      setError('Debes aceptar los términos y condiciones para registrarte');
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        // Clear token before login to avoid sending stale token
        localStorage.removeItem('authToken');
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
        if (formData.password !== formData.confirmPassword) {
          setError('Las contraseñas no coinciden');
          return;
        }

        if (formData.password.length < 6) {
          setError('La contraseña debe tener al menos 6 caracteres');
          return;
        }

        const newUser = {
          username: formData.username,
          password: formData.password,
          role: formData.role,
          name: formData.name,
          email: formData.email,
          cedula: formData.cedula,
          telefono: formData.telefono,
        };

        const savedUser = await usuariosService.saveUsuario(newUser);
        onLogin(savedUser);
      }
    } catch (err) {
      setError(err.message || 'Error en el servidor. Intenta nuevamente.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setError('');
  };

  const togglePasswordVisibility = () => setIsPasswordVisible(!isPasswordVisible);
  const toggleConfirmPasswordVisibility = () => setIsConfirmPasswordVisible(!isConfirmPasswordVisible);

  const handleTabChange = (key) => {
    setIsLogin(key === "login");
    setError('');
    if (key === "login") {
      setFormData({ ...formData, username: '', password: '' });
    } else {
      setFormData({
        username: '',
        password: '',
        confirmPassword: '',
        name: '',
        email: '',
        role: 'padre',
        cedula: '',
        telefono: '',
      });
      setAcceptTerms(false);
    }
  };

  const roleDescriptions = {
    padre: {
      icon: '👨‍👩‍👧‍👦',
      title: 'Padre/Tutor',
      description: 'Accede al historial de vacunación de tus hijos y programa citas en centros de vacunación.'
    },
    doctor: {
      icon: '🩺',
      title: 'Doctor',
      description: 'Gestiona pacientes, registra vacunaciones y administra citas en los centros asignados.'
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <Button
            onClick={onBack}
            variant="light"
            startContent={<span>←</span>}
            className="absolute left-0 top-0"
            title="Volver a la página principal"
          >
            Volver
          </Button>
          <Button
            onClick={() => setDarkMode(!darkMode)}
            isIconOnly
            variant="light"
            className="absolute right-0 top-0"
            title={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            {darkMode ? '☀️' : '🌙'}
          </Button>
          <h1 className="text-4xl font-bold mb-2">Sistema de Vacunación</h1>
          <p className="text-lg text-default-500">Gestión integral de centros de vacunación y pacientes</p>
        </div>

        <div className="auth-content">
          <Card className="auth-card w-full max-w-md">
            <CardHeader className="pb-0 pt-4 px-4 flex-col items-start">
              <Tabs 
                fullWidth 
                size="lg" 
                aria-label="Opciones de autenticación"
                selectedKey={isLogin ? "login" : "register"}
                onSelectionChange={handleTabChange}
              >
                <Tab key="login" title="Iniciar Sesión" />
                <Tab key="register" title="Registrarse" />
              </Tabs>
            </CardHeader>

            <CardBody className="py-5 px-6">
              {error && (
                <div className="bg-danger-50 border-l-4 border-danger text-danger p-3 rounded-lg mb-4 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {isLogin ? (
                  <>
                    <Input
                      label="Usuario"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="Ingresa tu nombre de usuario"
                      variant="bordered"
                      fullWidth
                      required
                      startContent={<span className="text-default-400">👤</span>}
                    />

                    <Input
                      label="Contraseña"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Ingresa tu contraseña"
                      type={isPasswordVisible ? "text" : "password"}
                      variant="bordered"
                      fullWidth
                      required
                      startContent={<span className="text-default-400">🔒</span>}
                      endContent={
                        <button 
                          type="button" 
                          onClick={togglePasswordVisibility}
                          className="focus:outline-none"
                        >
                          {isPasswordVisible ? (
                            <EyeSlashIcon className="text-default-400 w-5 h-5" />
                          ) : (
                            <EyeIcon className="text-default-400 w-5 h-5" />
                          )}
                        </button>
                      }
                    />

                    <div className="flex justify-between items-center">
                      <Checkbox size="sm">Recordarme</Checkbox>
                      <Link href="#" size="sm">¿Olvidaste tu contraseña?</Link>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Nombre Completo"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Tu nombre completo"
                        variant="bordered"
                        fullWidth
                        required
                      />
                      <Input
                        label="Cédula"
                        name="cedula"
                        value={formData.cedula}
                        onChange={handleChange}
                        placeholder="000-0000000-0"
                        variant="bordered"
                        fullWidth
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="tu@email.com"
                        type="email"
                        variant="bordered"
                        fullWidth
                        required
                      />
                      <Input
                        label="Teléfono"
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleChange}
                        placeholder="(809) 000-0000"
                        variant="bordered"
                        fullWidth
                        required
                      />
                    </div>

                    <Input
                      label="Usuario"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="Nombre de usuario único"
                      variant="bordered"
                      fullWidth
                      required
                      startContent={<span className="text-default-400">👤</span>}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Contraseña"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Mínimo 6 caracteres"
                        type={isPasswordVisible ? "text" : "password"}
                        variant="bordered"
                        fullWidth
                        required
                        endContent={
                          <button 
                            type="button" 
                            onClick={togglePasswordVisibility}
                            className="focus:outline-none"
                          >
                            {isPasswordVisible ? (
                              <EyeSlashIcon className="text-default-400 w-5 h-5" />
                            ) : (
                              <EyeIcon className="text-default-400 w-5 h-5" />
                            )}
                          </button>
                        }
                      />
                      <Input
                        label="Confirmar Contraseña"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Repite tu contraseña"
                        type={isConfirmPasswordVisible ? "text" : "password"}
                        variant="bordered"
                        fullWidth
                        required
                        endContent={
                          <button 
                            type="button" 
                            onClick={toggleConfirmPasswordVisibility}
                            className="focus:outline-none"
                          >
                            {isConfirmPasswordVisible ? (
                              <EyeSlashIcon className="text-default-400 w-5 h-5" />
                            ) : (
                              <EyeIcon className="text-default-400 w-5 h-5" />
                            )}
                          </button>
                        }
                      />
                    </div>

                    <Select
                      label="Tipo de Usuario"
                      name="role"
                      value={formData.role}
                      onChange={(e) => handleChange({target: {name: 'role', value: e.target.value}})}
                      variant="bordered"
                      fullWidth
                    >
                      <SelectItem key="padre" value="padre" startContent={<span>👨‍👩‍👧‍👦</span>}>
                        Padre/Tutor
                      </SelectItem>
                      <SelectItem key="doctor" value="doctor" startContent={<span>🩺</span>}>
                        Doctor
                      </SelectItem>
                    </Select>

                    {formData.role && (
                      <div className="bg-default-50 p-3 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xl">{roleDescriptions[formData.role].icon}</span>
                          <h4 className="text-md font-semibold">{roleDescriptions[formData.role].title}</h4>
                        </div>
                        <p className="text-sm text-default-500">{roleDescriptions[formData.role].description}</p>
                      </div>
                    )}

                    <Checkbox 
                      isSelected={acceptTerms}
                      onValueChange={setAcceptTerms}
                      size="sm"
                    >
                      Acepto los <Link href="#" size="sm">términos y condiciones</Link> y la <Link href="#" size="sm">política de privacidad</Link>
                    </Checkbox>
                  </>
                )}

                <Divider className="my-4" />

                <Button
                  type="submit"
                  color="primary"
                  fullWidth
                  isLoading={loading}
                  isDisabled={!isLogin && !acceptTerms}
                  className="font-semibold"
                  size="lg"
                >
                  {loading ? 'Procesando...' : (isLogin ? 'Iniciar Sesión' : 'Registrarse')}
                </Button>

                {isLogin && (
                  <div className="text-center mt-4">
                    <p className="text-sm text-default-500">
                      ¿No tienes una cuenta? 
                      <Button 
                        variant="light" 
                        className="ml-1 p-0" 
                        onClick={() => handleTabChange("register")}
                      >
                        Regístrate aquí
                      </Button>
                    </p>
                  </div>
                )}
              </form>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;