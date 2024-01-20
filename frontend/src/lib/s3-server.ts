import AWS from "aws-sdk";
import fs from "fs";
export async function downloadFromS3(fileKey: string) {
  
  // @note removes the error in getObject(params) as bucket may not be set
  const bucketName = process.env.NEXT_PUBLIC_S3_BUCKET_NAME;
  if (!bucketName) {
    throw new Error("S3 bucket name is not set in environment variables");
  }
  try {
    AWS.config.update({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || undefined,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || undefined,
    });
    const s3 = new AWS.S3();
    const params = {
      Bucket: bucketName,
      Key: fileKey,
    };

    const data = await s3.getObject(params).promise();
    const file_name = `/tmp/pdf/${Date.now()}.pdf`;
    fs.writeFileSync(file_name, data.Body as Buffer);
    return file_name;
  }
  catch (error) {
    console.log(error);
    return null;
  }
}
