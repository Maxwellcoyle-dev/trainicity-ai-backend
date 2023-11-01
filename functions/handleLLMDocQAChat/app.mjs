// Custom Code Imports
import { getFile } from "./utilities/getFile.mjs";
import { saveFile } from "./utilities/saveFile.mjs";
import { main } from "./utilities/main.mjs";
import { getOpenAIKey } from "./utilities/getOpenAIKey.mjs";

// event.body definition
//  {
//   files: ["string"],
//   question: "string",
//   userID: "string",
//   threadID: "string",
// };

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
      };
    }

    if (event.requestContext?.authorizer) {
      console.log(`CLAIMS: `, event.requestContext?.authorizer?.claims);
    }

    console.log(`EVENT: ${JSON.stringify(event)}`);

    const OPENAI_API_KEY = await getOpenAIKey();

    // Get the body and save to payload
    const payload = JSON.parse(event.body); // Expecting an array of file keys
    console.log("payload: ", payload);

    // Return an error if no files are recieved in the body
    if (payload.files?.length < 1)
      return { statusCode: 400, body: "No files found" };

    let filePaths = [];
    for (let i = 0; i < payload.files.length; i++) {
      const buffer = await getFile(payload.files[i]);
      const newFilePath = saveFile(buffer, payload.files[i]);
      filePaths.push(newFilePath);
    }

    // payload for main function
    const mainPayload = {
      apiKey: OPENAI_API_KEY,
      question: payload.question,
      userID: payload.userID,
      threadID: payload.threadID,
    };

    const result = await main(mainPayload);

    console.log("result: ", result);
    console.log("result type: ", typeof result);

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "*",
        "Access-Control-Allow-Headers": "*",
      },
      body: JSON.stringify(result),
    };
  } catch (error) {
    console.error(error);
    throw error; // If you want to end the execution in case of an error
  }
};
