"use client";
import { useDropzone } from "react-dropzone";
import { Inbox } from "lucide-react";
const FileUpload = () => {
  const { getRootProps, getInputProps } = useDropzone({
    accept: { "application/pdf": [".pdf"] },

    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      console.log(acceptedFiles);
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
