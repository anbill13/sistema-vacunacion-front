// test-backend.js - Script para probar la conectividad con el backend
const apiConfig = {
  baseURL: 'https://sistema-vacunacion-backend.onrender.com',
  timeout: 10000,
};

async function testBackendConnection() {
  console.log('🔗 Probando conexión con el backend...');
  console.log('URL del backend:', apiConfig.baseURL);

  try {
    // Probar endpoint de centros
    console.log('\n📍 Probando endpoint de centros...');
    const centrosResponse = await fetch(`${apiConfig.baseURL}/api/centers`);
    console.log('Status centros:', centrosResponse.status);
    
    if (centrosResponse.ok) {
      const centros = await centrosResponse.json();
      console.log('✅ Centros obtenidos:', centros.length, 'centros');
      console.log('Ejemplo:', centros[0]);
    } else {
      const errorText = await centrosResponse.text();
      console.log('❌ Error centros:', errorText);
    }

    // Probar endpoint de vacunas
    console.log('\n💉 Probando endpoint de vacunas...');
    const vacunasResponse = await fetch(`${apiConfig.baseURL}/api/vaccines`);
    console.log('Status vacunas:', vacunasResponse.status);
    
    if (vacunasResponse.ok) {
      const vacunas = await vacunasResponse.json();
      console.log('✅ Vacunas obtenidas:', vacunas.length, 'vacunas');
      console.log('Ejemplo:', vacunas[0]);
    } else {
      const errorText = await vacunasResponse.text();
      console.log('❌ Error vacunas:', errorText);
    }

    // Probar endpoint de usuarios
    console.log('\n👥 Probando endpoint de usuarios...');
    const usuariosResponse = await fetch(`${apiConfig.baseURL}/api/users`);
    console.log('Status usuarios:', usuariosResponse.status);
    
    if (usuariosResponse.ok) {
      const usuarios = await usuariosResponse.json();
      console.log('✅ Usuarios obtenidos:', usuarios.length, 'usuarios');
      console.log('Ejemplo:', usuarios[0]);
    } else {
      const errorText = await usuariosResponse.text();
      console.log('❌ Error usuarios:', errorText);
    }

    console.log('\n✅ Prueba de conectividad completada');

  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
  }
}

// Ejecutar prueba si se ejecuta directamente
if (typeof window === 'undefined') {
  testBackendConnection();
}

export default testBackendConnection;
