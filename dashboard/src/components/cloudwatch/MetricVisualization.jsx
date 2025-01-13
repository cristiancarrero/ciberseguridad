import React, { useEffect, useState } from 'react';
import { getInstanceMetrics } from '../../services/cloudwatchService';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const MetricVisualization = ({ metric, instanceId }) => {
  const [metricData, setMetricData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadMetricData();
    const interval = setInterval(loadMetricData, 300000); // Actualizar cada 5 minutos
    return () => clearInterval(interval);
  }, [metric.id, instanceId]);

  const loadMetricData = async () => {
    try {
      setLoading(true);
      console.log('Cargando métrica:', { metric, instanceId });
      const data = await getInstanceMetrics(instanceId, metric.id);
      console.log('Datos recibidos:', data);
      setMetricData(data);
      setError(null);
    } catch (err) {
      console.error('Error loading metric:', err);
      setError('Error al cargar la métrica');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="metric-loading">
        <div className="loading-spinner"></div>
        <p>Cargando métrica...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="metric-error">
        <p>{error}</p>
        <button onClick={loadMetricData}>Reintentar</button>
      </div>
    );
  }

  if (!metricData || !metricData.Values || metricData.Values.length === 0) {
    return (
      <div className="metric-no-data">
        <p>No hay datos disponibles para esta métrica</p>
      </div>
    );
  }

  const chartData = {
    labels: metricData.Timestamps.map(t => new Date(t).toLocaleTimeString()),
    datasets: [
      {
        label: metric.name,
        data: metricData.Values,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: metric.name
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: metric.unit
        }
      }
    }
  };

  return (
    <div className="metric-visualization">
      <div className="metric-header">
        <div className="metric-title">
          <div className="metric-icon">{metric.icon}</div>
          <h3>{metric.name}</h3>
        </div>
        <span className="metric-value">
          {metricData.Values[metricData.Values.length - 1]?.toFixed(2)} {metric.unit}
        </span>
      </div>
      <div className="metric-chart">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default MetricVisualization; 