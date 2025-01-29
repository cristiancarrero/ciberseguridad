import React, { useState, useEffect } from 'react';
import { FaTimes, FaAws, FaChartLine } from 'react-icons/fa';
import { getEC2Client, getCloudWatchClient } from '../../../../services/awsClientsService';
import { 
  DescribeInstancesCommand,
} from "@aws-sdk/client-ec2";
import {
  GetMetricDataCommand,
} from "@aws-sdk/client-cloudwatch";

const CloudWatchManager = ({ isOpen, onClose, onAddMetric }) => {
  const [instances, setInstances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState({
    instanceId: '',
    metricName: '',
    period: 300,
    statistic: 'Average'
  });

  useEffect(() => {
    if (isOpen) {
      loadInstances();
    }
  }, [isOpen]);

  const loadInstances = async () => {
    try {
      setLoading(true);
      setError(null);

      const ec2Client = getEC2Client();
      const command = new DescribeInstancesCommand({});
      const response = await ec2Client.send(command);

      const instancesList = response.Reservations
        .flatMap(reservation => reservation.Instances)
        .map(instance => ({
          id: instance.InstanceId,
          name: instance.Tags?.find(tag => tag.Key === 'Name')?.Value || 'Sin nombre',
          state: instance.State.Name
        }));

      setInstances(instancesList);
    } catch (error) {
      console.error('Error loading instances:', error);
      setError('Error al cargar las instancias');
    } finally {
      setLoading(false);
    }
  };

  const handleMetricChange = (field, value) => {
    setSelectedMetric(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddMetric = async () => {
    try {
      const cloudWatchClient = getCloudWatchClient();
      
      // Validar que se hayan seleccionado todos los campos necesarios
      if (!selectedMetric.instanceId || !selectedMetric.metricName) {
        throw new Error('Por favor selecciona una instancia y una métrica');
      }

      // Crear la nueva métrica
      const newMetric = {
        ...selectedMetric,
        id: `${selectedMetric.instanceId}-${selectedMetric.metricName}`,
        label: `${selectedMetric.metricName} (${selectedMetric.instanceId})`,
      };

      // Añadir la métrica
      onAddMetric(newMetric);
      onClose();
    } catch (error) {
      console.error('Error adding metric:', error);
      setError('Error al añadir la métrica');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2><FaChartLine /> Añadir Métrica de CloudWatch</h2>
          <button className="close-button" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="modal-body">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label>Instancia EC2</label>
            <select
              value={selectedMetric.instanceId}
              onChange={(e) => handleMetricChange('instanceId', e.target.value)}
            >
              <option value="">Selecciona una instancia</option>
              {instances.map(instance => (
                <option key={instance.id} value={instance.id}>
                  {instance.name} ({instance.id})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Métrica</label>
            <select
              value={selectedMetric.metricName}
              onChange={(e) => handleMetricChange('metricName', e.target.value)}
            >
              <option value="">Selecciona una métrica</option>
              <option value="CPUUtilization">CPU Utilization</option>
              <option value="NetworkIn">Network In</option>
              <option value="NetworkOut">Network Out</option>
              <option value="DiskReadBytes">Disk Read Bytes</option>
              <option value="DiskWriteBytes">Disk Write Bytes</option>
            </select>
          </div>

          <div className="form-group">
            <label>Período (segundos)</label>
            <select
              value={selectedMetric.period}
              onChange={(e) => handleMetricChange('period', Number(e.target.value))}
            >
              <option value={60}>1 minuto</option>
              <option value={300}>5 minutos</option>
              <option value={900}>15 minutos</option>
              <option value={3600}>1 hora</option>
            </select>
          </div>

          <div className="form-group">
            <label>Estadística</label>
            <select
              value={selectedMetric.statistic}
              onChange={(e) => handleMetricChange('statistic', e.target.value)}
            >
              <option value="Average">Promedio</option>
              <option value="Maximum">Máximo</option>
              <option value="Minimum">Mínimo</option>
              <option value="Sum">Suma</option>
            </select>
          </div>
        </div>

        <div className="modal-footer">
          <button className="cancel-btn" onClick={onClose}>
            Cancelar
          </button>
          <button 
            className="add-btn"
            onClick={handleAddMetric}
            disabled={loading || !selectedMetric.instanceId || !selectedMetric.metricName}
          >
            Añadir Métrica
          </button>
        </div>
      </div>
    </div>
  );
};

export default CloudWatchManager; 