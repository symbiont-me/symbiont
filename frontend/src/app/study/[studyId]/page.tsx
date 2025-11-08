"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { User } from "../../../types";
import { Study } from "@/types";
import { ViewSelected } from "@/const";
import { UserAuth } from "@/app/context/AuthContext";
import { useStudyContext } from "@/app/context/StudyContext";
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
import { Card, CardContent } from "@/components/ui/card";
import "@/app/studies/studyStyles.css";
import "@/app/globals.css";
import StudyInfo from "@/components/Study/StudyInfo";
import Loader from "../../../components/Loader";
import Session from "supertokens-auth-react/recipe/session";
import useAuthRedirect from "@/hooks/useAuthRedirect";

// an object that maps each ViewSelected enum value to a corresponding React component.
// this allows the application to dynamically render different components based on the current view selection
const viewComponents: { [key in ViewSelected]?: React.ComponentType<any> } = {
  [ViewSelected.Writer]: TextEditor,
  [ViewSelected.PDFViewer]: PdfViewer,
  // [ViewSelected.TestKnowledge]: TestKnowledge,
  // [ViewSelected.SciencePapers]: SciPapers,
  // [ViewSelected.Evaluation]: TextEvaluation,
  [ViewSelected.VideoViewer]: VideoViewer,
  // [ViewSelected.AudioPlayer]: AudioPlayer,
  [ViewSelected.Summaries]: Summaries,
  [ViewSelected.Resources]: Resources, // TODO name this properly or replace with the correct component
  // Add any other enum values that are missing
};

const StudyPage = () => {
  const { isLoggedIn, loading } = useAuthRedirect();
  const currentStudyContext = useStudyContext();
  const path = usePathname();
  const [currentStudy, setCurrentStudy] = useState<Study | undefined>(
    undefined
  );

  const [viewSelected, setViewSelected] = useState<ViewSelected>(
    ViewSelected.Writer
  );

  // TODO update the writer state in its own comaponent
  const [textWriterValue, setTextWriterValue] = useState<string>("");

  // TODO the best thing would be to delete this here as Context handles this
  const studyId = path.split("/")[2];
  const SelectedViewComponent = viewComponents[viewSelected] || null;
  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }
    setCurrentStudy(currentStudyContext?.study);
  }, [currentStudyContext?.study]);

  if (loading) {
    return <Loader />;
  }

  return (
    // @note the top class is used to set the distance from the left side bar
    <div className="ml-40">
      <div className="sidebar">
        <LeftSideBarMain />
      </div>

      <div className="viewer-container bg-background" style={{ height: "100vh" }}>
        {/* TODO add it some place else as it takes space from the top */}
        {/* <div className="header">
            <StudyInfo study={currentStudy} />
          </div> */}
        <div className="study-navv p-4 border-b bg-card">
          <StudyNavbar
            setViewSelected={setViewSelected}
            study={currentStudy as Study}
          />
        </div>
        <div
          className="overflow-y-auto"
          style={{
            height: "calc(100vh - 120px)",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          <div className="h-full p-4">
            {SelectedViewComponent && (
              <Card className="h-full border-0 shadow-sm">
                <CardContent className="p-6 h-full">
                  <SelectedViewComponent
                    textWriterValue={textWriterValue}
                    studyId={studyId}
                    study={currentStudy}
                  />
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <div className="chat flex flex-col m-4 mb-0">
          <Card className="border shadow-sm">
            <CardContent className="p-0">
              <ChatComponent studyId={studyId} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudyPage;