import { 
  EC2Client,
  DescribeInstancesCommand,
  ModifyInstanceAttributeCommand,
  TerminateInstancesCommand
} from "@aws-sdk/client-ec2";

let ec2Client = null;

const initializeEC2Client = async () => {
  try {
    const awsCredentials = localStorage.getItem('awsCredentials');
    const awsRegion = localStorage.getItem('awsRegion');
    
    if (!awsCredentials || !awsRegion) {
      throw new Error('Credenciales de AWS no encontradas');
    }

    const credentials = JSON.parse(awsCredentials);
    
    ec2Client = new EC2Client({
      region: awsRegion,
      credentials: {
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey,
        sessionToken: credentials.sessionToken
      }
    });

    return ec2Client;
  } catch (error) {
    console.error('Error inicializando EC2 client:', error);
    throw error;
  }
};

const getClient = async () => {
  if (!ec2Client) {
    await initializeEC2Client();
  }
  return ec2Client;
};

// Funciones específicas para VPC
export const getVPCInstances = async () => {
  try {
    const client = await getClient();
    const command = new DescribeInstancesCommand({});
    const response = await client.send(command);
    
    const instances = response.Reservations
      .flatMap(reservation => reservation.Instances)
      .filter(instance => instance.State.Name !== 'terminated');
    
    return instances;
  } catch (error) {
    console.error('Error al obtener instancias EC2:', error);
    throw error;
  }
};

export const moveInstanceToSubnet = async (instanceId, subnetId) => {
  try {
    const client = await getClient();
    const command = new ModifyInstanceAttributeCommand({
      InstanceId: instanceId,
      SubnetId: subnetId
    });
    await client.send(command);
    return true;
  } catch (error) {
    console.error('Error al mover instancia:', error);
    throw error;
  }
};

export const getInstancesByVpc = async (vpcId) => {
  try {
    const instances = await getVPCInstances();
    return instances.filter(instance => instance.VpcId === vpcId);
  } catch (error) {
    console.error('Error al obtener instancias por VPC:', error);
    throw error;
  }
};

export const terminateVPCInstance = async (instanceId) => {
  try {
    const client = await getClient();
    const command = new TerminateInstancesCommand({
      InstanceIds: [instanceId]
    });
    await client.send(command);
    return true;
  } catch (error) {
    console.error('Error al terminar instancia:', error);
    throw error;
  }
}; 