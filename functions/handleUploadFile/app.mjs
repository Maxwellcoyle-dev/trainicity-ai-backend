import { addFileToBucket } from "./utilities/addFileToBucket.mjs";
import { updateDBTable } from "./utilities/updateDBTable.mjs";

export const lambdaHandler = async (event) => {
  let dynamoDBResponse;

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

    try {
      const s3Response = await addFileToBucket(payload);

      try {
        dynamoDBResponse = await updateDBTable(
          s3Response.userID,
          s3Response.threadID,
          s3Response.fileName,
          s3Response.fileKey,
          s3Response.fileURL
        );
        console.log(dynamoDBResponse.message, dynamoDBResponse.data);
      } catch (error) {
        console.error(
          "DynamoDB update failed after successful S3 upload",
          error.message
        );
        throw error; // Re-throwing to handle it in the outer catch block, if necessary
      }
    } catch (err) {
      console.error("Error during S3 upload or DynamoDB update", err);
      console.error("Error Message: ", err.message);
      console.error("Error Stack: ", err.stack);
      throw err; // Re-throwing to handle it in the outer catch block, if necessary
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
