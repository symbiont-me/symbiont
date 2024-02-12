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
import "../../../app/styles.css";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { UserAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { User } from "firebase/auth";
import LeftSideBarMain from "@/components/LeftSideBar/LeftSideBarMain";

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

  useEffect(() => {
    if (fetchLinkedChatQuery.data) {
      setChatId(fetchLinkedChatQuery.data);
    }
  }, [fetchLinkedChatQuery.data]);

  if (fetchLinkedChatQuery.isLoading) {
    return <div>Loading...</div>;
  }

  if (fetchLinkedChatQuery.isError) {
    console.error("Error fetching chat:", fetchLinkedChatQuery.error);
    // TODO: handle error with a toast
  }

  const SelectedViewComponent = viewComponents[viewSelected] || null;

  return (
    <div className="h-screen">
      <div className="study-container h-full w-full">
        <div className="left-sidebar">
          <LeftSideBarMain />
        </div>
        <div className="study-nav">
          <StudyNavbar setViewSelected={setViewSelected} studyId={studyId} />
        </div>
        <div className="view-container">
          {SelectedViewComponent && <SelectedViewComponent studyId={studyId} />}
        </div>
        <div className="chat-container">
          <ChatComponent chatId={chatId} />
        </div>
      </div>
    </div>
  );
}
