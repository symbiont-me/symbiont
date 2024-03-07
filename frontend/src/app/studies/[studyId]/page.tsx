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
import { Study } from "@/types";
import "@/app/studies/studyStyles.css";
import "@/app/globals.css";
import { useFetchUserStudies } from "@/hooks/useFetchStudies";

// an object that maps each ViewSelected enum value to a corresponding React component.
// this allows the application to dynamically render different components based on the current view selection
// TODO only pass Study to the components down the tree, studyId is available in the pathname
const viewComponents: Record<
  ViewSelected,
  React.ComponentType<{
    textWriterValue: string;
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
  const [studies, setStudies] = useState<Study[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewSelected, setViewSelected] = useState<ViewSelected>(
    ViewSelected.Writer
  );

  const [user, setUser] = useState<User | null>(null);
  // TODO remove this as only the current study should be in state
  const { data, isLoading, isError, error } = useFetchUserStudies();

  useEffect(() => {
    if (!authContext) {
      router.push("/");
    } else {
      setUser(authContext.user);
    }
    setLoading(false);
  }, [authContext, router]);

  // TODO update the writer state in its own component
  const [textWriterValue, setTextWriterValue] = useState<string>("");
  const [currentStudy, setCurrentStudy] = useState<any>(null); // TODO set to type study
  const path = usePathname();
  const studyId = path.split("/")[2];
  const SelectedViewComponent = viewComponents[viewSelected] || null;

  // TODO fetch study here and then pass it down the tree

  useEffect(() => {
    if (data) {
      console.log(data.studies);
      setStudies(data.studies);
    }
  }, [data]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error: {error?.message}</div>;
  }
  return (
    <div className="layout">
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
                studyId={studyId}
                study={currentStudy}
              />
            )}
          </div>
          <div className="chat flex flex-col h-screen">
            <ChatComponent studyId={studyId} />
          </div>
        </div>
      </div>
    </div>
  );
}
