import { CloudWatchClient, GetMetricDataCommand } from "@aws-sdk/client-cloudwatch";
import { getAWSCredentials } from './credentialsService';

let cloudWatchClient = null;

const getCloudWatchClient = () => {
  const credentials = getAWSCredentials();
  
  if (!credentials) {
    console.error('No hay credenciales disponibles');
    cloudWatchClient = null;
    return null;
  }

  try {
    // Siempre crear un nuevo cliente si las credenciales cambian
    if (!cloudWatchClient || 
        cloudWatchClient.config.credentials.accessKeyId !== credentials.accessKeyId ||
        cloudWatchClient.config.credentials.secretAccessKey !== credentials.secretAccessKey) {
      
      console.log('Inicializando nuevo cliente CloudWatch');
      cloudWatchClient = new CloudWatchClient({
        region: credentials.region,
        credentials: {
          accessKeyId: credentials.accessKeyId,
          secretAccessKey: credentials.secretAccessKey
        }
      });
    }

    return cloudWatchClient;
  } catch (error) {
    console.error('Error al crear cliente CloudWatch:', error);
    cloudWatchClient = null;
    return null;
  }
};

export const getMetricData = async (metric, instanceId) => {
  const client = getCloudWatchClient();
  if (!client) {
    throw new Error('No hay credenciales de AWS disponibles');
  }

  const endTime = new Date();
  const startTime = new Date(endTime - 3600000);

  const command = new GetMetricDataCommand({
    StartTime: startTime,
    EndTime: endTime,
    MetricDataQueries: [
      {
        Id: 'm1',
        MetricStat: {
          Metric: {
            Namespace: 'AWS/EC2',
            MetricName: metric.metricName,
            Dimensions: [
              {
                Name: 'InstanceId',
                Value: instanceId
              }
            ]
          },
          Period: 300,
          Stat: 'Average'
        }
      }
    ]
  });

  try {
    const response = await client.send(command);
    return {
      timestamps: response.MetricDataResults[0].Timestamps,
      values: response.MetricDataResults[0].Values
    };
  } catch (error) {
    console.error('Error al obtener datos de CloudWatch:', error);
    throw error;
  }
}; 