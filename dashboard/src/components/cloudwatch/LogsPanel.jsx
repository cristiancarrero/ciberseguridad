import React, { useState, useEffect } from 'react';
import { FaSync, FaExclamationTriangle } from 'react-icons/fa';
import { getLogGroups, getLogEventsWithCache, createLogGroup, putLogEvents, syncLogGroupsWithInstances } from '../../services/cloudwatchLogs';
import { getSSHEvents } from '../../services/cloudtrailService';

const LogsPanel = () => {
  // Cargar logs guardados del localStorage si existen
  const savedLogs = localStorage.getItem('cloudwatch-logs');
  const initialLogs = savedLogs ? JSON.parse(savedLogs) : [];

  const [logGroups, setLogGroups] = useState([
    {
      logGroupName: 'all',
      arn: 'all',
      displayName: 'Todos los grupos'
    },
    {
      logGroupName: '/aws/ec2/aws-cloudwatch-alarms',
      arn: 'alarms',
      displayName: 'Alarmas y Eventos'
    }
  ]);
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [logs, setLogs] = useState(initialLogs);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [isLoadingTest, setIsLoadingTest] = useState(false);

  useEffect(() => {
    const loadGroups = async () => {
      try {
        const groups = await syncLogGroupsWithInstances();
        // Filtrar grupos duplicados y mantener los grupos base
        const newGroups = groups.filter(group => 
          group.logGroupName !== 'all' && 
          group.logGroupName !== '/aws/ec2/aws-cloudwatch-alarms'
        );
        
        setLogGroups(prevGroups => {
          const baseGroups = prevGroups.filter(g => 
            g.logGroupName === 'all' || 
            g.logGroupName === '/aws/ec2/aws-cloudwatch-alarms'
          );
          return [...baseGroups, ...newGroups];
        });

        // Cargar logs inmediatamente después de obtener los grupos
        if (selectedGroup) {
          loadAllLogs();
        }
      } catch (err) {
        console.error('Error cargando grupos:', err);
      }
    };
    loadGroups();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      loadAllLogs();
    }
  }, [selectedGroup]);

  useEffect(() => {
    let interval;
    if (autoRefresh && selectedGroup) {
      interval = setInterval(loadAllLogs, 30000);
    }
    return () => clearInterval(interval);
  }, [autoRefresh, selectedGroup]);

  const loadAllLogs = async () => {
    try {
      setLoading(true);
      const endTime = new Date();
      const startTime = new Date(endTime - 24 * 60 * 60 * 1000);
      
      let allLogs = [];
      if (selectedGroup === 'all') {
        // Cargar primero los logs de alarmas para mostrar algo rápido
        const alarmGroup = logGroups.find(g => g.logGroupName.includes('aws-cloudwatch-alarms'));
        if (alarmGroup) {
          const alarmLogs = await getLogEventsWithCache(
            alarmGroup.logGroupName,
            null,
            startTime.getTime(),
            endTime.getTime()
          );
          allLogs.push(...alarmLogs.map(event => ({
            ...event,
            logGroupName: alarmGroup.logGroupName
          })));
          // Actualizar los logs inmediatamente con los primeros resultados
          setLogs(allLogs);
        }

        // Luego cargar el resto de los grupos
        for (const group of logGroups) {
          if (group.logGroupName !== 'all' && 
              group.logGroupName !== alarmGroup?.logGroupName) {
            try {
              const events = await getLogEventsWithCache(
                group.logGroupName,
                null,
                startTime.getTime(),
                endTime.getTime()
              );
              allLogs.push(...events.map(event => ({
                ...event,
                logGroupName: group.logGroupName
              })));
            } catch (err) {
              console.error(`Error cargando logs del grupo ${group.logGroupName}:`, err);
            }
          }
        }
      } else {
        const events = await getLogEventsWithCache(
          selectedGroup,
          null,
          startTime.getTime(),
          endTime.getTime()
        );
        allLogs = events.map(event => ({
          ...event,
          logGroupName: selectedGroup
        }));
      }

      allLogs.sort((a, b) => b.timestamp - a.timestamp);
      setLogs(allLogs);
      localStorage.setItem('cloudwatch-logs', JSON.stringify(allLogs));
      setError(null);
    } catch (err) {
      console.error('Error detallado al cargar logs:', err);
      setError(`Error al cargar logs: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const getLogLevel = (message) => {
    if (message.includes('ERROR')) return 'error';
    if (message.includes('WARN')) return 'warning';
    if (message.includes('INFO')) return 'info';
    return 'default';
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;
    
    try {
      setLoading(true);
      const fullGroupName = await createLogGroup(newGroupName);
      await loadAllLogs();
      setNewGroupName('');
      setShowCreateGroup(false);
      setError(null);
      
      setSelectedGroup(fullGroupName);
    } catch (err) {
      setError('Error al crear grupo de logs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTestLog = async () => {
    if (!selectedGroup || selectedGroup === 'all') {
      setError('Selecciona un grupo específico para enviar logs de prueba');
      return;
    }
    
    try {
      setIsLoadingTest(true);
      const timestamp = new Date().toISOString();
      const testMessage = `Test log message - ${timestamp}`;
      
      await putLogEvents(selectedGroup, testMessage);
      
      setLogs(prevLogs => [{
        timestamp: Date.now(),
        message: testMessage,
        logGroupName: selectedGroup
      }, ...prevLogs]);
      
      setError(null);
      
    } catch (err) {
      console.error('Error detallado al enviar log de prueba:', err);
      setError(`Error al enviar log de prueba: ${err.message}`);
    } finally {
      setIsLoadingTest(false);
    }
  };

  return (
    <div className="logs-panel">
      <div className="logs-controls">
        <div className="logs-header">
          <select 
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="log-group-select"
          >
            {logGroups.map(group => {
              const name = group.logGroupName.split('/').pop();
              return (
                <option key={group.arn} value={group.logGroupName}>
                  {group.displayName || name}
                </option>
              );
            })}
          </select>

          <button 
            className="refresh-btn-circle"
            onClick={loadAllLogs}
            disabled={loading}
            title="Actualizar"
          >
            <FaSync className={loading ? 'spinning' : ''} />
          </button>

          <label className="auto-refresh">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            <span>Auto-refresh</span>
          </label>

          <button 
            className="create-group-btn"
            onClick={() => setShowCreateGroup(true)}
          >
            + Crear Grupo
          </button>
        </div>

        {showCreateGroup && (
          <div className="create-group-form">
            <input
              type="text"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="Nombre del grupo de logs"
            />
            <button onClick={handleCreateGroup} disabled={loading}>
              Crear
            </button>
            <button onClick={() => setShowCreateGroup(false)}>
              Cancelar
            </button>
          </div>
        )}
      </div>

      <div className="logs-viewer">
        {error && (
          <div className="error-message">
            <FaExclamationTriangle /> {error}
          </div>
        )}

        {logs.length > 0 ? (
          <div className="logs-list">
            {logs.map((log, index) => (
              <div key={index} className={`log-entry ${getLogLevel(log.message)}`}>
                <span className="timestamp">{formatTimestamp(log.timestamp)}</span>
                <span className="group-name">{log.logGroupName}</span>
                <span className="message">{log.message}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-logs">
            {loading ? (
              <p>Cargando logs...</p>
            ) : (
              <p>No hay logs disponibles</p>
            )}
          </div>
        )}
      </div>

      <button
        className={`test-log-btn ${isLoadingTest ? 'loading' : ''}`}
        onClick={handleTestLog}
        disabled={!selectedGroup || isLoadingTest}
      >
        {isLoadingTest ? (
          <>
            <FaSync className="spinning" />
            Enviando...
          </>
        ) : (
          'Prueba'
        )}
      </button>
    </div>
  );
};

export default LogsPanel; 