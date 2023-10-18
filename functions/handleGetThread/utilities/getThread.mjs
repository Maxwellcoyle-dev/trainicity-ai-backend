import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";

const REGION = "us-east-2";
const ddbClient = new DynamoDBClient({ region: REGION });

export const getThread = async (payload) => {
  const params = {
    TableName: process.env.MAIN_TABLE_NAME,
    Key: {
      UserID: { S: payload.userID },
      ThreadID: { S: payload.threadID },
    },
  };
  try {
    const data = await ddbClient.send(new GetItemCommand(params));
    return data.Item;
  } catch (err) {
    console.error("GetThread Error: ", err);
  }
};
