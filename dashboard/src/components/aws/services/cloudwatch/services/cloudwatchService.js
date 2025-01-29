import { CloudWatchClient, GetMetricDataCommand } from "@aws-sdk/client-cloudwatch";

let cloudWatchClient = null;

export const getCloudWatchClient = () => {
  if (!cloudWatchClient) {
    console.log('Intentando obtener cliente CloudWatch...');
    const savedConfig = JSON.parse(localStorage.getItem('awsConfig'));
    console.log('Config guardada:', savedConfig);
    
    if (!savedConfig) {
      throw new Error('No hay configuración de AWS');
    }

    try {
      initializeCloudWatch(savedConfig);
    } catch (error) {
      console.error('Error al inicializar CloudWatch:', error);
      throw error;
    }
  }
  return cloudWatchClient;
};

export const initializeCloudWatch = (credentials) => {
  try {
    console.log('Inicializando CloudWatch con credenciales:', credentials);
    
    if (!credentials || !credentials.credentials) {
      throw new Error('Credenciales inválidas');
    }

    const awsConfig = {
      region: credentials.region || 'us-west-2',
      credentials: {
        accessKeyId: credentials.credentials.accessKeyId,
        secretAccessKey: credentials.credentials.secretAccessKey,
        sessionToken: credentials.credentials.sessionToken
      }
    };

    if (!awsConfig.credentials.accessKeyId || !awsConfig.credentials.secretAccessKey) {
      throw new Error('Credenciales incompletas');
    }

    cloudWatchClient = new CloudWatchClient(awsConfig);
    console.log('CloudWatch client inicializado con éxito');
    return true;
  } catch (error) {
    console.error('Error al inicializar CloudWatch client:', error);
    throw error;
  }
};

export const getInstanceMetrics = async (instanceId, metricName, period = 300) => {
  try {
    if (!cloudWatchClient) {
      const savedConfig = JSON.parse(localStorage.getItem('awsConfig'));
      if (!savedConfig) {
        throw new Error('No hay configuración de AWS');
      }
      
      await initializeCloudWatch(savedConfig);
    }

    console.log('Solicitando métricas:', { instanceId, metricName, period });

    const endTime = new Date();
    const startTime = new Date(endTime - 24 * 60 * 60 * 1000);

    let cloudWatchMetricName = metricName;
    if (metricName.toLowerCase() === 'cpuutilization') {
      cloudWatchMetricName = 'CPUUtilization';
    } else if (metricName.toLowerCase() === 'networkin') {
      cloudWatchMetricName = 'NetworkIn';
    } else if (metricName.toLowerCase() === 'networkout') {
      cloudWatchMetricName = 'NetworkOut';
    } else if (metricName.toLowerCase() === 'diskreadbytes') {
      cloudWatchMetricName = 'DiskReadBytes';
    } else if (metricName.toLowerCase() === 'diskwritebytes') {
      cloudWatchMetricName = 'DiskWriteBytes';
    } else if (metricName.toLowerCase() === 'statuscheckfailed') {
      cloudWatchMetricName = 'StatusCheckFailed';
    }

    console.log('Nombre de métrica normalizado:', cloudWatchMetricName);

    const command = new GetMetricDataCommand({
      MetricDataQueries: [
        {
          Id: 'm1',
          MetricStat: {
            Metric: {
              Namespace: 'AWS/EC2',
              MetricName: cloudWatchMetricName,
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

    const response = await cloudWatchClient.send(command);
    
    if (!response.MetricDataResults || !response.MetricDataResults[0]) {
      throw new Error('No se recibieron datos de métricas');
    }

    return {
      Timestamps: response.MetricDataResults[0].Timestamps || [],
      Values: response.MetricDataResults[0].Values || []
    };
  } catch (error) {
    console.error('Error detallado al obtener métricas:', error);
    if (error.name === 'InvalidClientTokenId') {
      throw new Error('Error de autenticación. Por favor, reconéctese a AWS.');
    }
    throw error;
  }
}; 