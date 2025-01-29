import React, { useState, useEffect, useCallback } from 'react';
import { Line } from 'react-chartjs-2';
import { getMetricData } from '../services/cloudwatchService';
import { useAWS } from '../context/AWSContext';

export const MetricChart = ({ metric, instanceId }) => {
  const { isInitialized } = useAWS();
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMetricData = useCallback(async () => {
    if (!isInitialized || !instanceId || !metric) {
      return;
    }

    try {
      setLoading(true);
      const data = await getMetricData(metric, instanceId);
      
      const formattedData = {
        labels: data.timestamps,
        datasets: [{
          label: metric.label || metric.metricName,
          data: data.values,
          fill: false,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        }]
      };

      setChartData(formattedData);
      setError(null);
    } catch (err) {
      console.error('Error al obtener datos de métrica:', err);
      setError('Error al cargar los datos de la métrica');
      setChartData(null);
    } finally {
      setLoading(false);
    }
  }, [isInitialized, instanceId, metric]);

  useEffect(() => {
    fetchMetricData();
    
    const interval = setInterval(fetchMetricData, 300000);
    
    return () => clearInterval(interval);
  }, [fetchMetricData]);

  if (!isInitialized) return <div>Esperando inicialización de AWS...</div>;
  if (loading) return <div>Cargando métrica...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!chartData) return <div>No hay datos disponibles</div>;

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: metric.unit || ''
        }
      },
      x: {
        title: {
          display: true,
          text: 'Tiempo'
        },
        adapters: {
          date: {
            locale: 'es'
          }
        },
        type: 'time',
        time: {
          unit: 'minute',
          displayFormats: {
            minute: 'HH:mm'
          }
        }
      }
    }
  };

  return (
    <div className="metric-chart" style={{ height: '300px', marginBottom: '20px' }}>
      <h3>{metric.label || metric.metricName}</h3>
      <Line data={chartData} options={options} />
    </div>
  );
}; 