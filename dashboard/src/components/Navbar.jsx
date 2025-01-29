import React, { useState } from 'react';
import { FaSignOutAlt, FaShieldAlt, FaSearch, FaUser, FaCog, FaChevronDown } from 'react-icons/fa';
import { clearAWSConfig } from '../../../Pentest/src/services/aws';
import '../styles/components/navbar.css';

const Navbar = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handlePentestClick = () => {
    window.location.href = 'http://localhost:5174/pentest';
  };

  const handleLogout = () => {
    clearAWSConfig();
    window.location.href = 'http://localhost:8000/auth/index.html';
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Implementar lógica de búsqueda
    console.log('Buscando:', searchQuery);
  };

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <a href="http://localhost:8000/home" className="logo">AWS Services</a>
      </div>

      <div className="nav-search">
        <form onSubmit={handleSearch}>
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Buscar servicios, recursos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>
      </div>

      <div className="nav-links">
        <a onClick={handlePentestClick} 
           className="dashboard-link"
           style={{ cursor: 'pointer' }}>
          <FaShieldAlt /> Pentest
        </a>
        
        <div className="profile-menu">
          <button 
            className="profile-btn"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
          >
            <div className="profile-img">
              <FaUser />
            </div>
            <FaChevronDown className={`arrow ${isProfileOpen ? 'open' : ''}`} />
          </button>

          {isProfileOpen && (
            <div className="profile-dropdown">
              <div className="profile-header">
                <div className="profile-img large">
                  <FaUser />
                </div>
                <div className="profile-info">
                  <span className="profile-name">Usuario</span>
                  <span className="profile-email">usuario@example.com</span>
                </div>
              </div>
              <div className="profile-menu-items">
                <a href="#" className="profile-menu-item">
                  <FaCog /> Ajustes
                </a>
                <a onClick={handleLogout} className="profile-menu-item">
                  <FaSignOutAlt /> Cerrar Sesión
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 