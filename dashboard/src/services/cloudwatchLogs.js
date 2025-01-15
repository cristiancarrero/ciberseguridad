import { 
  CloudWatchLogsClient,
  DescribeLogGroupsCommand,
  GetLogEventsCommand,
  CreateLogGroupCommand,
  DescribeLogStreamsCommand,
  CreateLogStreamCommand,
  PutLogEventsCommand
} from "@aws-sdk/client-cloudwatch-logs";
import { listInstances } from './ec2Service';

let logsClient = null;
let logsCache = {
  groups: {},  // Un objeto para almacenar caché por grupo
  ttl: 5000    // 5 segundos de tiempo de vida
};

export const initializeCloudWatchLogs = (credentials) => {
  console.log('Inicializando CloudWatch Logs Client...');
  logsClient = new CloudWatchLogsClient({
    region: credentials.region,
    credentials: {
      accessKeyId: credentials.credentials.accessKeyId,
      secretAccessKey: credentials.credentials.secretAccessKey,
      sessionToken: credentials.credentials.sessionToken
    }
  });
};

export const getLogGroups = async () => {
  if (!logsClient) {
    throw new Error('CloudWatch Logs Client no inicializado');
  }

  try {
    const command = new DescribeLogGroupsCommand({
      // Filtrar solo grupos que empiecen con /aws/ec2/
      logGroupNamePrefix: '/aws/ec2/'
    });
    
    const response = await logsClient.send(command);
    const groups = response.logGroups || [];

    // Ordenar los grupos por nombre
    groups.sort((a, b) => {
      // Poner el grupo de alarmas primero
      if (a.logGroupName.includes('aws-cloudwatch-alarms')) return -1;
      if (b.logGroupName.includes('aws-cloudwatch-alarms')) return 1;
      return a.logGroupName.localeCompare(b.logGroupName);
    });

    return groups;
  } catch (error) {
    console.error('Error al obtener grupos de logs:', error);
    throw error;
  }
};

export const getLogEvents = async (logGroupName, logStreamName, startTime, endTime) => {
  if (!logsClient) throw new Error('Logs Client no inicializado');

  try {
    // Obtener todos los streams del grupo
    const describeStreamsCommand = new DescribeLogStreamsCommand({
      logGroupName,
      orderBy: 'LastEventTime',
      descending: true,
      limit: 20
    });
    
    const streamsResponse = await logsClient.send(describeStreamsCommand);
    console.log('Streams disponibles:', streamsResponse);
    
    if (!streamsResponse.logStreams || streamsResponse.logStreams.length === 0) {
      return []; // No hay streams disponibles
    }

    // Obtener eventos de todos los streams
    let allEvents = [];
    await Promise.all(streamsResponse.logStreams.map(async (stream) => {
      try {
        const command = new GetLogEventsCommand({
          logGroupName,
          logStreamName: stream.logStreamName,
          startTime,
          endTime,
          limit: 50,
          startFromHead: false
        });
        
        const response = await logsClient.send(command);
        if (response.events && response.events.length > 0) {
          allEvents = [...allEvents, ...response.events];
        }
      } catch (err) {
        console.warn(`Error obteniendo eventos del stream ${stream.logStreamName}:`, err);
      }
    }));

    // Ordenar todos los eventos por timestamp (más recientes primero)
    allEvents.sort((a, b) => b.timestamp - a.timestamp);
    allEvents = allEvents.slice(0, 500);
    console.log('Total de eventos encontrados:', allEvents.length);
    return allEvents;

  } catch (error) {
    console.error('Error detallado al obtener logs:', error);
    if (error.name === 'ResourceNotFoundException') {
      return []; // Grupo o stream no encontrado
    }
    throw error;
  }
};

export const getLogEventsWithCache = async (logGroupName, logStreamName, startTime, endTime) => {
  const now = Date.now();
  const cacheKey = logGroupName || 'all';
  
  // Intentar obtener del localStorage primero
  const savedLogs = localStorage.getItem(`logs-${cacheKey}`);
  if (savedLogs) {
    const parsed = JSON.parse(savedLogs);
    if (now - parsed.timestamp < 30000) { // 30 segundos de caché
      return parsed.data;
    }
  }
  
  // Si la caché en memoria es válida, usarla
  if (logsCache.groups[cacheKey] && 
      now - logsCache.groups[cacheKey].timestamp < logsCache.ttl) {
    return logsCache.groups[cacheKey].data;
  }
  
  // Si no hay caché válida, obtener nuevos datos
  const events = await getLogEvents(logGroupName, logStreamName, startTime, endTime);
  
  // Actualizar ambas cachés
  logsCache.groups[cacheKey] = {
    timestamp: now,
    data: events
  };
  
  // Guardar en localStorage
  localStorage.setItem(`logs-${cacheKey}`, JSON.stringify({
    timestamp: now,
    data: events
  }));
  
  return events;
};

