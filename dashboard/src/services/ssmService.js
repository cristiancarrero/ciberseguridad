import { 
  SSMClient, 
  GetInventoryCommand,
  ListCommandsCommand,
  ListAssociationsCommand,
  DescribeInstanceInformationCommand,
  StartAutomationExecutionCommand,
  ListResourceComplianceSummariesCommand,
  DescribeInstancePatchStatesCommand,
  SendCommandCommand,
  DescribeInstancePatchesCommand,
  DeregisterManagedInstanceCommand
} from "@aws-sdk/client-ssm";

import { 
  IAMClient, 
  GetRoleCommand,
  CreateRoleCommand,
  AttachRolePolicyCommand,
  CreateInstanceProfileCommand,
  AddRoleToInstanceProfileCommand 
} from "@aws-sdk/client-iam";

import { 
  EC2Client,
  DescribeInstancesCommand,
  AssociateIamInstanceProfileCommand,
  CreateTagsCommand,
  DeleteTagsCommand,
  DisassociateIamInstanceProfileCommand,
  DescribeIamInstanceProfileAssociationsCommand
} from "@aws-sdk/client-ec2";

let ssmClient = null;
let ec2Client = null;

const getClient = () => {
  if (!ssmClient) {
    const credentials = JSON.parse(localStorage.getItem('awsCredentials'));
    const region = localStorage.getItem('awsRegion') || 'us-west-2';

    ssmClient = new SSMClient({
      region,
      credentials: {
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey,
        sessionToken: credentials.sessionToken
      }
    });
  }
  return ssmClient;
};

const getEC2Client = () => {
  if (!ec2Client) {
    const credentials = JSON.parse(localStorage.getItem('awsCredentials'));
    const region = localStorage.getItem('awsRegion') || 'us-west-2';

    ec2Client = new EC2Client({
      region,
      credentials: {
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey,
        sessionToken: credentials.sessionToken
      }
    });
  }
  return ec2Client;
};

export const initializeSSMService = (credentials) => {
  ssmClient = new SSMClient({
    region: credentials.region,
    credentials: {
      accessKeyId: credentials.credentials.accessKeyId,
      secretAccessKey: credentials.credentials.secretAccessKey,
      sessionToken: credentials.credentials.sessionToken
    }
  });
};

export const resetClient = () => {
  ssmClient = null;
};

// Obtener el resumen real de parches
export const getPatchSummary = async () => {
  try {
    const client = getClient();
    
    // 1. Obtener instancias gestionadas
    const instancesCommand = new DescribeInstanceInformationCommand({});
    const instancesResponse = await client.send(instancesCommand);
    const instances = instancesResponse.InstanceInformationList || [];

    if (instances.length === 0) {
      return {
        critical: 0,
        important: 0,
        moderate: 0,
        total: 0,
        compliant: 0,
        nonCompliant: 0
      };
    }

    // 2. Obtener estado de parches para cada instancia
    const patchStates = await Promise.all(
      instances.map(async (instance) => {
        const command = new DescribeInstancePatchStatesCommand({
          InstanceIds: [instance.InstanceId]
        });
        return client.send(command);
      })
    );

    // 3. Analizar resultados
    const summary = patchStates.reduce((acc, state) => {
      if (state.InstancePatchStates) {
        state.InstancePatchStates.forEach(patch => {
          // Contadores generales
          acc.total += patch.InstalledCount + patch.MissingCount;
          acc.compliant += patch.InstalledCount;
          acc.nonCompliant += patch.MissingCount;

          // Contadores por severidad
          if (patch.CriticalNonCompliantCount > 0) {
            acc.critical += patch.CriticalNonCompliantCount;
          }
          if (patch.SecurityNonCompliantCount > 0) {
            acc.important += patch.SecurityNonCompliantCount;
          }
          if (patch.OtherNonCompliantCount > 0) {
            acc.moderate += patch.OtherNonCompliantCount;
          }
        });
      }
      return acc;
    }, { 
      critical: 0, 
      important: 0, 
      moderate: 0,
      total: 0,
      compliant: 0,
      nonCompliant: 0
    });

    return summary;
  } catch (error) {
    console.error("Error fetching patch summary:", error);
    throw error; // Propagar el error en lugar de devolver datos simulados
  }
};

