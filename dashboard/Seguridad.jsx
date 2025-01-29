import React from 'react';
import { MetricChart } from './MetricChart';

const metrics = [
  {
    metricName: 'CPUUtilization',
    label: 'Utilización de CPU',
    unit: '%'
  },
  {
    metricName: 'NetworkIn',
    label: 'Tráfico de Red (Entrada)',
    unit: 'Bytes'
  },
  {
    metricName: 'NetworkOut',
    label: 'Tráfico de Red (Salida)',
    unit: 'Bytes'
  }
];

export const Seguridad = ({ selectedInstanceId }) => {
  if (!selectedInstanceId) {
    return <div>Seleccione una instancia para ver sus métricas</div>;
  }

  return (
    <div className="metrics-container">
      {metrics.map((metric) => (
        <div key={metric.metricName} className="metric-wrapper">
          <MetricChart
            metric={metric}
            instanceId={selectedInstanceId}
          />
        </div>
      ))}
    </div>
  );
}; 