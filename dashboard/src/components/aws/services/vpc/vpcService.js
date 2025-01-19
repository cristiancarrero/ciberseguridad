import { getEC2Client } from '../../../../services/awsClientsService';
import { 
  DescribeVpcsCommand,
  DescribeSubnetsCommand,
  CreateVpcCommand,
  DeleteVpcCommand,
  CreateSubnetCommand,
  DeleteSubnetCommand,
  CreateInternetGatewayCommand,
  AttachInternetGatewayCommand,
  CreateRouteTableCommand,
  CreateRouteCommand,
  AssociateRouteTableCommand,
  CreateNetworkAclCommand,
  DeleteNetworkAclCommand,
  CreateNetworkAclEntryCommand,
  DeleteNetworkAclEntryCommand,
  DescribeNetworkAclsCommand,
  DescribeAvailabilityZonesCommand,
  ModifyVpcAttributeCommand,
  CreateTagsCommand,
  CreateSecurityGroupCommand,
  DeleteSecurityGroupCommand,
  AuthorizeSecurityGroupIngressCommand,
  AuthorizeSecurityGroupEgressCommand,
  RevokeSecurityGroupIngressCommand,
  RevokeSecurityGroupEgressCommand,
  DescribeSecurityGroupsCommand,
  DeleteRouteTableCommand,
  DescribeRouteTablesCommand,
  DescribeInternetGatewaysCommand,
  CreateNatGatewayCommand,
  DeleteNatGatewayCommand,
  DetachInternetGatewayCommand,
  DeleteInternetGatewayCommand,
  DeleteRouteCommand,
  ReplaceRouteCommand,
  DescribeInstancesCommand,
  ModifyInstanceAttributeCommand,
  TerminateInstancesCommand,
  CreateVpcPeeringConnectionCommand,
  AcceptVpcPeeringConnectionCommand,
  DeleteVpcPeeringConnectionCommand,
  DescribeVpcPeeringConnectionsCommand,
  ModifySubnetAttributeCommand,
  DescribeTagsCommand,
  DescribeNatGatewaysCommand
} from "@aws-sdk/client-ec2";

const getClient = async () => {
  return await getEC2Client();
};

export const getVPCs = async () => {
  try {
    const client = await getClient();
    const command = new DescribeVpcsCommand({});
    const response = await client.send(command);
    return response.Vpcs || [];
  } catch (error) {
    console.error('Error al obtener VPCs:', error);
    throw error;
  }
};

export const createVPC = async (config) => {
  try {
    const ec2Client = getEC2Client();
    
    // Primero verificar cuántas VPCs tenemos
    const existingVpcs = await getVPCs();
    if (existingVpcs.length >= 5) {
      throw new Error('Has alcanzado el límite máximo de VPCs (5) permitido en AWS Academy. Por favor, elimina alguna VPC antes de crear una nueva.');
    }

    // Crear la VPC con el nombre como etiqueta
    const createVpcCommand = new CreateVpcCommand({
      CidrBlock: config.cidrBlock,
      TagSpecifications: [
        {
          ResourceType: 'vpc',
          Tags: [
            {
              Key: 'Name',
              Value: config.name || 'Nueva VPC'  // Usar el nombre proporcionado o un valor por defecto
            }
          ]
        }
      ]
    });

    const response = await ec2Client.send(createVpcCommand);
    
    // Asegurarnos de que la etiqueta se aplicó correctamente
    if (!response.Vpc.Tags?.some(tag => tag.Key === 'Name')) {
      const tagCommand = new CreateTagsCommand({
        Resources: [response.Vpc.VpcId],
        Tags: [
          {
            Key: 'Name',
            Value: config.name || 'Nueva VPC'
          }
        ]
      });
      await ec2Client.send(tagCommand);
    }

    return response.Vpc;
  } catch (error) {
    // Mejorar el manejo de errores específicos
    if (error.name === 'VpcLimitExceeded') {
      throw new Error('Has alcanzado el límite máximo de VPCs permitido en AWS Academy. Por favor, elimina alguna VPC antes de crear una nueva.');
    }
    console.error('Error creating VPC:', error);
    throw error;
  }
};

