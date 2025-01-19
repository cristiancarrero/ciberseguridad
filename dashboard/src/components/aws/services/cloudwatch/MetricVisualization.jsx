import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { getInstanceMetrics } from './services/cloudwatchMetrics';
import { FaServer, FaChartLine } from 'react-icons/fa';

const MetricVisualization = ({ metric, instanceId, onAuthError }) => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const awsConfig = JSON.parse(localStorage.getItem('awsConfig'));
        if (!awsConfig) {
          throw new Error('No hay configuración de AWS');
        }

        const data = await getInstanceMetrics(instanceId, metric.id);
        
        if (!data || !data.Timestamps || !data.Values) {
          throw new Error('No se recibieron datos válidos');
        }

        // Formatear datos para el gráfico y ordenarlos de más antiguo a más reciente
        const formattedData = data.Timestamps.map((timestamp, index) => {
          // Usar Intl.DateTimeFormat para manejar automáticamente el cambio de horario
          const date = new Date(timestamp);
          const formatter = new Intl.DateTimeFormat('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
            timeZone: 'Europe/Madrid'
          });

          return {
            timestamp: date,
            time: formatter.format(date),
            value: parseFloat(data.Values[index].toFixed(2))
          };
        })
        .sort((a, b) => a.timestamp - b.timestamp)
        .map(({ time, value }) => ({ time, value }));

        setChartData(formattedData);
      } catch (error) {
        console.error('Error al obtener métricas:', error);
        setError(error.message);
        if (error.message.includes('autenticación')) {
          onAuthError?.();
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [instanceId, metric, onAuthError]);

  if (loading) {
    return (
      <div className="metric-loading">
        <div className="loading-spinner"></div>
        <p>Cargando datos de {metric.title}...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="metric-error">
        <span className="error-icon">⚠️</span>
        <p>{error}</p>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="metric-no-data">
        <span className="no-data-icon">📊</span>
        <p>No hay datos disponibles para esta métrica</p>
      </div>
    );
  }

  const formatYAxis = (value) => {
    if (metric.unit === 'Bytes') {
      if (value >= 1073741824) return `${(value / 1073741824).toFixed(1)} GB`;
      if (value >= 1048576) return `${(value / 1048576).toFixed(1)} MB`;
      if (value >= 1024) return `${(value / 1024).toFixed(1)} KB`;
      return `${value} B`;
    }
    if (metric.unit === '%') return `${value}%`;
    return value;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-time">{label}</p>
          <p className="tooltip-value">
            {metric.title}: {formatYAxis(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="metric-visualization">
      <div className="metric-header">
        <div className="metric-title">
          <div className="metric-icon-wrapper">
            <FaChartLine className="metric-icon" />
          </div>
          <div className="metric-info">
            <div className="metric-name">
              <h3>{metric.title}</h3>
              <span className="metric-unit">{metric.unit}</span>
            </div>
            <div className="metric-details">
              <span className="instance-info">
                <FaServer className="instance-icon" />
                <div className="instance-details">
                  <span className="instance-name">{instanceId.split('(')[0].trim()}</span>
                  <span className="instance-id">({instanceId.split('(')[1]?.replace(')', '')})</span>
                </div>
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              vertical={false}
              stroke="rgba(255,255,255,0.05)"
            />
            <XAxis
              dataKey="time"
              stroke="rgba(255,255,255,0.5)"
              tick={{ fill: 'rgba(255,255,255,0.7)' }}
              tickLine={{ stroke: 'rgba(255,255,255,0.5)' }}
            />
            <YAxis
              stroke="rgba(255,255,255,0.5)"
              tick={{ fill: 'rgba(255,255,255,0.7)' }}
              tickLine={{ stroke: 'rgba(255,255,255,0.5)' }}
              tickFormatter={formatYAxis}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{
                paddingTop: '20px',
                opacity: 0.7
              }}
            />
            <Line
              type="monotone"
              dataKey="value"
              name={metric.title}
              stroke="#4ecdc4"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6, fill: '#4ecdc4', strokeWidth: 0 }}
              animationDuration={500}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MetricVisualization; 