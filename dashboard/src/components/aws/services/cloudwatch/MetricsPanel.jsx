// Componente principal para el panel de métricas de CloudWatch
// Muestra la instancia seleccionada y la lista de métricas disponibles

import React, { useState, useEffect } from 'react';
import { FaServer, FaEye, FaExchangeAlt, FaChartLine } from 'react-icons/fa';
import InstanceSelectorModal from './InstanceSelectorModal';
import MetricVisualizationModal from './MetricVisualizationModal';

// Props:
// - onAddMetric: Función que se llama cuando se añade una métrica al dashboard
const MetricsPanel = ({ onAddMetric }) => {
  // Estado para manejar la instancia seleccionada y los modales
  const [selectedInstance, setSelectedInstance] = useState(null);
  const [showInstanceSelector, setShowInstanceSelector] = useState(false);
  const [showMetricPreview, setShowMetricPreview] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState(null);

  // Cargar la instancia guardada en localStorage al montar el componente
  useEffect(() => {
    const savedInstance = localStorage.getItem('selectedInstance');
    if (savedInstance) {
      setSelectedInstance(JSON.parse(savedInstance));
    }
  }, []);

  // Guardar la instancia en localStorage cuando cambie
  useEffect(() => {
    if (selectedInstance) {
      localStorage.setItem('selectedInstance', JSON.stringify(selectedInstance));
    }
  }, [selectedInstance]);

  // Lista de métricas disponibles con sus propiedades
  const metrics = [
    {
      id: 'CPUUtilization',
      title: 'CPU Utilization',
      description: 'Uso de CPU de la instancia',
      icon: '📊',
      unit: '%'
    },
    {
      id: 'MemoryUtilization',
      title: 'Memory Usage',
      description: 'Uso de memoria RAM',
      icon: '💾',
      unit: 'GB'
    },
    {
      id: 'NetworkIn',
      title: 'Network In',
      description: 'Tráfico de red entrante',
      icon: '🌐',
      unit: 'Bytes'
    },
    {
      id: 'NetworkOut',
      title: 'Network Out',
      description: 'Tráfico de red saliente',
      icon: '🌐',
      unit: 'Bytes'
    },
    {
      id: 'DiskReadBytes',
      title: 'Disk Read',
      description: 'Bytes leídos del disco',
      icon: '💿',
      unit: 'Bytes'
    },
    {
      id: 'DiskWriteBytes',
      title: 'Disk Write',
      description: 'Bytes escritos en disco',
      icon: '💿',
      unit: 'Bytes'
    },
    {
      id: 'StatusCheckFailed',
      title: 'Status Check Failed',
      description: 'Verificaciones de estado fallidas',
      icon: '🔍',
      unit: 'Count'
    }
  ];

  // Manejadores de eventos para la instancia
  const handleInstanceSelect = (instance) => {
    setSelectedInstance(instance);
    setShowInstanceSelector(false);
  };

  const handleChangeInstance = () => {
    setShowInstanceSelector(true);
  };

  const handleClearInstance = () => {
    setSelectedInstance(null);
    localStorage.removeItem('selectedInstance');
  };

  // Manejadores para la previsualización y adición de métricas
  const handlePreviewMetric = (metric) => {
    setSelectedMetric(metric);
    setShowMetricPreview(true);
  };

  const handleAddToDashboard = (metric) => {
    const metricConfig = {
      title: metric.title,
      type: metric.id,
      unit: metric.unit,
      instanceId: selectedInstance.id,
      instanceName: selectedInstance.name || selectedInstance.id,
      id: `${metric.id}_${selectedInstance.id}`,
      value: 0
    };
    console.log('Añadiendo métrica al dashboard:', metricConfig);
    onAddMetric?.(metricConfig);
  };

  return (
    <div className="metrics-panel">
      {/* Header: Muestra la instancia seleccionada o el botón para seleccionar una */}
      <div className="instance-header">
        {selectedInstance ? (
          <>
            <div className="instance-info">
              <FaServer />
              <div>
                <h3>{selectedInstance.name || selectedInstance.id}</h3>
                <span>{selectedInstance.id}</span>
              </div>
              <button 
                className="change-instance-btn"
                onClick={handleChangeInstance}
                title="Cambiar Instancia"
              >
                <FaExchangeAlt />
              </button>
            </div>
            <div className="instance-actions">
              <button 
                className="clear-instance-btn"
                onClick={handleClearInstance}
                title="Limpiar selección"
              >
                ×
              </button>
            </div>
          </>
        ) : (
          <button 
            className="select-instance-btn"
            onClick={() => setShowInstanceSelector(true)}
          >
            <FaServer /> Seleccionar Instancia
          </button>
        )}
      </div>

      {/* Grid de métricas: Solo se muestra cuando hay una instancia seleccionada */}
      {selectedInstance && (
        <div className="metrics-grid">
          {metrics.map(metric => (
            <div key={metric.id} className="metric-card">
              <div className="metric-icon">{metric.icon}</div>
              <div className="metric-info">
                <h4>{metric.title}</h4>
                <p>{metric.description}</p>
                <div className="metric-unit">Unidad: {metric.unit}</div>
              </div>
              <div className="metric-actions">
                <button 
                  className="preview-btn"
                  onClick={() => handlePreviewMetric(metric)}
                  title="Vista previa"
                >
                  <FaEye /> Vista Previa
                </button>
                <button 
                  className="add-to-dashboard-btn"
                  onClick={() => handleAddToDashboard(metric)}
                  title="Añadir al dashboard"
                >
                  <FaChartLine /> Añadir al Dashboard
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal para seleccionar instancia */}
      {showInstanceSelector && (
        <InstanceSelectorModal
          onClose={() => setShowInstanceSelector(false)}
          onSelect={handleInstanceSelect}
        />
      )}

      {/* Modal para previsualizar métrica */}
      {showMetricPreview && selectedMetric && (
        <MetricVisualizationModal
          metric={selectedMetric}
          instance={selectedInstance}
          onClose={() => setShowMetricPreview(false)}
          onAddToDashboard={handleAddToDashboard}
        />
      )}
    </div>
  );
};

export default MetricsPanel; 