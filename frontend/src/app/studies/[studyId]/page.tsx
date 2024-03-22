"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { User } from "firebase/auth";
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
import { Container } from "@mui/material";
import Box from "@mui/material/Box";
import "@/app/studies/studyStyles.css";
import "@/app/globals.css";

// an object that maps each ViewSelected enum value to a corresponding React component.
// this allows the application to dynamically render different components based on the current view selection
const viewComponents: { [key in ViewSelected]?: React.ComponentType<any> } = {
  [ViewSelected.Writer]: TextEditor,
  [ViewSelected.PDFViewer]: PdfViewer,
  [ViewSelected.TestKnowledge]: TestKnowledge,
  [ViewSelected.SciencePapers]: SciPapers,
  [ViewSelected.Evaluation]: TextEvaluation,
  [ViewSelected.VideoViewer]: VideoViewer,
  [ViewSelected.AudioPlayer]: AudioPlayer,
  [ViewSelected.Summaries]: Summaries,
  [ViewSelected.Resources]: Resources,
  // Add any other enum values that are missing
};

const StudyPage = () => {
  const authContext = UserAuth();
  const currentStudyContext = useStudyContext();
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
  // TODO the best thing would be to delete this here as Context handles this
  const studyId = path.split("/")[2];
  const SelectedViewComponent = viewComponents[viewSelected] || null;

  useEffect(() => {
    // Check if the authContext is not null and has finished loading the user's authentication status
    if (authContext && !authContext.isAuthLoading) {
      if (authContext.user === null) {
        // No user is logged in, redirect to the landing page
        router.push("/");
      } else {
        // User is logged in, we update the user state
        setUser(authContext.user);
      }
    }
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
    <div className="ml-80">
      <div className="sidebar">
        <LeftSideBarMain />
      </div>
      <div className="main-window">
        <div
          className="viewer-container"
          style={{ height: "calc(100vh - 217px)" }}
        >
          <div className="header">
            <StudyNavbar
              setViewSelected={setViewSelected}
              study={currentStudy as Study}
            />
          </div>
          <Container
            className="overflow-y-auto"
            style={{
              height: "calc(100vh - 250px)",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            <Box sx={{ height: "100vh" }}>
              {SelectedViewComponent && (
                // TODO fix this type error
                <SelectedViewComponent
                  textWriterValue={textWriterValue}
                  studyId={studyId}
                  study={currentStudy}
                />
              )}
            </Box>
          </Container>

          <div
            className="chat flex flex-col"
            style={{ height: "calc(100vh - 225px)" }}
          >
            <ChatComponent studyId={studyId} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyPage;
