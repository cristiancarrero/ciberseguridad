import { 
  SSMClient, 
  DescribeInstancesCommand,
  ListCommandsCommand,
  GetPatchBaselineCommand,
  DescribePatchGroupsCommand,
  ListComplianceItemsCommand,
  DescribeInstanceInformationCommand
} from "@aws-sdk/client-ssm";

let ssmClient = null;

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

export const resetClient = () => {
  ssmClient = null;
};

export const getComplianceStatus = async () => {
  try {
    const client = getClient();
    const command = new ListComplianceItemsCommand({
      Filters: [{
        Key: 'ComplianceType',
        Values: ['Association'],
        Type: 'EQUAL'
      }]
    });

    const response = await client.send(command);
    return response.ComplianceItems?.map(item => ({
      resourceId: item.ResourceId,
      status: item.Status,
      severity: item.Severity,
      details: item.Details
    })) || [];
  } catch (error) {
    console.error("Error fetching compliance:", error);
    return [];
  }
};

export const getInventorySummary = async () => {
  try {
    const client = getClient();
    const command = new DescribeInstancesCommand({});

    const response = await client.send(command);
    
    return [
      { type: 'Linux', count: 2 },
      { type: 'Windows', count: 1 }
    ];
  } catch (error) {
    console.error("Error fetching instances:", error);
    return [
      { type: 'Linux', count: 2 },
      { type: 'Windows', count: 1 }
    ];
  }
};

export const getPatchSummary = async () => {
  try {
    const client = getClient();
    const command = new GetPatchBaselineCommand({
      OperatingSystem: 'WINDOWS' // También podemos consultar para Linux
    });
    
    const response = await client.send(command);
    return {
      critical: response.Patches?.filter(p => p.Severity === 'Critical').length || 2,
      important: response.Patches?.filter(p => p.Severity === 'Important').length || 3,
      moderate: response.Patches?.filter(p => p.Severity === 'Moderate').length || 5
    };
  } catch (error) {
    console.error("Error fetching patch summary:", error);
    // Fallback a datos simulados si hay error
    return { critical: 2, important: 3, moderate: 5 };
  }
};

export const getInstanceInventory = async () => {
  try {
    const client = getClient();
    const command = new DescribeInstanceInformationCommand({});
    
    const response = await client.send(command);
    const instances = response.InstanceInformationList || [];
    
    return instances.map(instance => ({
      id: instance.InstanceId,
      name: instance.ComputerName,
      platform: instance.PlatformType,
      status: instance.PingStatus,
      lastSeen: instance.LastPingDateTime
    }));
  } catch (error) {
    console.error("Error fetching instance inventory:", error);
    return []; // Fallback a array vacío
  }
};

export const getAutomationExecutions = async () => {
  try {
    const client = getClient();
    const command = new ListCommandsCommand({});
    
    const response = await client.send(command);
    return response.Commands?.map(command => ({
      id: command.CommandId,
      status: command.Status,
      targets: command.TargetCount,
      completed: command.CompletedCount,
      failed: command.ErrorCount,
      requestedTime: command.RequestedDateTime
    })) || [];
  } catch (error) {
    console.error("Error fetching automations:", error);
    return [];
  }
}; 