"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";

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
  const currentStudyContext = useStudyContext();
  const [text, setText] = useState("");
  const [textSaved, setTextSaved] = useState(false);

  useEffect(() => {
    if (currentStudyContext && currentStudyContext.study?.text) {
      setText(currentStudyContext.study?.text);
    }
  }, [currentStudyContext?.study?.text]);

  useEffect(() => {
    const saveText = async () => {
      currentStudyContext?.updateWriterContent(text);
    };

    const timer = setTimeout(() => {
      saveText();
      setTextSaved(true);
    }, 3000);
    setTextSaved(false);
    return () => clearTimeout(timer);
  }, [text]);

  return (
    <div className="w-full ">
      <ReactQuill
        className="ql-container q-snow"
        theme="snow"
        value={text}
        onChange={setText}
        style={{ height: "calc(100vh - 125px)", borderRadius: "5px" }}
      />
    </div>
  );
};

export default TextEditor;
