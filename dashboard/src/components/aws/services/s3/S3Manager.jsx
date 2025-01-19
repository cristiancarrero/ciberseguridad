import React, { useState, useEffect } from 'react';
import { FaServer, FaTimes, FaUpload, FaTrash } from 'react-icons/fa';
import { getBuckets, createBucket, deleteBucket } from '../../../../services/aws/s3/s3Service';
import './styles/s3-manager.css';

const S3Manager = ({ isOpen, onClose }) => {
  const [buckets, setBuckets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newBucketName, setNewBucketName] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadBuckets();
    }
  }, [isOpen]);

  const loadBuckets = async () => {
    try {
      setIsLoading(true);
      const bucketsList = await getBuckets();
      setBuckets(bucketsList);
      setError(null);
    } catch (err) {
      setError('Error al cargar buckets: ' + err.message);
      console.error('Error cargando buckets:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateBucket = async (e) => {
    e.preventDefault();
    if (!newBucketName.trim()) return;

    try {
      await createBucket(newBucketName);
      setNewBucketName('');
      await loadBuckets();
    } catch (err) {
      setError('Error al crear bucket: ' + err.message);
    }
  };

  const handleDeleteBucket = async (bucketName) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar el bucket ${bucketName}?`)) {
      try {
        await deleteBucket(bucketName);
        await loadBuckets();
      } catch (err) {
        setError('Error al eliminar bucket: ' + err.message);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="s3-manager-modal">
        <div className="modal-header">
          <h2><FaServer /> Amazon S3</h2>
          <button className="close-button" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="modal-content">
          {error && <div className="error-message">{error}</div>}

          <div className="create-bucket-form">
            <form onSubmit={handleCreateBucket}>
              <input
                type="text"
                value={newBucketName}
                onChange={(e) => setNewBucketName(e.target.value)}
                placeholder="Nombre del nuevo bucket"
              />
              <button type="submit">
                <FaUpload /> Crear Bucket
              </button>
            </form>
          </div>

          {isLoading ? (
            <div className="loading">Cargando buckets...</div>
          ) : (
            <div className="buckets-list">
              {buckets.map(bucket => (
                <div key={bucket.Name} className="bucket-item">
                  <div className="bucket-info">
                    <h4>{bucket.Name}</h4>
                    <p>Creado: {bucket.CreationDate.toLocaleDateString()}</p>
                  </div>
                  <div className="bucket-actions">
                    <button
                      className="delete-bucket-btn"
                      onClick={() => handleDeleteBucket(bucket.Name)}
                    >
                      <FaTrash /> Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default S3Manager; 