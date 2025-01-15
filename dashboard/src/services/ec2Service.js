import { EC2Client, DescribeInstancesCommand, RunInstancesCommand, StartInstancesCommand, StopInstancesCommand, TerminateInstancesCommand, DescribeSecurityGroupsCommand, CreateSecurityGroupCommand, AuthorizeSecurityGroupIngressCommand, DescribeVpcsCommand, DescribeSubnetsCommand } from "@aws-sdk/client-ec2";
import { putLogEvents, logSystemEvent } from './cloudwatchLogs';

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
    console.error('EC2 Client no inicializado');
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
    console.error('Error listando instancias:', error);
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
    await putLogEvents('/aws/ec2/aws-cloudwatch-alarms',
      `INFO: Nueva instancia EC2 creada
       ID: ${response.Instances[0].InstanceId}
       Tipo: ${instanceData.type}
       AMI: ${instanceData.imageId}`
    );
    return response.Instances[0];
  } catch (error) {
    await putLogEvents('/aws/ec2/aws-cloudwatch-alarms',
      `ERROR: Fallo al lanzar instancia - ${error.message}`
    );
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
    await ec2Client.send(new StartInstancesCommand({
      InstanceIds: [instanceId]
    }));

    // Registrar el evento de inicio
    await logSystemEvent('Instancia iniciada', {
      ID: instanceId,
      Usuario: 'Sistema',
      Fecha: new Date().toISOString()
    });

    return true;
  } catch (error) {
    await logSystemEvent('Error al iniciar instancia', {
      ID: instanceId,
      Error: error.message,
      Fecha: new Date().toISOString()
    });
    throw error;
  }
};

export const stopInstance = async (instanceId) => {
  try {
    await ec2Client.send(new StopInstancesCommand({
      InstanceIds: [instanceId]
    }));

    // Registrar el evento de detención
    await logSystemEvent('Instancia detenida', {
      ID: instanceId,
      Usuario: 'Sistema',
      Fecha: new Date().toISOString()
    });

    return true;
  } catch (error) {
    await logSystemEvent('Error al detener instancia', {
      ID: instanceId,
      Error: error.message,
      Fecha: new Date().toISOString()
    });
    throw error;
  }
};

export const terminateInstance = async (instanceId) => {
  try {
    await ec2Client.send(new TerminateInstancesCommand({
      InstanceIds: [instanceId]
    }));

    // Registrar la terminación de la instancia
    await logSystemEvent('Instancia terminada', {
      ID: instanceId,
      Usuario: 'Sistema',
      Fecha: new Date().toISOString()
    });

    return true;
  } catch (error) {
    // Registrar el error
    await logSystemEvent('Error al terminar instancia', {
      ID: instanceId,
      Error: error.message,
      Fecha: new Date().toISOString()
    });
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

export const getSSHConfig = async (instance) => {
  try {
    const config = {
      username: 'ec2-user',
      host: getInstanceDNS(instance),
      port: 22,
      privateKey: sessionStorage.getItem('ssh_key')
    };

    // Registrar el evento en el grupo específico de la instancia
    await logSystemEvent('Conexión SSH iniciada', {
      Instancia: instance.id,
      Nombre: instance.name || instance.id,
      Host: config.host,
      Usuario: config.username,
      Puerto: config.port,
      Fecha: new Date().toISOString()
    }, `/aws/ec2/${instance.id}`);

    return config;
  } catch (error) {
    console.error('Error en configuración SSH:', error);
    throw error;
  }
};

// También podríamos añadir un log cuando se cierra la conexión
export const closeSSHConnection = async (instance) => {
  try {
    await logSystemEvent('Conexión SSH cerrada', {
      Instancia: instance.id,
      Nombre: instance.name || instance.id,
      Fecha: new Date().toISOString()
    }, `/aws/ec2/${instance.id}`);
  } catch (error) {
    console.error('Error registrando cierre de SSH:', error);
  }
}; 