import { CloudWatchClient, GetMetricDataCommand } from "@aws-sdk/client-cloudwatch";

export const getMetrics = async (metricName, period = 3600) => {
  const client = new CloudWatchClient({ region: "tu-region" });
  
  const endTime = new Date();
  const startTime = new Date(endTime - period * 1000);

  const command = new GetMetricDataCommand({
    StartTime: startTime,
    EndTime: endTime,
    MetricDataQueries: [
      {
        Id: 'cpu',
        MetricStat: {
          Metric: {
            Namespace: 'AWS/EC2',
            MetricName: metricName,
            Dimensions: [
              {
                Name: 'InstanceId',
                Value: 'tu-instance-id'
              }
            ]
          },
          Period: 300, // 5 minutos
          Stat: 'Average'
        }
      }
    ]
  });

  const response = await client.send(command);
  return response.MetricDataResults[0];
}; 