export const createSubnet = async ({ vpcId, cidrBlock, availabilityZone, name }) => {
  try {
    const client = await getClient();
    const command = new CreateSubnetCommand({
      VpcId: vpcId,
      CidrBlock: cidrBlock,
      AvailabilityZone: availabilityZone,
      TagSpecifications: [{
        ResourceType: 'subnet',
        Tags: [{ Key: 'Name', Value: name }]
      }]
    });
    const response = await client.send(command);
    return response.Subnet;
  } catch (error) {
    console.error('Error al crear subnet:', error);
    throw error;
  }
};

export const deleteSubnet = async (subnetId) => {
  try {
    const client = await getClient();
    const command = new DeleteSubnetCommand({ SubnetId: subnetId });
    await client.send(command);
    return true;
  } catch (error) {
    console.error('Error al eliminar subnet:', error);
    throw error;
  }
};

export const setupInternetGateway = async (vpcId) => {
  try {
    const client = await getClient();
    
    // Crear Internet Gateway
    const createIgwCommand = new CreateInternetGatewayCommand({});
    const igwResponse = await client.send(createIgwCommand);
    const internetGatewayId = igwResponse.InternetGateway.InternetGatewayId;

    // Adjuntar a la VPC
    const attachCommand = new AttachInternetGatewayCommand({
      InternetGatewayId: internetGatewayId,
      VpcId: vpcId
    });
    await client.send(attachCommand);

    // Crear y configurar tabla de rutas
    const routeTableCommand = new CreateRouteTableCommand({ VpcId: vpcId });
    const routeTableResponse = await client.send(routeTableCommand);
    const routeTableId = routeTableResponse.RouteTable.RouteTableId;

    // Añadir ruta por defecto
    const routeCommand = new CreateRouteCommand({
      RouteTableId: routeTableId,
      DestinationCidrBlock: '0.0.0.0/0',
      GatewayId: internetGatewayId
    });
    await client.send(routeCommand);

    return { internetGatewayId, routeTableId };
  } catch (error) {
    console.error('Error configurando Internet Gateway:', error);
    throw error;
  }
};

export const deleteVPC = async (vpcId) => {
  try {
    const client = await getClient();
    const command = new DeleteVpcCommand({ VpcId: vpcId });
    await client.send(command);
    return true;
  } catch (error) {
    console.error('Error al eliminar VPC:', error);
    throw error;
  }
};

export const clearVPCClient = () => {
  ec2Client = null;
};

// Funciones para Network ACLs
export const createNetworkAcl = async ({ vpcId, name }) => {
  try {
    const client = await getClient();
    const command = new CreateNetworkAclCommand({
      VpcId: vpcId,
      TagSpecifications: [{
        ResourceType: 'network-acl',
        Tags: [{ Key: 'Name', Value: name }]
      }]
    });
    const response = await client.send(command);
    return response.NetworkAcl;
  } catch (error) {
    console.error('Error al crear Network ACL:', error);
    throw error;
  }
};

export const deleteNetworkAcl = async (networkAclId) => {
  try {
    const client = await getClient();
    const command = new DeleteNetworkAclCommand({ NetworkAclId: networkAclId });
    await client.send(command);
    return true;
  } catch (error) {
    console.error('Error al eliminar Network ACL:', error);
    throw error;
  }
};

export const updateNetworkAclEntry = async ({
  networkAclId,
  ruleNumber,
  protocol,
  ruleAction,
  cidrBlock,
  egress = false,
  portRange = null
}) => {
  try {
    const client = await getClient();
    
    // Primero intentamos eliminar la regla existente si existe
    try {
      const deleteCommand = new DeleteNetworkAclEntryCommand({
        NetworkAclId: networkAclId,
        RuleNumber: ruleNumber,
        Egress: egress
      });
      await client.send(deleteCommand);
    } catch (error) {
      // Ignoramos el error si la regla no existía
      if (error.name !== 'ResourceNotFoundException') {
        throw error;
      }
    }

    // Crear la nueva regla
    const command = new CreateNetworkAclEntryCommand({
      NetworkAclId: networkAclId,
      RuleNumber: ruleNumber,
      Protocol: protocol,
      RuleAction: ruleAction.toUpperCase(),
      CidrBlock: cidrBlock,
      Egress: egress,
      ...(portRange && {
        PortRange: {
          From: portRange.from,
          To: portRange.to
        }
      })
    });
    
    await client.send(command);
    return true;
  } catch (error) {
    console.error('Error al actualizar regla de Network ACL:', error);
    throw error;
  }
};

