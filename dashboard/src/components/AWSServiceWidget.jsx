import React, { useEffect } from 'react';
import { useAWS } from '../context/AWSContext';
import { FaServer, FaUsers, FaShieldAlt, FaChartLine, FaDatabase } from 'react-icons/fa';
import { listInstances, listSecurityGroups } from '../services/ec2Service';
import '../styles/components/aws-widget.css';
import S3Manager from './aws/services/s3/S3Manager';

const AWSServiceWidget = ({ service, icon, onClick, customMetrics }) => {
  const awsContext = useAWS();
  const { 
    instances = [], 
    securityGroups = [], 
    updateInstances, 
    updateSecurityGroups 
  } = awsContext || {};
  const [showS3Manager, setShowS3Manager] = React.useState(false);

  // Cargar datos iniciales y mantenerlos actualizados
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (service === 'EC2') {
          const instancesData = await listInstances();
          updateInstances(instancesData);
        }
      } catch (error) {
        console.error('Error al cargar datos:', error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [service]);

  const getServiceIcon = () => {
    switch (service) {
      case 'CloudWatch':
        return <FaChartLine />;
      case 'EC2':
        return <FaServer />;
      case 'IAM':
        return <FaUsers />;
      case 'Security':
        return <FaShieldAlt />;
      case 'S3':
        return <FaDatabase />;
      case 'SSM':
        return icon;
      default:
        return null;
    }
  };

  const getServiceStatus = () => {
    switch (service) {
      case 'EC2':
        return instances && instances.some(instance => instance.state === 'running');
      case 'IAM':
      case 'GuardDuty':
      case 'SSM':
      default:
        return false;
    }
  };

  const getServiceMetrics = () => {
    if (customMetrics) {
      return customMetrics;
    }

    switch (service) {
      case 'EC2':
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
      case 'SSM':
        return {
          primary: {
            label: 'Parches Pendientes',
            value: '-'
          },
          secondary: {
            label: 'Recursos Gestionados',
            value: '-'
          }
        };
      default:
        return {
          primary: {
            label: 'No disponible',
            value: '-'
          },
          secondary: {
            label: 'No disponible',
            value: '-'
          }
        };
    }
  };

  const metrics = getServiceMetrics();
  const isConnected = getServiceStatus();

  const handleClick = () => {
    if (service === 'S3') {
      setShowS3Manager(true);
    } else if (onClick) {
      onClick(service);
    }
  };

  return (
    <>
      <div className="aws-service-widget" onClick={handleClick}>
        <div className="widget-header">
          <div className="service-icon">
            {getServiceIcon()}
          </div>
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

      {showS3Manager && (
        <S3Manager onClose={() => setShowS3Manager(false)} />
      )}
    </>
  );
};

export default AWSServiceWidget; 