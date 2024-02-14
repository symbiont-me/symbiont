"use client";
import React from "react";
import TextEditor from "@/components/Study/TextEditor";
import ChatComponent from "@/components/ChatComponent/ChatComponentMain";
import StudyNavbar from "@/components/Study/StudyNavbar";
import PdfViewer from "@/components/Study/PdfViewer";
import SciPapers from "@/components/Study/SciPapers";
import VideoViewer from "@/components/Study/VideoViewer";
import AudioPlayer from "@/components/Study/AudioPlayer";
import TestKnowledge from "@/components/Study/TestKnowledge";
import TextEvaluation from "@/components/Study/TextEvaluation";
import Summaries from "@/components/Study/Summaries";
import Resources from "@/components/Study/Resources";
import { ViewSelected } from "@/const";
import axios from "axios";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { UserAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { User } from "firebase/auth";
import LeftSideBarMain from "@/components/LeftSideBar/LeftSideBarMain";
import "@/app/studies/studyStyles.css";
import { Study } from "@/types";
import "@/app/styles.css";
// an object that maps each ViewSelected enum value to a corresponding React component.
// this allows the application to dynamically render different components based on the current view selection
const viewComponents: Record<
  ViewSelected,
  React.ComponentType<{
    textWriterValue: string;
    video_url: string | undefined;
    studyId: string;
    study: Study;
  }>
> = {
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

export default function StudyPage() {
  const authContext = UserAuth();
  const router = useRouter();

  const [viewSelected, setViewSelected] = useState<ViewSelected>(
    ViewSelected.Writer
  );
  const [user, setUser] = useState<User | null>(null);
  // TODO fix
  // NOTE note correct: authContext is undefined on first render and then it is set to the user object
  // and this pushes the user to the home page
  useEffect(() => {
    if (authContext?.user) {
      setUser(authContext.user);
    } else {
      router.push("/");
    }
  }, [authContext, router]);

  // TODO Test and remove the following unused state variables
  const [textWriterValue, setTextWriterValue] = useState<string>("");
  const [video_url, setVideoUrl] = useState<string | undefined>(undefined);
  const [currentStudy, setCurrentStudy] = useState<any>(null); // TODO set to type study
  const path = usePathname();
  const studyId = path.split("/")[2];
  // const chatId = path.split("/")[3]; // NOTE this method can avoid a db call
  const [chatId, setChatId] = useState<number | undefined>(undefined);

  const fetchLinkedChatQuery = useQuery({
    queryKey: ["get-chat", studyId],
    queryFn: async () => {
      const response = await axios.post("/api/get-chat", {
        studyId: studyId,
        userId: user?.uid,
      });
      return response.data.chat_id;
    },
  });

  // TODO make this a GET request
  const fetchStudyQuery = useQuery({
    queryKey: ["get-study", studyId],
    queryFn: async () => {
      const response = await axios.post(`/api/get-study`, {
        studyId: studyId,
      });
      return response.data;
    },
  });

  useEffect(() => {
    if (fetchStudyQuery.data) {
      setCurrentStudy(fetchStudyQuery.data.study[0]);
      // setTextWriterValue(fetchStudyQuery.data.text);
      // setVideoUrl(fetchStudyQuery.data.video_url);
    }
  }, [fetchStudyQuery.data]);

  useEffect(() => {
    if (fetchLinkedChatQuery.data) {
      setChatId(fetchLinkedChatQuery.data);
    }
  }, [fetchLinkedChatQuery.data]);

  if (fetchLinkedChatQuery.isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <span className="loading loading-ring loading-lg"></span>
      </div>
    );
  }

  if (fetchLinkedChatQuery.isError) {
    console.error("Error fetching chat:", fetchLinkedChatQuery.error);
    // TODO: handle error with a toast
  }

  const SelectedViewComponent = viewComponents[viewSelected] || null;

  return (
    <div className="main-container h-screen overflow-hidden">
      <div className="sidebar">
        <LeftSideBarMain />
      </div>
      <div className="main-window">
        <div className="viewer-container">
          <div className="header">
            <StudyNavbar
              setViewSelected={setViewSelected}
              study={currentStudy}
            />
          </div>
          <div className="viewer">
            {SelectedViewComponent && (
              <SelectedViewComponent
                textWriterValue={textWriterValue}
                video_url={video_url}
                studyId={studyId}
                study={currentStudy}
              />
            )}
          </div>
          <div className="chat flex flex-col">
            <ChatComponent chatId={chatId} studyId={studyId} />
          </div>
        </div>
      </div>
    </div>
  );
}
