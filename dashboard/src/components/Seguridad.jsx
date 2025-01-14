import React, { useState } from 'react';
import { FaChartLine, FaTimes } from 'react-icons/fa';
import CloudWatchManager from './CloudWatchManager';
import MetricChart from './MetricChart';

const Seguridad = ({ metrics, onRemoveMetric, onMetricUpdate, onAddMetric, isAwsConnected, currentValues }) => {
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
                <button 
                  className="remove-metric-btn"
                  onClick={() => onRemoveMetric(index)}
                  title="Eliminar métrica"
                >
                  <FaTimes />
                </button>
                
                <div className="widget-header">
                  <div className="metric-info">
                    <h4>{metric.title}</h4>
                    <span className="instance-name">
                      {metric.instanceName || metric.instanceId}
                    </span>
                  </div>
                  <div className="metric-value">
                    {metric.type === 'cpu' ? `${Number(currentValues[index] || 0).toFixed(2)}%` :
                     metric.type === 'network' ? `${Math.round(currentValues[index] || 0)} ${metric.unit}` :
                     metric.type === 'disk' ? `${Math.round(currentValues[index] || 0)} ${metric.unit}` :
                     metric.type === 'status' ? (currentValues[index] === 0 ? 'OK' : 'Failed') :
                     `${currentValues[index] || 0} ${metric.unit}`}
                    <span className="update-indicator"></span>
                  </div>
                </div>
                <div className="widget-content">
                  <MetricChart 
                    metricData={metric}
                    timeRange={timeFilter}
                    onValueUpdate={(value) => onMetricUpdate(index, value)}
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