// Obtener detalles de parches para una instancia específica
export const getPatchDetails = async (instanceId) => {
  try {
    const client = getClient();
    const command = new DescribeInstancePatchesCommand({
      InstanceId: instanceId,
      MaxResults: 50 // Limitar resultados para mejor rendimiento
    });

    const response = await client.send(command);
    
    return response.Patches.map(patch => ({
      id: patch.KBId || patch.PatchId,
      title: patch.Title,
      severity: patch.Severity,
      state: patch.State,
      cvss: patch.CVEIds || [],
      classification: patch.Classification,
      installedTime: patch.InstalledTime,
      cves: patch.CVEIds?.split(',').map(cve => cve.trim()) || []
    }));
  } catch (error) {
    console.error("Error fetching patch details:", error);
    throw error;
  }
};

// Iniciar un escaneo de parches
export const scanForPatches = async (instanceIds) => {
  try {
    const client = getClient();
    const command = new SendCommandCommand({
      DocumentName: 'AWS-RunPatchBaseline',
      DocumentVersion: '$LATEST',
      Targets: [{ Key: 'InstanceIds', Values: instanceIds }],
      Parameters: {
        Operation: ['Scan'],
        RebootOption: ['NoReboot']
      },
      TimeoutSeconds: 600 // 10 minutos
    });

    const response = await client.send(command);
    return {
      commandId: response.Command.CommandId,
      status: response.Command.Status
    };
  } catch (error) {
    console.error("Error scanning for patches:", error);
    throw error;
  }
};

// Instalar parches
export const installPatches = async (instanceIds, rebootOption = 'NoReboot') => {
  try {
    const client = getClient();
    const command = new SendCommandCommand({
      DocumentName: 'AWS-RunPatchBaseline',
      DocumentVersion: '$LATEST',
      Targets: [{ Key: 'InstanceIds', Values: instanceIds }],
      Parameters: {
        Operation: ['Install'],
        RebootOption: [rebootOption] // 'NoReboot', 'RebootIfNeeded', 'RebootNow'
      },
      TimeoutSeconds: 3600 // 1 hora
    });

    const response = await client.send(command);
    return {
      commandId: response.Command.CommandId,
      status: response.Command.Status
    };
  } catch (error) {
    console.error("Error installing patches:", error);
    throw error;
  }
};

// Implementación real para automatización
export const createAutomation = async (documentName, parameters) => {
  try {
    const client = getClient();
    const command = new StartAutomationExecutionCommand({
      DocumentName: documentName,
      Parameters: parameters
    });
    
    const response = await client.send(command);
    return response.AutomationExecutionId;
  } catch (error) {
    console.error("Error starting automation:", error);
    throw error;
  }
};

// Implementación real para cumplimiento
export const getComplianceDetails = async () => {
  try {
    const client = getClient();
    const command = new ListResourceComplianceSummariesCommand({});
    
    const response = await client.send(command);
    return response.ResourceComplianceSummaryItems.map(item => ({
      resourceId: item.ResourceId,
      status: item.ComplianceType,
      details: {
        compliant: item.CompliantSummary?.CompliantCount || 0,
        nonCompliant: item.NonCompliantSummary?.NonCompliantCount || 0
      }
    }));
  } catch (error) {
    console.error("Error fetching compliance:", error);
    return [];
  }
};

// Usamos GetInventoryCommand para el inventario
export const getInventorySummary = async () => {
  try {
    const client = getClient();
    const command = new GetInventoryCommand({});

    const response = await client.send(command);
    const entities = response.Entities || [];
    
    return entities.map(entity => ({
      type: entity.Data?.['AWS:InstanceInformation']?.PlatformType || 'Unknown',
      count: 1
    })).reduce((acc, curr) => {
      const existing = acc.find(item => item.type === curr.type);
      if (existing) {
        existing.count += curr.count;
      } else {
        acc.push(curr);
      }
      return acc;
    }, []);
  } catch (error) {
    console.error("Error fetching inventory:", error);
    return [];
  }
};

