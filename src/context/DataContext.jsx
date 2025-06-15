import React, { createContext, useContext } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { initialData } from '../data/initialData';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [data, setData] = useLocalStorage('app_data', initialData);

  const addItem = (newItem) => {
    setData(prevData => ({
      ...prevData,
      items: [...prevData.items, { ...newItem, id: Date.now() }]
    }));
  };

  const updateItem = (id, updatedItem) => {
    setData(prevData => ({
      ...prevData,
      items: prevData.items.map(item => 
        item.id === id ? { ...item, ...updatedItem } : item
      )
    }));
  };

  const deleteItem = (id) => {
    setData(prevData => ({
      ...prevData,
      items: prevData.items.filter(item => item.id !== id)
    }));
  };

  return (
    <DataContext.Provider value={{ data, addItem, updateItem, deleteItem }}>
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
