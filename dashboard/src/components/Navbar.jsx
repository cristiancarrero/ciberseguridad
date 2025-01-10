import React from 'react';
import { FaSignOutAlt, FaChartLine, FaShieldAlt } from 'react-icons/fa';
import '../styles/components/navbar.css';

const Navbar = () => {
  const handlePentestClick = () => {
    window.location.href = 'http://localhost:8000/Pentest/pentesting.html';
  };

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <a href="http://localhost:8000/home" className="logo">AWS Services</a>
      </div>
      <div className="nav-links">
        <a href="/dashboard" className="dashboard-link">
          <FaChartLine /> Dashboard
        </a>
        <a onClick={handlePentestClick} 
           className="dashboard-link"
           style={{ cursor: 'pointer' }}>
          <FaShieldAlt /> Pentest
        </a>
        <a href="http://localhost:8000/auth/index.html" className="login-btn">
          <FaSignOutAlt /> Cerrar Sesión
        </a>
      </div>
    </nav>
  );
};

export default Navbar; 