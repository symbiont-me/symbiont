"use client";
import { useDropzone } from "react-dropzone";
import { Inbox } from "lucide-react";
import { uploadFileToS3, getS3Url } from "@/lib/s3";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import ToastMessage from "./ToastMessage";
import { usePathname } from 'next/navigation'



// TODO fix toast messages

// The FileUpload component allows users to upload PDF files
const FileUpload = () => {
  const router = useRouter();
  const path = usePathname()
  const studyId = path.split("/")[2];


  const [uploading, setUploading] = useState(false);

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
          studyId
        });

        if (response.status !== 200) {
          <ToastMessage message="Error creating chat" type="error" />;
          throw new Error("Error creating chat");
        }
        <ToastMessage message="Chat created successfully" type="success" />;

        return response.data;
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
        // TODO add toast component here
        alert("File is too big!");
        return;
      }
      // Try to upload the file to S3
      try {
        setUploading(true);
        const data = await uploadFileToS3(file);
        if (!data?.fileKey || !data.fileName) {
          
          return;
        }
        mutate(data, {
          onSuccess: (data: { chat_id: number }) => {
            <ToastMessage message="Chat created successfully" type="success" />;           
            console.log(data);
          },
          onError: (err) => {
            <ToastMessage message="Error creating chat" type="error" />;
            console.error(err);
          },
        });
      } catch (error) {
        console.log(error);
      } finally {
        setUploading(false);
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

        <Image
          src="/icons/plus.svg"
          width={20}
          height={20}
          alt="upload resources"
        />
      </div>
    </div>
  );
};

export default FileUpload;
