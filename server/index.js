const { WebSocketServer } = require('ws');
const { Client } = require('ssh2');
const fs = require('fs');

const wss = new WebSocketServer({ port: 8082 });

console.log('Servidor WebSocket iniciado en el puerto 8082');

wss.on('connection', (ws) => {
  console.log('Nueva conexión WebSocket');

  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);

      if (data.type === 'connect') {
        console.log('Intentando conectar a:', data.host);

        // Verificar que la clave privada es válida
        if (!data.privateKey.includes('-----BEGIN RSA PRIVATE KEY-----')) {
          ws.send(JSON.stringify({
            type: 'error',
            message: 'La clave SSH no parece ser válida. Asegúrate de cargar el archivo vockey.pem correcto.'
          }));
          return;
        }

        const sshClient = new Client();

        sshClient.on('ready', () => {
          console.log('Conexión SSH establecida');
          ws.send(JSON.stringify({ type: 'status', message: 'Conectado' }));

          sshClient.shell((err, stream) => {
            if (err) {
              console.error('Error al crear shell:', err);
              ws.send(JSON.stringify({ type: 'error', message: err.message }));
              return;
            }

            // Enviar datos del stream SSH al WebSocket
            stream.on('data', (data) => {
              ws.send(JSON.stringify({ type: 'data', data: data.toString() }));
            });

            // Enviar datos del WebSocket al stream SSH
            ws.on('message', (message) => {
              try {
                const wsData = JSON.parse(message);
                if (wsData.type === 'data') {
                  stream.write(wsData.data);
                }
              } catch (error) {
                console.error('Error al procesar mensaje:', error);
              }
            });

            stream.on('close', () => {
              console.log('Stream SSH cerrado');
              ws.close();
              sshClient.end();
            });
          });
        });

        sshClient.on('error', (err) => {
          console.error('Error SSH detallado:', {
            message: err.message,
            level: err.level,
            code: err.code
          });

          let errorMessage = 'Error de conexión SSH: ';
          if (err.message.includes('timeout')) {
            errorMessage += 'No se pudo establecer la conexión. Verifica que:';
            errorMessage += '\n1. La instancia esté en ejecución';
            errorMessage += '\n2. El grupo de seguridad permita conexiones SSH (puerto 22)';
            errorMessage += '\n3. La clave SSH sea la correcta';
          } else {
            errorMessage += err.message;
          }

          ws.send(JSON.stringify({ type: 'error', message: errorMessage }));
          ws.close();
        });

        try {
          const isUbuntu = data.host.includes('ubuntu') || data.host.includes('compute.amazonaws.com');
          const username = isUbuntu ? 'ubuntu' : 'ec2-user';

          console.log('Configuración de conexión:', {
            host: data.host,
            username: username,
            keyLength: data.privateKey.length
          });

          sshClient.connect({
            host: data.host,
            port: 22,
            username: username,
            privateKey: data.privateKey,
            readyTimeout: 15000, // 15 segundos
            debug: (msg) => console.log('SSH Debug:', msg)
          });
        } catch (error) {
          console.error('Error al iniciar conexión:', error);
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Error al iniciar la conexión: ' + error.message
          }));
        }
      }
    } catch (error) {
      console.error('Error al procesar mensaje:', error);
      ws.send(JSON.stringify({ type: 'error', message: error.message }));
    }
  });

  ws.on('close', () => {
    console.log('Conexión WebSocket cerrada');
  });
}); 