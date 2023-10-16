import { DynamoDBClient, QueryCommand } from "@aws-sdk/client-dynamodb";

const docClient = new DynamoDBClient({ region: "us-east-2" });

export const listUserThreads = async (userID) => {
  const params = {
    TableName: "trainicity-ai-thread-table", // replace with your table name
    KeyConditionExpression: "UserID = :userid",
    ExpressionAttributeValues: {
      ":userid": { S: userID },
    },
  };

  try {
    const data = await docClient.send(new QueryCommand(params));
    console.log("List User Threads Success", data.Items);
    return data.Items;
  } catch (err) {
    console.error(err);
  }
};
