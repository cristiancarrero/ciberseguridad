import React, { useState } from 'react';
import { FaChartLine, FaServer, FaDatabase, FaLambda } from 'react-icons/fa';

const MetricsPanel = () => {
  const [selectedService, setSelectedService] = useState(null);

  const services = [
    {
      id: 'ec2',
      name: 'Amazon EC2',
      icon: <FaServer />,
      metrics: [
        { name: 'CPUUtilization', label: 'CPU Utilization', unit: '%' },
        { name: 'NetworkIn', label: 'Network In', unit: 'bytes' },
        { name: 'NetworkOut', label: 'Network Out', unit: 'bytes' },
        { name: 'DiskReadOps', label: 'Disk Read Ops', unit: 'count' },
        { name: 'DiskWriteOps', label: 'Disk Write Ops', unit: 'count' }
      ]
    },
    {
      id: 'rds',
      name: 'Amazon RDS',
      icon: <FaDatabase />,
      metrics: [
        { name: 'DatabaseConnections', label: 'DB Connections', unit: 'count' },
        { name: 'ReadIOPS', label: 'Read IOPS', unit: 'count/second' },
        { name: 'WriteIOPS', label: 'Write IOPS', unit: 'count/second' },
        { name: 'FreeStorageSpace', label: 'Free Storage', unit: 'bytes' }
      ]
    },
    {
      id: 'lambda',
      name: 'AWS Lambda',
      icon: <FaLambda />,
      metrics: [
        { name: 'Invocations', label: 'Invocations', unit: 'count' },
        { name: 'Errors', label: 'Errors', unit: 'count' },
        { name: 'Duration', label: 'Duration', unit: 'milliseconds' },
        { name: 'Throttles', label: 'Throttles', unit: 'count' }
      ]
    }
  ];

  return (
    <div className="metrics-panel">
      <div className="services-list">
        {services.map(service => (
          <div 
            key={service.id}
            className={`service-item ${selectedService?.id === service.id ? 'active' : ''}`}
            onClick={() => setSelectedService(service)}
          >
            <div className="service-icon">{service.icon}</div>
            <div className="service-info">
              <h4>{service.name}</h4>
              <span>{service.metrics.length} métricas disponibles</span>
            </div>
          </div>
        ))}
      </div>

      {selectedService && (
        <div className="metrics-list">
          <h3>Métricas de {selectedService.name}</h3>
          <div className="metrics-grid">
            {selectedService.metrics.map(metric => (
              <div key={metric.name} className="metric-card">
                <h4>{metric.label}</h4>
                <div className="metric-details">
                  <span>Nombre: {metric.name}</span>
                  <span>Unidad: {metric.unit}</span>
                </div>
                <button className="add-metric-btn">
                  <FaChartLine /> Monitorizar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MetricsPanel; 