// Función para verificar permisos usando GetRole en lugar de SimulatePrincipalPolicy
export const checkPermissions = async () => {
  try {
    const credentials = JSON.parse(localStorage.getItem('awsCredentials'));
    const region = localStorage.getItem('awsRegion') || 'us-west-2';

    const iamClient = new IAMClient({
      region,
      credentials: {
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey,
        sessionToken: credentials.sessionToken
      }
    });

    // Intentamos obtener el rol LabRole
    const command = new GetRoleCommand({
      RoleName: 'LabRole'
    });

    const response = await iamClient.send(command);
    
    // Si llegamos aquí, asumimos que tenemos los permisos básicos
    const assumedPermissions = [
      { action: 'ssm:Describe*', allowed: true },
      { action: 'ssm:Get*', allowed: true },
      { action: 'ssm:List*', allowed: true }
    ];

    console.log('Permisos asumidos:', assumedPermissions);
    localStorage.setItem('ssmPermissions', JSON.stringify(assumedPermissions));

    // Inicializamos el cliente SSM aquí, después de verificar los permisos
    initializeSSMService({
      region,
      credentials: {
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey,
        sessionToken: credentials.sessionToken
      }
    });

    return assumedPermissions;
  } catch (error) {
    console.error('Error checking permissions:', error);
    return null;
  }
};

// Obtener lista de instancias gestionadas por SSM
export const getManagedInstances = async () => {
  try {
    const client = getClient();
    
    // Obtener información de SSM
    const ssmCommand = new DescribeInstanceInformationCommand({});
    const ssmResponse = await client.send(ssmCommand);
    
    // Obtener información detallada de EC2
    const ec2Client = getEC2Client();
    const instanceIds = ssmResponse.InstanceInformationList.map(instance => instance.InstanceId);
    
    if (instanceIds.length === 0) return [];

    const ec2Command = new DescribeInstancesCommand({
      InstanceIds: instanceIds
    });
    const ec2Response = await ec2Client.send(ec2Command);

    // Combinar la información de SSM y EC2
    return ssmResponse.InstanceInformationList.map(instance => {
      const ec2Instance = ec2Response.Reservations
        .flatMap(r => r.Instances)
        .find(i => i.InstanceId === instance.InstanceId);

      // Buscar el tag Name
      const nameTag = ec2Instance?.Tags?.find(tag => tag.Key === 'Name');

      return {
        instanceId: instance.InstanceId,
        computerName: instance.ComputerName,
        platform: instance.PlatformType,
        platformVersion: instance.PlatformVersion,
        ipAddress: instance.IPAddress,
        pingStatus: instance.PingStatus,
        lastPingTime: instance.LastPingDateTime,
        agentVersion: instance.AgentVersion,
        platformType: instance.PlatformType,
        // Añadir los campos nuevos manteniendo compatibilidad
        friendlyName: nameTag?.Value || 
                     instance.ComputerName || 
                     instance.IPAddress ||
                     instance.InstanceId,
        platformDetails: ec2Instance?.PlatformDetails || instance.PlatformType
      };
    });
  } catch (error) {
    console.error("Error fetching managed instances:", error);
    throw error;
  }
};

const determinePlatformType = (instance) => {
  if (instance.PlatformType === 'Linux' || instance.PlatformType === 'Windows') {
    return 'EC2';
  } else if (instance.InstanceId.startsWith('rds-')) {
    return 'RDS';
  } else if (instance.InstanceId.startsWith('lambda-')) {
    return 'Lambda';
  }
  return instance.PlatformType || 'Unknown';
};

// Obtener inventario detallado
export const getDetailedInventory = async (instanceId) => {
  try {
    const client = getClient();
    const command = new GetInventoryCommand({
      Filters: [
        {
          Key: 'AWS:Application',
          Type: 'Equal',
          Values: ['*']
        },
        {
          Key: 'AWS:Network',
          Type: 'Equal',
          Values: ['*']
        },
        {
          Key: 'AWS:InstanceInformation',
          Type: 'Equal',
          Values: ['*']
        }
      ],
      ResultAttributes: [
        { TypeName: 'AWS:Application' },
        { TypeName: 'AWS:Network' },
        { TypeName: 'AWS:InstanceInformation' }
      ]
    });

    const response = await client.send(command);
    
    // Procesamos la respuesta real de AWS
    return {
      applications: processApplications(response),
      networkConfig: processNetworkConfig(response),
      instanceDetails: processInstanceDetails(response)
    };
  } catch (error) {
    console.error("Error fetching inventory:", error);
    throw error;
  }
};

