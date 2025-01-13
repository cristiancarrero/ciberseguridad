import { EC2Client, DescribeInstancesCommand, RunInstancesCommand, StartInstancesCommand, StopInstancesCommand, TerminateInstancesCommand, DescribeSecurityGroupsCommand, CreateSecurityGroupCommand, AuthorizeSecurityGroupIngressCommand, DescribeVpcsCommand, DescribeSubnetsCommand } from "@aws-sdk/client-ec2";

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

export const listSecurityGroups = async () => {
  try {
    const response = await fetch('/api/security-groups');
    const groups = await response.json();
    return groups;
  } catch (error) {
    throw new Error('Error al listar grupos de seguridad: ' + error.message);
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
    
    // Obtener VPC por defecto
    const vpcCommand = new DescribeVpcsCommand({
      Filters: [{ Name: 'isDefault', Values: ['true'] }]
    });
    const vpcResponse = await ec2Client.send(vpcCommand);
    
    if (!vpcResponse.Vpcs || vpcResponse.Vpcs.length === 0) {
      throw new Error('No se encontró una VPC por defecto');
    }
    const vpcId = vpcResponse.Vpcs[0].VpcId;

    // Obtener una subred de la VPC por defecto
    const subnetCommand = new DescribeSubnetsCommand({
      Filters: [{ Name: 'vpc-id', Values: [vpcId] }]
    });
    const subnetResponse = await ec2Client.send(subnetCommand);

    if (!subnetResponse.Subnets || subnetResponse.Subnets.length === 0) {
      throw new Error('No se encontraron subredes en la VPC por defecto');
    }

    // Crear grupo de seguridad
    const sgName = `ec2-sg-${Date.now()}`;
    const createSgCommand = new CreateSecurityGroupCommand({
      GroupName: sgName,
      Description: 'Security group for EC2 instance',
      VpcId: vpcId
    });
    
    const { GroupId } = await ec2Client.send(createSgCommand);

    // Configurar reglas de seguridad (SSH)
    await ec2Client.send(new AuthorizeSecurityGroupIngressCommand({
      GroupId: GroupId,
      IpPermissions: [{
        IpProtocol: 'tcp',
        FromPort: 22,
        ToPort: 22,
        IpRanges: [{ CidrIp: '0.0.0.0/0' }]
      }]
    }));

    // Lanzar instancia
    const command = new RunInstancesCommand({
      MaxCount: 1,
      MinCount: 1,
      ImageId: instanceData.imageId,
      InstanceType: instanceData.type,
      KeyName: 'vockey',
      SubnetId: subnetResponse.Subnets[0].SubnetId,
      SecurityGroupIds: [GroupId],
      TagSpecifications: [{
        ResourceType: 'instance',
        Tags: [
          { Key: 'Name', Value: instanceData.name }
        ]
      }]
    });

    const response = await ec2Client.send(command);
    return response.Instances[0];
  } catch (error) {
    console.error('Error al lanzar instancia:', error);
    throw error;
  }
};

// Función auxiliar para crear un grupo de seguridad
const createSecurityGroup = async (name) => {
  try {
    // Crear el grupo de seguridad
    const createCommand = new CreateSecurityGroupCommand({
      GroupName: name,
      Description: 'Security group for SSH access'
    });
    
    const { GroupId } = await ec2Client.send(createCommand);

    // Configurar reglas de entrada para SSH
    const authorizeCommand = new AuthorizeSecurityGroupIngressCommand({
      GroupId: GroupId,
      IpPermissions: [
        {
          IpProtocol: 'tcp',
          FromPort: 22,
          ToPort: 22,
          IpRanges: [{ CidrIp: '0.0.0.0/0' }]
        }
      ]
    });

    await ec2Client.send(authorizeCommand);
    return GroupId;
  } catch (error) {
    console.error('Error creando grupo de seguridad:', error);
    throw error;
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