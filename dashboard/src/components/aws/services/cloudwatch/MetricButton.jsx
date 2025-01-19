import React, { useState } from 'react';
import InstanceSelectorModal from './InstanceSelectorModal';
import { getInstanceMetrics } from './services/cloudwatchService';

const MetricButton = ({ metricType, description, unit, onMetricAdd }) => {
  const [showModal, setShowModal] = useState(false);

  const handleInstanceSelect = async (instance) => {
    try {
      const metrics = await getInstanceMetrics(instance.id, metricType);
      onMetricAdd(metrics);
      setShowModal(false);
    } catch (error) {
      console.error('Error al obtener métricas:', error);
    }
  };

  return (
    <div className="metric-box">
      <div className="metric-box-header">
        <h3>{metricType}</h3>
        <span className="metric-box-unit">{unit}</span>
      </div>
      <p className="metric-box-description">{description}</p>
      <button 
        className="add-metric-btn"
        onClick={() => setShowModal(true)}
      >
        Añadir a Métricas
      </button>

      {showModal && (
        <InstanceSelectorModal
          onClose={() => setShowModal(false)}
          onSelect={handleInstanceSelect}
        />
      )}
    </div>
  );
};

export default MetricButton; 