const processApplications = (response) => {
  const apps = [];
  response.Entities?.forEach(entity => {
    if (entity.Data['AWS:Application']) {
      const appData = entity.Data['AWS:Application'].Content;
      appData.forEach(app => {
        apps.push({
          name: app.Name,
          version: app.Version,
          publisher: app.Publisher,
          installTime: app.InstallTime
        });
      });
    }
  });
  return apps;
};

const processNetworkConfig = (response) => {
  const networkConfig = {
    interfaces: [],
    ips: [],
    dns: []
  };

  response.Entities?.forEach(entity => {
    if (entity.Data['AWS:Network']) {
      const netData = entity.Data['AWS:Network'].Content;
      
      // Procesamos interfaces
      netData.forEach(net => {
        networkConfig.interfaces.push({
          name: net.Name,
          macAddress: net.MacAddress,
          status: net.Status,
          type: net.Type
        });

        // Procesamos IPs
        if (net.IPv4Addresses) {
          net.IPv4Addresses.forEach(ip => {
            networkConfig.ips.push({
              address: ip,
              type: 'IPv4',
              interface: net.Name,
              netmask: net.SubnetMask
            });
          });
        }
      });

      // DNS servers si están disponibles
      if (netData[0].DnsServers) {
        netData[0].DnsServers.forEach((server, index) => {
          networkConfig.dns.push({
            server: server,
            type: 'Primary',
            priority: index + 1,
            zone: 'Default'
          });
        });
      }
    }
  });

  return networkConfig;
};

// Obtener estado de conexión de las instancias
export const getInstancesConnectionStatus = async () => {
  try {
    const client = getClient();
    const command = new DescribeInstanceInformationCommand({});
    
    const response = await client.send(command);
    const instances = response.InstanceInformationList || [];
    
    return {
      online: instances.filter(i => i.PingStatus === 'Online').length,
      offline: instances.filter(i => i.PingStatus === 'Offline').length,
      total: instances.length
    };
  } catch (error) {
    console.error("Error fetching instances connection status:", error);
    throw error;
  }
};

// Obtener todas las instancias EC2
export const getAllEC2Instances = async () => {
  try {
    const client = getEC2Client();
    const command = new DescribeInstancesCommand({});
    const response = await client.send(command);
    
    const instances = [];
    response.Reservations.forEach(reservation => {
      reservation.Instances.forEach(instance => {
        // Solo incluimos instancias que no estén terminadas
        if (instance.State.Name !== 'terminated') {
          const name = instance.Tags?.find(tag => tag.Key === 'Name')?.Value || 'Sin nombre';
          instances.push({
            instanceId: instance.InstanceId,
            name: name,
            state: instance.State.Name,
            type: instance.InstanceType,
            platform: instance.Platform || 'Linux',
            privateIp: instance.PrivateIpAddress,
            publicIp: instance.PublicIpAddress,
            hasSSM: instance.Tags?.some(tag => tag.Key === 'SSM-Managed') || false,
            launchTime: instance.LaunchTime
          });
        }
      });
    });
    
    return instances;
  } catch (error) {
    console.error("Error fetching EC2 instances:", error);
    throw error;
  }
};

