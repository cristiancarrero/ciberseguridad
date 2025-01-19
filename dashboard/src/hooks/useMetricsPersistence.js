import { useState, useEffect } from 'react';

export const useMetricsPersistence = () => {
  const [metrics, setMetrics] = useState(() => {
    try {
      const savedMetrics = localStorage.getItem('dashboard_metrics');
      const parsedMetrics = savedMetrics ? JSON.parse(savedMetrics) : [];
      console.log('Métricas cargadas del localStorage:', parsedMetrics);
      return parsedMetrics;
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
      console.log('Guardando métricas en localStorage:', metrics);
      localStorage.setItem('dashboard_metrics', JSON.stringify(metrics));
    } catch (error) {
      console.error('Error al guardar métricas:', error);
    }
  }, [metrics]);

  useEffect(() => {
    try {
      localStorage.setItem('dashboard_metric_values', JSON.stringify(metricValues));
    } catch (error) {
      console.error('Error al guardar valores de métricas:', error);
    }
  }, [metricValues]);

  const addMetric = (newMetric) => {
    console.log('Intentando añadir nueva métrica:', newMetric);
    if (!newMetric || !newMetric.id) {
      console.error('Métrica inválida:', newMetric);
      return;
    }

    // Verificar si la métrica ya existe
    const exists = metrics.some(m => 
      m.id === newMetric.id && 
      m.instanceId === newMetric.instanceId
    );

    if (!exists) {
      const metricToAdd = {
        ...newMetric,
        addedAt: new Date().toISOString()
      };
      console.log('Añadiendo métrica:', metricToAdd);
      setMetrics(prev => {
        const updatedMetrics = [...prev, metricToAdd];
        console.log('Nuevo estado de métricas:', updatedMetrics);
        return updatedMetrics;
      });
    } else {
      console.log('La métrica ya existe en el dashboard');
    }
  };

  const removeMetric = (index) => {
    console.log('Eliminando métrica en índice:', index);
    setMetrics(prev => {
      const updatedMetrics = prev.filter((_, i) => i !== index);
      console.log('Métricas después de eliminar:', updatedMetrics);
      return updatedMetrics;
    });
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