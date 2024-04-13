const { DynamoDBDocument } = require("@aws-sdk/lib-dynamodb");
const { DynamoDB } = require("@aws-sdk/client-dynamodb");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { PutObjectCommand, S3Client } = require("@aws-sdk/client-s3");
const region = "us-east-2";
const s3 = new S3Client({ region });
const mydynamoDB = DynamoDBDocument.from(new DynamoDB({}));

// const { v4: uuidv4 } = require('uuid');


require("dotenv").config();
const myBucket = 'fovus-storage';
const tableName = 'fovus-table2'; 

  
;
// const no = uuidv4();


exports.handler = async (event) => {
  const { nanoid } = require("nanoid");
  const no = nanoid();
  //이거 람다 handler 외부에 두면 한번 실행되고 공유된다.
  // Lambda의 Execution Envirment는 재사용 되는데, hanlder 바깥의 스코프에 있는 부분은 계속 유지될 수 있다.
  console.log("no가 생성이 잘되니?: ", no);
  
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Credentials": true,
  };

  let inputData;
  try {
    inputData = JSON.parse(event.body);
  } catch (e) {
    console.log(e);
    return {
      statusCode: 400,
    };
  }
  const { inputText, fileName } = inputData;
  const bucketName = myBucket;
  const fileKey = `${fileName}`;
  
 console.log("inputData는:", inputData, 
 "  bucketName은: ", myBucket, 
 "  fileKey는: ", fileKey);

   const dbParams = {
   TableName: tableName,
   Item: {
     no: no,
     inputText: inputText,
     inputFile: `s3://${bucketName}/${fileKey}`,
   },
 };
  // return {
  //   statusCode: 200,
  //   headers,
  //   body: "",
  // };
  try {
    const ourURL = await getSignedUrl(
      s3,
      new PutObjectCommand({
        Bucket: bucketName,
        Key: fileKey,
      ContentType: 'image/png',
      }),
      { expiresIn: 3600 }
    );
    
    console.log("DynamoDB put operation 시작:", dbParams);
    await mydynamoDB.put(dbParams);
    console.log("DynamoDB put operation 성공"); 
      
    return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          id: no,
          inputText: inputText,
          inputFile: `s3://${bucketName}/${fileKey}`,
          ourURL
        }),
      };
  } catch (err) {
    console.log("람다에서 나는 에러: ", err);
    // console.error('Error:', err);
    return {
      statusCode: 500,
      headers,
      // body,
    };
  }
};