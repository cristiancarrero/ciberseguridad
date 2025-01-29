import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { getMetrics } from '../services/cloudwatchService';
import '../styles/components/metrics.css';

const Metrics = () => {
  const [selectedInstance, setSelectedInstance] = useState(null);
  const [timeRange, setTimeRange] = useState('1h'); // 1h, 6h, 24h, 7d
  const [metrics, setMetrics] = useState({
    cpu: [],
    network: [],
    diskIO: []
  });

  return (
    <div className="metrics-container">
      <div className="metrics-header">
        <h2>Métricas de Rendimiento</h2>
        <div className="metrics-controls">
          <select onChange={(e) => setSelectedInstance(e.target.value)}>
            {/* Lista de instancias */}
          </select>
          <select onChange={(e) => setTimeRange(e.target.value)}>
            <option value="1h">Última hora</option>
            <option value="6h">Últimas 6 horas</option>
            <option value="24h">Último día</option>
            <option value="7d">Última semana</option>
          </select>
        </div>
      </div>

      <div className="metrics-grid">
        {/* CPU Usage */}
        <div className="metric-card">
          <h3>Uso de CPU</h3>
          <LineChart width={500} height={300} data={metrics.cpu}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="usage" stroke="#8884d8" />
          </LineChart>
        </div>

        {/* Network Traffic */}
        <div className="metric-card">
          <h3>Tráfico de Red</h3>
          <LineChart width={500} height={300} data={metrics.network}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="in" stroke="#82ca9d" />
            <Line type="monotone" dataKey="out" stroke="#ffc658" />
          </LineChart>
        </div>

        {/* Disk I/O */}
        <div className="metric-card">
          <h3>I/O de Disco</h3>
          <LineChart width={500} height={300} data={metrics.diskIO}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="read" stroke="#82ca9d" />
            <Line type="monotone" dataKey="write" stroke="#ffc658" />
          </LineChart>
        </div>

        {/* System Logs */}
        <div className="metric-card logs">
          <h3>Logs del Sistema</h3>
          <div className="logs-container">
            {/* Lista de logs */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Metrics; 