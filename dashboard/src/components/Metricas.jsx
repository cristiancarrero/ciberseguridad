import React from 'react';
import { FaServer, FaDatabase, FaNetworkWired, FaUsers } from 'react-icons/fa';
import { useAWS } from '../context/AWSContext';

const Metricas = () => {
  const { cloudwatchMetrics } = useAWS();

  return (
    <div className="metrics-page">
      {/* Gráficos existentes */}
      
      {/* Métricas de CloudWatch */}
      {cloudwatchMetrics.length > 0 && (
        <div className="metrics-section">
          <h3>Métricas de CloudWatch</h3>
          <div className="metrics-grid">
            {cloudwatchMetrics.map(metric => (
              <div key={metric.id} className="metric-card">
                <div className="metric-header">
                  <h4>{metric.name}</h4>
                  <span className="metric-unit">{metric.unit}</span>
                </div>
                <div className="metric-chart">
                  {/* Aquí irá el gráfico de la métrica */}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Metricas; 