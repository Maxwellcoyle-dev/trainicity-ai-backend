import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";

const REGION = "us-east-2";
const ddbClient = new DynamoDBClient({ region: REGION });

// payload definition
// {
//   "userID": "string",
//   "threadID": "string",
//   "message": [
//     {
//       "role": "string",
//       "content": "string",
//       "messageID": "string"
//     }

//  lastUpdated

export const updateThread = async (payload) => {
  // Set the lastUpdated timestamp
  const lastUpdated = Date.now().toString();

  // Convert the messages array into DynamoDB format
  const messagesForDynamo = payload.messages.map((message) => ({
    M: {
      role: { S: message.role },
      content: { S: message.content },
      messageID: { S: message.messageID },
    },
  }));

  const params = {
    TableName: process.env.MAIN_TABLE_NAME,
    Key: {
      UserID: { S: payload.userID },
      ThreadID: { S: payload.threadID },
    },
    UpdateExpression: "set Messages = :messages, LastUpdated = :lastUpdated",
    ExpressionAttributeValues: {
      ":messages": { L: messagesForDynamo },
      ":lastUpdated": { S: lastUpdated },
    },
  };

  try {
    const data = await ddbClient.send(new UpdateItemCommand(params));
    console.log("Success", data);
    return data;
  } catch (err) {
    console.error("UpdateThread Error: ", err);
    console.log("UpdateThread Error message:", err.message);
    console.log("UpdateThread Stack trace:", err.stack);
  }
};
