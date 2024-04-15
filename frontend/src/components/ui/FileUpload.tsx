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
import { useStudyContext } from "@/app/context/StudyContext";
import { Button } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { styled } from "@mui/material/styles";
import CircularProgress from "@mui/material/CircularProgress";

import useAddResourceRequest, { Headers } from "@/hooks/useAddResourceRequest";
import Alert from "@mui/material/Alert";
const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

// TODO fix toast messages
// TODO update to handle audio file uploads

// The FileUpload component allows users to upload PDF files
const FileUpload = () => {
  const path = usePathname();
  const studyId = path.split("/")[2];
  const authContext = UserAuth();
  const studyContext = useStudyContext();

  const [userToken, setUserToken] = useState<string | undefined>(undefined);

  useEffect(() => {
    async function getUserAuthToken() {
      if (authContext?.user?.getIdToken) {
        const token = await authContext.user.getIdToken();
        setUserToken(token);
      }
    }
    const fetchToken = async () => {
      await getUserAuthToken();
    };
    fetchToken();
  }, [authContext?.user]);

  const { resourceType, resourceStatus, mutation } = useAddResourceRequest();

  const uploadFileResource = (file: File, studyId: string) => {
    const endpoint = `${process.env.NEXT_PUBLIC_BASE_URL}/upload-resource?studyId=${studyId}`;
    const body = new FormData();
    const headers: Headers = {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${userToken}`,
    };
    body.append("file", file);
    const fileType = file.type;

    mutation.mutate({
      endpoint,
      body,
      headers,
      resourceType: fileType,
    });
  };

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
      if (studyContext) {
        uploadFileResource(file, studyId);
      }
    },
  });

  if (!studyContext) {
    return null;
  }
  // Render the dropzone UI
  return (
    <div className="flex flex-col justify-center items-center mr-4 mt-12">
      {mutation.isError && (
        <Alert severity="error">{resourceStatus.error?.message}</Alert>
      )}
      {mutation.isSuccess && (
        <Alert severity="success">
          {resourceType === "application/pdf"
            ? `PDF file was succesfully uploaded!`
            : `Audio file was succesfully uploaded!`}
        </Alert>
      )}
      {mutation.isPending ? (
        <CircularProgress />
      ) : (
        <div {...getRootProps({ className: "dropzone" })}>
          <input {...getInputProps()} />

          <Button
            component="label"
            role={undefined}
            variant="contained"
            tabIndex={-1}
            startIcon={<CloudUploadIcon />}
            sx={{ marginTop: "1rem" }}
          >
            Upload file
            {/* Input handles the upload */}
            {/* <VisuallyHiddenInput {...getInputProps()} /> */}
          </Button>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
