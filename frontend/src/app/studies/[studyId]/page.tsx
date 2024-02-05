"use client";
import React from "react";
import TextEditor from "@/components/Study/TextEditor";
import ChatComponent from "@/components/ChatComponent/ChatComponentMain";
import StudyNavbar from "@/components/Study/StudyNavbar";
import PdfViewer from "@/components/Study/PdfViewer";
import McqTest from "@/components/Study/TestKnowledge";
import SciPapers from "@/components/Study/SciPapers";
import VideoViewer from "@/components/Study/VideoViewer";
import AudioPlayer from "@/components/Study/AudioPlayer";
import TestKnowledge from "@/components/Study/TestKnowledge";
import TextEvaluation from "@/components/Study/TextEvaluation";
import Summaries from "@/components/Study/Summaries";
import Resources from "@/components/Study/Resources";
import { ViewSelected } from "@/const";
import axios from "axios";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import "../../../app/styles.css";

// TODO add sidebar
// TODO add chat component bar on the right
// TODO add pdf viewer
// TODO add video viewer
// TODO add audio player
// TODO add multiple choice quiz

// an object that maps each ViewSelected enum value to a corresponding React component.
// this allows the application to dynamically render different components based on the current view selection
const viewComponents: Record<
  ViewSelected,
  React.ComponentType<{
    textWriterValue: string;
    video_url: string | undefined;
    studyId: string;
  }>
> = {
  // TODO fix the errors
  [ViewSelected.Writer]: TextEditor,
  [ViewSelected.PDFViewer]: PdfViewer,
  [ViewSelected.TestKnowledge]: TestKnowledge,
  [ViewSelected.SciencePapers]: SciPapers,
  [ViewSelected.Evaluation]: TextEvaluation,
  [ViewSelected.VideoViewer]: VideoViewer,
  [ViewSelected.AudioPlayer]: AudioPlayer,
  [ViewSelected.Summaries]: Summaries,
  [ViewSelected.Resources]: Resources,
};

type StudyPageProps = {
  pdfUrl: string | undefined;
};

const StudyPage: React.FC<StudyPageProps> = ({ pdfUrl }: StudyPageProps) => {
  const [viewSelected, setViewSelected] = useState<ViewSelected>(
    ViewSelected.Writer,
  );
  const [pdfs, setPdfs] = useState<string[]>([]);
  const [textWriterValue, setTextWriterValue] = useState<string>("");
  const [video_url, setVideoUrl] = useState<string | undefined>(undefined);
  const path = usePathname();
  const studyId = path.split("/")[2];
  // const chatId = path.split("/")[3]; // NOTE this method can avoid a db call
  const [chatId, setChatId] = useState<number | undefined>(undefined);

  const fetchLinkedChat = async () => {
    try {
      const response = await axios.post("/api/get-chat", {
        studyId: studyId,
      });
      setChatId(response.data.chat_id);
    } catch (error) {
      console.error("Error fetching chat:", error);
    }
  };
  fetchLinkedChat();

const SelectedViewComponent = viewComponents[viewSelected] || null;

return (
  <div className="study-container w-full h-screen">
    <div className="study-nav">
      <StudyNavbar setViewSelected={setViewSelected} />
    </div>
    <div className="view-container">
      {SelectedViewComponent && <SelectedViewComponent studyId={studyId} />}
    </div>
    <div className="chat-container">
      <ChatComponent chatId={chatId} />
    </div>
  </div>
);
};

export default StudyPage;