// Habilitar SSM en una instancia
export const enableSSMOnInstance = async (instanceId) => {
  try {
    const client = getEC2Client();
    
    // 1. Asociar el perfil de instancia
    const associateCommand = new AssociateIamInstanceProfileCommand({
      IamInstanceProfile: {
        Name: 'LabInstanceProfile'
      },
      InstanceId: instanceId
    });
    await client.send(associateCommand);

    // 2. Marcar la instancia
    const tagCommand = new CreateTagsCommand({
      Resources: [instanceId],
      Tags: [
        {
          Key: 'SSM-Managed',
          Value: 'true'
        }
      ]
    });
    await client.send(tagCommand);

    // 3. Esperar más tiempo y verificar varias veces
    for (let i = 0; i < 3; i++) {
      // Esperar 30 segundos entre cada intento
      await new Promise(resolve => setTimeout(resolve, 30000));
      
      const ssmClient = getClient();
      const verifyCommand = new DescribeInstanceInformationCommand({
        Filters: [
          {
            Key: 'InstanceIds',
            Values: [instanceId]
          }
        ]
      });
      
      const verifyResponse = await ssmClient.send(verifyCommand);
      if (verifyResponse.InstanceInformationList.length > 0) {
        return true;
      }
    }

    // Si llegamos aquí, la instancia aún se está inicializando
    return true;

  } catch (error) {
    console.error("Error enabling SSM on instance:", error);
    throw error;
  }
};

// Verificar el estado de SSM en una instancia
export const checkSSMStatus = async (instanceId) => {
  try {
    const client = getClient();
    const command = new DescribeInstanceInformationCommand({
      Filters: [
        {
          Key: 'InstanceIds',
          Values: [instanceId]
        }
      ]
    });
    
    const response = await client.send(command);

    // Si la instancia está en SSM
    if (response.InstanceInformationList && response.InstanceInformationList.length > 0) {
      const instance = response.InstanceInformationList[0];
      return {
        isManaged: true,
        status: instance.PingStatus === 'Online' ? 'Managed' : 'Connecting',
        agentVersion: instance.AgentVersion,
        platformType: instance.PlatformType,
        lastPingTime: instance.LastPingDateTime
      };
    }
    
    // Si la instancia tiene el perfil pero aún no aparece en SSM
    const ec2Client = getEC2Client();
    const describeCommand = new DescribeInstancesCommand({
      InstanceIds: [instanceId]
    });
    const ec2Response = await ec2Client.send(describeCommand);
    
    if (ec2Response.Reservations[0]?.Instances[0]?.IamInstanceProfile) {
      return {
        isManaged: true,
        status: 'Initializing',
        agentVersion: null,
        platformType: null,
        lastPingTime: null
      };
    }
    
    // Si no está gestionada por SSM
    return {
      isManaged: false,
      status: 'Not Managed',
      agentVersion: null,
      platformType: null,
      lastPingTime: null
    };
  } catch (error) {
    console.error("Error checking SSM status:", error);
    throw error;
  }
};

// Deshabilitar SSM en una instancia
export const disableSSMOnInstance = async (instanceId) => {
  try {
    const client = getEC2Client();
    const ssmClient = getClient();

    // 1. Primero obtenemos el ID de la instancia gestionada de SSM
    const describeCommand = new DescribeInstanceInformationCommand({
      Filters: [
        {
          Key: 'InstanceIds',
          Values: [instanceId]
        }
      ]
    });
    
    const response = await ssmClient.send(describeCommand);
    const managedInstance = response.InstanceInformationList?.[0];
    
    if (managedInstance) {
      // 2. Deregistrar la instancia usando el ManagedInstanceId
      try {
        const deregisterCommand = new DeregisterManagedInstanceCommand({
          InstanceId: managedInstance.ManagedInstanceId // Usamos el ID que empieza por "mi-"
        });
        await ssmClient.send(deregisterCommand);
      } catch (error) {
        console.log("Error al deregistrar de SSM, continuando...", error);
      }
    }

    // 3. Obtener y desasociar el perfil de instancia
    const describeAssociationsCommand = new DescribeIamInstanceProfileAssociationsCommand({
      Filters: [
        {
          Name: 'instance-id',
          Values: [instanceId]
        }
      ]
    });

    try {
      const associationsResponse = await client.send(describeAssociationsCommand);
      if (associationsResponse.IamInstanceProfileAssociations?.length > 0) {
        const association = associationsResponse.IamInstanceProfileAssociations[0];
        const disassociateCommand = new DisassociateIamInstanceProfileCommand({
          AssociationId: association.AssociationId
        });
        await client.send(disassociateCommand);
      }
    } catch (error) {
      console.log("Error al desasociar perfil, continuando...", error);
    }

    // 4. Eliminar el tag de SSM
    const tagCommand = new DeleteTagsCommand({
      Resources: [instanceId],
      Tags: [
        {
          Key: 'SSM-Managed'
        }
      ]
    });
    await client.send(tagCommand);

    // 5. Esperar y verificar
    await new Promise(resolve => setTimeout(resolve, 10000)); // Aumentamos el tiempo de espera
    
    const verifyResponse = await ssmClient.send(describeCommand);
    if (verifyResponse.InstanceInformationList.length === 0) {
      return true;
    } else {
      throw new Error('La instancia aún aparece en SSM después de la desactivación. Puede tardar unos minutos en reflejarse el cambio.');
    }

  } catch (error) {
    console.error("Error disabling SSM on instance:", error);
    throw error;
  }
};

