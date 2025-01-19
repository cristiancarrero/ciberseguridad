import { 
  CloudWatchLogsClient,
  PutLogEventsCommand
} from "@aws-sdk/client-cloudwatch-logs";

let logsClient = null;

export const initializeLoggingService = (credentials) => {
  logsClient = new CloudWatchLogsClient({
    region: credentials.region,
    credentials: {
      accessKeyId: credentials.credentials.accessKeyId,
      secretAccessKey: credentials.credentials.secretAccessKey,
      sessionToken: credentials.credentials.sessionToken
    }
  });
};

export const putLogEvents = async (logGroupName, logStreamName, logEvents) => {
  if (!logsClient) throw new Error('Logs Client no inicializado');

  try {
    const command = new PutLogEventsCommand({
      logGroupName,
      logStreamName,
      logEvents: logEvents.map(event => ({
        timestamp: new Date().getTime(),
        message: JSON.stringify(event)
      }))
    });
    await logsClient.send(command);
  } catch (error) {
    console.error('Error al escribir logs:', error);
    throw error;
  }
};

export const logSystemEvent = async (message, details, logGroupName = '/aws/system/events') => {
  try {
    await putLogEvents(logGroupName, 'system-events', [{
      message,
      details,
      timestamp: new Date().toISOString()
    }]);
  } catch (error) {
    console.error('Error logging system event:', error);
    // No lanzamos el error para evitar interrumpir el flujo principal
  }
}; 