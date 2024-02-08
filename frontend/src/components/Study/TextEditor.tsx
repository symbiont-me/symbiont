"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";
import axios from "axios";
import { usePathname } from "next/navigation";
import {UserAuth} from "@/app/context/AuthContext";
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

const TextEditor = () => {
  const [text, setText] = useState("");
  const {user} = UserAuth();

  // NOTE I don't like doing it this way
  const path = usePathname();
  const studyId = path.split("/")[2];

  const user_id = user?.uid;
  useEffect(() => {
    const saveText = async () => {
      try {
        const response = await axios.post("/api/save-writer-text", {
          // TODO fix studyTextId and studyId
          studyId: studyId,
          userId: user_id,
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
      <ReactQuill
        className="h-screen"
        theme="snow"
        value={text}
        onChange={setText}
      />
    </div>
  );
};

export default TextEditor;
