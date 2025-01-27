import React, { useEffect, useRef } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { FaTerminal, FaTimes, FaExpandAlt } from 'react-icons/fa';
import '@xterm/xterm/css/xterm.css';
import '../styles/components/instance-terminal.css';

const InstanceTerminal = ({ instance, onClose }) => {
  const terminalRef = useRef(null);
  const xtermRef = useRef(null);
  const wsRef = useRef(null);

  useEffect(() => {
    if (!terminalRef.current) return;

    const term = new Terminal({
      cursorBlink: true,
      theme: {
        background: '#1a1f2e',
        foreground: '#fff'
      }
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    
    term.open(terminalRef.current);
    fitAddon.fit();

    xtermRef.current = term;

    // Conectar a la instancia
    const connectToInstance = async () => {
      const key = sessionStorage.getItem('ssh_key');
      if (!key) {
        term.writeln('Error: No se encontró la clave SSH');
        return;
      }

      try {
        const ws = new WebSocket('ws://localhost:8080');
        wsRef.current = ws;

        ws.onopen = () => {
          term.writeln('Conectando a ' + instance.publicIp + '...');
          ws.send(JSON.stringify({
            type: 'connect',
            host: instance.publicIp,
            privateKey: key
          }));
        };

        ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          
          switch (data.type) {
            case 'data':
              term.write(data.data);
              break;
            case 'status':
              term.writeln(data.message);
              break;
            case 'error':
              term.writeln('\r\nError: ' + data.message);
              break;
          }
        };

        ws.onclose = () => {
          term.writeln('\r\nConexión cerrada');
        };

        // Enviar datos del terminal al WebSocket
        term.onData((data) => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'data', data }));
          }
        });

      } catch (error) {
        term.writeln('Error al conectar: ' + error.message);
      }
    };

    connectToInstance();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (xtermRef.current) {
        xtermRef.current.dispose();
      }
    };
  }, [instance]);

  return (
    <div className="terminal-fullscreen-overlay">
      <div className="terminal-window">
        <div className="terminal-header">
          <div className="terminal-title">
            <FaTerminal />
            <span>Terminal - {instance.name || instance.id}</span>
          </div>
          <div className="terminal-actions">
            <button className="terminal-btn" title="Expandir">
              <FaExpandAlt />
            </button>
            <button 
              className="terminal-btn" 
              onClick={() => {
                if (wsRef.current) wsRef.current.close();
                onClose();
              }} 
              title="Cerrar"
            >
              <FaTimes />
            </button>
          </div>
        </div>
        <div className="terminal-container" ref={terminalRef} />
      </div>
    </div>
  );
};

export default InstanceTerminal; 