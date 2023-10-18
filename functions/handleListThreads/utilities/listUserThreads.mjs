import { DynamoDBClient, QueryCommand } from "@aws-sdk/client-dynamodb";

const docClient = new DynamoDBClient({ region: "us-east-2" });

export const listUserThreads = async (userID) => {
  const params = {
    TableName: process.env.MAIN_TABLE_NAME,
    KeyConditionExpression: "UserID = :userid",
    ExpressionAttributeValues: {
      ":userid": { S: userID },
    },
  };

  try {
    const data = await docClient.send(new QueryCommand(params));
    return data.Items;
  } catch (err) {
    console.error(err);
  }
};
