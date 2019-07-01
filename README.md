# food_menu-backend

## Introduction

This project is the backend of Food Menu Search, a Serverless Express Application.

## Setup -  Serverless online

Make sure to follow all these steps exactly as explained below.

### Install the Dependencies

Install the express framework, as well as the serverless-http.

    sudo npm install --save express serverless-http
    sudo npm install --save aws-sdk body-parser

### Deployment

    export BASE_DOMAIN=https://bl4r0gjjv5.execute-api.us-east-1.amazonaws.com/dev
    sls deploy
    
This will launch the server.
Open up your browser and head over to:

    https://bl4r0gjjv5.execute-api.us-east-1.amazonaws.com/dev

You should see the "Hello World!". That confirms that you have set up everything successfully.

## Setup - Serverless offline

### Install serverless-offline plugin

    npm install --save-dev serverless-offline
    
### Install DynamoDB local

    sls dynamodb install

### Deployment

    sls offline start
    
This will launch the server.
Open up your browser and head over to:

    https://localhost:3000/

You should see the "Hello World!". That confirms that you have set up everything successfully.

### Create user and test
Open another terminal window and hit

    curl -H "Content-Type: application/json" -X POST ${BASE_DOMAIN}/users -d '{"userId": "alexdebrie1", "name": "Alex DeBrie"}'
