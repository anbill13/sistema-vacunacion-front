import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './polyfills'; // Importar polyfills para manejar advertencias
import App from './App';
import reportWebVitals from './reportWebVitals';
import { NextUIProvider } from '@nextui-org/react';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <NextUIProvider>
      <App />
    </NextUIProvider>
  </React.StrictMode>
);

// Si quieres que tu app funcione offline y cargue más rápido, puedes cambiar
// unregister() a register() a continuación. Ten en cuenta que esto viene con algunas trampas.
// Aprende más sobre service workers: https://cra.link/PWA
serviceWorkerRegistration.register({
  onUpdate: (registration) => {
    // Mostrar notificación de actualización disponible
    if (window.confirm('Hay una nueva versión disponible. ¿Deseas actualizar?')) {
      if (registration && registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
      window.location.reload();
    }
  },
  onSuccess: (registration) => {
    console.log('La aplicación está lista para trabajar offline');
  }
});

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
