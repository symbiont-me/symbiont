"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";
import axios from "axios";
import { usePathname } from "next/navigation";
import { UserAuth } from "@/app/context/AuthContext";
import { HttpStatus } from "@/const";
import { useFetchWriterText } from "@/hooks/useFetchWriterText";
// TODO on render, fetch text from db and set value to that text

// TODO move inside the component
// NOTE this fixes the issue with document not being defined at initial render
// ref: https://github.com/zenoamaro/react-quill/issues/292
const ReactQuill = dynamic(() => import("react-quill"), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center items-center h-screen">
      <span className="loading loading-dots loading-md"></span>
    </div>
  ),
});

async function updatWriterText(
  userToken: string,
  studyId: string,
  text: string
) {
  const response = await axios.post(
    "http://127.0.0.1:8000/update-text",
    {
      studyId: studyId,
      text: text,
    },

    {
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    }
  );
  return response;
}

const TextEditor = () => {
  const [text, setText] = useState("");
  const path = usePathname();
  const studyId = path.split("/")[2];
  const authContext = UserAuth();

  const { data: writerText } = useFetchWriterText(studyId);

  useEffect(() => {
    if (writerText) {
      setText(writerText.text);
    }
  }, [writerText]);

  useEffect(() => {
    const saveText = async () => {
      try {
        const userToken = await authContext?.user?.getIdToken();
        if (userToken) {
          const response = await updatWriterText(userToken, studyId, text);
          if (response && response.status === HttpStatus.OK) {
            console.log("Text Updated");
          }
        }
      } catch (error) {
        throw error;
      }
    };

    const timer = setTimeout(() => {
      saveText();
    }, 10000);

    return () => clearTimeout(timer);
  }, [text]);

  return (
    <div className="w-full bg-symbiont-foreground rounded-2xl h-full">
      <ReactQuill
        className="ql-container q-snow"
        theme="snow"
        value={text}
        onChange={setText}
      />
    </div>
  );
};

export default TextEditor;
