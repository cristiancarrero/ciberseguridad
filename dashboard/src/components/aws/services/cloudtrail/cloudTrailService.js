import { CloudTrailClient, LookupEventsCommand } from "@aws-sdk/client-cloudtrail";
import { getEC2Client } from '../../../../services/awsClientsService';

export const getRecentActivity = async () => {
  try {
    const client = new CloudTrailClient({
      region: 'us-west-2'
    });

    const command = new LookupEventsCommand({
      StartTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
      EndTime: new Date()
    });

    const response = await client.send(command);
    return response.Events || [];
  } catch (error) {
    console.error('Error fetching CloudTrail events:', error);
    throw error;
  }
}; 