export const createLogGroup = async (logGroupName) => {
  if (!logsClient) {
    throw new Error('CloudWatch Logs Client no inicializado');
  }

  try {
    const fullGroupName = `/aws/ec2/${logGroupName}`;
    // Crear el grupo
    const command = new CreateLogGroupCommand({
      logGroupName: fullGroupName
    });
    await logsClient.send(command);
    console.log('Grupo de logs creado:', logGroupName);

    // Generar algunos logs de ejemplo
    const sampleLogs = [
      `INFO: Grupo de logs ${logGroupName} creado`,
      `INFO: Iniciando monitoreo de métricas`,
      `INFO: Alarma de CPU configurada para umbral de 80%`,
      `WARN: Uso de CPU alcanzó 75%`,
      `ERROR: La instancia EC2 superó el umbral de CPU (85%)`,
      `INFO: Notificación enviada al administrador`,
      `INFO: Uso de memoria: 60%`,
      `WARN: Latencia de red incrementada`,
      `INFO: Estado de la instancia: Running`,
      `INFO: Comprobación de estado completada`
    ];

    // Crear un stream y enviar los logs
    const streamName = 'initial-logs';
    await logsClient.send(new CreateLogStreamCommand({
      logGroupName: fullGroupName,
      logStreamName: streamName
    }));

    // Enviar los logs con timestamps incrementales
    const now = Date.now();
    const logEvents = sampleLogs.map((message, index) => ({
      timestamp: now - (sampleLogs.length - index) * 60000, // Cada log separado por 1 minuto
      message
    }));

    await logsClient.send(new PutLogEventsCommand({
      logGroupName: fullGroupName,
      logStreamName: streamName,
      logEvents
    }));

    console.log('Logs de ejemplo creados');
    return fullGroupName;
  } catch (error) {
    console.error('Error creando grupo de logs:', error);
    throw error;
  }
};

export const putLogEvents = async (logGroupName, message) => {
  if (!logsClient) throw new Error('Logs Client no inicializado');

  try {
    // Crear un stream de logs con la fecha actual
    const streamName = new Date().toISOString().replace(/[:.]/g, '-');
    const createStreamCommand = new CreateLogStreamCommand({
      logGroupName,
      logStreamName: streamName
    });
    await logsClient.send(createStreamCommand);

    // Enviar el evento de log
    const putCommand = new PutLogEventsCommand({
      logGroupName,
      logStreamName: streamName,
      logEvents: [
        {
          timestamp: Date.now(),
          message: message
        }
      ]
    });

    await logsClient.send(putCommand);
    console.log('Log enviado correctamente');
  } catch (error) {
    console.error('Error enviando log:', error);
    throw error;
  }
};

// Función para crear un grupo de logs para una instancia específica
export const createInstanceLogGroup = async (instanceId, instanceName) => {
  if (!logsClient) {
    throw new Error('CloudWatch Logs Client no inicializado');
  }

  try {
    const groupName = `/aws/ec2/${instanceId}`;
    const command = new CreateLogGroupCommand({
      logGroupName: groupName,
      tags: {
        InstanceId: instanceId,
        InstanceName: instanceName || instanceId
      }
    });

    await logsClient.send(command);
    console.log('Grupo de logs creado para instancia:', instanceId);
    return groupName;
  } catch (error) {
    console.error('Error creando grupo de logs para instancia:', error);
    throw error;
  }
};

export const syncLogGroupsWithInstances = async () => {
  if (!logsClient) {
    throw new Error('CloudWatch Logs Client no inicializado');
  }

  try {
    // 1. Obtener instancias EC2 activas con sus nombres
    const instances = await listInstances();
    const instanceMap = instances.reduce((map, instance) => {
      map[instance.id] = instance.name || instance.id;
      return map;
    }, {});
    
    // 2. Crear grupos de logs para cada instancia si no existen
    for (const instance of instances) {
      try {
        await createInstanceLogGroup(
          instance.id,
          instance.name || instance.id
        );
      } catch (err) {
        // Si el grupo ya existe, ignoramos el error
        if (!err.message.includes('ResourceAlreadyExistsException')) {
          console.error(`Error creando grupo para instancia ${instance.id}:`, err);
        }
      }
    }

    // 3. Obtener todos los grupos y filtrar solo los de instancias activas
    const command = new DescribeLogGroupsCommand({
      logGroupNamePrefix: '/aws/ec2/'
    });
    
    const response = await logsClient.send(command);
    const groups = response.logGroups || [];

    // Filtrar solo grupos de instancias activas y el grupo de alarmas
    const activeGroups = groups.filter(group => {
      const groupName = group.logGroupName.split('/').pop();
      return groupName === 'aws-cloudwatch-alarms' || 
             instances.some(instance => instance.id === groupName);
    }).map(group => {
      const groupId = group.logGroupName.split('/').pop();
      return {
        ...group,
        displayName: groupId === 'aws-cloudwatch-alarms' 
          ? 'Alarmas y Eventos'
          : `Instancia ${instanceMap[groupId] || groupId}`
      };
    });

    // Ordenar con el grupo de alarmas primero
    activeGroups.sort((a, b) => {
      if (a.logGroupName.includes('aws-cloudwatch-alarms')) return -1;
      if (b.logGroupName.includes('aws-cloudwatch-alarms')) return 1;
      return a.logGroupName.localeCompare(b.logGroupName);
    });

    return activeGroups;
  } catch (error) {
    console.error('Error sincronizando grupos de logs:', error);
    throw error;
  }
};

// Añadir función para logs del sistema
export const logSystemEvent = async (action, details, logGroupName = '/aws/ec2/aws-cloudwatch-alarms') => {
  try {
    console.log('Registrando evento:', { action, details, logGroupName });
    
    // Asegurarse de que el grupo existe
    try {
      await createInstanceLogGroup(logGroupName.split('/').pop(), 'Sistema');
    } catch (error) {
      // Ignorar error si el grupo ya existe
      if (!error.message.includes('ResourceAlreadyExistsException')) {
        console.error('Error creando grupo de logs:', error);
      }
    }

    const message = `INFO: ${action}\n${Object.entries(details)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n')}`;

    await putLogEvents(logGroupName, message);
    console.log('Evento registrado correctamente');
  } catch (error) {
    console.error('Error registrando evento:', error);
  }
}; 