"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { User } from "firebase/auth";
import { Study } from "@/types";
import { ViewSelected } from "@/const";
import { UserAuth } from "@/app/context/AuthContext";
import { CurrentStudy } from "@/app/context/StudyContext";
import LeftSideBarMain from "@/components/LeftSideBar/LeftSideBarMain";
import StudyNavbar from "@/components/Study/StudyNavbar";
import TextEditor from "@/components/Study/TextEditor";
import PdfViewer from "@/components/Study/PdfViewer";
import SciPapers from "@/components/Study/SciPapers";
import VideoViewer from "@/components/Study/VideoViewer";
import AudioPlayer from "@/components/Study/AudioPlayer";
import TestKnowledge from "@/components/Study/TestKnowledge";
import TextEvaluation from "@/components/Study/TextEvaluation";
import Summaries from "@/components/Study/Summaries";
import Resources from "@/components/Study/Resources";
import ChatComponent from "@/components/ChatComponent/ChatComponentMain";

import "@/app/studies/studyStyles.css";
import "@/app/globals.css";

// an object that maps each ViewSelected enum value to a corresponding React component.
// this allows the application to dynamically render different components based on the current view selection
const viewComponents = {
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

const StudyPage = () => {
  const authContext = UserAuth();
  const currentStudyContext = CurrentStudy();
  const router = useRouter();
  const path = usePathname();
  const [currentStudy, setCurrentStudy] = useState<Study | undefined>(
    undefined
  );
  const [loading, setLoading] = useState(true);
  const [viewSelected, setViewSelected] = useState<ViewSelected>(
    ViewSelected.Writer
  );
  const [user, setUser] = useState<User | null>(null);
  // TODO update the writer state in its own comaponent
  const [textWriterValue, setTextWriterValue] = useState<string>("");
  const studyId = path.split("/")[2];
  const SelectedViewComponent = viewComponents[viewSelected] || null;

  useEffect(() => {
    if (!authContext) {
      router.push("/");
    } else {
      setUser(authContext.user);
    }
    setLoading(false);
  }, [authContext, router]);

  useEffect(() => {
    if (currentStudyContext && currentStudyContext.study) {
      setCurrentStudy(currentStudyContext.study);
    }
  }, [currentStudyContext]);

  useEffect(() => {
    if (currentStudy) {
      setLoading(false);
    }
  }, [currentStudy]);

  if (loading) {
    return <div></div>;
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
              // TODO fix this type error
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
};

export default StudyPage;
