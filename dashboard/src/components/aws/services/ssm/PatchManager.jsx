import React, { useState, useEffect } from 'react';
import { FaDownload, FaCheck, FaExclamationTriangle, FaSpinner } from 'react-icons/fa';
import './styles/patch-manager.css';
import { getPatchSummary, getPatchDetails, installPatches, getManagedInstances } from '../../../../services/ssmService.js';

const PatchManager = ({ selectedInstance, onInstanceSelect }) => {
  const [patches, setPatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [instances, setInstances] = useState([]);
  const [patchData, setPatchData] = useState({
    critical: 0,
    important: 0,
    moderate: 0,
    total: 0
  });

  // Cargar resumen de parches y actualizar cada 5 minutos
  useEffect(() => {
    loadPatchSummary();
    const interval = setInterval(() => {
      loadPatchSummary();
      if (selectedInstance) {
        loadPatchDetails();
      }
    }, 300000); // 5 minutos

    return () => clearInterval(interval);
  }, [selectedInstance]);

  useEffect(() => {
    loadInstances();
  }, []);

  const loadPatchSummary = async () => {
    try {
      const summary = await getPatchSummary();
      setPatchData(summary);
    } catch (err) {
      console.error('Error loading patch summary:', err);
      setError('Error al cargar el resumen de parches');
    }
  };

  const loadPatchDetails = async () => {
    if (!selectedInstance) {
      setPatches([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const patchDetails = await getPatchDetails(selectedInstance.instanceId);
      setPatches(patchDetails || []);
    } catch (err) {
      console.error('Error loading patch details:', err);
      setError('Error al cargar los detalles de los parches');
      setPatches([]);
    } finally {
      setLoading(false);
    }
  };

  const loadInstances = async () => {
    try {
      const instancesList = await getManagedInstances();
      setInstances(instancesList);
    } catch (err) {
      console.error('Error loading instances:', err);
      setError('Error al cargar las instancias');
    }
  };

  const handleInstallPatch = async (instanceId) => {
    if (!instanceId) return;

    try {
      setLoading(true);
      setError(null);
      await installPatches([instanceId], 'NoReboot');
      await loadPatchDetails();
      await loadPatchSummary();
    } catch (err) {
      console.error('Error installing patch:', err);
      setError('Error al instalar los parches');
    } finally {
      setLoading(false);
    }
  };

  const renderSummary = () => (
    <div className="patch-summary">
      <div className="summary-card critical">
        <span className="count">{patchData.critical}</span>
        <span className="label">Críticos</span>
      </div>
      <div className="summary-card important">
        <span className="count">{patchData.important}</span>
        <span className="label">Importantes</span>
      </div>
      <div className="summary-card moderate">
        <span className="count">{patchData.moderate}</span>
        <span className="label">Moderados</span>
      </div>
      <div className="summary-card total">
        <span className="count">{patchData.total}</span>
        <span className="label">Total</span>
      </div>
    </div>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <div className="loading-state">
          <FaSpinner className="fa-spin" />
          <p>Cargando parches...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="error-state">
          <FaExclamationTriangle />
          <p>{error}</p>
        </div>
      );
    }

    if (!selectedInstance) {
      return (
        <div className="no-instance-selected">
          <p>Selecciona una instancia para ver sus parches disponibles</p>
        </div>
      );
    }

    if (patches.length === 0) {
      return (
        <div className="empty-state">
          <FaCheck className="success-icon" />
          <h3>Sistema Actualizado</h3>
          <p>No hay parches pendientes para esta instancia</p>
          <small>La lista se actualiza automáticamente cada 5 minutos</small>
        </div>
      );
    }

    return patches.map(patch => (
      <div key={patch.id} className="patch-card">
        <div className="patch-header">
          <h3>{patch.id}</h3>
          <span className={`patch-severity ${patch.severity.toLowerCase()}`}>
            {patch.severity}
          </span>
        </div>
        <div className="patch-content">
          <p className="patch-title">{patch.title}</p>
          <div className="patch-details">
            <span>Estado: {patch.state}</span>
            <span>Clasificación: {patch.classification}</span>
            {patch.installedTime && (
              <span>Instalado: {new Date(patch.installedTime).toLocaleDateString()}</span>
            )}
          </div>
          {patch.cves?.length > 0 && (
            <div className="patch-cves">
              <h4>CVEs:</h4>
              <ul>
                {patch.cves.map(cve => (
                  <li key={cve}>{cve}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="patch-actions">
          <button 
            className="install-button"
            onClick={() => handleInstallPatch(selectedInstance.instanceId)}
            disabled={!selectedInstance || loading || patches.length === 0}
          >
            Instalar
          </button>
        </div>
      </div>
    ));
  };

  return (
    <div className="patch-manager">
      <div className="patch-header">
        <h3>Administración de Parches</h3>
        <div className="instance-selector">
          <select 
            value={selectedInstance?.instanceId || ''} 
            onChange={(e) => {
              const instance = instances.find(i => i.instanceId === e.target.value);
              onInstanceSelect(instance);
            }}
          >
            <option key="default" value="">Selecciona una instancia</option>
            {instances.map(instance => (
              <option key={instance.instanceId} value={instance.instanceId}>
                {instance.friendlyName} ({instance.platformDetails})
              </option>
            ))}
          </select>
        </div>
        <div className="patch-actions">
          <button 
            className="patch-button scan"
            onClick={() => selectedInstance && loadPatchDetails()}
            disabled={!selectedInstance || loading}
          >
            {loading ? <FaSpinner className="fa-spin" /> : <FaDownload />} 
            Buscar Actualizaciones
          </button>
          <button 
            className="patch-button install"
            onClick={() => selectedInstance && handleInstallPatch(selectedInstance.instanceId)}
            disabled={!selectedInstance || loading || patches.length === 0}
          >
            <FaCheck /> Instalar Seleccionados
          </button>
        </div>
      </div>

      {renderSummary()}
      <div className="patches-list">
        {renderContent()}
      </div>
    </div>
  );
};

export default PatchManager; 