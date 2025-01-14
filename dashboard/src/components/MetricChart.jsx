import React, { useEffect, useState, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getInstanceMetrics } from '../services/cloudwatchService';

// Cache global para los datos de las métricas
const metricsCache = new Map();

const MetricChart = ({ metricData, timeRange, onValueUpdate }) => {
  const [chartData, setChartData] = useState([]);
  const lastFetchRef = useRef(0);
  const cacheKey = `${metricData.instanceId}-${metricData.type}-${timeRange}`;

  useEffect(() => {
    const fetchMetricData = async () => {
      try {
        if (!metricData.instanceId) return;

        const now = Date.now();
        const cachedData = metricsCache.get(cacheKey);
        if (cachedData && now - lastFetchRef.current < 60000) {
          setChartData(cachedData);
          if (cachedData.length > 0) {
            onValueUpdate?.(cachedData[cachedData.length - 1].value);
          }
          return;
        }

        let formattedData = [];
        
        if (metricData.type === 'network') {
          const [networkInData, networkOutData] = await Promise.all([
            getInstanceMetrics(metricData.instanceId, 'NetworkIn'),
            getInstanceMetrics(metricData.instanceId, 'NetworkOut')
          ]);

          if (networkInData?.Timestamps && networkOutData?.Timestamps) {
            const combinedData = networkInData.Timestamps.map((timestamp, index) => ({
              timestamp: new Date(timestamp),
              value: (networkInData.Values[index] || 0) + (networkOutData.Values[index] || 0)
            }));

            combinedData.sort((a, b) => b.timestamp - a.timestamp);
            formattedData = combinedData.map(item => ({
              time: item.timestamp.toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit'
              }),
              value: item.value
            })).reverse();
          }
        } else {
          const metricName = {
            cpu: 'CPUUtilization',
            disk: 'EBSReadOps',
            status: 'StatusCheckFailed_System'
          }[metricData.type] || '';

          const response = await getInstanceMetrics(metricData.instanceId, metricName);
          
          if (response?.Timestamps && response?.Values) {
            formattedData = response.Timestamps.map((timestamp, index) => ({
              time: new Date(timestamp).toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit'
              }),
              value: response.Values[index]
            }))
            .sort((a, b) => new Date(b.time) - new Date(a.time))
            .reverse();
          }
        }

        metricsCache.set(cacheKey, formattedData);
        lastFetchRef.current = now;
        setChartData(formattedData);
        
        if (formattedData.length > 0) {
          onValueUpdate?.(formattedData[formattedData.length - 1].value);
        }
      } catch (error) {
        console.error('Error al obtener datos de la métrica:', error);
      }
    };

    fetchMetricData();
    const interval = setInterval(fetchMetricData, 60000);
    return () => clearInterval(interval);
  }, [metricData.instanceId, metricData.type, timeRange, onValueUpdate, cacheKey]);

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