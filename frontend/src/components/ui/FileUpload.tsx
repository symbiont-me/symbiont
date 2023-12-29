"use client";
import { useDropzone } from "react-dropzone";
import { Inbox } from "lucide-react";
import { uploadFileToS3, getS3Url } from "@/lib/s3";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

const FileUpload = () => {
  const { mutate } = useMutation({
    mutationFn: async ({fileKey, fileName}: {fileKey: string, fileName: string}) => {
      const response = await axios.post("/api/create-chat", {fileKey, fileName});
    }
    });

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      console.log(acceptedFiles);
      const file = acceptedFiles[0];
      if (file.size > 10000000) {
        alert("File is too big!");
        return;
      }
  
      try {
        const data = await uploadFileToS3(file);
        if (!data.fileKey || !data.fileName) {
          alert("Error uploading file");
          return;
        }
        mutate(data, {
          onSuccess: () => {
            console.log("success", data);
          }, 
          onError: (error) => {
            console.log("error", error);
          }
          
        });
      } catch (e) {
        throw e;
      }
    },
  });
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
