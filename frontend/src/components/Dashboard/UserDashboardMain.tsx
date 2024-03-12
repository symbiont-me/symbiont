"use client";
import NewStudyCard from "./NewStudyCard";
import { useState, useEffect } from "react";
import { Study } from "@/types";
import "@/app/styles.css";
import LeftSideBar from "@/components/LeftSideBar/LeftSideBarMain";
import StudyCard from "@/components/Study/StudyCard";
import { useStudyContext } from "@/app/context/StudyContext";
// NOTE without ContextApi one way to update studies when deleted would be here in the UserDashboard component
const UserDashboard = () => {
  const studyContext = useStudyContext();
  const [studies, setStudies] = useState<Study[]>([]);

  useEffect(() => {
    if (studyContext && studyContext.allStudies) {
      setStudies(studyContext.allStudies);
    }
  }, [studyContext]);

  return (
    <div className="layout">
      <div className="sidebar">
        <LeftSideBar />
      </div>

      {/*  Dashboard */}
      <div className="main-window flex flex-row">
        <>
          <NewStudyCard />
        </>

        <div className="w-full h-full flex flex-row">
          {studies.map((study) => (
            <StudyCard key={study.id} study={study} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
