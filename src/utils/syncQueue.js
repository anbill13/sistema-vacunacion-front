// Sistema de cola de sincronización para cambios offline
// Deja la integración abierta para conectar con un backend real

const SYNC_QUEUE_KEY = '__sync_queue__';

export function getSyncQueue() {
  try {
    const queue = localStorage.getItem(SYNC_QUEUE_KEY);
    return queue ? JSON.parse(queue) : [];
  } catch {
    return [];
  }
}

export function addToSyncQueue(change) {
  const queue = getSyncQueue();
  queue.push({ ...change, timestamp: Date.now() });
  localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
}

export function clearSyncQueue() {
  localStorage.removeItem(SYNC_QUEUE_KEY);
}

export function removeFirstFromSyncQueue() {
  const queue = getSyncQueue();
  queue.shift();
  localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
}

// Esta función debe ser llamada cuando vuelva la conexión o se detecte 'online'
export async function syncWithBackend(syncFn) {
  const queue = getSyncQueue();
  for (const change of queue) {
    try {
      // syncFn debe ser una función async que reciba el cambio y lo sincronice con el backend
      await syncFn(change);
      removeFirstFromSyncQueue();
    } catch (e) {
      // Si falla, detener la sincronización para reintentar luego
      break;
    }
  }
}
