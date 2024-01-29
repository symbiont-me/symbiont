"use client"
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
import { ViewSelected } from "@/const";
import {db} from "@/lib/db";
import {studies, chats} from "@/lib/db/schema";
import {eq} from "drizzle-orm";
import axios from 'axios';
import {useState, useEffect} from 'react';



// TODO add sidebar
// TODO add chat component bar on the right
// TODO add pdf viewer
// TODO add video viewer
// TODO add audio player
// TODO add multiple choice quiz


// an object that maps each ViewSelected enum value to a corresponding React component.
// this allows the application to dynamically render different components based on the current view selection
const viewComponents: Record<ViewSelected, React.ComponentType<{ pdfUrl: string | undefined, textWriterValue: string, video_url:string | undefined}>> = {
  [ViewSelected.Writer]: TextEditor,
  [ViewSelected.PDFViewer]: PdfViewer,
  [ViewSelected.TestKnowledge]: TestKnowledge, 
  [ViewSelected.SciencePapers]: SciPapers, 
  [ViewSelected.Evaluation] : TextEvaluation,
  [ViewSelected.VideoViewer]: VideoViewer,
  [ViewSelected.AudioPlayer]: AudioPlayer,
  [ViewSelected.Summaries]: Summaries
};

type StudyPageProps = {
  pdfUrl: string | undefined;

}

const StudyPage: React.FC<StudyPageProps> = ({pdfUrl}: StudyPageProps) => {
  const [viewSelected, setViewSelected] =useState<ViewSelected>(ViewSelected.Writer);
  const [pdfs, setPdfs] = useState<string[]>([]);
  const [textWriterValue, setTextWriterValue] = useState<string>('');
  const [video_url, setVideoUrl] = useState<string | undefined>(undefined);


  useEffect(() => {
    const fetchPDFs = async () => {
      try {
        const response = await axios.post('/api/get-pdfs', { studyId: 1});
        // TODO add pdfUrl to state
        setPdfs(response.data);
      } catch (error) {
        console.error('Error fetching PDFs:', error);
      }
    };

    fetchPDFs();
  }, []);
  

  const SelectedViewComponent = viewComponents[viewSelected] || null;

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <StudyNavbar setViewSelected={setViewSelected} />
      <div className="flex flex-row  ">
        {/* <Sidebar /> */}
        
        
        {SelectedViewComponent && <SelectedViewComponent  pdfUrls={pdfs}/>}
        <ChatComponent />
      </div>
    </div>
  );
};

export default StudyPage;


