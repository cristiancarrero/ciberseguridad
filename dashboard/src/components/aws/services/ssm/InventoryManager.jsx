import React, { useState, useEffect } from 'react';
import { FaServer, FaDesktop, FaDatabase, FaFilter, FaSpinner } from 'react-icons/fa';
import './styles/inventory-manager.css';
import { getManagedInstances, getDetailedInventory, getInstancesConnectionStatus } from '../../../../services/ssmService';

const InventoryManager = () => {
  const [instances, setInstances] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadInventoryData = async () => {
      try {
        setLoading(true);
        const [instancesData, statusData] = await Promise.all([
          getManagedInstances(),
          getInstancesConnectionStatus()
        ]);
        
        setInstances(instancesData);
        setConnectionStatus(statusData);
      } catch (err) {
        console.error('Error loading inventory:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadInventoryData();
  }, []);

  if (loading) {
    return (
      <div className="loading-state">
        <FaSpinner className="fa-spin" />
        <p>Cargando inventario...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-state">
        <p>Error al cargar el inventario: {error}</p>
      </div>
    );
  }

  return (
    <div className="inventory-manager">
      <div className="inventory-header">
        <h3>Inventario de Recursos</h3>
        <div className="inventory-filters">
          <div className="search-box">
            <input type="text" placeholder="Buscar recursos..." />
            <FaFilter />
          </div>
          <select>
            <option value="all">Todos los tipos</option>
            <option value="ec2">EC2 Instances</option>
            <option value="rds">RDS Databases</option>
            <option value="lambda">Lambda Functions</option>
          </select>
        </div>
      </div>

      <div className="inventory-summary">
        <div className="summary-card">
          <FaServer className="summary-icon" />
          <div className="summary-info">
            <span className="count">{connectionStatus?.online || 0}</span>
            <span className="label">Conectadas</span>
          </div>
        </div>
        <div className="summary-card">
          <FaDatabase className="summary-icon" />
          <div className="summary-info">
            <span className="count">{connectionStatus?.offline || 0}</span>
            <span className="label">Desconectadas</span>
          </div>
        </div>
        <div className="summary-card">
          <FaDesktop className="summary-icon" />
          <div className="summary-info">
            <span className="count">{connectionStatus?.total || 0}</span>
            <span className="label">Total</span>
          </div>
        </div>
      </div>

      <div className="inventory-list">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Plataforma</th>
              <th>IP</th>
              <th>Estado</th>
              <th>Versión Agente</th>
            </tr>
          </thead>
          <tbody>
            {instances.map(instance => (
              <tr key={instance.instanceId}>
                <td>{instance.instanceId}</td>
                <td>{instance.computerName}</td>
                <td>{`${instance.platform} ${instance.platformVersion}`}</td>
                <td>{instance.ipAddress}</td>
                <td>
                  <span className={`status-badge ${instance.pingStatus.toLowerCase()}`}>
                    {instance.pingStatus}
                  </span>
                </td>
                <td>{instance.agentVersion}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryManager; 