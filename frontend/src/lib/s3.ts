import AWS from "aws-sdk";

export async function uploadFileToS3(file: File): Promise<{ fileKey: string; fileName: string }> {
  if (!(file instanceof File)) {
    throw new Error("Invalid file type. Expected instance of File.");
  }
  try {
    AWS.config.update({
      accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY,
    });
    const s3 = new AWS.S3({
      params: {
        Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME,
      },
      region: process.env.NEXT_PUBLIC_S3_REGION,
    });

    const cleanedFileName = file.name.replace(/[^a-zA-Z0-9.]/g, "");
    const fileKey = `uploads/${Date.now()}_${cleanedFileName}`;    
    const bucketName = process.env.NEXT_PUBLIC_S3_BUCKET_NAME;
    if (!bucketName) {
      throw new Error("S3 bucket name is not set in environment variables");
    }
    const params = {
      Bucket: bucketName,
      Key: fileKey,
      Body: file,
    };

    try {
      
      const upload = s3.putObject(params).promise();
  
      const data = await upload;
      console.log("File uploaded successfully to S3", fileKey);
      return { fileKey, fileName: file.name }; // Fixed by removing Promise.resolve and directly returning the object
    } catch (error) {
      console.log(error);
      throw new Error("Error uploading file to S3");
    }
  } catch (error) {
    console.log(error);
    throw new Error("Error uploading file to S3");
  }
}

// helper
export function getS3Url(fileKey: string) {
  const url =
    `https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_S3_REGION}.amazonaws.com/${fileKey}`
  return url;
}
