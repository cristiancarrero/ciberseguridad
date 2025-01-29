import { CloudTrailClient, LookupEventsCommand } from "@aws-sdk/client-cloudtrail";
import { logSystemEvent } from './cloudwatchLogs';

let cloudTrailClient = null;

export const initializeCloudTrail = (credentials) => {
  console.log('Inicializando CloudTrail Client...');
  cloudTrailClient = new CloudTrailClient({
    region: credentials.region,
    credentials: {
      accessKeyId: credentials.credentials.accessKeyId,
      secretAccessKey: credentials.credentials.secretAccessKey,
      sessionToken: credentials.credentials.sessionToken
    }
  });
};

export const getSSHEvents = async (instanceId) => {
  if (!cloudTrailClient) {
    throw new Error('CloudTrail Client no inicializado');
  }

  try {
    console.log('Buscando eventos SSH para instancia:', instanceId);
    const command = new LookupEventsCommand({
      LookupAttributes: [
        {
          AttributeKey: 'ResourceName',
          AttributeValue: instanceId
        }
      ],
      StartTime: new Date(Date.now() - 24 * 60 * 60 * 1000), // Últimas 24 horas
      EndTime: new Date()
    });

    const response = await cloudTrailClient.send(command);
    const sshEvents = response.Events.filter(event => 
      event.EventName === 'ConsoleLogin' || 
      event.EventName === 'SSHKeyPairUsed'
    );

    // Registrar los eventos encontrados
    for (const event of sshEvents) {
      await logSystemEvent('Conexión SSH detectada por CloudTrail', {
        Instancia: instanceId,
        EventoID: event.EventId,
        Usuario: event.Username,
        Fecha: event.EventTime.toISOString()
      }, `/aws/ec2/${instanceId}`);
    }

    return sshEvents;
  } catch (error) {
    console.error('Error obteniendo eventos SSH de CloudTrail:', error);
    throw error;
  }
};

export const testCloudTrailConnection = async () => {
  try {
    if (!cloudTrailClient) {
      throw new Error('CloudTrail Client no inicializado');
    }
    // Intentar una operación simple para probar la conexión
    const command = new LookupEventsCommand({
      StartTime: new Date(Date.now() - 3600000), // Última hora
      EndTime: new Date(),
      MaxResults: 1
    });
    await cloudTrailClient.send(command);
    return true;
  } catch (error) {
    console.error('Error en test de conexión CloudTrail:', error);
    return false;
  }
}; 