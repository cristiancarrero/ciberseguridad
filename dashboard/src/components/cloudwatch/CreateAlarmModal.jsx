import React, { useState } from 'react';
import { useAWS } from '../../context/AWSContext';
import { FaBell } from 'react-icons/fa';
import '../../styles/components/modal.css';

const CreateAlarmModal = ({ onClose, onCreate }) => {
  const { instances } = useAWS();
  const [formData, setFormData] = useState({
    name: '',
    metric: 'cpu',
    instance: '',
    condition: 'greater',
    threshold: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreate({
      ...formData,
      status: 'OK',
      createdAt: new Date().toISOString()
    });
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
                  onChange={e => setFormData({...formData, metric: e.target.value})}
                  required
                >
                  <option value="cpu">CPU Utilization</option>
                  <option value="memory">Memory Usage</option>
                  <option value="disk">Disk Usage</option>
                  <option value="network">Network I/O</option>
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
                  <option value="greater">Mayor que</option>
                  <option value="less">Menor que</option>
                  <option value="equal">Igual a</option>
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