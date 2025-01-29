import React, { useState } from 'react';
import './Chatbox.css'; // Asegúrate de crear este archivo para los estilos
import axios from 'axios';

const Chatbox = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([
    {
      type: 'bot',
      content: '👋 Hi there! How can I assist?'
    }
  ]);
  const [isMinimized, setIsMinimized] = useState(false);

  const handleSendMessage = async (text = message) => {
    if (!text.trim()) return;

    try {
      // Añadir mensaje del usuario al historial
      setChatHistory(prev => [...prev, {
        type: 'user',
        content: text
      }]);

      const response = await axios.post('http://localhost:8000/api/chat', { 
        question: text 
      });
      
      // Añadir respuesta del bot al historial
      setChatHistory(prev => [...prev, {
        type: 'bot',
        content: response.data.answer
      }]);

      // Limpiar el input después de enviar
      setMessage("");
    } catch (error) {
      console.error('Error:', error);
      setChatHistory(prev => [...prev, {
        type: 'bot',
        content: 'Sorry, I encountered an error. Please try again.'
      }]);
    }
  };

  const handleQuickAction = (action) => {
    switch(action) {
      case 'getting-started':
        handleSendMessage("Can you help me get started?");
        break;
      case 'pricing':
        handleSendMessage("What are your pricing options?");
        break;
      case 'trial':
        handleSendMessage("Tell me about the free trial");
        break;
      default:
        break;
    }
  };

  return (
    <div className={`chatbox ${isMinimized ? 'minimized' : ''}`}>
      <div className="chatbox-header">
        <div className="chatbox-header-title">
          <span className="aws-gradient">AWS Services</span> Chatbot
        </div>
        <button onClick={() => setIsMinimized(!isMinimized)} className="chatbox-toggle-size">
          {isMinimized ? '<>' : '><'}
        </button>
      </div>
      
      <div className="chatbox-messages">
        {chatHistory.map((msg, index) => (
          <div key={index} className={`message ${msg.type}`}>
            {msg.type === 'bot' && (
              <div className="message-avatar">
                <img src="/assets/robot-icon.png" alt="Robot" />
              </div>
            )}
            <div className="message-content">
              {msg.content}
            </div>
          </div>
        ))}
      </div>

      <div className="chatbox-input-container">
        <div className="input-wrapper">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            className="chatbox-input"
            placeholder="Type here and press Enter to chat"
          />
        </div>
        <div className="button-container">
          <button 
            className="action-button"
            onClick={() => handleQuickAction('getting-started')}
          >
            Getting Started
          </button>
          <button 
            className="action-button"
            onClick={() => handleQuickAction('pricing')}
          >
            Pricing
          </button>
          <button 
            className="action-button primary"
            onClick={() => handleQuickAction('trial')}
          >
            Free Trial
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbox; 