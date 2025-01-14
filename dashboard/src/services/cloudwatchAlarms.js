import { CloudWatchClient, PutMetricAlarmCommand, DeleteAlarmsCommand } from "@aws-sdk/client-cloudwatch";
import { SNSClient, CreateTopicCommand, SubscribeCommand } from "@aws-sdk/client-sns";

let cloudWatchClient = null;
let snsClient = null;

export const initializeCloudWatchAlarms = (credentials) => {
  cloudWatchClient = new CloudWatchClient({
    region: credentials.region,
    credentials: {
      accessKeyId: credentials.credentials.accessKeyId,
      secretAccessKey: credentials.credentials.secretAccessKey,
      sessionToken: credentials.credentials.sessionToken
    }
  });

  snsClient = new SNSClient({
    region: credentials.region,
    credentials: {
      accessKeyId: credentials.credentials.accessKeyId,
      secretAccessKey: credentials.credentials.secretAccessKey,
      sessionToken: credentials.credentials.sessionToken
    }
  });
};

export const setupAlarmNotifications = async (email) => {
  if (!snsClient) {
    throw new Error('SNS Client no inicializado');
  }

  try {
    console.log('Configurando notificaciones para:', email);
    
    // Crear un nombre único para el tema
    const topicName = `CloudWatchAlarms-${Date.now()}`;
    
    // Crear el tema SNS
    const createTopicCommand = new CreateTopicCommand({
      Name: topicName
    });
    console.log('Creando tema SNS...');
    const topicResponse = await snsClient.send(createTopicCommand);
    const topicArn = topicResponse.TopicArn;
    console.log('Tema SNS creado:', topicArn);

    // Suscribir el email al tema
    const subscribeCommand = new SubscribeCommand({
      TopicArn: topicArn,
      Protocol: "email",
      Endpoint: email
    });
    console.log('Suscribiendo email al tema...');
    await snsClient.send(subscribeCommand);
    console.log('Email suscrito correctamente');

    return topicArn;
  } catch (error) {
    console.error('Error detallado en setupAlarmNotifications:', error);
    throw new Error(`Error configurando notificaciones: ${error.message}`);
  }
};

export const createCloudWatchAlarm = async (alarmData, topicArn) => {
  if (!cloudWatchClient) {
    throw new Error('CloudWatch Client no inicializado');
  }

  try {
    console.log('Creando alarma con datos:', { alarmData, topicArn });
    const command = new PutMetricAlarmCommand({
      AlarmName: alarmData.name,
      ComparisonOperator: 
        alarmData.condition === 'greater' ? 'GreaterThanThreshold' :
        alarmData.condition === 'less' ? 'LessThanThreshold' :
        'EqualToThreshold',
      EvaluationPeriods: 1,
      MetricName: 
        alarmData.metric === 'cpu' ? 'CPUUtilization' :
        alarmData.metric === 'memory' ? 'MemoryUtilization' :
        alarmData.metric === 'disk' ? 'DiskReadOps' :
        'NetworkIn',
      Namespace: 'AWS/EC2',
      Period: 300,
      Statistic: 'Average',
      Threshold: parseFloat(alarmData.threshold),
      ActionsEnabled: true,
      AlarmDescription: `Alarma para ${alarmData.metric} en instancia ${alarmData.instanceName}`,
      Dimensions: [
        {
          Name: 'InstanceId',
          Value: alarmData.instance
        }
      ],
      AlarmActions: topicArn ? [topicArn] : []
    });

    console.log('Enviando comando de creación de alarma...');
    await cloudWatchClient.send(command);
    console.log('Alarma creada exitosamente');
    return true;
  } catch (error) {
    console.error('Error detallado creando alarma en CloudWatch:', error);
    throw error;
  }
};

export const deleteCloudWatchAlarm = async (alarmName) => {
  if (!cloudWatchClient) {
    throw new Error('CloudWatch Client no inicializado');
  }

  try {
    const command = new DeleteAlarmsCommand({
      AlarmNames: [alarmName]
    });

    await cloudWatchClient.send(command);
    return true;
  } catch (error) {
    console.error('Error eliminando alarma de CloudWatch:', error);
    throw error;
  }
}; 