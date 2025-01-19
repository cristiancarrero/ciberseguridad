import React from 'react';
import { FaTimes, FaChartLine } from 'react-icons/fa';
import MetricVisualization from './MetricVisualization';

const MetricVisualizationModal = ({ metric, instance, onClose, onAddToDashboard }) => {
  const handleAddToDashboard = () => {
    // Formatear la métrica según el formato esperado por el dashboard
    const formattedMetric = {
      title: metric.title,
      type: metric.id, // Mantener el ID original sin convertir a minúsculas
      unit: metric.unit,
      instanceId: instance.id,
      instanceName: instance.name || instance.id,
      id: `${metric.id}_${instance.id}`,
      value: 0
    };

    console.log('Enviando métrica formateada:', formattedMetric);
    onAddToDashboard?.(formattedMetric);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="metric-modal-content" onClick={e => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>
          <FaTimes />
        </button>
        <div className="metric-modal-actions">
          <button 
            className="add-to-dashboard-btn" 
            onClick={handleAddToDashboard}
            title="Añadir al dashboard"
          >
            <FaChartLine />
            Añadir al Dashboard
          </button>
        </div>
        <MetricVisualization
          metric={metric}
          instanceId={instance.id}
          onAuthError={onClose}
        />
      </div>
    </div>
  );
};

export default MetricVisualizationModal; 