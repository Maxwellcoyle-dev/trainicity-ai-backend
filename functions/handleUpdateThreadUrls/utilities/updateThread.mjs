import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";

const REGION = "us-east-2";
const ddbClient = new DynamoDBClient({ region: REGION });

export const updateThread = async (urlList, userID, threadID) => {
  const urlsForDynamo = urlList.map((url) => ({
    M: {
      url: { S: url },
    },
  }));

  const params = {
    TableName: process.env.MAIN_TABLE_NAME,
    Key: {
      UserID: { S: userID },
      ThreadID: { S: threadID },
    },
    UpdateExpression: "SET URLs = :urls",
    ExpressionAttributeValues: {
      ":urls": { L: urlsForDynamo },
    },
  };

  try {
    const data = await ddbClient.send(new UpdateItemCommand(params));
    console.log("Success", data);
    return data;
  } catch (err) {
    console.error("Error", err);
  }
};
