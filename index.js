/*
  index.js - creating several endponints
  Heal1

  Created by Prashuk Ajmera on 5/10/19.
  Copyright © 2019 Prashuk Ajmera. All rights reserved.
*/

// Set all required var
const serverless = require("serverless-http");
const bodyParser = require("body-parser");
const express = require("express");
const app = express();
const AWS = require("aws-sdk");
const INGREDIENTS_TABLE = process.env.INGREDIENTS_TABLE;
const IS_OFFLINE = process.env.IS_OFFLINE;

let dynamoDb;

// File is included here
var fs = require("fs");
eval(fs.readFileSync("StringUtils.js") + "");

// Condition for online and offline
if (IS_OFFLINE === "true") {
  dynamoDb = new AWS.DynamoDB.DocumentClient({
    region: "localhost",
    endpoint: "http://localhost:8000"
  });
} else {
  dynamoDb = new AWS.DynamoDB.DocumentClient();
}

// Set app for bodyparser for size limit 10MB
app.use(bodyParser.json({ strict: false, limit: "10mb" }));

app.get("/", function(req, res) {
  res.send("Hello World");
});

// Endpoint for get data from key
app.get("/ingredients/:key", function(req, res) {
  const params = {
    TableName: INGREDIENTS_TABLE,
    Key: { key: req.params.key }
  };
  dynamoDb.get(params, (error, result) => {
    if (error) {
      console.log(error);
      res.status(400).json({ error: "Could not find ingredients" });
    }
    res.json(result);
  });
});

// Endpoint for put data to database
app.put("/add-ingredients", function(req, res) {
  var data = [];

  for (var key in req.body) {
    var currObj = req.body[key];
    var currData = {
      PutRequest: {
        Item: {
          key: key,
          text: currObj.text,
          tags: currObj.tags
        }
      }
    };

    data.push(currData);
    console.log(data);
    // Data can be add of max 25 values
    if (data.length == 25) {
      const params = {
        RequestItems: {
          "ingredients-table-dev": data
        }
      };

      dynamoDb.batchWrite(params, error => {
        if (error) {
          console.log(error);
          res.status(400).json({ error: "Could not create ingredients" });
        }
      });
      // Clear data
      data = [];
    }
  }

  // Data size < 25. Add to DB
  if (data.length > 0) {
    const params = {
      RequestItems: {
        "ingredients-table-dev": data
      }
    };

    dynamoDb.batchWrite(params, (error, data) => {
      if (error) {
        console.log(error);
        res.status(400).json({ error: "Could not create ingredients" });
      } else {
        res.json(data);
      }
    });
  } else {
    res.status(400).json({ error: "Failed to add ingredient" });
  }
});

// Endpoint for fuzzy-search using toHashKey
app.get("/fuzzy-search-hash/:inputText", (req, res) => {
  var inputText = req.params.inputText;
  var searchText = inputText.toHashKey();

  const params = {
    TableName: INGREDIENTS_TABLE,
    Key: { key: searchText }
  };
  dynamoDb.get(params, (error, result) => {
    if (error) {
      res.status(400).json({ error: "Could not find ingredient" });
    }
    res.json(result);
  });
});

// Endpoint for fuzzy-search using getVariations with inputText
app.get("/fuzzy-search-variation/:inputText", (req, res) => {
  var inputText = req.params.inputText;
  var searchText = inputText.toHashKey().getVariations();
  const params = {
    TableName: INGREDIENTS_TABLE,
    Key: { key: inputText }
  };
  dynamoDb.get(params, (error, result) => {
    if (error) {
      console.log(error);
      res.status(400).json({ error: "Could not find ingredients" });
    }

    var requestsFinished = 0;

    // No result for inputText the it search for SearchText
    if (Object.keys(result).length === 0) {
      console.log(searchText);

      // Getting result for every searchText
      for (i = 0; i < searchText.length; i++) {
        const params = {
          TableName: INGREDIENTS_TABLE,
          Key: { key: searchText[i] }
        };
        dynamoDb.get(params, (error, result) => {
          requestsFinished++;
          if (error) {
            console.log(error);
            res.status(400).json({ error: "Could not find ingredients" });
          }

          // Condition for no results on searchText
          if (Object.keys(result).length === 0) {
            if (requestsFinished == searchText.length) {
              res.status(400).json({ error: "Could not find ingredients" });
            }
          } else {
            res.json(result);
          }
        });
      }
    } else {
      res.json(result);
    }
  });
});

// Endpoint for autocomplete
app.get("/autocomplete/:inputText", (req, res) => {
  var inputText = req.params.inputText;
});

// Exporting app to Severless
module.exports.handler = serverless(app);
