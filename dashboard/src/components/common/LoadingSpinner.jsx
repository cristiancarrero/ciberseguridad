import React from 'react';
import { FaSpinner } from 'react-icons/fa';

const LoadingSpinner = () => (
  <div className="loading">
    <FaSpinner className="loading-spinner" />
    <p>Cargando...</p>
  </div>
);

export default LoadingSpinner; 