// Funciones auxiliares
export const getAvailabilityZones = async () => {
  try {
    const client = await getClient();
    const command = new DescribeAvailabilityZonesCommand({});
    const response = await client.send(command);
    return response.AvailabilityZones;
  } catch (error) {
    console.error('Error al obtener zonas de disponibilidad:', error);
    throw error;
  }
};

export const getNetworkAcls = async () => {
  try {
    const client = await getClient();
    const command = new DescribeNetworkAclsCommand({});
    const response = await client.send(command);
    return response.NetworkAcls || [];
  } catch (error) {
    console.error('Error al obtener Network ACLs:', error);
    throw error;
  }
};

export const getSubnets = async () => {
  try {
    const client = await getClient();
    const command = new DescribeSubnetsCommand({});
    const response = await client.send(command);
    return response.Subnets || [];
  } catch (error) {
    console.error('Error al obtener Subnets:', error);
    throw error;
  }
};

export const modifyVPC = async (vpcId, { name, enableDnsHostnames, enableDnsSupport, tags }) => {
  try {
    const client = await getClient();
    
    // Modificar configuración DNS
    if (enableDnsHostnames !== undefined) {
      await client.send(new ModifyVpcAttributeCommand({
        VpcId: vpcId,
        EnableDnsHostnames: { Value: enableDnsHostnames }
      }));
    }

    if (enableDnsSupport !== undefined) {
      await client.send(new ModifyVpcAttributeCommand({
        VpcId: vpcId,
        EnableDnsSupport: { Value: enableDnsSupport }
      }));
    }

    // Actualizar tags si se proporcionaron
    if (tags) {
      await client.send(new CreateTagsCommand({
        Resources: [vpcId],
        Tags: tags
      }));
    }

    return true;
  } catch (error) {
    console.error('Error al modificar VPC:', error);
    throw error;
  }
};

export const getSecurityGroups = async (vpcId = null) => {
  try {
    const client = await getClient();
    const command = new DescribeSecurityGroupsCommand(
      vpcId ? { Filters: [{ Name: 'vpc-id', Values: [vpcId] }] } : {}
    );
    const response = await client.send(command);
    return response.SecurityGroups || [];
  } catch (error) {
    console.error('Error al obtener Security Groups:', error);
    throw error;
  }
};

export const createSecurityGroup = async ({ name, description, vpcId, ingressRules = [], egressRules = [] }) => {
  try {
    const client = await getClient();
    
    // Crear Security Group
    const createCommand = new CreateSecurityGroupCommand({
      GroupName: name,
      Description: description,
      VpcId: vpcId
    });
    const response = await client.send(createCommand);
    const groupId = response.GroupId;

    // Añadir reglas de ingreso
    if (ingressRules.length > 0) {
      const ingressCommand = new AuthorizeSecurityGroupIngressCommand({
        GroupId: groupId,
        IpPermissions: ingressRules.map(rule => ({
          IpProtocol: rule.protocol,
          FromPort: parseInt(rule.fromPort),
          ToPort: parseInt(rule.toPort),
          IpRanges: [{ CidrIp: rule.cidrIp }]
        }))
      });
      await client.send(ingressCommand);
    }

    // Añadir reglas de egreso
    if (egressRules.length > 0) {
      const egressCommand = new AuthorizeSecurityGroupEgressCommand({
        GroupId: groupId,
        IpPermissions: egressRules.map(rule => ({
          IpProtocol: rule.protocol,
          FromPort: parseInt(rule.fromPort),
          ToPort: parseInt(rule.toPort),
          IpRanges: [{ CidrIp: rule.cidrIp }]
        }))
      });
      await client.send(egressCommand);
    }

    return groupId;
  } catch (error) {
    console.error('Error al crear Security Group:', error);
    throw error;
  }
};

export const deleteSecurityGroup = async (groupId) => {
  try {
    const client = await getClient();
    const command = new DeleteSecurityGroupCommand({
      GroupId: groupId
    });
    await client.send(command);
    return true;
  } catch (error) {
    console.error('Error al eliminar Security Group:', error);
    throw error;
  }
};

