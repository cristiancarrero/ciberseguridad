import React, { useEffect } from 'react';
import { useAWS } from '../context/AWSContext';
import { FaServer } from 'react-icons/fa';
import { listInstances, listSecurityGroups } from '../services/ec2Service';

const EC2 = () => {
  const { isConnected, instances, securityGroups, updateInstances, updateSecurityGroups } = useAWS();

  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      try {
        const [instancesData, groupsData] = await Promise.all([
          listInstances(),
          listSecurityGroups()
        ]);
        updateInstances(instancesData);
        updateSecurityGroups(groupsData);
      } catch (error) {
        console.error('Error al cargar datos:', error);
      }
    };

    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="service-card">
      <div className="service-header">
        <FaServer className="service-icon" />
        <h2>EC2</h2>
        <span className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
          {isConnected ? 'Conectado' : 'Desconectado'}
        </span>
      </div>

      <div className="service-info">
        <div className="info-section">
          <h3>Instancias Activas</h3>
          <div className="instance-count">
            {instances.length > 0 ? instances.length : '-'}
          </div>
        </div>

        <div className="info-section">
          <h3>Security Groups</h3>
          <div className="sg-count">
            {securityGroups.length > 0 ? securityGroups.length : '-'}
          </div>
        </div>
      </div>

      <button className="manage-button">
        Gestionar
      </button>
    </div>
  );
};

export default EC2; 