import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";

const REGION = "us-east-2";
const ddbClient = new DynamoDBClient({ region: REGION });

// payload definition
// userID = "string"
// threadID = "string"

export const getThread = async (userID, threadID) => {
  try {
    const params = {
      TableName: process.env.MAIN_TABLE_NAME,
      Key: {
        UserID: { S: userID },
        ThreadID: { S: threadID },
      },
    };
    console.log("DynamoDB Params: ", JSON.stringify(params));

    const data = await ddbClient.send(new GetItemCommand(params));

    // create a message list for the buffer memory
    const bufferMessageList = data.Item.Messages.L.map((message) => {
      return {
        role: message.M.role.S,
        content: message.M.content.S,
      };
    });

    // create a message list for message update
    const messageList = data.Item.Messages.L.map((message) => {
      return {
        role: message.M.role.S,
        content: message.M.content.S,
        messageID: message.M.messageID.S,
      };
    });

    return { bufferMessageList, messageList };
  } catch (err) {
    console.error("GetThread Error: ", err);
  }
};
