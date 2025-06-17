// Indicador visual de sincronización offline/online
import React from 'react';

export default function SyncStatus({ pending, syncing, onSync }) {
  if (pending === 0) return null;
  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white/90 dark:bg-gray-800/90 shadow-md rounded-lg px-4 py-2 flex items-center gap-2 border border-gray-200 dark:border-gray-700">
      <span className={`inline-block w-2.5 h-2.5 rounded-full ${syncing ? 'bg-blue-400 animate-pulse' : 'bg-yellow-400'}`}></span>
      <span className="text-xs text-gray-700 dark:text-gray-200">
        {syncing ? 'Sincronizando...' : `${pending} cambio(s) pendiente(s) de sincronizar`}
      </span>
      {!syncing && (
        <button className="ml-2 text-xs underline text-blue-600 dark:text-blue-300" onClick={onSync}>
          Sincronizar ahora
        </button>
      )}
    </div>
  );
}
