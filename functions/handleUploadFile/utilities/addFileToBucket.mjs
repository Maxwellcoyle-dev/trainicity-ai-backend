import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const REGION = "us-east-2";
const s3Client = new S3Client({ region: REGION });

export const addFileToBucket = async (payload) => {
  const fileBuffer = Buffer.from(payload.fileData, "base64");

  console.log("fileBuffer: ", fileBuffer);

  //   Define S3 object params
  const params = {
    Bucket: process.env.STORAGE_BUCKET_NAME,
    Key: `${payload.userID}/${payload.threadID}/${payload.fileName}`,
    Body: fileBuffer,
  };

  console.log("params: ", params);

  // Upload file to S3
  try {
    const response = await s3Client.send(new PutObjectCommand(params));

    const returnBody = {
      fileName: payload.fileName,
      fileUrl: `https://trainicity-ai-storage-bucket.s3.us-east-2.amazonaws.com/${payload.userID}/${payload.threadID}/${payload.fileName}`,
      fileKey: `${payload.userID}/${payload.threadID}/${payload.fileName}`,
      userID: payload.userID,
      threadID: payload.threadID,
      success: true,
      response: response,
    };

    console.log("Add File to Bucket Success", response);
    return returnBody;
  } catch (err) {
    console.error("Error", err);
    console.error("Error Message: ", err.message);
    console.error("Error Stack: ", err.stack);
    throw new Error("Error uploading file to S3: ", err);
  }
};
