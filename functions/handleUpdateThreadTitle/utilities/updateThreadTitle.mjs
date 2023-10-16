import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";

const REGION = "us-east-2";
const ddbClient = new DynamoDBClient({ region: REGION });

export const updateThreadTitle = async (payload) => {
  const newTitle = payload.threadTitle;

  const params = {
    TableName: "trainicity-ai-thread-table",
    Key: {
      UserID: { S: payload.userID },
      ThreadID: { S: payload.threadID },
    },
    UpdateExpression: "set ThreadTitle = :threadTitle",
    ExpressionAttributeValues: {
      ":threadTitle": { S: newTitle },
    },
  };

  try {
    const data = await ddbClient.send(new UpdateItemCommand(params));
    console.log("update Thread Title Success", data);
    return data;
  } catch (err) {
    console.error("UpdateThread Error: ", err);
  }
};
