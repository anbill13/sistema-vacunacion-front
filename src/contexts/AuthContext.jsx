import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('public'); // 'public', 'auth', 'dashboard'

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
      setCurrentPage('dashboard');
    } else {
      setCurrentPage('public');
    }
  }, []);

  const handleLogin = (user) => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    setCurrentPage('public');
    // Mantener la preferencia de modo oscuro al cerrar sesión
    const darkMode = localStorage.getItem('darkMode');
    localStorage.setItem('publicDarkMode', darkMode);
  };

  const showAuthPage = () => {
    setCurrentPage('auth');
  };

  const showPublicPage = () => {
    setCurrentPage('public');
  };

  return (
    <AuthContext.Provider 
      value={{ 
        currentUser, 
        currentPage, 
        handleLogin, 
        handleLogout, 
        showAuthPage, 
        showPublicPage 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);