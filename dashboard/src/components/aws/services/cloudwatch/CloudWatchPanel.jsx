import React, { useState, useEffect } from 'react';
import { FaChartLine, FaBell, FaList } from 'react-icons/fa';
import MetricsPanel from './MetricsPanel';
import AlarmsPanel from './AlarmsPanel';
import LogsPanel from './LogsPanel';
import './styles/cloudwatch.css';
import { initializeCloudWatch } from './services/cloudwatchService';

const CloudWatchPanel = ({ isOpen, onClose, onAddMetric }) => {
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('cloudwatchActiveTab') || 'metrics';
  });

  useEffect(() => {
    localStorage.setItem('cloudwatchActiveTab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    const savedIsOpen = localStorage.getItem('isCloudWatchOpen');
    if (savedIsOpen === 'true' && !isOpen) {
      onClose();
    }
  }, [isOpen, onClose]);

  useEffect(() => {
    // Inicializar CloudWatch cuando se abre el panel
    if (isOpen) {
      const awsConfig = JSON.parse(localStorage.getItem('awsConfig'));
      if (awsConfig) {
        console.log('Inicializando CloudWatch desde panel:', awsConfig);
        try {
          initializeCloudWatch(awsConfig);
        } catch (error) {
          console.error('Error inicializando CloudWatch:', error);
        }
      }
    }
  }, [isOpen]);

  const tabs = [
    {
      id: 'metrics',
      label: 'Métricas',
      icon: <FaChartLine />,
      component: <MetricsPanel onAddMetric={onAddMetric} />
    },
    {
      id: 'alarms',
      label: 'Alarmas',
      icon: <FaBell />,
      component: <AlarmsPanel />
    },
    {
      id: 'logs',
      label: 'Logs',
      icon: <FaList />,
      component: <LogsPanel />
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="cloudwatch-panel">
        <div className="panel-header">
          <h2><FaChartLine /> Amazon CloudWatch</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="panel-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        <div className="panel-content">
          {tabs.find(tab => tab.id === activeTab)?.component}
        </div>
      </div>
    </div>
  );
};

export default CloudWatchPanel; 