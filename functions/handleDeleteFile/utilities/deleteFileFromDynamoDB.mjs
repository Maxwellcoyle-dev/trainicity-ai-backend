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
    TableName: process.env.MAIN_TABLE_NAME,
    Key: {
      UserID: { S: userID },
      ThreadID: { S: threadID },
    },
  };

  const fileListResponse = await ddbClient.send(new GetItemCommand(getParams));
  console.log("fileListResponse: ", fileListResponse);
  const filesList = fileListResponse.Item.ThreadFiles.L;

  console.log("filesList: ", filesList);
  const updatedList = filesList.filter((file) => {
    return file.M.fileKey.S !== fileKeyToRemove;
  });

  console.log("updatedList: ", updatedList);

  try {
    const updateParams = {
      TableName: process.env.MAIN_TABLE_NAME,
      Key: {
        UserID: { S: userID },
        ThreadID: { S: threadID },
      },
      UpdateExpression: "set ThreadFiles = :threadFiles",
      ExpressionAttributeValues: {
        ":threadFiles": { L: updatedList },
      },
    };
    const response = await ddbClient.send(new UpdateItemCommand(updateParams));
    console.log("DynamoDB Delete Success", response);
    return response;
  } catch (err) {
    console.error("Error deleting file from dynamodb", err);
    console.error("Error Message: ", err.message);
    console.error("Error Stack: ", err.stack);
    return err;
  }
};
