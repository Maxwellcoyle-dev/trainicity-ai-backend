import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";

const REGION = "us-east-2";
const ddbClient = new DynamoDBClient({ region: REGION });

export const getThread = async (payload) => {
  const params = {
    TableName: "trainicity-ai-thread-table",
    Key: {
      UserID: { S: payload.userID },
      ThreadID: { S: payload.threadID },
    },
  };
  console.log("GetThread Params for DynamoDB: ", JSON.stringify(params));
  try {
    const data = await ddbClient.send(new GetItemCommand(params));
    console.log("GetThread Success", data.Item);
    return data.Item;
  } catch (err) {
    console.error("GetThread Error: ", err);
  }
};
