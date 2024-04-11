const { DynamoDBDocument } = require("@aws-sdk/lib-dynamodb");
const { DynamoDB } = require("@aws-sdk/client-dynamodb");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { PutObjectCommand, S3Client } = require("@aws-sdk/client-s3");
const region = "us-east-2";
const s3 = new S3Client({ region });
const mydynamoDB = DynamoDBDocument.from(new DynamoDB({}));
const { nanoid } = require("nanoid");

// Set your AWS resources
require("dotenv").config();
const myBucket = process.env.MY_BUCKET;
const tableName = process.env.TABLE_NAME;
const contentT = "text/plain";


// let nanoid;
async function generateNanoid() {
  if (typeof nanoid === "undefined") {
    const { nanoid: localNanoid } = await import("nanoid");
    nanoid = localNanoid;
  }
  return nanoid;
}

exports.handler = async (event) => {
  const responseBody = {
    message: "이제 잘 되지?",
  };

  let body = JSON.stringify(responseBody);
  console.log("body는: ", body)
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Credentials": true,
  };

  const no = await generateNanoid();
  console.log("no는: ", no);
  
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
  // const fileKey = `${fileName}.txt`;
 console.log("inputData는:", inputData, 
 "  bucketName은: ", myBucket, 
 "  fileKey는: ", fileKey);

  const dbParams = {
    TableName: tableName,
    Item: {
      id: no(),
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
    // console.log("ourURL은: ", ourURL);
    // await mydynamoDB.put(dbParams);
    // console.log("dbParams는: ", dbParams);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        // id: dbParams.Item.id,
        // s3Path: dbParams.Item.inputFile,
        ourURL,
      }),
    };
  } catch (err) {
    console.log("람다에서 나는 에러: ", err);
    // console.error('Error:', err);
    return {
      statusCode: 500,
      headers,
      body,
    };
  }
};