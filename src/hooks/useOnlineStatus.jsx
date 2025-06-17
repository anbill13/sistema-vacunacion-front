import { useState, useEffect } from 'react';

/**
 * Hook personalizado para detectar si el usuario está online o offline
 * @returns {boolean} Estado de la conexión (true = online, false = offline)
 */
const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    // Función para actualizar el estado
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    // Agregar event listeners para detectar cambios en la conexión
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // Cleanup: remover event listeners cuando el componente se desmonte
    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  return isOnline;
};

export default useOnlineStatus;