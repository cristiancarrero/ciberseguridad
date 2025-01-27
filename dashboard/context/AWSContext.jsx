import React, { createContext, useContext, useState, useEffect } from 'react';
import { setAWSCredentials, getAWSCredentials, isCredentialsValid, clearAWSCredentials } from '../services/credentialsService';

const AWSContext = createContext();

export const AWSProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastCheck, setLastCheck] = useState(Date.now());

  // Verificar credenciales periódicamente
  useEffect(() => {
    const checkCredentials = () => {
      const valid = isCredentialsValid();
      setIsAuthenticated(valid);
      setLoading(false);
    };

    checkCredentials();

    // Verificar cada minuto
    const interval = setInterval(() => {
      checkCredentials();
      setLastCheck(Date.now());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // También verificar cuando la ventana recupera el foco
  useEffect(() => {
    const handleFocus = () => {
      const valid = isCredentialsValid();
      setIsAuthenticated(valid);
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const login = async (credentials) => {
    try {
      const success = setAWSCredentials(credentials);
      if (success) {
        setIsAuthenticated(true);
        setLastCheck(Date.now());
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error al establecer credenciales:', error);
      return false;
    }
  };

  const logout = () => {
    clearAWSCredentials();
    setIsAuthenticated(false);
    setLastCheck(Date.now());
  };

  if (loading) {
    return <div>Verificando credenciales...</div>;
  }

  return (
    <AWSContext.Provider value={{ 
      isAuthenticated,
      login,
      logout,
      credentials: getAWSCredentials(),
      lastCheck
    }}>
      {children}
    </AWSContext.Provider>
  );
};

export const useAWS = () => {
  const context = useContext(AWSContext);
  if (!context) {
    throw new Error('useAWS debe ser usado dentro de un AWSProvider');
  }
  return context;
}; 