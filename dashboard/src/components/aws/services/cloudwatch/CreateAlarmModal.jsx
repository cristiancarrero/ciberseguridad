import React, { useState } from 'react';
import { useAWS } from '../../../../context/AWSContext';
import { FaBell } from 'react-icons/fa';
import '../../../../styles/components/modal.css';

const METRIC_OPTIONS = [
  {
    value: 'CPUUtilization',
    label: 'CPU Utilization',
    unit: '%',
    defaultThreshold: 80
  },
  {
    value: 'MemoryUtilization',
    label: 'Memory Usage',
    unit: '%',
    defaultThreshold: 80
  },
  {
    value: 'DiskSpaceUtilization',
    label: 'Disk Space Usage',
    unit: '%',
    defaultThreshold: 85
  }
];

const CONDITION_OPTIONS = [
  { value: 'GreaterThanThreshold', label: 'Mayor que' },
  { value: 'LessThanThreshold', label: 'Menor que' },
  { value: 'GreaterThanOrEqualToThreshold', label: 'Mayor o igual que' }
];

const CreateAlarmModal = ({ onClose, onCreate }) => {
  const { instances } = useAWS();
  const [formData, setFormData] = useState({
    name: '',
    metric: METRIC_OPTIONS[0].value,
    condition: CONDITION_OPTIONS[0].value,
    threshold: METRIC_OPTIONS[0].defaultThreshold,
    instance: ''
  });

  const handleMetricChange = (metric) => {
    const selectedMetric = METRIC_OPTIONS.find(m => m.value === metric);
    setFormData({
      ...formData,
      metric,
      threshold: selectedMetric.defaultThreshold
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Aquí implementaremos la creación de la alarma usando AWS SDK
      console.log('Creando alarma:', formData);
      onCreate(formData);
    } catch (error) {
      console.error('Error al crear alarma:', error);
    }
  };

  console.log('CreateAlarmModal renderizado');

  return (
    <div className="instance-selector-wrapper" onClick={onClose}>
      <div className="instance-selector-modal" onClick={e => e.stopPropagation()}>
        <div className="instance-selector-header">
          <h3>
            <FaBell />
            Crear Nueva Alarma
          </h3>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="instance-selector-content">
            <div className="form-content">
              <div className="form-group">
                <label>Nombre de la Alarma</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Métrica</label>
                <select
                  value={formData.metric}
                  onChange={e => handleMetricChange(e.target.value)}
                  required
                >
                  {METRIC_OPTIONS.map(metric => (
                    <option key={metric.value} value={metric.value}>
                      {metric.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Instancia</label>
                <select
                  value={formData.instance}
                  onChange={e => setFormData({...formData, instance: e.target.value})}
                  required
                >
                  <option value="">Seleccionar instancia</option>
                  {instances.map(instance => (
                    <option key={instance.id} value={instance.id}>
                      {instance.name || instance.id}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Condición</label>
                <select
                  value={formData.condition}
                  onChange={e => setFormData({...formData, condition: e.target.value})}
                  required
                >
                  {CONDITION_OPTIONS.map(condition => (
                    <option key={condition.value} value={condition.value}>
                      {condition.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Umbral</label>
                <input
                  type="number"
                  value={formData.threshold}
                  onChange={e => setFormData({...formData, threshold: e.target.value})}
                  required
                />
              </div>
            </div>
          </div>

          <div className="instance-selector-footer">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="confirm-btn">
              Crear Alarma
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAlarmModal;