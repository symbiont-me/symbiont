"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";

import { useStudyContext } from "@/app/context/StudyContext";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), {
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
    <div className="w-full">
      <MDEditor
        value={text}
        onChange={(val) => setText(val || "")}
        height={600}
        preview="edit"
        hideToolbar={false}
        visibleDragBar={false}
        data-color-mode="light"
        style={{
          backgroundColor: 'white',
        }}
      />
    </div>
  );
};

export default TextEditor;
