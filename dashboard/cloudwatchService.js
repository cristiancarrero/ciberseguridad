import { CloudWatchClient, GetMetricDataCommand } from "@aws-sdk/client-cloudwatch";

// Create a singleton instance
let cloudWatchClient = null;

export const initializeCloudWatchClient = (credentials) => {
  try {
    // Validate all required credentials
    if (!credentials?.accessKeyId || !credentials?.secretAccessKey || !credentials?.region) {
      throw new Error('Missing required AWS credentials (accessKeyId, secretAccessKey, or region)');
    }

    // Only initialize if not already initialized or if credentials changed
    if (!cloudWatchClient) {
      cloudWatchClient = new CloudWatchClient({
        region: credentials.region,
        credentials: {
          accessKeyId: credentials.accessKeyId,
          secretAccessKey: credentials.secretAccessKey
        },
        maxAttempts: 3 // Add retry logic
      });

      console.log('CloudWatch client initialized successfully');
    }

    return cloudWatchClient;
  } catch (error) {
    console.error('Failed to initialize CloudWatch client:', error);
    throw error;
  }
};

export const getMetricData = async (metric, instanceId) => {
  if (!cloudWatchClient) {
    console.error('CloudWatch client no inicializado');
    throw new Error('CloudWatch client no inicializado');
  }

  console.log('Solicitando métricas:', {
    instanceId,
    metricName: metric.metricName,
    period: 300
  });

  const endTime = new Date();
  const startTime = new Date(endTime - 3600000); // última hora

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
          Period: 300, // 5 minutos
          Stat: 'Average'
        }
      }
    ]
  });

  try {
    const response = await cloudWatchClient.send(command);
    console.log('CloudWatch response received');
    
    // Add validation for the response
    if (!response?.MetricDataResults?.[0]) {
      throw new Error('Invalid metric data response from CloudWatch');
    }

    return {
      timestamps: response.MetricDataResults[0].Timestamps || [],
      values: response.MetricDataResults[0].Values || []
    };
  } catch (error) {
    console.error('Failed to fetch CloudWatch metrics:', error);
    throw error;
  }
}; 