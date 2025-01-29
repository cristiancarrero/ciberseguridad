import { EC2Client, DescribeInstancesCommand } from "@aws-sdk/client-ec2";

let cwInstanceClient = null;

export const initializeCloudWatchInstances = (credentials) => {
  console.log('Inicializando CloudWatch Instance Client...');
  cwInstanceClient = new EC2Client({
    region: credentials.region,
    credentials: {
      accessKeyId: credentials.credentials.accessKeyId,
      secretAccessKey: credentials.credentials.secretAccessKey,
      sessionToken: credentials.credentials.sessionToken
    }
  });
};

export const getCloudWatchInstances = async () => {
  if (!cwInstanceClient) {
    console.error('CloudWatch Instance Client no inicializado');
    return [];
  }

  try {
    console.log('Obteniendo instancias para CloudWatch...');
    const command = new DescribeInstancesCommand({});
    const response = await cwInstanceClient.send(command);
    
    const instances = [];
    
    response.Reservations?.forEach(reservation => {
      reservation.Instances?.forEach(instance => {
        // Solo incluimos instancias que no estén terminadas
        if (instance.State.Name !== 'terminated') {
          const nameTag = instance.Tags?.find(tag => tag.Key === 'Name');
          instances.push({
            id: instance.InstanceId,
            name: nameTag?.Value || instance.InstanceId,
            type: instance.InstanceType
          });
        }
      });
    });

    console.log('Instancias encontradas:', instances);
    return instances;
  } catch (error) {
    console.error('Error al obtener instancias para CloudWatch:', error);
    return [];
  }
};