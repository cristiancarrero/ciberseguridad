import React, { useState, useEffect } from 'react';
import { FaDownload, FaCheck, FaExclamationTriangle, FaSpinner } from 'react-icons/fa';
import './styles/patch-manager.css';
import { getPatchSummary } from '../../../../services/ssmService.js';

const PatchManager = () => {
  const [patches, setPatches] = useState([
    {
      id: 'PATCH-001',
      name: 'Security Update KB123456',
      severity: 'Critical',
      status: 'Pending',
      releaseDate: '2024-03-15'
    },
    {
      id: 'PATCH-002',
      name: 'System Update KB789012',
      severity: 'Important',
      status: 'Installed',
      releaseDate: '2024-03-10'
    }
  ]);

  const [patchData, setPatchData] = useState(null);
  
  useEffect(() => {
    const loadPatchData = async () => {
      try {
        const data = await getPatchSummary();
        setPatchData(data);
        
        if (data) {
          setPatches([
            {
              id: 'PATCH-001',
              name: 'Security Update KB123456',
              severity: data.critical > 0 ? 'Critical' : 'Moderate',
              status: 'Pending',
              releaseDate: new Date().toISOString().split('T')[0]
            },
            {
              id: 'PATCH-002',
              name: 'System Update KB789012',
              severity: 'Important',
              status: 'Installed',
              releaseDate: '2024-03-10'
            }
          ]);
        }
      } catch (error) {
        console.error('Error loading patch data:', error);
      }
    };
    
    loadPatchData();
  }, []);

  const renderSummary = () => {
    if (!patchData) return null;

    return (
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
      </div>
    );
  };

  return (
    <div className="patch-manager">
      <div className="patch-header">
        <h3>Administración de Parches</h3>
        <div className="patch-actions">
          <button className="patch-button scan">
            <FaDownload /> Buscar Actualizaciones
          </button>
          <button className="patch-button install">
            <FaCheck /> Instalar Seleccionados
          </button>
        </div>
      </div>

      {renderSummary()}

      <div className="patch-list">
        <table className="data-table">
          <thead>
            <tr>
              <th><input type="checkbox" /></th>
              <th>ID</th>
              <th>Nombre</th>
              <th>Severidad</th>
              <th>Estado</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {patches.map(patch => (
              <tr key={patch.id}>
                <td><input type="checkbox" /></td>
                <td>{patch.id}</td>
                <td>{patch.name}</td>
                <td>
                  <span className={`severity-badge ${patch.severity.toLowerCase()}`}>
                    {patch.severity}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${patch.status.toLowerCase()}`}>
                    {patch.status}
                  </span>
                </td>
                <td>{patch.releaseDate}</td>
                <td>
                  <button 
                    className="install-action-button"
                    disabled={patch.status === 'Installed'}
                  >
                    {patch.status === 'Installing' ? (
                      <><FaSpinner className="fa-spin" /> Instalando</>
                    ) : (
                      <><FaDownload /> Instalar</>
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PatchManager; 