import { ListMetricsCommand } from "@aws-sdk/client-cloudwatch";
import { putLogEvents } from './cloudwatchLogs';

export const fetchEC2Instances = async (cloudWatchClient) => {
  try {
    console.log('Intentando obtener métricas de EC2...');
    const command = new ListMetricsCommand({
      Namespace: 'AWS/EC2',
      MetricName: 'CPUUtilization'
    });

    const response = await cloudWatchClient.send(command);
    console.log('Respuesta de CloudWatch:', response);

    const instances = new Set();
    response.Metrics.forEach(metric => {
      const instanceId = metric.Dimensions.find(d => d.Name === 'InstanceId')?.Value;
      if (instanceId) {
        instances.add(instanceId);
      }
    });

    return Array.from(instances);
  } catch (error) {
    console.error('Error obteniendo métricas:', error);
    return [];
  }
};

export const updateMetrics = async (instanceId) => {
  try {
    const metrics = await getInstanceMetrics(instanceId);
    await putLogEvents('/aws/ec2/aws-cloudwatch-alarms',
      `INFO: Métricas actualizadas para instancia ${instanceId}
       CPU: ${metrics.cpu}%
       Memoria: ${metrics.memory}%
       Red: ${metrics.network}MB/s`
    );
    return metrics;
  } catch (error) {
    await putLogEvents('/aws/ec2/aws-cloudwatch-alarms',
      `ERROR: Fallo al actualizar métricas - ${error.message}`
    );
    throw error;
  }
}; 