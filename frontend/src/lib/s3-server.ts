import AWS from "aws-sdk";
import fs from "fs";
export async function downloadFromS3(fileKey: string) {
  try {
    AWS.config.update({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });
    const s3 = new AWS.S3(
      {
        const params = {
          Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME || "",
          Key: fileKey,
        },
        region = process.env.NEXT_PUBLIC_AWS_REGION || "";
      }
    );
    const params = {
      Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME || "",
      Key: fileKey,
    }

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
