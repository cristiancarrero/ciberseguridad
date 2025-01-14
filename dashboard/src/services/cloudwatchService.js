import { CloudWatchClient, GetMetricDataCommand } from "@aws-sdk/client-cloudwatch";

export const getInstanceMetrics = async (instanceId, metricName, period = 300) => {
  try {
    console.log('Solicitando métricas:', { instanceId, metricName, period });
    
    const awsConfig = JSON.parse(localStorage.getItem('awsConfig'));
    
    if (!awsConfig || !awsConfig.credentials) {
      throw new Error('No se encontraron credenciales de AWS');
    }

    const client = new CloudWatchClient({ 
      region: awsConfig.region || 'us-west-2',
      credentials: {
        accessKeyId: awsConfig.credentials.accessKeyId,
        secretAccessKey: awsConfig.credentials.secretAccessKey,
        sessionToken: awsConfig.credentials.sessionToken
      }
    });
    
    const now = new Date();
    const startTime = new Date(now.getTime() - (3600 * 1000)); // Última hora

    const command = new GetMetricDataCommand({
      StartTime: startTime,
      EndTime: now,
      MetricDataQueries: [
        {
          Id: 'm1',
          MetricStat: {
            Metric: {
              Namespace: 'AWS/EC2',
              MetricName: metricName,
              Dimensions: [
                {
                  Name: 'InstanceId',
                  Value: instanceId
                }
              ]
            },
            Period: period,
            Stat: 'Average'
          }
        }
      ]
    });

    const response = await client.send(command);
    console.log('Respuesta de CloudWatch:', response);
    return response.MetricDataResults[0];
  } catch (error) {
    console.error('Error detallado al obtener métricas:', error);
    throw error;
  }
}; 