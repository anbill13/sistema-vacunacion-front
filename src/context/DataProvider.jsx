import React, { createContext, useContext } from 'react';
import { useJsonData } from '../hooks/useJsonData';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const useCentrosVacunacion = () => useJsonData('Centros_Vacunacion');
  const useVacunas = () => useJsonData('Vacunas');
  const useNinos = () => useJsonData('Niños');
  const useTutores = () => useJsonData('Tutores');
  // ... otros hooks para diferentes endpoints

  const value = {
    useCentrosVacunacion,
    useVacunas,
    useNinos,
    useTutores,
    // ... otros hooks
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
