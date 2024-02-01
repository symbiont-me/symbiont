"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";
import axios from "axios";
import { useAuth } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
// TODO on render, fetch text from db and set value to that text

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

export default function TextEditor() {
  const auth = useAuth();
  const [text, setText] = useState("");

  // NOTE I don't like doing it this way
  const path = usePathname();
  const studyId = path.split("/")[2];

  if (!auth) {
    return <div>Please Log in </div>;
  }

  useEffect(() => {
    const saveText = async () => {
      try {
        const response = await axios.post("/api/save-writer-text", {
          // TODO fix studyTextId and studyId
          studyId: studyId,
          userId: auth.userId,
          studyTextContent: text,
        });
        if (response.status === 200) {
          console.log("text saved");
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
    <div className="w-full h-screen">
      <ReactQuill className="h-screen" theme="snow" value={text} onChange={setText} />
    </div>
  );
}
