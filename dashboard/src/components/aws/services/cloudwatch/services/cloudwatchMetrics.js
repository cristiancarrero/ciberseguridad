import { GetMetricDataCommand } from "@aws-sdk/client-cloudwatch";
import { getCloudWatchClient } from './cloudwatchService';

export const getInstanceMetrics = async (instanceId, metricName, period = 300) => {
  try {
    console.log('Solicitando métricas:', { instanceId, metricName, period });
    
    const cloudWatchClient = getCloudWatchClient();
    if (!cloudWatchClient) {
      throw new Error('Cliente de CloudWatch no inicializado');
    }

    const endTime = new Date();
    const startTime = new Date(endTime - 24 * 60 * 60 * 1000); // Últimas 24 horas

    const command = new GetMetricDataCommand({
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
      ],
      StartTime: startTime,
      EndTime: endTime
    });

    console.log('Enviando comando a CloudWatch:', JSON.stringify(command.input, null, 2));
    
    const response = await cloudWatchClient.send(command);
    console.log('Respuesta de CloudWatch:', JSON.stringify(response, null, 2));
    
    if (!response.MetricDataResults || !response.MetricDataResults[0]) {
      console.warn('No se recibieron datos de métricas para:', { instanceId, metricName });
      return {
        Timestamps: [],
        Values: []
      };
    }

    return {
      Timestamps: response.MetricDataResults[0].Timestamps || [],
      Values: response.MetricDataResults[0].Values || []
    };
  } catch (error) {
    console.error('Error detallado al obtener métricas:', error);
    if (error.name === 'InvalidClientTokenId' || error.name === 'ExpiredToken') {
      // Limpiar las credenciales expiradas
      localStorage.removeItem('awsConfig');
      localStorage.setItem('awsConnected', 'false');
      throw new Error('Credenciales de AWS expiradas o inválidas');
    }
    throw error;
  }
}; 