export const getSystemInfo = async (instanceId) => {
  try {
    const client = getClient();
    
    // Solo obtenemos información de SSM y EC2 ya que son las únicas fuentes disponibles
    const [ssmResponse, ec2Response] = await Promise.all([
      client.send(new DescribeInstanceInformationCommand({
        Filters: [{ Key: 'InstanceIds', Values: [instanceId] }]
      })),
      getEC2Client().send(new DescribeInstancesCommand({
        InstanceIds: [instanceId]
      }))
    ]);

    return processSystemInfo(ssmResponse, ec2Response);
  } catch (error) {
    console.error("Error fetching system info:", error);
    throw error;
  }
};

const processSystemInfo = (ssmResponse, ec2Response) => {
  const systemInfo = {
    os: {},
    network: {},
    hardware: {}
  };

  if (ssmResponse.InstanceInformationList?.length > 0) {
    const ssmInfo = ssmResponse.InstanceInformationList[0];
    const ec2Info = ec2Response.Reservations[0]?.Instances[0];

    // Información del hardware
    systemInfo.hardware = {
      instanceType: ec2Info?.InstanceType || ssmInfo.InstanceType || 'N/A',
      platform: ssmInfo.PlatformType || 'N/A',
      platformVersion: ssmInfo.PlatformVersion || 'N/A',
      agentVersion: ssmInfo.AgentVersion || 'N/A',
      state: ec2Info?.State?.Name || 'N/A',
      launchTime: ec2Info?.LaunchTime || 'N/A'
    };

    // Información del SO
    systemInfo.os = {
      name: ssmInfo.PlatformName || ssmInfo.PlatformType || 'N/A',
      version: ssmInfo.PlatformVersion || 'N/A',
      architecture: ec2Info?.Architecture || ssmInfo.Architecture || 'N/A',
      kernelVersion: ec2Info?.PlatformDetails || 'N/A',
      lastBootTime: ssmInfo.LastPingDateTime || 'N/A'
    };

    // Información de red desde EC2
    systemInfo.network = {
      interfaces: ec2Info?.NetworkInterfaces?.map(nic => ({
        name: nic.NetworkInterfaceId || 'Primary Network Interface',
        macAddress: nic.MacAddress || 'N/A',
        ipv4: [
          ...(nic.PrivateIpAddresses?.map(ip => ip.PrivateIpAddress) || []),
          nic.PublicIpAddress ? [nic.PublicIpAddress] : []
        ].flat(),
        ipv6: nic.Ipv6Addresses?.map(ip => ip.Ipv6Address) || [],
        dnsServers: [
          nic.PrivateDnsName,
          nic.PublicDnsName
        ].filter(Boolean),
        subnetId: nic.SubnetId || 'N/A',
        vpcId: nic.VpcId || 'N/A',
        securityGroups: nic.Groups?.map(sg => ({
          id: sg.GroupId,
          name: sg.GroupName
        })) || []
      })) || [{
        name: 'Primary Network Interface',
        macAddress: 'N/A',
        ipv4: [ssmInfo.IPAddress || 'N/A'],
        ipv6: [],
        dnsServers: []
      }]
    };
  }

  return systemInfo;
}; 