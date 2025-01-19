import React, { createContext, useContext, useState } from 'react';
import { connectToAWS, disconnectFromAWS, isConnectedToAWS } from '../services/awsService';

const AWSContext = createContext();

export const AWSProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = async (credentials) => {
    try {
      await connectToAWS(credentials);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error('Error al conectar con AWS:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await disconnectFromAWS();
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error al desconectar de AWS:', error);
    }
  };

  return (
    <AWSContext.Provider value={{
      isAuthenticated,
      login,
      logout
    }}>
      {children}
    </AWSContext.Provider>
  );
};

export const useAWS = () => useContext(AWSContext);

export default AWSProvider; 