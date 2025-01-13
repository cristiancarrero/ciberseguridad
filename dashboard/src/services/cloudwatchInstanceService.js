import { EC2Client, DescribeInstancesCommand } from "@aws-sdk/client-ec2";

let cwInstanceClient = null;

export const initializeCloudWatchInstances = (credentials, region) => {
  cwInstanceClient = new EC2Client({
    credentials: credentials,
    region: region
  });
};

export const getCloudWatchInstances = async () => {
  if (!cwInstanceClient) {
    console.error('CloudWatch Instance Client no inicializado');
    // Para desarrollo, devolvemos datos de prueba
    return [
      { id: 'i-123456', name: 'Test Instance 1', type: 't2.micro', state: 'running' },
      { id: 'i-789012', name: 'Test Instance 2', type: 't2.small', state: 'running' }
    ];
  }

  try {
    const command = new DescribeInstancesCommand({
      Filters: [
        {
          Name: 'instance-state-name',
          Values: ['running']
        }
      ]
    });
    
    const response = await cwInstanceClient.send(command);
    const instances = [];
    
    response.Reservations.forEach(reservation => {
      reservation.Instances.forEach(instance => {
        const nameTag = instance.Tags?.find(tag => tag.Key === 'Name');
        instances.push({
          id: instance.InstanceId,
          name: nameTag?.Value || instance.InstanceId,
          type: instance.InstanceType,
          state: instance.State.Name
        });
      });
    });

    return instances;
  } catch (error) {
    console.error('Error al obtener instancias:', error);
    return [];
  }
};