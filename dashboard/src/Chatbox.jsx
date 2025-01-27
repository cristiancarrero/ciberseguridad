import React, { useState, useEffect } from 'react';
import './Chatbox.css'; // Asegúrate de crear este archivo para los estilos
import axios from 'axios';

const Chatbox = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // Abre el chatbox automáticamente al cargar la página
    setIsOpen(true);
  }, []);

  const toggleChatbox = () => {
    setIsOpen(!isOpen);
  };

  const handleSendMessage = async () => {
    if (message.trim()) {
      try {
        console.log('Sending message:', message);
        const response = await axios.post('http://localhost:8000/api/chat', { question: message });
        console.log('Response received:', response.data);
        setMessages([...messages, message, response.data.answer]);
      } catch (error) {
        console.error('Error sending message:', error);
      }
      setMessage("");
    }
  };

  const handleInputChange = (e) => {
    setMessage(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className={`chatbox ${isOpen ? 'open' : ''} `}>
      <div className="chatbox-header" onClick={toggleChatbox}>
        <img src="/chatbot_back/freepik__adjust__4556.png" alt="Chatbot" className="chatbox-icon" />
        <span>¿Necesitas ayuda?</span>
      </div>
      {isOpen && (
        <div className="chatbox-body">
          <p>¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?</p>
          <input type="text" placeholder="Escribe tu mensaje..." className="chatbox-input" value={message} onChange={handleInputChange} onKeyPress={handleKeyPress} />
          <button className="chatbox-send" onClick={handleSendMessage}>Enviar</button>
          <div className="chatbox-messages">
            {messages.map((msg, index) => (
              <p key={index}>{msg}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbox; 