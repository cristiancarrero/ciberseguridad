import { CloudWatchClient, PutMetricAlarmCommand, DeleteAlarmsCommand, DescribeAlarmsCommand } from "@aws-sdk/client-cloudwatch";
import { SNSClient, CreateTopicCommand, SubscribeCommand } from "@aws-sdk/client-sns";
import { putLogEvents } from './cloudwatchLogs';

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

export const createCloudWatchAlarm = async (alarmData) => {
  if (!cloudWatchClient) {
    throw new Error('CloudWatch Client no inicializado');
  }

  try {
    let topicArn = null;

    // Solo crear el tema SNS si hay email
    if (alarmData.email) {
      // 1. Crear tema SNS
      const topicName = `CloudWatch-Alarm-${Date.now()}`;
      const createTopicCommand = new CreateTopicCommand({
        Name: topicName
      });
      console.log('Creando tema SNS...');
      const topicResponse = await snsClient.send(createTopicCommand);
      topicArn = topicResponse.TopicArn;
      console.log('Tema SNS creado:', topicArn);

      // 2. Suscribir email
      const subscribeCommand = new SubscribeCommand({
        TopicArn: topicArn,
        Protocol: "email",
        Endpoint: alarmData.email
      });
      console.log('Suscribiendo email:', alarmData.email);
      await snsClient.send(subscribeCommand);
    }

    // 3. Crear alarma
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
      Period: 60,
      DatapointsToAlarm: 1,
      TreatMissingData: 'breaching',
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
      AlarmActions: topicArn ? [topicArn] : [],
      OKActions: topicArn ? [topicArn] : [],
      InsufficientDataActions: topicArn ? [topicArn] : []
    });

    await cloudWatchClient.send(command);
    console.log('Alarma creada exitosamente');

    // Registrar el evento en los logs
    await putLogEvents('/aws/ec2/aws-cloudwatch-alarms', 
      `INFO: Nueva alarma creada - ${alarmData.name} para la instancia ${alarmData.instanceName} 
       Métrica: ${alarmData.metric}, Umbral: ${alarmData.threshold}%`
    );

    return true;
  } catch (error) {
    await putLogEvents('/aws/ec2/aws-cloudwatch-alarms', 
      `ERROR: Fallo al crear alarma - ${error.message}`
    );
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
    // Registrar el evento de eliminación
    await putLogEvents('/aws/ec2/aws-cloudwatch-alarms',
      `INFO: Alarma eliminada - ${alarmName}
       Fecha: ${new Date().toISOString()}`
    );

    return true;
  } catch (error) {
    // Registrar el error
    await putLogEvents('/aws/ec2/aws-cloudwatch-alarms',
      `ERROR: Fallo al eliminar alarma ${alarmName} - ${error.message}`
    );
    console.error('Error eliminando alarma:', error);
    throw error;
  }
};

export const getAlarmState = async (alarmName) => {
  if (!cloudWatchClient) {
    throw new Error('CloudWatch Client no inicializado');
  }

  try {
    const command = new DescribeAlarmsCommand({
      AlarmNames: [alarmName]
    });
    const response = await cloudWatchClient.send(command);
    if (response.MetricAlarms && response.MetricAlarms.length > 0) {
      return response.MetricAlarms[0].StateValue;
    }
    return 'UNKNOWN';
  } catch (error) {
    console.error('Error obteniendo estado de alarma:', error);
    throw error;
  }
}; 