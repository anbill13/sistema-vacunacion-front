// Hook React para manejar la sincronización automática de la cola offline
import { useEffect, useState } from 'react';
import { getSyncQueue, syncWithBackend } from '../utils/syncQueue';

export default function useSyncQueue(syncFn) {
  const [pending, setPending] = useState(getSyncQueue().length);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const updatePending = () => setPending(getSyncQueue().length);
    window.addEventListener('storage', updatePending);
    return () => window.removeEventListener('storage', updatePending);
  }, []);

  useEffect(() => {
    const handleOnline = async () => {
      setSyncing(true);
      await syncWithBackend(syncFn);
      setPending(getSyncQueue().length);
      setSyncing(false);
    };
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [syncFn]);

  // Permite sincronizar manualmente
  const manualSync = async () => {
    setSyncing(true);
    await syncWithBackend(syncFn);
    setPending(getSyncQueue().length);
    setSyncing(false);
  };

  return { pending, syncing, manualSync };
}
