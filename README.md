## Prerequisites

Node.js, typescript, AWS CDK and esbuild (as a global NPM module) should be installed in your computer. 

## Configuration

Go to the config folder at the project's root directory and copy the .env.example and name this copy as .env.{your environment name} like .env.dev or .env.prod

Replace the sample values with your own environment name, application name, AWS account ID and region and save this .env file.


## Deployment

Set NODE_ENV environment variable as your target environment. For example if you want to start the deployment according to the parameters that are written in .env.**dev** file, then you need to run the following command:

    $ export NODE_ENV=dev

Run the following command to start the automated deployment:

    $ cdk deploy

