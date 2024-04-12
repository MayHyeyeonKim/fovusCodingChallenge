# My pain in da buxx!! (Encountered Errors)

## about nanoid
Solution </br>
- Downgrade the version to 3.3.1. {"nanoid": "^3.3.1"}
- ES module Syntex disabled


```json
2024-04-11T07:31:48.497Z	045fa3a5-51a1-4ea2-ba0e-7fe182a39109	ERROR	Invoke Error 	{
    "errorType": "Error",
    "errorMessage": "Cannot find package 'nanoid' imported from /var/task/index.js\nDid you mean to import nanoid/index.cjs?",
    "code": "ERR_MODULE_NOT_FOUND",
    "stack": [
        "Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'nanoid' imported from /var/task/index.js",
        "Did you mean to import nanoid/index.cjs?",
        "    at new NodeError (node:internal/errors:387:5)",
        "    at packageResolve (node:internal/modules/esm/resolve:852:9)",
        "    at moduleResolve (node:internal/modules/esm/resolve:901:20)",
        "    at defaultResolve (node:internal/modules/esm/resolve:1115:11)",
        "    at nextResolve (node:internal/modules/esm/loader:163:28)",
        "    at ESMLoader.resolve (node:internal/modules/esm/loader:841:30)",
        "    at ESMLoader.getModuleJob (node:internal/modules/esm/loader:424:18)",
        "    at ESMLoader.import (node:internal/modules/esm/loader:525:22)",
        "    at importModuleDynamically (node:internal/modules/cjs/loader:1136:29)",
        "    at importModuleDynamicallyWrapper (node:internal/vm/module:438:21)"
    ]
}

```

## The second lambda that does the following operations:

![Architecture Diagram](https://github.com/MayHyeyeonKim/fovusCodingChallenge/blob/main/images/triggerErr.png)

<ul>
<li>The second Lambda function catches the event inserted into the database and triggers another Lambda function to perform subsequent tasks.
<li>This Lambda function is responsible for creating a new EC2 instance, downloading a script from the S3 bucket, and executing the script.

<li>The script should:  
    - Retrieve the input from DynamoDB using the ID. </br>
    - Append the input text to the downloaded input file, save it, and leave the previous file unchanged. </br>
    - Upload the updated file back to the S3 bucket. </br>

<li>Store the metadata of the newly created file in the DynamoDB table.
<li>Carry out the process from executing the script to shutting down the EC2 instance.
</ul>