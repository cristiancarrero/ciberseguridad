import React, { useState } from 'react';
import MetricButton from './MetricButton';

const MetricsPanel = () => {
  const [metrics, setMetrics] = useState({});

  const handleMetricAdd = (metricType, newMetrics) => {
    setMetrics(prev => ({
      ...prev,
      [metricType]: newMetrics
    }));
  };

  const metricTypes = [
    {
      type: 'CPU Utilization',
      description: 'Uso de CPU de la instancia',
      unit: '%'
    },
    {
      type: 'Memory Usage',
      description: 'Uso de memoria RAM',
      unit: 'GB'
    },
    {
      type: 'Network I/O',
      description: 'Tráfico de red entrante/saliente',
      unit: 'MB/s'
    },
    {
      type: 'Disk I/O',
      description: 'Operaciones de lectura/escritura en disco',
      unit: 'IOPS'
    },
    {
      type: 'Status Check',
      description: 'Estado de la instancia',
      unit: 'Status'
    }
  ];

  return (
    <div className="metrics-panel">
      <h2>Métricas Disponibles</h2>
      <div className="metrics-grid">
        {metricTypes.map((metric) => (
          <MetricButton
            key={metric.type}
            metricType={metric.type}
            description={metric.description}
            unit={metric.unit}
            onMetricAdd={(newMetrics) => handleMetricAdd(metric.type, newMetrics)}
          />
        ))}
      </div>
    </div>
  );
};

export default MetricsPanel; 