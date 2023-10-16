import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";

const REGION = "us-east-2";
const ddbClient = new DynamoDBClient({ region: REGION });

export const createThread = async (payload) => {
  const params = {
    TableName: "trainicity-ai-thread-table",
    Key: {
      UserID: { S: payload.userID },
      ThreadID: { S: payload.threadID },
    },
    Item: {
      UserID: { S: payload.userID },
      ThreadID: { S: payload.threadID },
      // optional fields
      LastUpdated: { S: payload.lastUpdated },
      ThreadTitle: { S: payload.threadTitle },
      ThreadMode: { S: payload.threadMode },
      ThreadInstructions: { S: payload.threadInstructions },
    },
  };

  try {
    const data = await ddbClient.send(new PutItemCommand(params));
    console.log("Success", data);
    return data;
  } catch (err) {
    console.error("PutThread Error: ", err);
  }
};
