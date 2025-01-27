import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import S3Manager from './s3/S3Manager';
import './Dashboard.css';

const Dashboard = () => {
  const [showS3Manager, setShowS3Manager] = useState(false);
  const navigate = useNavigate();

  const handleCloseS3Manager = () => {
    console.log('Dashboard: Cerrando S3 Manager');
    setShowS3Manager(false);
    navigate('/dashboard');
  };

  const handleOpenS3 = () => {
    setShowS3Manager(true);
  };

  return (
    <div className="dashboard">
      {/* Botón para abrir S3 */}
      <button onClick={handleOpenS3}>Abrir S3</button>

      {/* S3 Manager */}
      {showS3Manager && (
        <S3Manager 
          onClose={handleCloseS3Manager}
          isOpen={showS3Manager}
        />
      )}
    </div>
  );
};

export default Dashboard; 