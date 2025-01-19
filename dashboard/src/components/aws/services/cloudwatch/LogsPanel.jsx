import React, { useState } from 'react';
import { FaSearch, FaFilter, FaServer, FaClock, FaExclamationTriangle, FaInfo, FaBug } from 'react-icons/fa';

const LogsPanel = () => {
  const [selectedLogGroup, setSelectedLogGroup] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [timeRange, setTimeRange] = useState('1h');

  const logGroups = [
    { id: 1, name: '/aws/ec2/production', instance: 'Production Server' },
    { id: 2, name: '/aws/ec2/staging', instance: 'Staging Server' },
    { id: 3, name: '/aws/lambda/api', instance: 'API Functions' }
  ];

  const logs = [
    {
      id: 1,
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      message: 'Failed to connect to database',
      source: 'app.js'
    },
    {
      id: 2,
      timestamp: new Date().toISOString(),
      level: 'INFO',
      message: 'User authentication successful',
      source: 'auth.js'
    },
    {
      id: 3,
      timestamp: new Date().toISOString(),
      level: 'DEBUG',
      message: 'Processing request payload',
      source: 'api.js'
    }
  ];

  const getLogIcon = (level) => {
    switch (level) {
      case 'ERROR':
        return <FaExclamationTriangle className="log-icon error" />;
      case 'INFO':
        return <FaInfo className="log-icon info" />;
      case 'DEBUG':
        return <FaBug className="log-icon debug" />;
      default:
        return null;
    }
  };

  return (
    <div className="logs-panel">
      <div className="logs-header">
        <div className="log-groups">
          <select 
            value={selectedLogGroup || ''} 
            onChange={(e) => setSelectedLogGroup(e.target.value)}
            className="log-group-select"
          >
            <option value="">Seleccionar grupo de logs</option>
            {logGroups.map(group => (
              <option key={group.id} value={group.id}>
                {group.name} - {group.instance}
              </option>
            ))}
          </select>
        </div>

        <div className="logs-filters">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Buscar en logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="time-filter">
            <FaClock className="time-icon" />
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="1h">Última hora</option>
              <option value="3h">Últimas 3 horas</option>
              <option value="6h">Últimas 6 horas</option>
              <option value="12h">Últimas 12 horas</option>
              <option value="24h">Últimas 24 horas</option>
              <option value="7d">Últimos 7 días</option>
            </select>
          </div>
        </div>
      </div>

      <div className="logs-content">
        {selectedLogGroup ? (
          <div className="logs-list">
            {logs.map(log => (
              <div key={log.id} className={`log-entry ${log.level.toLowerCase()}`}>
                <div className="log-icon-wrapper">
                  {getLogIcon(log.level)}
                </div>
                <div className="log-info">
                  <div className="log-meta">
                    <span className="log-time">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                    <span className="log-source">{log.source}</span>
                    <span className={`log-level ${log.level.toLowerCase()}`}>
                      {log.level}
                    </span>
                  </div>
                  <div className="log-message">{log.message}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-logs-selected">
            <FaServer className="empty-icon" />
            <h3>Selecciona un grupo de logs</h3>
            <p>Elige un grupo de logs para ver sus entradas</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LogsPanel; 