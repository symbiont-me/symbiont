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
  study_id: string;
  identifier: string;
  name: string;
  url: string;
  category: string;
};

async function sendFileUploadRequest(file: File): Promise<FileUploadData> {
  const formData = new FormData();
  formData.append("file", file);
  const response = await axios.post(
    `http://127.0.0.1:8000/upload-resource/?studyId=Pp0ZYO6EL54A2XiIr7Eu`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data.resource;
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
    mutationFn: async ({ identifier, name, url }: FileUploadData) => {
      if (!identifier || !name || !url) {
        throw new Error("fileKey or fileName is undefined");
      }
      try {
        // TODO set file type either audio or pdf
        const fileType = "pdf" as StudyResourceCategory;
        // create the resource in the database
        const resourceData: StudyResource = {
          studyId: parseInt(studyId),
          name: name,
          url: url,
          identifier: identifier,
          category: fileType,
        };

        const response = await axios.post(
          `http://127.0.0.1:8000/upload-resource?studyId=${studyId}`
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
        const data = await sendFileUploadRequest(file);
        console.log(data);

        if (!data?.identifier || !data.name) {
          return;
        }
        const { identifier, name, url, category, study_id } = data;
        // The mutate function is used to asynchronously upload a file and create a resource in the database, with onSuccess and onError callbacks for post-upload handling.
        fileUploadRequest.mutate(
          { identifier, name, url, study_id, category }, // Adjust "pdf" as necessary
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
          }
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
