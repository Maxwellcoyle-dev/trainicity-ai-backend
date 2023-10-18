import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

// set the S3 Client options
const REGION = "us-east-2";
const s3Client = new S3Client({ region: REGION });

// Expects a bucketName + a key
export const getFile = async (key) => {
  const params = {
    Bucket: process.env.STORAGE_BUCKET_NAME,
    Key: key,
  };

  try {
    const data = await s3Client.send(new GetObjectCommand(params));
    // Here we check for the Readable stream type
    if (data.Body && typeof data.Body.pipe === "function") {
      return new Promise((resolve, reject) => {
        const chunks = [];
        data.Body.on("data", (chunk) => chunks.push(chunk));
        data.Body.on("end", () => resolve(Buffer.concat(chunks)));
        data.Body.on("error", reject);
      });
    } else {
      throw new Error("Unsupported Body type in S3 response");
    }
  } catch (error) {
    console.error("Error getting object from S3:", error);
    throw error; // If you want to end the execution in case of an error
  }
};