export const updateSecurityGroupRules = async (groupId, rules, isIngress) => {
  try {
    const client = await getClient();
    
    // Primero revocar reglas existentes
    const revokeCommand = isIngress 
      ? new RevokeSecurityGroupIngressCommand({
          GroupId: groupId,
          IpPermissions: []
        })
      : new RevokeSecurityGroupEgressCommand({
          GroupId: groupId,
          IpPermissions: []
        });
    
    await client.send(revokeCommand);

    // Luego añadir las nuevas reglas
    const authorizeCommand = isIngress
      ? new AuthorizeSecurityGroupIngressCommand({
          GroupId: groupId,
          IpPermissions: rules.map(rule => ({
            IpProtocol: rule.protocol,
            FromPort: parseInt(rule.fromPort),
            ToPort: parseInt(rule.toPort),
            IpRanges: [{ CidrIp: rule.cidrIp }]
          }))
        })
      : new AuthorizeSecurityGroupEgressCommand({
          GroupId: groupId,
          IpPermissions: rules.map(rule => ({
            IpProtocol: rule.protocol,
            FromPort: parseInt(rule.fromPort),
            ToPort: parseInt(rule.toPort),
            IpRanges: [{ CidrIp: rule.cidrIp }]
          }))
        });

    await client.send(authorizeCommand);
    return true;
  } catch (error) {
    console.error('Error al actualizar reglas de Security Group:', error);
    throw error;
  }
};

export const createRouteTable = async (vpcId) => {
  try {
    const client = await getClient();
    const command = new CreateRouteTableCommand({
      VpcId: vpcId
    });
    const response = await client.send(command);
    return response.RouteTable;
  } catch (error) {
    console.error('Error al crear Route Table:', error);
    throw error;
  }
};

export const deleteRouteTable = async (routeTableId) => {
  try {
    const client = await getClient();
    const command = new DeleteRouteTableCommand({
      RouteTableId: routeTableId
    });
    await client.send(command);
    return true;
  } catch (error) {
    console.error('Error al eliminar Route Table:', error);
    throw error;
  }
};

export const associateRouteTable = async (routeTableId, subnetId) => {
  try {
    const client = await getClient();
    const command = new AssociateRouteTableCommand({
      RouteTableId: routeTableId,
      SubnetId: subnetId
    });
    const response = await client.send(command);
    return response.AssociationId;
  } catch (error) {
    console.error('Error al asociar Route Table:', error);
    throw error;
  }
};

export const getRouteTables = async () => {
  try {
    const client = await getClient();
    const command = new DescribeRouteTablesCommand({});
    const response = await client.send(command);
    return response.RouteTables || [];
  } catch (error) {
    console.error('Error al obtener Route Tables:', error);
    throw error;
  }
};

export const getInternetGateways = async () => {
  try {
    const client = await getClient();
    const command = new DescribeInternetGatewaysCommand({});
    const response = await client.send(command);
    return response.InternetGateways || [];
  } catch (error) {
    console.error('Error al obtener Internet Gateways:', error);
    throw error;
  }
};

export const getNatGateways = async () => {
  try {
    const client = await getClient();
    const command = new DescribeNatGatewaysCommand({});
    const response = await client.send(command);
    return response.NatGateways || [];
  } catch (error) {
    console.error('Error al obtener NAT Gateways:', error);
    throw error;
  }
};

export const createNatGateway = async ({ SubnetId, AllocationId }) => {
  try {
    const client = await getClient();
    const command = new CreateNatGatewayCommand({
      SubnetId,
      AllocationId
    });
    const response = await client.send(command);
    return response.NatGateway;
  } catch (error) {
    console.error('Error al crear NAT Gateway:', error);
    throw error;
  }
};

export const deleteNatGateway = async (natGatewayId) => {
  try {
    const client = await getClient();
    const command = new DeleteNatGatewayCommand({
      NatGatewayId: natGatewayId
    });
    await client.send(command);
    return true;
  } catch (error) {
    console.error('Error al eliminar NAT Gateway:', error);
    throw error;
  }
};

export const createInternetGateway = async () => {
  try {
    const client = await getClient();
    const command = new CreateInternetGatewayCommand({});
    const response = await client.send(command);
    return response.InternetGateway;
  } catch (error) {
    console.error('Error al crear Internet Gateway:', error);
    throw error;
  }
};

