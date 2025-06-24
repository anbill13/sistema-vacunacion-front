// Archivo de prueba para verificar el registro de tutores
// Abrir en el navegador con las herramientas de desarrollo para ver los logs

console.log('=== PRUEBA DE REGISTRO DE TUTOR ===');

// Simular datos de un padre registrándose
const formDataExample = {
  username: 'maria.rodriguez',
  password: 'password123',
  confirmPassword: 'password123',
  name: 'María Rodríguez',
  email: 'maria.rodriguez@example.com',
  role: 'padre',
  cedula: '001-1234567-8',
  telefono: '809-555-1234',
  direccion: 'Calle 1, La Romana',
  nacionalidad: 'Dominicano',
  relacion: 'Madre'
};

console.log('Datos del formulario:', formDataExample);

// Formato que debe enviarse al backend
const expectedTutorFormat = {
  id_niño: null,
  nombre: formDataExample.name,
  relacion: formDataExample.relacion,
  nacionalidad: formDataExample.nacionalidad,
  identificacion: formDataExample.cedula,
  telefono: formDataExample.telefono,
  email: formDataExample.email,
  direccion: formDataExample.direccion
};

console.log('Formato esperado para tutor:');
console.log(JSON.stringify(expectedTutorFormat, null, 2));

console.log('=== VERIFICAR EN AuthPage.jsx QUE SE ENVÍE ESTE FORMATO ===');
