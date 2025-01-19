import React, { useState, useEffect } from 'react';
import { useAWS } from './AWSContext';
import { launchInstance, getEC2Client } from './ec2Service';

export const EC2Manager = () => {
  const { isInitialized, error: awsError } = useAWS();
  const [error, setError] = useState(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (isInitialized && getEC2Client()) {
      setIsReady(true);
    } else {
      setIsReady(false);
    }
  }, [isInitialized]);

  const handleLaunchInstance = async (instanceConfig) => {
    if (!isReady) {
      setError('AWS no está inicializado todavía');
      return;
    }

    try {
      console.log('Creando instancia con configuración:', instanceConfig);
      const response = await launchInstance(instanceConfig);
      console.log('Instancia creada:', response);
    } catch (error) {
      console.error('Error al crear la instancia:', error);
      setError(error.message);
    }
  };

  if (awsError) {
    return <div>Error de AWS: {awsError}</div>;
  }

  if (!isReady) {
    return <div>Inicializando AWS...</div>;
  }

  // ... resto del componente
}; 