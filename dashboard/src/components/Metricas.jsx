import React from 'react';
import { FaServer, FaDatabase, FaNetworkWired, FaUsers } from 'react-icons/fa';

const Metricas = () => {
  const metrics = [
    {
      title: 'Recursos AWS',
      items: [
        { label: 'CPU Utilization', value: '67%', change: '+5%', icon: <FaServer /> },
        { label: 'Memory Usage', value: '8.2GB', change: '-2%', icon: <FaDatabase /> },
        { label: 'Network I/O', value: '1.2TB', change: '+15%', icon: <FaNetworkWired /> },
        { label: 'Active Users', value: '1,234', change: '+22%', icon: <FaUsers /> }
      ]
    },
    {
      title: 'Rendimiento',
      items: [
        { label: 'Response Time', value: '245ms', change: '-12%' },
        { label: 'Error Rate', value: '0.05%', change: '-3%' },
        { label: 'Success Rate', value: '99.95%', change: '+1%' },
        { label: 'Requests/sec', value: '2.3K', change: '+8%' }
      ]
    }
  ];

  return (
    <div className="metricas-container">
      {metrics.map((section, idx) => (
        <section key={idx} className="metrics-section">
          <h2>{section.title}</h2>
          <div className="metrics-grid">
            {section.items.map((item, index) => (
              <div key={index} className="metric-card">
                <div className="metric-header">
                  {item.icon && <div className="metric-icon">{item.icon}</div>}
                  <h3>{item.label}</h3>
                </div>
                <div className="metric-content">
                  <span className="metric-value">{item.value}</span>
                  <span className={`change ${item.change.startsWith('+') ? 'increase' : 'decrease'}`}>
                    {item.change}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      <section className="metrics-chart">
        <h2>Tendencias</h2>
        <div className="chart-container">
          <div className="chart-placeholder">
            Aquí irá el gráfico de tendencias
          </div>
        </div>
      </section>
    </div>
  );
};

export default Metricas; 