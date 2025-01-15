import { 
  CloudWatchLogsClient,
  DescribeLogGroupsCommand,
  GetLogEventsCommand,
  FilterLogEventsCommand,
  DescribeLogStreamsCommand
} from "@aws-sdk/client-cloudwatch-logs";

let logsClient = null;

export const initializeCloudWatchLogs = (credentials) => {
  logsClient = new CloudWatchLogsClient({
    region: credentials.region,
    credentials: {
      accessKeyId: credentials.credentials.accessKeyId,
      secretAccessKey: credentials.credentials.secretAccessKey,
      sessionToken: credentials.credentials.sessionToken
    }
  });
};

export const getLogGroups = async () => {
  if (!logsClient) throw new Error('Logs Client no inicializado');
  
  try {
    const command = new DescribeLogGroupsCommand({});
    const response = await logsClient.send(command);
    return response.logGroups;
  } catch (error) {
    console.error('Error obteniendo grupos de logs:', error);
    throw error;
  }
};

export const getLogStreams = async (logGroupName) => {
  if (!logsClient) throw new Error('Logs Client no inicializado');

  try {
    const command = new DescribeLogStreamsCommand({
      logGroupName,
      orderBy: 'LastEventTime',
      descending: true
    });
    const response = await logsClient.send(command);
    return response.logStreams;
  } catch (error) {
    console.error('Error obteniendo streams de logs:', error);
    throw error;
  }
};

export const getLogEvents = async (params) => {
  if (!logsClient) throw new Error('Logs Client no inicializado');

  const { logGroupName, logStreamName, startTime, endTime, nextToken } = params;

  try {
    const command = new GetLogEventsCommand({
      logGroupName,
      logStreamName,
      startTime,
      endTime,
      nextToken,
      limit: 50
    });
    const response = await logsClient.send(command);
    return {
      events: response.events,
      nextForwardToken: response.nextForwardToken,
      nextBackwardToken: response.nextBackwardToken
    };
  } catch (error) {
    console.error('Error obteniendo eventos de logs:', error);
    throw error;
  }
};

export const filterLogEvents = async (params) => {
  if (!logsClient) throw new Error('Logs Client no inicializado');

  const { logGroupName, filterPattern, startTime, endTime } = params;

  try {
    const command = new FilterLogEventsCommand({
      logGroupName,
      filterPattern,
      startTime,
      endTime
    });
    const response = await logsClient.send(command);
    return response.events;
  } catch (error) {
    console.error('Error filtrando eventos de logs:', error);
    throw error;
  }
}; 