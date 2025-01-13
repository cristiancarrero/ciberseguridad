import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaChartLine, FaShieldAlt, FaBell, FaCloud } from 'react-icons/fa';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <nav>
        <Link to="/" className="nav-item">
          <FaHome /> Panel Principal
        </Link>
        <Link to="/metrics" className="nav-item">
          <FaChartLine /> Métricas
        </Link>
        <Link to="/security" className="nav-item">
          <FaShieldAlt /> Seguridad
        </Link>
        <Link to="/alerts" className="nav-item">
          <FaBell /> Alertas
        </Link>
        <Link to="/aws" className="nav-item">
          <FaCloud /> AWS
        </Link>
      </nav>
    </div>
  );
};

export default Sidebar; 