import React from 'react';
import { FaExclamationCircle } from 'react-icons/fa';

const AlertModal = ({ message, onClose }) => {
  React.useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div className="alert-modal-overlay" onClick={onClose}>
      <div className="alert-modal-content" onClick={e => e.stopPropagation()}>
        <div className="alert-icon">
          <FaExclamationCircle />
        </div>
        <p className="alert-message">{message}</p>
        <button className="alert-button" onClick={onClose} autoFocus>
          Aceptar
        </button>
      </div>
    </div>
  );
};

export default AlertModal; 