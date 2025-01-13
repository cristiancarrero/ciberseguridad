import React, { useEffect } from 'react';
import { useAWS } from '../context/AWSContext';
import { FaServer, FaUsers, FaShield } from 'react-icons/fa';
import { listInstances, listSecurityGroups } from '../services/ec2Service';
import '../styles/components/aws-widget.css';

const AWSServiceWidget = ({ service }) => {
  const { instances, securityGroups, updateInstances, updateSecurityGroups } = useAWS();

  // Cargar datos iniciales y mantenerlos actualizados
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (service === 'EC2') {
          const instancesData = await listInstances();
          updateInstances(instancesData);
          const groupsData = await listSecurityGroups();
          updateSecurityGroups(groupsData);
        }
      } catch (error) {
        console.error('Error al cargar datos:', error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000); // Actualizar cada 5 segundos
    return () => clearInterval(interval);
  }, [service]);

  const getServiceIcon = () => {
    switch (service) {
      case 'EC2':
        return <FaServer />;
      case 'IAM':
        return <FaUsers />;
      case 'GuardDuty':
        return <FaShield />;
      default:
        return null;
    }
  };

  const getServiceStatus = () => {
    switch (service) {
      case 'EC2':
        // Verificar si hay instancias en estado running
        return instances && instances.some(instance => instance.state === 'running');
      case 'IAM':
        return false;
      case 'GuardDuty':
        return false;
      default:
        return false;
    }
  };

  const getServiceMetrics = () => {
    switch (service) {
      case 'EC2':
        // Contar instancias running y grupos de seguridad
        const runningInstances = instances ? instances.filter(instance => instance.state === 'running').length : 0;
        const totalGroups = securityGroups ? securityGroups.length : 0;
        
        return {
          primary: {
            label: 'Instancias Activas',
            value: runningInstances
          },
          secondary: {
            label: 'Security Groups',
            value: totalGroups
          }
        };
      case 'IAM':
        return {
          primary: {
            label: 'Usuarios',
            value: '-'
          },
          secondary: {
            label: 'Roles',
            value: '-'
          }
        };
      case 'GuardDuty':
        return {
          primary: {
            label: 'Amenazas Detectadas',
            value: '-'
          },
          secondary: {
            label: 'Regiones Monitorizadas',
            value: '-'
          }
        };
      default:
        return null;
    }
  };

  const metrics = getServiceMetrics();
  const isConnected = getServiceStatus();

  return (
    <div className="aws-service-widget">
      <div className="widget-header">
        {getServiceIcon()}
        <h3>{service}</h3>
        <span className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
          {isConnected ? 'Conectado' : 'Desconectado'}
        </span>
      </div>

      <div className="widget-metrics">
        <div className="metric-item">
          <label>{metrics.primary.label}</label>
          <span className="metric-value">{metrics.primary.value}</span>
        </div>
        <div className="metric-item">
          <label>{metrics.secondary.label}</label>
          <span className="metric-value">{metrics.secondary.value}</span>
        </div>
      </div>

      <button className="widget-action-button">
        Gestionar
      </button>
    </div>
  );
};

export default AWSServiceWidget; 