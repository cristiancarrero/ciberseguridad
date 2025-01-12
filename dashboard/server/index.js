import { WebSocketServer } from 'ws';
import { Client } from 'ssh2';

const wss = new WebSocketServer({ port: 8080 });

// Historial de comandos por sesión
const commandHistory = new Map();

// Colores ANSI para la terminal
const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',
  // Colores de texto
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

wss.on('connection', (ws) => {
  console.log('Nueva conexión WebSocket');
  
  // Inicializar historial para esta sesión
  const sessionId = Date.now().toString();
  commandHistory.set(sessionId, []);

  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);
      
      if (data.type === 'connect') {
        console.log('Datos de conexión recibidos:', {
          host: data.host,
          hasPrivateKey: !!data.privateKey,
          keyLength: data.privateKey?.length,
          keyStart: data.privateKey?.substring(0, 50)
        });

        if (!data.privateKey || !data.privateKey.trim()) {
          ws.send(JSON.stringify({ 
            type: 'error', 
            message: 'No se ha proporcionado una clave SSH válida'
          }));
          return;
        }

        // Asegurarse de que la clave tiene el formato correcto
        let cleanedKey = data.privateKey
          .replace(/\\n/g, '\n')
          .replace(/\r\n/g, '\n')
          .replace(/\r/g, '\n')
          .split('\n')
          .map(line => line.trim())
          .filter(line => line)
          .join('\n');

        // Asegurar que hay un salto de línea después del BEGIN y antes del END
        if (!cleanedKey.includes('\n-----BEGIN RSA PRIVATE KEY-----\n')) {
          cleanedKey = cleanedKey.replace('-----BEGIN RSA PRIVATE KEY-----', '-----BEGIN RSA PRIVATE KEY-----\n');
        }
        if (!cleanedKey.includes('\n-----END RSA PRIVATE KEY-----')) {
          cleanedKey = cleanedKey.replace('-----END RSA PRIVATE KEY-----', '\n-----END RSA PRIVATE KEY-----');
        }

        // Log para verificar el formato de la clave
        console.log('Clave formateada:', {
          length: cleanedKey.length,
          hasCorrectStart: cleanedKey.startsWith('-----BEGIN RSA PRIVATE KEY-----'),
          hasCorrectEnd: cleanedKey.endsWith('-----END RSA PRIVATE KEY-----'),
          lineCount: cleanedKey.split('\n').length,
          firstLine: cleanedKey.split('\n')[0],
          lastLine: cleanedKey.split('\n').slice(-1)[0]
        });

        const sshClient = new Client();
        
        sshClient.on('ready', () => {
          console.log('Conexión SSH establecida exitosamente');
          ws.send(JSON.stringify({ 
            type: 'status', 
            message: COLORS.green + 'Conectado exitosamente' + COLORS.reset 
          }));
          
          sshClient.shell((err, stream) => {
            if (err) {
              console.error('Error al crear shell:', err);
              ws.send(JSON.stringify({ 
                type: 'error', 
                message: COLORS.red + err.message + COLORS.reset 
              }));
              return;
            }

            stream.on('data', (data) => {
              ws.send(JSON.stringify({ type: 'data', data: data.toString() }));
            });

            ws.on('message', (message) => {
              try {
                const wsData = JSON.parse(message);
                if (wsData.type === 'data') {
                  // Guardar comando en el historial si termina en enter
                  if (wsData.data === '\r' || wsData.data === '\n') {
                    const history = commandHistory.get(sessionId);
                    const lastCommand = history.pop(); // Obtener el comando que se está construyendo
                    if (lastCommand && lastCommand.trim()) {
                      history.push(lastCommand); // Guardar solo si no está vacío
                      if (history.length > 100) history.shift(); // Mantener máximo 100 comandos
                    }
                    commandHistory.set(sessionId, history);
                  } else if (wsData.data === '\x1b[A') {
                    // Flecha arriba - navegar historial hacia atrás
                    const history = commandHistory.get(sessionId);
                    if (history.length > 0) {
                      const command = history[history.length - 1] + '\r';
                      ws.send(JSON.stringify({ type: 'data', data: command }));
                    }
                  } else {
                    // Construir el comando actual
                    const history = commandHistory.get(sessionId);
                    const currentCommand = (history.pop() || '') + wsData.data;
                    history.push(currentCommand);
                    commandHistory.set(sessionId, history);
                  }
                  stream.write(wsData.data);
                }
              } catch (error) {
                console.error('Error al procesar mensaje:', error);
              }
            });

            stream.on('close', () => {
              console.log('Stream SSH cerrado');
              commandHistory.delete(sessionId); // Limpiar historial al cerrar
              sshClient.end();
            });
          });
        });

        sshClient.on('error', (err) => {
          console.error('Error SSH detallado:', {
            message: err.message,
            level: err.level,
            code: err.code,
            description: err.description
          });
          
          let errorMessage = 'Error de conexión SSH: ';
          if (err.level === 'client-authentication') {
            errorMessage = 'Error de autenticación SSH. Por favor verifica:\n' +
              '1. Que estás usando la clave vockey.pem correcta de AWS Academy\n' +
              '2. Que la clave incluye las líneas BEGIN y END\n' +
              '3. Que estás usando el usuario "ubuntu"\n' +
              '4. Que la instancia está en ejecución';
          } else if (err.level === 'client-timeout') {
            errorMessage = 'Timeout de conexión SSH. Por favor verifica:\n' +
              '1. Que la instancia está en ejecución\n' +
              '2. Que el grupo de seguridad permite el puerto 22\n' +
              '3. Que estás usando el DNS público correcto';
          } else {
            errorMessage += err.message;
          }
          
          ws.send(JSON.stringify({ 
            type: 'error', 
            message: errorMessage 
          }));
        });

        try {
          // Usar el DNS completo y el usuario ubuntu
          const dnsName = `ec2-${data.host.replace(/\./g, '-')}.us-west-2.compute.amazonaws.com`;
          const username = 'ubuntu';  // Siempre usar ubuntu para esta instancia

          console.log('Intentando conexión SSH con:', {
            host: dnsName,  // Usar el DNS completo
            username: username,
            originalHost: data.host
          });

          sshClient.connect({
            host: dnsName,  // Usar el DNS completo
            port: 22,
            username: username,
            privateKey: cleanedKey,
            readyTimeout: 20000,
            debug: (msg) => console.log('SSH Debug:', msg),
            algorithms: {
              kex: [
                'curve25519-sha256',
                'curve25519-sha256@libssh.org',
                'ecdh-sha2-nistp256',
                'ecdh-sha2-nistp384',
                'ecdh-sha2-nistp521',
                'diffie-hellman-group-exchange-sha256',
                'diffie-hellman-group14-sha256'
              ],
              serverHostKey: [
                'ssh-rsa',
                'rsa-sha2-512',
                'rsa-sha2-256',
                'ecdsa-sha2-nistp256',
                'ssh-ed25519'
              ],
              cipher: [
                'chacha20-poly1305@openssh.com',
                'aes128-ctr',
                'aes192-ctr',
                'aes256-ctr',
                'aes128-gcm@openssh.com',
                'aes256-gcm@openssh.com'
              ]
            }
          });
        } catch (error) {
          console.error('Error al iniciar conexión:', error);
          ws.send(JSON.stringify({ 
            type: 'error', 
            message: 'Error al iniciar la conexión: ' + error.message 
          }));
        }
      } else if (data.type === 'getHistory') {
        // Endpoint para obtener el historial
        const history = commandHistory.get(sessionId) || [];
        ws.send(JSON.stringify({ 
          type: 'history', 
          data: history 
        }));
      }
    } catch (error) {
      console.error('Error al procesar mensaje:', error);
      ws.send(JSON.stringify({ 
        type: 'error', 
        message: COLORS.red + error.message + COLORS.reset 
      }));
    }
  });

  ws.on('close', () => {
    console.log('Conexión WebSocket cerrada');
    commandHistory.delete(sessionId); // Limpiar historial al cerrar conexión
  });
});

console.log('Servidor WebSocket iniciado en el puerto 8080'); 