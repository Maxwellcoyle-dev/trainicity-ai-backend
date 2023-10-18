import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

const REGION = "us-east-2";
const s3Client = new S3Client({ region: REGION });

export const deleteFileFromBucket = async (fileKey) => {
  try {
    const params = {
      Bucket: process.env.STORAGE_BUCKET_NAME, // Add s3 bucket upon creation
      Key: fileKey,
    };
    const response = await s3Client.send(new DeleteObjectCommand(params));
    console.log("S3 Delete Success", response);
    return response;
  } catch (err) {
    console.error("Error", err);
    console.error("Error Message: ", err.message);
    console.error("Error Stack: ", err.stack);
  }
};
