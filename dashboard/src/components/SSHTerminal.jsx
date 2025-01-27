import React, { useEffect, useRef, useState } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { WebLinksAddon } from 'xterm-addon-web-links';
import { getSSHConfig, closeSSHConnection } from '../services/ec2Service';
import { logSystemEvent } from '../services/cloudwatchLogs';
import 'xterm/css/xterm.css';

const SSHTerminal = ({ instance, onClose }) => {
  const terminalRef = useRef(null);
  const [terminal, setTerminal] = useState(null);

  const initTerminal = async () => {
    try {
      const config = await getSSHConfig(instance);
      const term = new Terminal({
        cursorBlink: true,
        theme: {
          background: '#1e1e1e'
        }
      });

      const fitAddon = new FitAddon();
      term.loadAddon(fitAddon);
      term.loadAddon(new WebLinksAddon());

      term.open(terminalRef.current);
      fitAddon.fit();
      setTerminal(term);

      // Aquí es donde se establece la conexión SSH
      term.writeln('Conectando a ' + config.host + '...');
      // ... resto de la lógica de conexión ...

      // Registrar el inicio de la sesión SSH
      await logSystemEvent('Sesión SSH iniciada', {
        Instancia: instance.id,
        Usuario: config.username,
        Host: config.host,
        Fecha: new Date().toISOString()
      }, `/aws/ec2/${instance.id}`);

    } catch (error) {
      console.error('Error iniciando terminal SSH:', error);
    }
  };

  const handleDisconnect = async () => {
    try {
      if (terminal) {
        terminal.dispose();
      }
      await closeSSHConnection(instance);
      onClose();
    } catch (error) {
      console.error('Error al desconectar:', error);
    }
  };

  useEffect(() => {
    initTerminal();
    return () => {
      handleDisconnect();
    };
  }, []);

  return (
    <div className="terminal-container">
      <div ref={terminalRef} />
    </div>
  );
};

export default SSHTerminal; 