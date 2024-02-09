"use client";
import { useDropzone } from "react-dropzone";
import { uploadFileToS3, getS3Url } from "@/lib/s3";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import ToastMessage from "./ToastMessage";
import { usePathname } from "next/navigation";
import { StudyResource, StudyResourceCategory } from "@/types";
import { uploadToFirebaseStorage } from "@/firebase/uploadToStorage";
// TODO fix toast messages
// TODO update to handle audio file uploads

// The FileUpload component allows users to upload PDF files
const FileUpload = () => {
  const path = usePathname();
  const studyId = path.split("/")[2];
  // TODO use uploading state
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
      // TODO ? Find where is FileKey coming from?
      try {
        // TODO set file type either audio or pdf
        const fileType = "pdf" as StudyResourceCategory;
        // create the resource in the database
        const resourceData: StudyResource = {
          studyId: parseInt(studyId),
          name: fileName,
          url: getS3Url(fileKey),
          identifier: fileKey,
          category: fileType,
        };
        const response = await axios.post("/api/upload-resource", resourceData);

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
        const fireBaseStorageData = await uploadToFirebaseStorage(file);
        console.log(fireBaseStorageData);
        const data = await uploadFileToS3(file);
        if (!data?.fileKey || !data.fileName) {
          return;
        }
        // TODO ?Find what is mutate doing here?
        mutate(data, {
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
