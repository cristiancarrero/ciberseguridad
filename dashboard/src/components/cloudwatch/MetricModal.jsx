import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getInstanceMetrics } from '../../services/cloudwatchService';
import { FaTimes, FaSync } from 'react-icons/fa';

const MetricModal = ({ metric, instance, onClose }) => {
  const [metricData, setMetricData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadMetricData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await getInstanceMetrics(
        instance.id,
        metric.id === 'cpu' ? 'CPUUtilization' : metric.id
      );

      if (!data || !data.Timestamps || !data.Values) {
        throw new Error('No se recibieron datos válidos de CloudWatch');
      }

      // Ordenar los datos por timestamp de más antiguo a más reciente
      const timestamps = [...data.Timestamps];
      const values = [...data.Values];
      const pairs = timestamps.map((timestamp, index) => ({
        timestamp,
        value: values[index]
      }));
      
      pairs.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

      // Formatear los datos para Recharts
      const formattedData = pairs.map(pair => ({
        time: new Date(pair.timestamp).toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit'
        }),
        value: Number(pair.value).toFixed(2)
      }));

      console.log('Datos formateados:', formattedData);
      
      setMetricData(formattedData);
    } catch (err) {
      console.error('Error detallado:', err);
      setError('Error al cargar los datos de la métrica: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetricData();
    const interval = setInterval(loadMetricData, 300000); // Actualizar cada 5 minutos
    return () => clearInterval(interval);
  }, [metric.id, instance.id]);

  const getYAxisDomain = () => {
    // Para CPU, usar siempre 0-100%
    if (metric.id === 'cpu') {
      return [0, 100];
    }

    // Para otras métricas, calcular el dominio basado en los datos
    if (!metricData || metricData.length === 0) return [0, 100];
    
    const values = metricData.map(d => parseFloat(d.value));
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    // Calcular un rango que deje espacio arriba y abajo
    const padding = (max - min) * 0.2;
    return [
      Math.max(0, Math.floor(min - padding)), // Redondear hacia abajo
      Math.ceil(max + padding) // Redondear hacia arriba
    ];
  };

  return (
    <div className="metric-modal-overlay" onClick={onClose}>
      <div className="metric-modal-content" onClick={e => e.stopPropagation()}>
        <div className="metric-modal-header">
          <div className="metric-modal-title">
            <h3>{metric.title}</h3>
            <span className="instance-name">
              {instance.name || instance.id} - {metric.unit}
            </span>
          </div>
          <div className="metric-modal-actions">
            <button className="refresh-btn" onClick={loadMetricData} title="Actualizar datos">
              <FaSync />
            </button>
            <button className="close-btn" onClick={onClose} title="Cerrar">
              <FaTimes />
            </button>
          </div>
        </div>

        <div className="metric-modal-body">
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Cargando datos de la métrica...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <p>{error}</p>
              <button className="retry-btn" onClick={loadMetricData}>
                Reintentar
              </button>
            </div>
          ) : !metricData || metricData.length === 0 ? (
            <div className="no-data-state">
              <p>No hay datos disponibles para esta métrica</p>
              <button className="retry-btn" onClick={loadMetricData}>
                Actualizar
              </button>
            </div>
          ) : (
            <div className="metric-chart">
              <ResponsiveContainer width="100%" height={400}>
                <LineChart 
                  data={metricData}
                  margin={{ top: 10, right: 30, left: 20, bottom: 65 }}
                >
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    stroke="rgba(255,255,255,0.1)"
                    vertical={false} // Solo líneas horizontales
                  />
                  <XAxis 
                    dataKey="time" 
                    stroke="rgba(255,255,255,0.5)"
                    label={{ 
                      value: 'Tiempo', 
                      position: 'bottom',
                      style: { fill: 'rgba(255,255,255,0.5)' }
                    }}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    stroke="rgba(255,255,255,0.5)"
                    domain={getYAxisDomain()}
                    label={{ 
                      value: metric.unit, 
                      angle: -90, 
                      position: 'insideLeft',
                      style: { fill: 'rgba(255,255,255,0.5)' }
                    }}
                    tick={{ fontSize: 12 }}
                    tickCount={5} // Reducir a 5 líneas para tener divisiones más limpias (0, 25, 50, 75, 100 para CPU)
                    tickFormatter={(value) => `${Math.round(value)}${metric.unit === '%' ? '%' : ''}`} // Redondear valores
                    allowDecimals={false} // Evitar decimales en las etiquetas
                  />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'rgba(0,0,0,0.8)', 
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '4px',
                      padding: '8px'
                    }}
                    labelStyle={{ color: 'rgba(255,255,255,0.7)' }}
                    itemStyle={{ color: '#67d1d3' }}
                    formatter={(value) => [`${Number(value).toFixed(2)}${metric.unit === '%' ? '%' : ''}`, metric.title]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#67d1d3" 
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: '#67d1d3' }}
                    isAnimationActive={true}
                    animationDuration={500}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MetricModal; 