import { EC2Client, DescribeInstancesCommand, RunInstancesCommand, StartInstancesCommand, StopInstancesCommand, TerminateInstancesCommand, DescribeSecurityGroupsCommand, CreateSecurityGroupCommand, AuthorizeSecurityGroupIngressCommand } from "@aws-sdk/client-ec2";

let ec2Client = null;

export const initializeEC2Client = (credentials) => {
  console.log('Inicializando EC2 Client con credenciales:', {
    region: credentials.region,
    hasAccessKey: !!credentials.credentials.accessKeyId,
    hasSecretKey: !!credentials.credentials.secretAccessKey,
    hasSessionToken: !!credentials.credentials.sessionToken
  });

  ec2Client = new EC2Client({
    region: credentials.region,
    credentials: {
      accessKeyId: credentials.credentials.accessKeyId,
      secretAccessKey: credentials.credentials.secretAccessKey,
      sessionToken: credentials.credentials.sessionToken
    }
  });
};

export const listInstances = async () => {
  if (!ec2Client) {
    throw new Error('EC2 Client no está inicializado. Asegúrate de estar conectado a AWS.');
  }

  try {
    console.log('Intentando listar instancias EC2...');
    const command = new DescribeInstancesCommand({});
    const response = await ec2Client.send(command);
    console.log('Respuesta de EC2:', response);
    
    const instances = [];
    response.Reservations?.forEach(reservation => {
      reservation.Instances?.forEach(instance => {
        if (instance.State.Name !== 'terminated') {
          const nameTag = instance.Tags?.find(tag => tag.Key === 'Name');
          instances.push({
            id: instance.InstanceId,
            name: nameTag?.Value || instance.InstanceId,
            type: instance.InstanceType,
            state: instance.State.Name,
            publicIp: instance.PublicIpAddress || 'N/A',
            privateIp: instance.PrivateIpAddress || 'N/A',
            platform: instance.Platform || 'linux',
            launchTime: instance.LaunchTime,
            securityGroups: instance.SecurityGroups || []
          });
        }
      });
    });
    
    return instances;
  } catch (error) {
    console.error('Error listando instancias EC2:', error);
    throw error;
  }
};

// Función auxiliar para obtener el grupo de seguridad por defecto
const getDefaultSecurityGroup = async () => {
  try {
    const command = new DescribeSecurityGroupsCommand({});
    const response = await ec2Client.send(command);
    // Buscar el grupo de seguridad por defecto
    const defaultGroup = response.SecurityGroups.find(group => group.GroupName === 'default');
    return defaultGroup?.GroupId;
  } catch (error) {
    console.error('Error al obtener grupo de seguridad:', error);
    return null;
  }
};

export const launchInstance = async (instanceData) => {
  try {
    console.log('Lanzando nueva instancia EC2...');

    const command = new RunInstancesCommand({
      ImageId: instanceData.imageId,
      InstanceType: instanceData.type,
      KeyName: 'vockey',
      MinCount: 1,
      MaxCount: 1,
      // Añadir configuración de red explícita
      NetworkInterfaces: [{
        AssociatePublicIpAddress: true,
        DeviceIndex: 0,
        DeleteOnTermination: true,
        SubnetId: 'subnet-002adab6199919fef' // Subnet ID que vemos en la imagen
      }],
      TagSpecifications: [{
        ResourceType: 'instance',
        Tags: [
          { Key: 'Name', Value: instanceData.name },
          { Key: 'Environment', Value: instanceData.tags.Environment },
          { Key: 'Project', Value: instanceData.tags.Project }
        ]
      }],
      UserData: btoa(`#!/bin/bash
# Actualizar el sistema
yum update -y

# Configurar acceso SSH
sed -i 's/#PasswordAuthentication yes/PasswordAuthentication yes/' /etc/ssh/sshd_config
sed -i 's/PasswordAuthentication no/PasswordAuthentication yes/' /etc/ssh/sshd_config

# Reiniciar servicio SSH
systemctl restart sshd`)
    });

    const response = await ec2Client.send(command);
    return response.Instances[0].InstanceId;
  } catch (error) {
    console.error('Error lanzando instancia EC2:', error);
    throw new Error(`Error al lanzar la instancia: ${error.message}`);
  }
};

export const startInstance = async (instanceId) => {
  try {
    const command = new StartInstancesCommand({
      InstanceIds: [instanceId]
    });
    
    await ec2Client.send(command);
  } catch (error) {
    console.error('Error starting EC2 instance:', error);
    throw error;
  }
};

export const stopInstance = async (instanceId) => {
  try {
    const command = new StopInstancesCommand({
      InstanceIds: [instanceId]
    });
    
    await ec2Client.send(command);
  } catch (error) {
    console.error('Error stopping EC2 instance:', error);
    throw error;
  }
};

export const terminateInstance = async (instanceId) => {
  try {
    const command = new TerminateInstancesCommand({
      InstanceIds: [instanceId]
    });
    
    await ec2Client.send(command);
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

const createSecurityGroup = async (instanceName) => {
  const createSgCommand = new CreateSecurityGroupCommand({
    GroupName: `${instanceName}-sg`,
    Description: 'Security group for SSH access'
  });

  const sg = await ec2Client.send(createSgCommand);

  const authorizeSgCommand = new AuthorizeSecurityGroupIngressCommand({
    GroupId: sg.GroupId,
    IpPermissions: [
      {
        IpProtocol: 'tcp',
        FromPort: 22,
        ToPort: 22,
        IpRanges: [{ CidrIp: '0.0.0.0/0' }]
      }
    ]
  });

  await ec2Client.send(authorizeSgCommand);
  return sg.GroupId;
}; 