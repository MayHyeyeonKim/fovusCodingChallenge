# May's File Upload System - fovusCodingChallenge

## Overview
This system allows users to upload text and files through a responsive web interface. It leverages serverless architecture with AWS services including Lambda, S3, DynamoDB, and EC2 for processing and storing data.

## System Components

### Responsive Web UI
- **Framework:** ReactJS

- **Functionalities:**
  - Text input: Allows users to enter text.
  - File input: Users can select and upload a file.
  - Submit button: Submits the input data.

### AWS Services Integration
- **Amazon S3:** Stores the uploaded files directly from the browser.
- **Amazon DynamoDB:** Stores input data and file paths.
- **AWS Lambda:** Interacts with DynamoDB and triggers EC2 scripts.
- **Amazon EC2:** Runs scripts to process files and text input.

## Workflow

1. **User Interaction:**
   - Users input text and select a file to upload via the ReactJS frontend.
   - Upon submission, the file is uploaded to S3 and the text input is sent to DynamoDB.

2. **Serverless Processing:**
   - A Lambda function is triggered to store the input text and file path in DynamoDB.
   - An event-driven script on EC2 is triggered by DynamoDB to process the file.

3. **File Processing on EC2:**
   - The script on EC2 retrieves input data from DynamoDB using the provided ID.
   - It downloads the file from S3 and appends the input text.
   - The modified file is saved as `[OutputFile].txt` and uploaded back to S3.

4. **Cleanup:**
   - The output file path is stored in DynamoDB.
   - The EC2 instance terminates automatically after the script execution.

## How to Use

1. Navigate to the web interface.
2. Enter the required text in the text input field.
3. Choose the file you wish to upload.
4. Click the 'Submit' button to start the upload process.

## Architecture Diagram

![Architecture Diagram](https://github.com/MayHyeyeonKim/fovusCodingChallenge/blob/main/images/ArchitectureDiagram.png)

## Prerequisites

- AWS account with access to S3, Lambda, DynamoDB, and EC2.
- Node.js and npm installed for running the React application.
- IAM roles and permissions properly set up for Lambda and EC2 access to S3 and DynamoDB.

## Setup and Deployment

_Instructions on setting up the environment and deploying the application._

## Contributing

_Information on how others can contribute to the project._

## Error Log


### CORS Configuration for S3
![CORS Error](https://github.com/MayHyeyeonKim/fovusCodingChallenge/blob/main/images/corsErr.png)

To enable the React application on `localhost:3000` to interact with the S3 bucket, the following CORS configuration was required:

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["PUT", "POST", "GET", "DELETE", "HEAD"],
        "AllowedOrigins": ["http://localhost:3000"],
        "ExposeHeaders": ["ETag"],
        "MaxAgeSeconds": 3000
    }
]
