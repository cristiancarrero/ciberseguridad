import React from 'react';
import { FaSearch, FaFilter } from 'react-icons/fa';

const LogsPanel = () => {
  return (
    <div className="logs-panel">
      <div className="panel-header">
        <h3>CloudWatch Logs</h3>
        <div className="logs-search">
          <FaSearch />
          <input type="text" placeholder="Buscar en logs..." />
          <select>
            <option value="1h">Última hora</option>
            <option value="3h">Últimas 3 horas</option>
            <option value="24h">Últimas 24 horas</option>
            <option value="7d">Últimos 7 días</option>
          </select>
        </div>
      </div>

      <div className="log-groups">
        <div className="log-group-item">
          <h4>/aws/ec2/production</h4>
          <div className="log-entries">
            {/* Aquí irían las entradas de log */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogsPanel; 