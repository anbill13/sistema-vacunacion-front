import React, { useState } from 'react';
import { ModalHeader, ModalBody, ModalFooter } from '../ui/Modal';
import { Input, Button, Card, CardBody, Chip } from "@nextui-org/react";

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
        Iniciar Sesión
      </ModalHeader>
      <ModalBody>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Chip color="danger" variant="flat" className="w-full">
              {error}
            </Chip>
          )}
          
          <Input
            label="Usuario"
            type="text"
            id="username"
            name="username"
            value={credentials.username}
            onChange={handleChange}
            placeholder="Ingresa tu nombre de usuario"
            variant="bordered"
            isRequired
            fullWidth
          />
          
          <Input
            label="Contraseña"
            type="password"
            id="password"
            name="password"
            value={credentials.password}
            onChange={handleChange}
            placeholder="Ingresa tu contraseña"
            variant="bordered"
            isRequired
            fullWidth
          />
          
          <Card className="mt-4">
            <CardBody>
              <h4 className="text-md font-semibold mb-2">Usuarios de prueba:</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="font-bold">Admin:</span> admin / admin123</div>
                <div><span className="font-bold">Director:</span> director1 / director123</div>
                <div><span className="font-bold">Doctor:</span> doctor1 / doctor123</div>
                <div><span className="font-bold">Padre:</span> padre1 / padre123</div>
              </div>
            </CardBody>
          </Card>
        </form>
      </ModalBody>
      <ModalFooter>
        <Button 
          color="danger" 
          variant="light" 
          onPress={onClose}
        >
          Cancelar
        </Button>
        <Button 
          color="primary" 
          isLoading={loading}
          onClick={handleSubmit}
        >
          {loading ? 'Procesando...' : 'Iniciar Sesión'}
        </Button>
      </ModalFooter>
    </>
  );
};

export default Login;