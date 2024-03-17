"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";
import axios from "axios";
import { usePathname } from "next/navigation";
import { UserAuth } from "@/app/context/AuthContext";
import { HttpStatus } from "@/const";

import { useStudyContext } from "@/app/context/StudyContext";
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
  const studyContext = useStudyContext();
  const [text, setText] = useState("");

  useEffect(() => {
    if (studyContext) {
      setText(studyContext.study?.text || "");
    }
  }, [studyContext]);

  useEffect(() => {
    const saveText = async () => {
      studyContext?.updateWriterContent(text);
    };

    const timer = setTimeout(() => {
      saveText();
    }, 10000);

    return () => clearTimeout(timer);
  }, [text]);

  return (
    <div className="w-full h-screen">
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
