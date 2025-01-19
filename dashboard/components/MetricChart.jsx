import React from 'react';
import { useAWS } from '../context/AWSContext';

const MetricChart = ({ metric, instanceId }) => {
  const { isAuthenticated, credentials } = useAWS();

  if (!isAuthenticated) {
    return <div>Por favor, inicie sesión para ver las métricas</div>;
  }

  // ... resto del componente
};

export default MetricChart; 