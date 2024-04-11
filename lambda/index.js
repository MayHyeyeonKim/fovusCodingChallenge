const { DynamoDBDocument } = require("@aws-sdk/lib-dynamodb");
const { DynamoDB } = require("@aws-sdk/client-dynamodb");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { PutObjectCommand, S3Client } = require("@aws-sdk/client-s3");
const region = "us-east-2";
const s3 = new S3Client({ region });
const mydynamoDB = DynamoDBDocument.from(new DynamoDB({}));
const { nanoid } = require("nanoid");
const no = nanoid();
require("dotenv").config();
const myBucket = process.env.MY_BUCKET;
const tableName = process.env.TABLE_NAME;

exports.handler = async (event) => {
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
  const dbParams = {
    TableName: tableName,
    Item: {
      no: no,
      inputText: inputText,
      inputFile: `s3://${bucketName}/${fileKey}`,
    },
  };

  try {
    const ourURL = await getSignedUrl(
      s3,
      new PutObjectCommand({
        Bucket: bucketName,
        Key: fileKey,
        ContentType: "image/png",
      }),
      { expiresIn: 3600 }
    );
    await mydynamoDB.put(dbParams);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        id: no,
        inputText: inputText,
        inputFile: `s3://${bucketName}/${fileKey}`,
        ourURL,
      }),
    };
  } catch (err) {
    console.log("람다에서 나는 에러: ", err);
    // console.error('Error:', err);
    return {
      statusCode: 500,
      headers
    };
  }
};