export const attachInternetGateway = async (internetGatewayId, vpcId) => {
  try {
    const client = await getClient();
    const command = new AttachInternetGatewayCommand({
      InternetGatewayId: internetGatewayId,
      VpcId: vpcId
    });
    await client.send(command);
    return true;
  } catch (error) {
    console.error('Error al adjuntar Internet Gateway:', error);
    throw error;
  }
};

export const detachInternetGateway = async (internetGatewayId, vpcId) => {
  try {
    const client = await getClient();
    const command = new DetachInternetGatewayCommand({
      InternetGatewayId: internetGatewayId,
      VpcId: vpcId
    });
    await client.send(command);
    return true;
  } catch (error) {
    console.error('Error al desconectar Internet Gateway:', error);
    throw error;
  }
};

export const deleteInternetGateway = async (internetGatewayId) => {
  try {
    const client = await getClient();
    const command = new DeleteInternetGatewayCommand({
      InternetGatewayId: internetGatewayId
    });
    await client.send(command);
    return true;
  } catch (error) {
    console.error('Error al eliminar Internet Gateway:', error);
    throw error;
  }
};

export const createRoute = async (routeTableId, destinationCidrBlock, gatewayId) => {
  try {
    const client = await getClient();
    const command = new CreateRouteCommand({
      RouteTableId: routeTableId,
      DestinationCidrBlock: destinationCidrBlock,
      GatewayId: gatewayId
    });
    const response = await client.send(command);
    return response.Route;
  } catch (error) {
    console.error('Error al crear ruta:', error);
    throw error;
  }
};

export const deleteRoute = async (routeTableId, destinationCidrBlock) => {
  try {
    const client = await getClient();
    const command = new DeleteRouteCommand({
      RouteTableId: routeTableId,
      DestinationCidrBlock: destinationCidrBlock
    });
    await client.send(command);
    return true;
  } catch (error) {
    console.error('Error al eliminar ruta:', error);
    throw error;
  }
};

export const replaceRoute = async (routeTableId, destinationCidrBlock, gatewayId) => {
  try {
    const client = await getClient();
    const command = new ReplaceRouteCommand({
      RouteTableId: routeTableId,
      DestinationCidrBlock: destinationCidrBlock,
      GatewayId: gatewayId
    });
    await client.send(command);
    return true;
  } catch (error) {
    console.error('Error al reemplazar ruta:', error);
    throw error;
  }
};

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

// VPC Peering
export const createVPCPeering = async (requesterVpcId, accepterVpcId) => {
  try {
    const client = await getClient();
    const command = new CreateVpcPeeringConnectionCommand({
      VpcId: requesterVpcId,
      PeerVpcId: accepterVpcId
    });
    const response = await client.send(command);
    return response.VpcPeeringConnection;
  } catch (error) {
    console.error('Error al crear VPC Peering:', error);
    throw error;
  }
};

export const acceptVPCPeering = async (peeringConnectionId) => {
  try {
    const client = await getClient();
    const command = new AcceptVpcPeeringConnectionCommand({
      VpcPeeringConnectionId: peeringConnectionId
    });
    const response = await client.send(command);
    return response.VpcPeeringConnection;
  } catch (error) {
    console.error('Error al aceptar VPC Peering:', error);
    throw error;
  }
};

export const deleteVPCPeering = async (peeringConnectionId) => {
  try {
    const client = await getClient();
    const command = new DeleteVpcPeeringConnectionCommand({
      VpcPeeringConnectionId: peeringConnectionId
    });
    await client.send(command);
    return true;
  } catch (error) {
    console.error('Error al eliminar VPC Peering:', error);
    throw error;
  }
};

export const getVPCPeerings = async () => {
  try {
    const client = await getClient();
    const command = new DescribeVpcPeeringConnectionsCommand({});
    const response = await client.send(command);
    return response.VpcPeeringConnections;
  } catch (error) {
    console.error('Error al obtener VPC Peerings:', error);
    throw error;
  }
};

// Subnet Management
export const modifySubnetAttribute = async (subnetId, attribute, value) => {
  try {
    const client = await getClient();
    const command = new ModifySubnetAttributeCommand({
      SubnetId: subnetId,
      [attribute]: { Value: value }
    });
    await client.send(command);
    return true;
  } catch (error) {
    console.error('Error al modificar atributo de subnet:', error);
    throw error;
  }
};

