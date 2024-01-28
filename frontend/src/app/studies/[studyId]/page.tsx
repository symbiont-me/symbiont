"use client"
import React from "react";
import TextEditor from "@/components/Study/TextEditor";
import ChatComponent from "@/components/ChatComponent";
import StudyNavbar from "@/components/Study/StudyNavbar";
import PdfViewer from "@/components/PdfViewer";
import McqTest from "@/components/Study/MCQTest";
import SciPapers from "@/components/Study/SciPapers";
import { ViewSelected } from "@/const";

// an object that maps each ViewSelected enum value to a corresponding React component.
// this allows the application to dynamically render different components based on the current view selection
const viewComponents: Record<ViewSelected, React.ComponentType<{ pdfUrl: string | undefined}>> = {
  [ViewSelected.Writer]: TextEditor,
  [ViewSelected.PDFViewer]: PdfViewer,
  [ViewSelected.MCQTest]: McqTest, 
  [ViewSelected.SciencePapers]: SciPapers, 
};

type StudyPageProps = {
  pdfUrl: string | undefined;

}

const StudyPage: React.FC<StudyPageProps> = ({pdfUrl}: StudyPageProps) => {
  const [viewSelected, setViewSelected] = React.useState<ViewSelected>(ViewSelected.Writer);

  const SelectedViewComponent = viewComponents[viewSelected] || null;

  return (
    <div>
      <StudyNavbar setViewSelected={setViewSelected} />
      <div className="flex flex-row h-screen">
        {/* <Sidebar /> */}
        
        {SelectedViewComponent && <SelectedViewComponent  pdfUrl={pdfUrl}/>}
        <ChatComponent />
      </div>
    </div>
  );
};

export default StudyPage;


// TODO add sidebar
// TODO add chat component bar on the right
// TODO add pdf viewer
// TODO add video viewer
// TODO add audio player
// TODO add multiple choice quiz
