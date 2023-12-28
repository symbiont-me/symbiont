"use client";
import { useDropzone } from "react-dropzone";
import { Inbox } from "lucide-react";
import { uploadFileToS3, getS3Url } from "@/lib/s3";
const FileUpload = () => {
  const { getRootProps, getInputProps } = useDropzone({
    accept: { "application/pdf": [".pdf"] },

    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      console.log(acceptedFiles);
      const file = acceptedFiles[0];
      if (file.size > 10000000) {
        alert("File is too big!");
        return;
      }
      try {
        uploadFileToS3(file).then((res) => {
          console.log(res.fileKey);
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
