"use client";
import { useDropzone } from "react-dropzone";
import { Inbox } from "lucide-react";
import { uploadFileToS3, getS3Url } from "@/lib/s3";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
// The FileUpload component allows users to upload PDF files
const FileUpload = () => {
  // useMutation is a hook from react-query that handles asynchronous updates

  const { mutate } = useMutation({
    // mutationFn is the function that will be called when mutate is invoked

    mutationFn: async ({
      fileKey,
      fileName,
    }: {
      fileKey: string;
      fileName: string;
    }) => {
      if (!fileKey || !fileName) {
        throw new Error("fileKey or fileName is undefined");
      }
      try {
        // Try to post the file information to the '/api/create-chat' endpoint
        const response = await axios.post("/api/create-chat", {
          fileKey,
          fileName,
        });
        console.log("response", response);
      } catch (e) {
        throw e;
      }
    },
  });
  // useDropzone is a hook that manages file dropping functionality
  const { getRootProps, getInputProps } = useDropzone({
    // Only accept PDF files

    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    // onDrop is the function that will be called when a file is dropped

    onDrop: async (acceptedFiles) => {
      console.log(acceptedFiles);
      // Get the first file from the array of accepted files

      const file = acceptedFiles[0];
      // Check if the file size exceeds 10MB and alert the user if it does

      if (file.size > 10000000) {
        alert("File is too big!");
        return;
      }
      // Try to upload the file to S3

      try {
        const data = await uploadFileToS3(file);
        console.log("file uploaded", data);
        if (!data.fileKey || !data.fileName) {
          alert("Error uploading file");
          return;
        }
        // If the upload was successful, call mutate to post the file information

        mutate(data, {
          onSuccess: () => {
            console.log("success", data);
          },
          onError: (error) => {
            console.log("error", error);
          },
        });
      } catch (e) {
        throw e;
      }
    },
  });
  // Render the dropzone UI

  return (
    <div className="p-2 bg-white rounded-xl">
      <div
        {...getRootProps({
          className:
            "p-2 bg-white rounded-xl border-2 border-dashed border-gray-300 text-center cursor-pointer",
        })}
      >
        <input {...getInputProps()} />
        <>
          <Inbox className="w-10 h-10 text-blue-500" />
          <p>Drop the PDF here</p>
        </>
      </div>
    </div>
  );
};

export default FileUpload;
