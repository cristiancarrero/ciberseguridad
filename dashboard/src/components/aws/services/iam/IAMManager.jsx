import React, { useState, useEffect } from 'react';
import { FaUsers, FaTimes, FaUserPlus, FaTrash } from 'react-icons/fa';
import { getUsers, getRoles, createUser, deleteUser } from '../../../../services/aws/iam/iamService';
import './styles/iam-manager.css';

const IAMManager = ({ isOpen, onClose }) => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newUsername, setNewUsername] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadIAMData();
    }
  }, [isOpen]);

  const loadIAMData = async () => {
    try {
      setIsLoading(true);
      const [usersList, rolesList] = await Promise.all([
        getUsers(),
        getRoles()
      ]);
      setUsers(usersList);
      setRoles(rolesList);
      setError(null);
    } catch (err) {
      setError('Error al cargar datos de IAM: ' + err.message);
      console.error('Error cargando IAM:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUsername.trim()) return;

    try {
      await createUser(newUsername);
      setNewUsername('');
      await loadIAMData();
    } catch (err) {
      setError('Error al crear usuario: ' + err.message);
    }
  };

  const handleDeleteUser = async (username) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar al usuario ${username}?`)) {
      try {
        await deleteUser(username);
        await loadIAMData();
      } catch (err) {
        setError('Error al eliminar usuario: ' + err.message);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="iam-manager-modal">
        <div className="modal-header">
          <h2><FaUsers /> Gestor de IAM</h2>
          <button className="close-button" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="modal-content">
          {error && <div className="error-message">{error}</div>}

          <div className="create-user-form">
            <form onSubmit={handleCreateUser}>
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="Nombre de usuario"
              />
              <button type="submit">
                <FaUserPlus /> Crear Usuario
              </button>
            </form>
          </div>

          {isLoading ? (
            <div className="loading">Cargando datos de IAM...</div>
          ) : (
            <>
              <div className="section">
                <h3>Usuarios</h3>
                <div className="users-list">
                  {users.map(user => (
                    <div key={user.UserName} className="user-item">
                      <div className="user-info">
                        <h4>{user.UserName}</h4>
                        <p>ID: {user.UserId}</p>
                        <p>Creado: {user.CreateDate.toLocaleDateString()}</p>
                      </div>
                      <div className="user-actions">
                        <button
                          className="delete-user-btn"
                          onClick={() => handleDeleteUser(user.UserName)}
                        >
                          <FaTrash /> Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="section">
                <h3>Roles</h3>
                <div className="roles-list">
                  {roles.map(role => (
                    <div key={role.RoleName} className="role-item">
                      <div className="role-info">
                        <h4>{role.RoleName}</h4>
                        <p>ARN: {role.Arn}</p>
                        <p>Creado: {role.CreateDate.toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default IAMManager; 