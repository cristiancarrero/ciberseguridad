import { useState, useEffect } from 'react';

export const useMetricsPersistence = () => {
  const [metrics, setMetrics] = useState(() => {
    try {
      const savedMetrics = localStorage.getItem('dashboard_metrics');
      return savedMetrics ? JSON.parse(savedMetrics) : [];
    } catch (error) {
      console.error('Error al cargar métricas:', error);
      return [];
    }
  });

  const [metricValues, setMetricValues] = useState(() => {
    try {
      const savedValues = localStorage.getItem('dashboard_metric_values');
      return savedValues ? JSON.parse(savedValues) : {};
    } catch (error) {
      console.error('Error al cargar valores:', error);
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('dashboard_metrics', JSON.stringify(metrics));
      localStorage.setItem('dashboard_metric_values', JSON.stringify(metricValues));
    } catch (error) {
      console.error('Error al guardar datos:', error);
    }
  }, [metrics, metricValues]);

  const addMetric = (newMetric) => {
    setMetrics(prev => [...prev, newMetric]);
  };

  const removeMetric = (index) => {
    setMetrics(prev => prev.filter((_, i) => i !== index));
    setMetricValues(prev => {
      const newValues = { ...prev };
      delete newValues[index];
      return newValues;
    });
  };

  const updateMetricValue = (index, value) => {
    setMetricValues(prev => ({
      ...prev,
      [index]: value
    }));
  };

  return {
    metrics,
    metricValues,
    addMetric,
    removeMetric,
    updateMetricValue
  };
}; 