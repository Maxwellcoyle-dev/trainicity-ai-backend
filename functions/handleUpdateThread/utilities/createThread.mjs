import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";

const REGION = "us-east-2";
const ddbClient = new DynamoDBClient({ region: REGION });

export const createThread = async (payload) => {
  const filesForDynamo = payload.files.map((file) => {
    console.log(file);
    return {
      M: {
        fileName: { S: file },
      },
    };
  });

  const urlsForDynamo = payload.urls.map((url) => {
    console.log(url);
    return {
      M: {
        url: { S: url },
      },
    };
  });

  const params = {
    TableName: process.env.MAIN_TABLE_NAME,
    Key: {
      UserID: { S: payload.userID },
      ThreadID: { S: payload.threadID },
    },
    Item: {
      UserID: { S: payload.userID },
      ThreadID: { S: payload.threadID },
      // optional fields
      LastUpdated: { S: payload.lastUpdated },
      ThreadTitle: { S: payload.threadTitle },
      ThreadMode: { S: payload.threadMode },
      ThreadInstructions: { S: payload.threadInstructions },
      ThreadUrls: { L: urlsForDynamo },
      ThreadFiles: { L: filesForDynamo },
    },
  };

  console.log("createThread Params: ", params);
  try {
    const data = await ddbClient.send(new PutItemCommand(params));
    console.log("Success", data);
    return data;
  } catch (err) {
    console.error("PutThread Error: ", err);
  }
};
