import {
  DynamoDBClient,
  UpdateItemCommand,
  GetItemCommand,
} from "@aws-sdk/client-dynamodb";

const REGION = "us-east-2";
const ddbClient = new DynamoDBClient({ region: REGION });

export const deleteFileFromDynamoDB = async (
  userID,
  threadID,
  fileKeyToRemove
) => {
  const getParams = {
    TableName: "trainicity-ai-thread-table",
    Key: {
      UserID: { S: userID },
      ThreadID: { S: threadID },
    },
  };

  const fileListResponse = await ddbClient.send(new GetItemCommand(getParams));

  const filesList = fileListResponse.Item.Files.L;

  const updatedList = filesList.filter((file) => {
    return file.M.fileKey.S !== fileKeyToRemove;
  });

  try {
    const updateParams = {
      TableName: "amplifyAiProjectTable",
      Key: {
        UserID: { S: userID },
        ThreadID: { S: threadID },
      },
      UpdateExpression: "set Files = :files",
      ExpressionAttributeValues: {
        ":files": { L: updatedList },
      },
    };
    const response = await ddbClient.send(new UpdateItemCommand(updateParams));
    console.log("DynamoDB Delete Success", response);
    return response;
  } catch (err) {
    console.error("Error", err);
    console.error("Error Message: ", err.message);
    console.error("Error Stack: ", err.stack);
  }
};
