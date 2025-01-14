import React, { useState } from 'react';
import { FaChartLine } from 'react-icons/fa';
import CloudWatchManager from './CloudWatchManager';
import MetricChart from './MetricChart';

const getInstanceName = (instanceId) => {
  // Mapa de IDs a nombres
  const instanceNames = {
    'i-0e82a3a9b592bb8dd': 'rfeefef',
    // Añadir más mapeos según sea necesario
  };
  return instanceNames[instanceId] || instanceId;
};

const Seguridad = ({ onAddMetric, metrics, isAwsConnected }) => {
  const [timeFilter, setTimeFilter] = useState('24h');

  return (
    <div className="security-metrics">
      <div className="time-filters">
        <button className={`time-filter ${timeFilter === '24h' ? 'active' : ''}`}>24h</button>
        <button className={`time-filter ${timeFilter === '7d' ? 'active' : ''}`}>7d</button>
        <button className={`time-filter ${timeFilter === '30d' ? 'active' : ''}`}>30d</button>
        <button className={`time-filter ${timeFilter === '90d' ? 'active' : ''}`}>90d</button>
      </div>

      <div className="metrics-grid">
        {metrics.length === 0 ? (
          <>
            <div className="metric-widget add-first">
              <div className="widget-content">
                <FaChartLine className="widget-icon" />
                <h3>Añadir Primera Métrica</h3>
                <p>Configura tu primera métrica de CloudWatch</p>
                <button onClick={onAddMetric} className="add-metric-btn">
                  Comenzar
                </button>
              </div>
            </div>
            <div className="metric-widget add-more disabled">
              <div className="widget-content">
                <div className="plus-icon">+</div>
                <p>Añadir más métricas</p>
              </div>
            </div>
          </>
        ) : (
          <>
            {metrics.map((metric, index) => (
              <div key={index} className="metric-widget">
                <div className="widget-header">
                  <div className="metric-info">
                    <h4>{metric.title}</h4>
                    <span className="instance-id">
                      {getInstanceName(metric.instanceId)}
                    </span>
                  </div>
                  <div className="metric-value">{metric.value || '0'}</div>
                </div>
                <div className="widget-content">
                  <MetricChart 
                    metricData={metric}
                    timeRange={timeFilter}
                  />
                </div>
              </div>
            ))}
            <div className="metric-widget add-more" onClick={onAddMetric}>
              <div className="widget-content">
                <div className="plus-icon">+</div>
                <p>Añadir métrica</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Seguridad; 