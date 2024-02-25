"use client";
import { useDropzone } from "react-dropzone";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import ToastMessage from "./ToastMessage";
import { usePathname } from "next/navigation";
import { StudyResource, StudyResourceCategory } from "@/types";
import { uploadToFirebaseStorage } from "@/firebase/uploadToStorage";
// TODO fix toast messages
// TODO update to handle audio file uploads

type FileUploadData = {
  fileKey: string;
  fileName: string;
  downloadUrl: string;
};

async function sendFileUploadRequest(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return axios.post("http://127.0.0.1:8000/upload-resource", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

// The FileUpload component allows users to upload PDF files
const FileUpload = () => {
  const path = usePathname();
  const studyId = path.split("/")[2];
  // TODO use uploading state
  const [uploading, setUploading] = useState(false);

  // useMutation is a hook from react-query that handles asynchronous updates
  const fileUploadRequest = useMutation({
    // The mutate method is called within the onDrop method of the useDropzone hook, where data returned from uploadToFirebaseStorage is passed to it. This data object should contain the fileKey, fileName, and downloadUrl needed to construct the resourceData object.
    mutationFn: async ({ fileKey, fileName, downloadUrl }: FileUploadData) => {
      if (!fileKey || !fileName || !downloadUrl) {
        throw new Error("fileKey or fileName is undefined");
      }
      try {
        // TODO set file type either audio or pdf
        const fileType = "pdf" as StudyResourceCategory;
        // create the resource in the database
        const resourceData: StudyResource = {
          studyId: parseInt(studyId),
          name: fileName,
          url: downloadUrl,
          identifier: fileKey,
          category: fileType,
        };

        // TODO make a POST request to the FastAPI server to store data in Firestore
        const response = await axios.post(
          `http://127.0.0.1:8000/upload-resource?studyId=Pp0ZYO6EL54A2XiIr7Eu`,
        );
        // TODO use the HTTP status code defined in Types
        if (response.status !== 201) {
          <ToastMessage message="Error creating resource" type="error" />;
          throw new Error("Error creating resource");
        }
        return;
      } catch (e) {
        throw e;
      }
    },
  });
  // useDropzone is a hook that manages file dropping functionality
  const { getRootProps, getInputProps } = useDropzone({
    // TODO accept and handle PDF and audio files
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    // onDrop is the function that will be called when a file is dropped
    onDrop: async (acceptedFiles) => {
      // Get the first file from the array of accepted files
      const file = acceptedFiles[0];
      // Check if the file size exceeds 5MB and alert the user if it does
      if (file.size > 6500000) {
        // TODO add toast component here
        alert("File is too big!");
        return;
      }
      try {
        setUploading(true);
        // send the file to the FastAPI server
        sendFileUploadRequest(file);
        const data = await uploadToFirebaseStorage(file);
        console.log("Firebase Storage Data", data.downloadUrl);

        if (!data?.fileKey || !data.fileName) {
          return;
        }
        const { fileKey, fileName, downloadUrl } = data;
        // The mutate function is used to asynchronously upload a file and create a resource in the database, with onSuccess and onError callbacks for post-upload handling.
        fileUploadRequest.mutate(
          { fileKey, fileName, downloadUrl },
          {
            onSuccess: () => {
              /*  NOTE this is supposed to referesh the resources query in the ResourceSwitcher component
                but seems to be working without it
            */
              // console.log("successfully uploaded file to s3 and created resource. Now invalidating resources query.");
              // queryClient.invalidateQueries({ queryKey: ['resources', studyId] })
            },
            onError: (err) => {
              <ToastMessage message="Error creating chat" type="error" />;
              console.error(err);
            },
          },
        );
      } catch (error) {
        console.log(error);
      } finally {
        setUploading(false);
      }
    },
  });
  // Render the dropzone UI
  return (
    <div className="flex justify-center items-start mr-4 mt-2">
      <div {...getRootProps({ className: "dropzone" })}>
        <input {...getInputProps()} />
        <input
          type="file"
          className="file-input file-input-bordered file-input-primary w-full max-w-xs"
        />
      </div>
    </div>
  );
};

export default FileUpload;
