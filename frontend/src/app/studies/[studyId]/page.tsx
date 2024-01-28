import TextEditor from "@/components/Study/TextEditor";
import ChatComponent from "@/components/ChatComponent";
import StudyNavbar from "@/components/Study/StudyNavbar";

import React from "react";

// TODO add sidebar
// TODO add chat component bar on the right
// TODO add pdf viewer
// TODO add video viewer
// TODO add audio player
// TODO add multiple choice quiz

const StudyPage: React.FC = () => {
  return (
    <div>
      {/* TODO center this */}
      <StudyNavbar />
    <div className="flex flex-row h-screen">
      
        <TextEditor />
        <ChatComponent />
      
    </div>
    </div>
  );
};

export default StudyPage;
