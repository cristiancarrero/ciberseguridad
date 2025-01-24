import React, { useState, useEffect } from 'react';
import './Chatbox.css'; // Asegúrate de crear este archivo para los estilos

const Chatbox = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Abre el chatbox automáticamente al cargar la página
    setIsOpen(true);
  }, []);

  const toggleChatbox = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`chatbox ${isOpen ? 'open' : ''}`}>
      <div className="chatbox-header" onClick={toggleChatbox}>
        <img src="/path/to/robot-icon.png" alt="Chatbot" className="chatbox-icon" />
        <span>¿Necesitas ayuda?</span>
      </div>
      {isOpen && (
        <div className="chatbox-body">
          <p>¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?</p>
          {/* Aquí puedes añadir un formulario o un input para interactuar con el chatbot */}
        </div>
      )}
    </div>
  );
};

export default Chatbox; 