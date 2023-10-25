import { deleteFileFromBucket } from "./utilities/deleteFileFromBucket.mjs";
import { deleteFileFromDynamoDB } from "./utilities/deleteFileFromDynamoDB.mjs";

export const lambdaHandler = async (event) => {
  try {
    // Handle possible preflight requests
    if (event.httpMethod === "OPTIONS") {
      return {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "*",
          "Access-Control-Allow-Headers": "*",
        },
        body: JSON.stringify({ message: "Hello World" }), // OPTIONS requests don't typically need a body
      };
    }

    if (event.requestContext?.authorizer) {
      console.log(`CLAIMS: `, event.requestContext?.authorizer?.claims);
    }

    // the actual code here
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "*",
          "Access-Control-Allow-Headers": "*",
        },
        body: JSON.stringify({ error: "Only POST requests are supported" }),
      };
    }

    const body = JSON.parse(event.body);
    console.log("body: ", body);
    console.log("body type: ", typeof body);

    const deleteFileFromS3 = await deleteFileFromBucket(body.fileKey);
    console.log("deleteFileFromS3: ", deleteFileFromS3);

    let dynamoDBResponse;

    if (deleteFileFromS3) {
      dynamoDBResponse = await deleteFileFromDynamoDB(
        body.userID,
        body.threadID,
        body.fileKey
      );
    }

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "*",
        "Access-Control-Allow-Headers": "*",
      },
      body: JSON.stringify(dynamoDBResponse), // convert items to JSON string
    };
  } catch (error) {
    console.log("handler error: ", error);
    console.log("handler error: ", error.message);
    console.log("handler error: ", error.stack);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "*",
        "Access-Control-Allow-Headers": "*",
      },
      body: JSON.stringify({ error: error.message }),
    };
  }
};
