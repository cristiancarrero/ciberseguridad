import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getInstanceMetrics } from '../services/cloudwatchService';

const MetricChart = ({ metricData, timeRange }) => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchMetricData = async () => {
      try {
        let metricName;
        switch(metricData.type) {
          case 'cpu':
            metricName = 'CPUUtilization';
            break;
          case 'network':
            metricName = 'NetworkIn';
            break;
          case 'disk':
            metricName = 'DiskReadOps';
            break;
          case 'status':
            metricName = 'StatusCheckFailed';
            break;
          default:
            metricName = '';
        }

        console.log('Solicitando métrica:', metricName, 'para instancia:', metricData.instanceId);
        const response = await getInstanceMetrics(metricData.instanceId, metricName);
        console.log('Respuesta de métrica:', response);
        
        if (response && response.Timestamps && response.Values) {
          const formattedData = response.Timestamps.map((timestamp, index) => ({
            time: new Date(timestamp).toLocaleTimeString('es-ES', {
              hour: '2-digit',
              minute: '2-digit'
            }),
            value: response.Values[index]
          }));
          setChartData(formattedData);
        }
      } catch (error) {
        console.error('Error al obtener datos de la métrica:', error);
      }
    };

    fetchMetricData();
    const interval = setInterval(fetchMetricData, 60000);
    return () => clearInterval(interval);
  }, [metricData.instanceId, metricData.type, timeRange]);

  return (
    <div className="metric-chart">
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
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
    </div>
  );
};

export default MetricChart; 