const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// 환경 변수 설정
const AMI = 'ami-0900fe555666598a2';
const INSTANCE_TYPE = 't2.micro';
const KEY_NAME = process.env.KEY_NAME;
const SUBNET_ID = process.env.SUBNET_ID;
const GROUP_ID = process.env.GROUP_ID;
const REGION = process.env.REGION;
const S3_BUCKET = 'fovus-storage';
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

  await new Promise((resolve) => setTimeout(resolve, 30000)); // 30초 기다림

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

  if (eventType === 'INSERT') {
    const idKey = record.dynamodb.no.S;
    console.log(`Starting instance with id: ${idKey}`);
    await createVm(idKey);
  } else {
    console.error('에러');
    return {
      statusCode: 400,
      body: JSON.stringify('에러다'),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify('Done'),
  };
};


// 1. S3 버킷에 파일을 업로드하고 
// 2. Lambda 함수를 통해 파일의 메타데이터로 DynamoDB 테이블을 업데이트
// 3. db 업데이트 후 이벤트 잡아서
// 4. 다음 작업을 수행하는 Lambda를 트리거. ----------------------------------------트리거는 됐는데, 스트림으로 MODIFY만 트리거 되게 해야하는가?
//     - 새 EC2 인스턴스를 생성하기.
//     - S3 버킷에서 스크립트를 다운로드하기.
//     - 스크립트를 실행하기
//               ID로 DynamoDB에서 인풋가져오기
//               인풋 텍스트를 다운로드한 입력 파일에 추가하고 저장하기
//               이전 파일은 그대로 내비두고 업데이트된 파일을 S3 버킷에 업로드하기
//     - 새로 생성된 파일의 메타데이터를 DynamoDB 테이블에 저장하기
//     - 스크립트 실행에서 ec2 종료까지 실행
// 즉 2번째 람다에서는 s3에서 스크립트를 다운받고 스크립트 실행까지만.

{/* <수정해야할 사항 예상> */}
// 1. ec2 생성
// 2. db insert
// 3. db insert되면 다시 ec2 생성
// 4. db insert

// 이게 반복되는거같음
// 두번째 람다에서 db에 업데이트가 되어야 하는데