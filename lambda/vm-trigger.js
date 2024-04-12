const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// 환경 변수 설정
const AMI = process.env.AMI;
const INSTANCE_TYPE = process.env.INSTANCE_TYPE;
const KEY_NAME = process.env.KEY_NAME;
const SUBNET_ID = process.env.SUBNET_ID;
const GROUP_ID = process.env.GROUP_ID;
const REGION = process.env.REGION;
const S3_BUCKET = process.env.S3_BUCKET;
const API_LINK = process.env.API_LINK;

// EC2 및 S3 클라이언트 생성
const ec2 = new AWS.EC2({ region: REGION });
const s3 = new AWS.S3();

const createVm = async (idKey) => {
  console.log('Downloading script file from S3');
  const scriptFile = await s3.getObject({ Bucket: S3_BUCKET, Key: 'scripts/script.sh' }).promise();

  fs.writeFileSync('/tmp/script.sh', scriptFile.Body.toString());

  // 사용자 데이터 스크립트 생성
  let userData = `#!/bin/bash
sudo apt update -y
sudo apt install jq -y
export AWS_ACCESS_KEY_ID=${process.env.ACCESS_KEY}
export AWS_SECRET_ACCESS_KEY=${process.env.SECRET_KEY}
export REGION=${REGION}
export KEY_ID=${idKey}
export API_LINK=${API_LINK}`;
  userData += fs.readFileSync('/tmp/script.sh');

  console.log('Creating instance합니다!');
  const response = await ec2.runInstances({
    KeyName: KEY_NAME,
    ImageId: AMI,
    InstanceType: INSTANCE_TYPE,
    NetworkInterfaces: [
      {
        SubnetId: SUBNET_ID,
        Groups: [GROUP_ID],
        DeviceIndex: 0,
        AssociatePublicIpAddress: true,
        DeleteOnTermination: true,
      },
    ],
    MinCount: 1,
    MaxCount: 1,
    UserData: Buffer.from(userData).toString('base64'),
  }).promise();

  const instanceId = response.Instances[0].InstanceId;
  console.log(`Instance created되었습니다!: ${instanceId}`);

  console.log('Waiting for instance to be ready 우와!!');
  await ec2.waitFor('instanceRunning', { InstanceIds: [instanceId] }).promise();
  console.log('Instance ready');

  await new Promise((resolve) => setTimeout(resolve, 60000)); // 60초 기다림

  console.log('Terminating instance');
  await ec2.terminateInstances({ InstanceIds: [instanceId] }).promise();
  console.log('Instance terminated');
};


exports.handler = async (event) => {
  console.log("Received event는 이거야 ->: ", JSON.stringify(event));

  // Check if the event has the expected structure
  if (!event.Records || !event.Records.length) {
    console.error('No records found in the event');
    return {
      statusCode: 400,
      body: JSON.stringify('No records found in the event'),
    };
  }

  const record = event.Records[0];
  const eventType = record.eventName;

  console.log("람다 fovus-vm-trigger 85까지 성공하면 이 메세지가 보일 것입니다!");

  // Check if NewImage exists and has property no with a string type
  if (eventType === 'INSERT' && record.dynamodb && record.dynamodb.NewImage && record.dynamodb.NewImage.no && record.dynamodb.NewImage.no.S) {
    const idKey = record.dynamodb.NewImage.no.S;
    console.log(`Starting instance with id: ${idKey}`);
    await createVm(idKey);
  } else {
    console.error('Event not supported or NewImage.no.S is undefined');
    return {
      statusCode: 400,
      body: JSON.stringify('Event not supported or NewImage.no.S is undefined'),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify('Done'),
  };
};
