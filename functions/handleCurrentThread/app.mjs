import { getThread } from "./utilities/getThread.mjs";
import { createThread } from "./utilities/createThread.mjs";
import { updateThread } from "./utilities/updateThread.mjs";

// Payload = event.body {
//   "threadID": "1234567890", ! REQUIRED
//   "userID" : "Email Address", ! REQUIRED
//   "messages": [], ? OPTIONAL
//   "lastUpdated": "1234567890", ? OPTIONAL
//   "threadTitle": "Title", ? OPTIONAL
//   "threadMode": "Mode", ? OPTIONAL
//   "threadInstructions": "Instructions" ? OPTIONAL
//   "threadUrls": [] ? OPTIONAL
//   "threadFiles": [] ? OPTIONAL

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

    const payload = JSON.parse(event.body);

    // Check if thread exists
    const getThreadResponse = await getThread(payload);

    // If thread exists, update thread
    if (getThreadResponse) {
      const updateThreadResponse = await updateThread(payload);
      return {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "*",
          "Access-Control-Allow-Headers": "*",
        },
        body: JSON.stringify(updateThreadResponse), // convert items to JSON string
      };
    } else {
      // If thread does not exist, create thread
      const putThreadResponse = await createThread(payload);
      return {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "*",
          "Access-Control-Allow-Headers": "*",
        },
        body: JSON.stringify(putThreadResponse), // convert items to JSON string
      };
    }
  } catch (error) {
    console.log(error);
    console.log("Error message:", error.message);
    console.log("Stack trace:", error.stack);
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "*",
        "Access-Control-Allow-Headers": "*",
      },
      body: JSON.stringify({ error: error.message }),
    };
  }
};
