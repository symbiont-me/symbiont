import AWS from "aws-sdk";

export async function uploadFileToS3(file: File): Promise<{ fileKey: string; fileName: string }> {
  try {
    AWS.config.update({
      accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY,
    });
    const s3 = new AWS.S3({
      params: {
        Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME,
      },
      region: "eu-west-2",
    });

    const cleanedFileName = file.name.replace(/[^a-zA-Z0-9.]/g, "");
    const fileKey = "uploads/" + Date.now() + "_" + cleanedFileName;

    const params = {
      Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME,
      Key: fileKey,
      Body: file,
    };

    // TODO fix error
    const upload = s3
      .putObject(params)
      .on("httpUploadProgress", (evt) => {
        // TODO add a progress bar
        console.log(evt.loaded + " of " + evt.total + " Bytes");
      })
      .promise();

    await upload.then((data) => {
      console.log(data);
      console.log("File uploaded successfully to S3", fileKey);
      return Promise.resolve({ fileKey, fileName: file.name });
    });
  } catch (error) {
    console.log(error);
    throw new Error("Error uploading file to S3");
  }
}

// helper
export function getS3Url(fileKey: string) {
  const url =
    "https://" + process.env.NEXT_PUBLIC_S3_BUCKET_NAME + ".s3.eu-wes-2.amazonaws.com/" + fileKey;
  return url;
}
