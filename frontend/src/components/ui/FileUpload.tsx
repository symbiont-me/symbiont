"use client";
import { useDropzone } from "react-dropzone";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import ToastMessage from "./ToastMessage";
import { usePathname } from "next/navigation";
import { StudyResource, StudyResourceCategory } from "@/types";
import { uploadToFirebaseStorage } from "@/firebase/uploadToStorage";
import { UserAuth } from "@/app/context/AuthContext";
import { useEffect } from "react";
import { CurrentStudy } from "@/app/context/StudyContext";

// TODO fix toast messages
// TODO update to handle audio file uploads

type FileUploadData = {
  study_id: string;
  identifier: string;
  name: string;
  url: string;
  category: string;
};

async function sendFileUploadRequest(
  file: File,
  studyId: string,
  userToken: string
): Promise<FileUploadData> {
  const endpoint = `http://127.0.0.1:8000/upload-resource?studyId=${studyId}`;
  const formData = new FormData();
  formData.append("file", file);
  const body = formData;

  console.log(userToken);
  const headers = {
    "Content-Type": "multipart/form-data",
    Authorization: `Bearer ${userToken}`,
  };
  const response = await axios.post(endpoint, body, { headers });
  return response.data.resource;
}

// The FileUpload component allows users to upload PDF files
const FileUpload = () => {
  const path = usePathname();
  const studyId = path.split("/")[2];
  // TODO use uploading state
  const [uploading, setUploading] = useState(false);
  const authContext = UserAuth();
  const studyContext = CurrentStudy();
  if (!studyContext) {
    return null;
  }
  const [userToken, setUserToken] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  async function getUserAuthToken() {
    if (authContext?.user?.getIdToken) {
      const token = await authContext.user.getIdToken();
      setUserToken(token);
    }
  }

  useEffect(() => {
    const fetchToken = async () => {
      await getUserAuthToken();
      setLoading(false);
    };
    fetchToken();
  }, []);

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
        if (userToken) {
          const uploadResponse = await sendFileUploadRequest(
            file,
            studyId,
            userToken
          );
          if (uploadResponse) {
            setUploading(false);
          }
          if (studyContext) {
            studyContext?.uploadFileResource("pdf");
          }
        }
      } catch (error) {
        console.log(error);
      }
    },
  });
  // Render the dropzone UI
  return (
    <div className="flex justify-center items-start mr-4 mt-2">
      {uploading ? (
        <span className="loading loading-dots loading-sm"></span>
      ) : (
        <div {...getRootProps({ className: "dropzone" })}>
          <input {...getInputProps()} />
          <input
            type="file"
            className="file-input file-input-bordered file-input-primary w-full max-w-xs"
          />
        </div>
      )}
    </div>
  );
};

export default FileUpload;
