import React, { useState, useEffect } from 'react';
import { FaChartLine, FaTimes, FaServer, FaPlus } from 'react-icons/fa';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getInstanceMetrics } from './aws/services/cloudwatch/services/cloudwatchService';
import CloudWatchPanel from './aws/services/cloudwatch/CloudWatchPanel';
import '../styles/components/seguridad.css';

const MetricCard = ({ metric, onRemove, onUpdate }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentValue, setCurrentValue] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        if (!isMounted) return;
        setLoading(true);
        console.log('MetricCard: Obteniendo datos para métrica:', {
          instanceId: metric.instanceId,
          type: metric.type,
          title: metric.title,
          unit: metric.unit
        });

        const response = await getInstanceMetrics(metric.instanceId, metric.type);
        
        if (!isMounted) return;
        
        if (response?.Timestamps && response?.Values) {
          const formattedData = response.Timestamps.map((timestamp, index) => ({
            time: new Date(timestamp).toLocaleTimeString('es-ES', {
              hour: '2-digit',
              minute: '2-digit',
              timeZone: 'Europe/Madrid'
            }),
            value: response.Values[index]
          })).sort((a, b) => new Date(a.time) - new Date(b.time));

          if (!isMounted) return;

          console.log('MetricCard: Datos formateados:', formattedData);
          setData(formattedData);
          
          if (formattedData.length > 0) {
            const newValue = formattedData[formattedData.length - 1].value;
            const now = Date.now();
            
            // Solo actualizar si han pasado más de 55 segundos desde la última actualización
            if (!lastUpdate || now - lastUpdate > 55000) {
              setCurrentValue(newValue);
              setLastUpdate(now);
              onUpdate?.(newValue);
            }
          }
        } else {
          if (!isMounted) return;
          console.warn('MetricCard: No se recibieron datos válidos de CloudWatch:', response);
          setError('No hay datos disponibles para esta métrica');
        }
      } catch (err) {
        if (!isMounted) return;
        console.error('MetricCard: Error al obtener datos de la métrica:', err);
        setError(err.message);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000); // Actualizar cada minuto

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [metric.instanceId, metric.type]); // Removida la dependencia onUpdate

  const formatValue = (value) => {
    if (metric.type === 'CPUUtilization') {
      return `${Number(value).toFixed(2)}%`;
    }
    if (metric.unit === 'Bytes') {
      if (value >= 1073741824) return `${(value / 1073741824).toFixed(1)} GB`;
      if (value >= 1048576) return `${(value / 1048576).toFixed(1)} MB`;
      if (value >= 1024) return `${(value / 1024).toFixed(1)} KB`;
      return `${value} B`;
    }
    return `${value} ${metric.unit}`;
  };

  return (
    <div className="metric-widget">
      <button 
        className="remove-metric-btn"
        onClick={() => onRemove(metric.id)}
        title="Eliminar métrica"
      >
        <FaTimes />
      </button>
      
      <div className="widget-header">
        <div className="metric-info">
          <h4>{metric.title}</h4>
          <div className="instance-info">
            <FaServer className="instance-icon" />
            <span className="instance-name">{metric.instanceName}</span>
          </div>
        </div>
        {currentValue !== null && (
          <div className="metric-value">
            {formatValue(currentValue)}
          </div>
        )}
      </div>

      <div className="widget-content">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner" />
            <p>Cargando datos...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p>{error}</p>
            <button 
              className="retry-btn" 
              onClick={() => setLoading(true)}
              style={{
                background: 'none',
                border: '1px solid rgba(255,255,255,0.2)',
                color: 'rgba(255,255,255,0.7)',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
                marginTop: '12px'
              }}
            >
              Reintentar
            </button>
          </div>
        ) : data.length === 0 ? (
          <div className="no-data-state">
            <p>No hay datos disponibles</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="time" 
                stroke="rgba(255,255,255,0.5)"
                tick={{ fill: 'rgba(255,255,255,0.5)' }}
              />
              <YAxis 
                stroke="rgba(255,255,255,0.5)"
                tick={{ fill: 'rgba(255,255,255,0.5)' }}
              />
              <Tooltip 
                contentStyle={{
                  background: '#1a1e2c',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '4px'
                }}
                labelStyle={{ color: 'rgba(255,255,255,0.7)' }}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#4ecdc4" 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#4ecdc4' }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

const Seguridad = ({ metrics = [], onAddMetric, onRemoveMetric, onMetricUpdate }) => {
  const [showCloudWatchPanel, setShowCloudWatchPanel] = useState(false);

  const handleOpenCloudWatch = () => {
    console.log('Abriendo panel de CloudWatch');
    setShowCloudWatchPanel(true);
  };

  const handleCloseCloudWatch = () => {
    setShowCloudWatchPanel(false);
  };

  const handleAddMetric = (metric) => {
    console.log('Seguridad: Recibiendo nueva métrica:', metric);
    onAddMetric(metric);
    setShowCloudWatchPanel(false);
  };

  const handleRemoveMetric = (index) => {
    console.log('Seguridad: Eliminando métrica en índice:', index);
    onRemoveMetric(index);
  };

  console.log('Seguridad: Métricas actuales:', metrics);

  return (
    <div className="security-metrics">
      {metrics.length === 0 ? (
        <div className="add-first-metric" onClick={handleOpenCloudWatch}>
          <div className="add-first-metric-content">
            <div className="add-first-metric-icon">
              <div className="icon-circle">
                <FaChartLine className="chart-icon" />
              </div>
              <div className="plus-icon-container">
                <FaPlus className="plus-icon" />
              </div>
            </div>
            <h3>Añadir Primera Métrica</h3>
            <p>Comienza a monitorizar tus recursos AWS</p>
            <div className="features-list">
              <div className="feature-item">
                <FaServer className="feature-icon" />
                <span>Monitoreo de instancias EC2</span>
              </div>
              <div className="feature-item">
                <FaChartLine className="feature-icon" />
                <span>Métricas en tiempo real</span>
              </div>
            </div>
            <button className="start-button">
              Comenzar
            </button>
          </div>
        </div>
      ) : (
        <div className="metrics-grid">
          {metrics.map((metric, index) => (
            <MetricCard
              key={metric.id || index}
              metric={metric}
              onRemove={() => handleRemoveMetric(index)}
              onUpdate={(value) => onMetricUpdate?.(index, value)}
            />
          ))}
          <div className="add-metric-card" onClick={handleOpenCloudWatch}>
            <FaPlus className="add-icon" />
            <span>Añadir Métrica</span>
          </div>
        </div>
      )}

      <CloudWatchPanel
        isOpen={showCloudWatchPanel}
        onClose={handleCloseCloudWatch}
        onAddMetric={handleAddMetric}
      />
    </div>
  );
};

export default Seguridad; 