// Security Group Association
export const associateSecurityGroupToSubnet = async (subnetId, securityGroupId) => {
  try {
    const client = await getClient();
    // Primero obtenemos las instancias en la subnet
    const instances = await getVPCInstances();
    const subnetInstances = instances.filter(instance => instance.SubnetId === subnetId);
    
    // Luego asociamos el security group a cada instancia
    for (const instance of subnetInstances) {
      const command = new ModifyInstanceAttributeCommand({
        InstanceId: instance.InstanceId,
        Groups: [...instance.SecurityGroups.map(sg => sg.GroupId), securityGroupId]
      });
      await client.send(command);
    }
    return true;
  } catch (error) {
    console.error('Error al asociar Security Group a subnet:', error);
    throw error;
  }
};

// Tag Management
export const addTags = async (resourceId, tags) => {
  try {
    const client = await getClient();
    const command = new CreateTagsCommand({
      Resources: [resourceId],
      Tags: tags
    });
    await client.send(command);
    return true;
  } catch (error) {
    console.error('Error al agregar tags:', error);
    throw error;
  }
};

export const getResourceTags = async (resourceId) => {
  try {
    const client = await getClient();
    const command = new DescribeTagsCommand({
      Filters: [
        {
          Name: 'resource-id',
          Values: [resourceId]
        }
      ]
    });
    const response = await client.send(command);
    return response.Tags;
  } catch (error) {
    console.error('Error al obtener tags:', error);
    throw error;
  }
};

// Resource Description
export const describeResource = async (resourceId, resourceType) => {
  try {
    const client = await getClient();
    let command;
    
    switch (resourceType) {
      case 'vpc':
        command = new DescribeVpcsCommand({ VpcIds: [resourceId] });
        break;
      case 'subnet':
        command = new DescribeSubnetsCommand({ SubnetIds: [resourceId] });
        break;
      case 'security-group':
        command = new DescribeSecurityGroupsCommand({ GroupIds: [resourceId] });
        break;
      case 'network-acl':
        command = new DescribeNetworkAclsCommand({ NetworkAclIds: [resourceId] });
        break;
      case 'route-table':
        command = new DescribeRouteTablesCommand({ RouteTableIds: [resourceId] });
        break;
      default:
        throw new Error('Tipo de recurso no soportado');
    }
    
    const response = await client.send(command);
    return response[`${resourceType.charAt(0).toUpperCase() + resourceType.slice(1)}s`][0];
  } catch (error) {
    console.error(`Error al describir recurso ${resourceType}:`, error);
    throw error;
  }
};

// Error Handling Utility
export const handleAWSError = (error) => {
  if (error.Code === 'UnauthorizedOperation') {
    return 'No tienes permisos suficientes para realizar esta operación';
  }
  if (error.Code === 'InvalidParameterValue') {
    return 'Uno o más parámetros son inválidos';
  }
  if (error.Code === 'ResourceInUse') {
    return 'El recurso está en uso y no puede ser modificado/eliminado';
  }
  return error.message || 'Error desconocido';
};

// Actualizar los ajustes de una VPC
export const updateVPCSettings = async (vpcId, settings) => {
  try {
    const client = await getClient();
    
    if (settings.enableDnsHostnames !== undefined) {
      const hostnamesCommand = new ModifyVpcAttributeCommand({
        VpcId: vpcId,
        EnableDnsHostnames: { Value: settings.enableDnsHostnames }
      });
      await client.send(hostnamesCommand);
    }
    
    if (settings.enableDnsSupport !== undefined) {
      const dnsSupportCommand = new ModifyVpcAttributeCommand({
        VpcId: vpcId,
        EnableDnsSupport: { Value: settings.enableDnsSupport }
      });
      await client.send(dnsSupportCommand);
    }
    
    return true;
  } catch (error) {
    console.error('Error al actualizar ajustes de VPC:', error);
    throw error;
  }
};

// Actualizar tags de una VPC
export const updateVPCTags = async (vpcId, tags) => {
  try {
    const client = await getClient();
    const command = new CreateTagsCommand({
      Resources: [vpcId],
      Tags: tags.map(tag => ({
        Key: tag.key,
        Value: tag.value
      }))
    });
    
    await client.send(command);
    return true;
  } catch (error) {
    console.error('Error al actualizar tags de VPC:', error);
    throw error;
  }
}; 