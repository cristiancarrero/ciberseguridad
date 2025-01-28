import { EC2Client, DescribeInstancesCommand } from "@aws-sdk/client-ec2";

let ec2Client = null;

const getClient = () => {
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

export const resetClient = () => {
  ec2Client = null;
}; 