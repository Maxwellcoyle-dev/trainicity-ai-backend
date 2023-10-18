import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";

const REGION = "us-east-2";
const ddbClient = new DynamoDBClient({ region: REGION });

export const updateThread = async (payload) => {
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
    UpdateExpression:
      "set Messages = :messages, LastUpdated = :lastUpdated, ThreadTitle = :threadTitle, ThreadInstructions = :threadInstructions",
    ExpressionAttributeValues: {
      ":messages": { L: messagesForDynamo },
      ":lastUpdated": { S: payload.lastUpdated },
      ":threadTitle": { S: payload.threadTitle },
      ":threadInstructions": { S: payload.threadInstructions },
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
