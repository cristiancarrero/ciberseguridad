import React, { createContext, useContext, useEffect, useState } from 'react';
import { initializeAWS } from './awsConfig';
import { initializeEC2Client } from './ec2Service';
import { initializeCloudWatchClient } from './services/cloudwatchService';

const AWSContext = createContext();

export const AWSProvider = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeServices = async () => {
      try {
        console.log('Iniciando inicialización de AWS...');
        const credentials = initializeAWS();
        
        // Inicializar todos los clientes necesarios
        await initializeEC2Client(credentials);
        await initializeCloudWatchClient(credentials);
        
        console.log('AWS inicializado correctamente');
        setIsInitialized(true);
        setError(null);
      } catch (error) {
        console.error('Error al inicializar servicios AWS:', error);
        setError(error.message);
        setIsInitialized(false);
      }
    };

    initializeServices();
  }, []);

  return (
    <AWSContext.Provider value={{ isInitialized, error }}>
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