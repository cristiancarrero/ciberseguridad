import React, { useState, useEffect } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { getCloudWatchInstances } from '../../services/cloudwatchInstanceService';

const AlarmForm = ({ onBack, onSubmit, initialData = null }) => {
  const [instances, setInstances] = useState([]);
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    metric: initialData?.metric || 'cpu',
    instance: initialData?.instance || '',
    condition: initialData?.condition || 'greater',
    threshold: initialData?.threshold || '',
    email: initialData?.email || ''
  });

  useEffect(() => {
    const fetchInstances = async () => {
      try {
        const awsConfig = JSON.parse(localStorage.getItem('awsConfig'));
        if (!awsConfig) {
          console.error('No se encontró configuración de AWS');
          return;
        }

        console.log('Obteniendo instancias...');
        const instancesList = await getCloudWatchInstances();
        console.log('Instancias obtenidas:', instancesList);
        setInstances(instancesList);
      } catch (error) {
        console.error('Error al obtener instancias:', error);
      }
    };

    fetchInstances();
  }, []);

  useEffect(() => {
    console.log('Estado de instances actualizado:', instances);
  }, [instances]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="tab-content">
      <div className="content-header">
        <button className="back-button" onClick={onBack}>
          <FaArrowLeft /> Volver
        </button>
        <h2 className="content-title">
          {initialData ? 'Editar Alarma' : 'Nueva Alarma'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="alarm-form">
        <div className="form-group">
          <label>Nombre de la Alarma</label>
          <input
            type="text"
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
            placeholder="Mi Alarma"
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
            onChange={e => {
              const selectedInstance = instances.find(i => i.id === e.target.value);
              setFormData({
                ...formData, 
                instance: e.target.value,
                instanceName: selectedInstance?.name || e.target.value
              });
            }}
            required
          >
            <option value="">Seleccionar instancia</option>
            {instances && instances.length > 0 ? (
              instances.map(instance => (
                <option key={instance.id} value={instance.id}>
                  {instance.name || instance.id}
                </option>
              ))
            ) : (
              <option value="" disabled>Cargando instancias...</option>
            )}
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
            onChange={e => {
              const value = e.target.value;
              if (value === '') {
                setFormData({...formData, threshold: ''});
              } else {
                const numValue = parseFloat(value);
                if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
                  const cleanValue = Number(numValue.toFixed(2)).toString();
                  setFormData({...formData, threshold: cleanValue});
                }
              }
            }}
            onFocus={e => {
              if (formData.threshold === '0') {
                setFormData({...formData, threshold: ''});
              }
            }}
            onBlur={e => {
              const value = parseFloat(e.target.value);
              if (isNaN(value) || value < 0) {
                setFormData({...formData, threshold: '0'});
              } else if (value > 100) {
                setFormData({...formData, threshold: '100'});
              } else {
                setFormData({...formData, threshold: Number(value.toFixed(2)).toString()});
              }
            }}
            step="0.01"
            min="0"
            max="100"
            placeholder="Ej: 80"
            required
          />
          <small className="form-help">
            Valor entre 0 y 100% (máximo 2 decimales)
          </small>
        </div>

        <div className="form-group">
          <label>Email para notificaciones (opcional)</label>
          <input
            type="email"
            value={formData.email}
            onChange={e => setFormData({...formData, email: e.target.value})}
            placeholder="ejemplo@correo.com"
          />
          <small className="form-help">
            Si proporcionas un email, recibirás notificaciones cuando la alarma se active
          </small>
        </div>

        <div className="form-actions">
          <button type="button" className="cancel-btn" onClick={onBack}>
            Cancelar
          </button>
          <button type="submit" className="save-btn">
            {initialData ? 'Guardar Cambios' : 'Crear Alarma'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AlarmForm; 