import { DynamoDBClient, DeleteItemCommand } from "@aws-sdk/client-dynamodb";

const REGION = "us-east-2";
const ddbClient = new DynamoDBClient({ region: REGION });

export const deleteThread = async (payload) => {
  const params = {
    TableName: "trainicity-ai-thread-table",
    Key: {
      UserID: { S: payload.userID },
      ThreadID: { S: payload.threadID },
    },
  };

  try {
    const data = await ddbClient.send(new DeleteItemCommand(params));
    console.log("Delete Thread Success", data);
    return data;
  } catch (err) {
    console.error("DeleteThread Error: ", err);
  }
};
