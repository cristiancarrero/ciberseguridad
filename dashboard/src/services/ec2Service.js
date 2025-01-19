import { 
  RunInstancesCommand, 
  DescribeInstancesCommand,
  StartInstancesCommand,
  StopInstancesCommand,
  TerminateInstancesCommand
} from "@aws-sdk/client-ec2";
import { getEC2Client } from './awsClientsService';

export const launchInstance = async (config) => {
  try {
    console.log('Lanzando nueva instancia EC2...');
    const client = getEC2Client();  // Obtener el cliente del servicio centralizado

    const command = new RunInstancesCommand({
      ImageId: config.imageId,
      InstanceType: config.type,
      KeyName: config.keyName,
      MinCount: 1,
      MaxCount: 1,
      SecurityGroups: [config.securityGroup],
      TagSpecifications: [
        {
          ResourceType: "instance",
          Tags: [{ Key: "Name", Value: config.name }]
        }
      ]
    });

    const response = await client.send(command);
    return response.Instances[0];
  } catch (error) {
    console.error('Error al lanzar instancia:', error);
    throw error;
  }
};

export const listInstances = async () => {
  try {
    const client = getEC2Client();
    const command = new DescribeInstancesCommand({});
    const response = await client.send(command);
    
    return response.Reservations.flatMap(reservation => 
      reservation.Instances.map(instance => ({
        id: instance.InstanceId,
        type: instance.InstanceType,
        state: instance.State.Name,
        name: instance.Tags?.find(tag => tag.Key === 'Name')?.Value || 'Sin nombre',
        publicIp: instance.PublicIpAddress,
        privateIp: instance.PrivateIpAddress
      }))
    );
  } catch (error) {
    console.error('Error listando instancias:', error);
    throw error;
  }
};

export const startInstance = async (instanceId) => {
  try {
    const client = getEC2Client();
    const command = new StartInstancesCommand({
      InstanceIds: [instanceId]
    });
    
    await client.send(command);
  } catch (error) {
    console.error('Error starting EC2 instance:', error);
    throw error;
  }
};

export const stopInstance = async (instanceId) => {
  try {
    const client = getEC2Client();
    const command = new StopInstancesCommand({
      InstanceIds: [instanceId]
    });
    
    await client.send(command);
  } catch (error) {
    console.error('Error stopping EC2 instance:', error);
    throw error;
  }
};

export const terminateInstance = async (instanceId) => {
  try {
    const client = getEC2Client();
    const command = new TerminateInstancesCommand({
      InstanceIds: [instanceId]
    });
    
    await client.send(command);
  } catch (error) {
    console.error('Error terminating EC2 instance:', error);
    throw error;
  }
};

export const testEC2Connection = async () => {
  try {
    const instances = await listInstances();
    console.log('EC2 Instances:', instances);
    return true;
  } catch (error) {
    console.error('EC2 Connection Test Failed:', error);
    return false;
  }
};

export const getInstanceDNS = (instance) => {
  const region = 'us-west-2'; // O la región que corresponda
  return `ec2-${instance.publicIp.replace(/\./g, '-')}.${region}.compute.amazonaws.com`;
};

export const getSSHConfig = (instance) => {
  return {
    username: 'ec2-user',
    host: getInstanceDNS(instance),
    port: 22,
    privateKey: sessionStorage.getItem('ssh_key')
  };
};

// ... otros métodos usando el mismo patrón 