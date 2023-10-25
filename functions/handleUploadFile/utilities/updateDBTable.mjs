import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";

const REGION = "us-east-2";
const ddbClient = new DynamoDBClient({ region: REGION });

export const updateDBTable = async (
  userID,
  threadID,
  fileName,
  fileKey,
  fileUrl
) => {
  console.log("updateDBTable: ", userID, threadID, fileName, fileKey, fileUrl);

  try {
    const params = {
      TableName: process.env.MAIN_TABLE_NAME,
      Key: {
        UserID: { S: userID },
        ThreadID: { S: threadID },
      },
      UpdateExpression:
        "SET #files = list_append(if_not_exists(#files, :empty_list), :new_file)",
      ExpressionAttributeNames: {
        "#files": "Files",
      },
      ExpressionAttributeValues: {
        ":new_file": {
          L: [
            {
              M: {
                fileName: { S: fileName },
                fileKey: { S: fileKey },
                fileUrl: { S: fileUrl },
              },
            },
          ],
        },
        ":empty_list": { L: [] },
      },
    };

    console.log(params);

    const response = await ddbClient.send(new UpdateItemCommand(params));
    console.log("update DB table with file Success", response);
    return {
      success: true,
      message: "Successfully updated DynamoDB",
      data: response,
    };
  } catch (err) {
    console.error("Error updating DynamoDB: ", err);
    console.error("Error Message: ", err.message);
    console.error("Error Stack: ", err.stack);
    throw new Error("Error updating DynamoDB: ", err);
  }
};
