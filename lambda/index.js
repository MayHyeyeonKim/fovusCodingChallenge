const { DynamoDBDocument } = require('@aws-sdk/lib-dynamodb');
const { DynamoDB } = require('@aws-sdk/client-dynamodb');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { PutObjectCommand, S3Client } = require('@aws-sdk/client-s3');
const { nanoid } = require('nanoid');

const region = 'us-east-2';
const s3 = new S3Client({ region });
const mydynamoDB = DynamoDBDocument.from(new DynamoDB({}));

// Set your AWS resources
require('dotenv').config();
const myBucket = process.env.MY_BUCKET;
const tableName = process.env.TABLE_NAME;
const contentT='text/plain';

async function generateNanoid() {
    if (typeof nanoid === 'undefined') {
        const { nanoid: localNanoid } = await import('nanoid');
        nanoid = localNanoid;
    }
    return nanoid;
}

exports.handler = async (event) => {
    const generateId = await generateNanoid();
    
    let inputData;
    try {
        inputData = JSON.parse(event.body);
    } catch (e) {
        console.log(e);
        return {
            statusCode: 400,
        };
    }
    const { inpTxt, fileName } = inputData;
    const bucketName = myBucket;
    const fileKey = `${fileName}.txt`;

    const dbParams = {
        TableName: tableName,
        Item: {
            id: generateId(),inputText: inpTxt,inputFile: `s3://${bucketName}/${fileKey}`,
        },
    };

    try {
        const ourURL = await getSignedUrl(s3, new PutObjectCommand({
            Bucket: bucketName,Key: fileKey,ContentType: contentT,
        }), { expiresIn: 3600 });

        await mydynamoDB.put(dbParams);

        return {
            statusCode: 200,
            body: JSON.stringify({ id: dbParams.Item.id, s3Path: dbParams.Item.inputFile, ourURL }),
        };
    } catch (err) {
        console.error('Error:', err);
        return {
            statusCode: 500,
        };
    }
};