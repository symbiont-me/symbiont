"use client";
import ProjectCard from "./StudyCard";
import NewStudyCard from "./NewStudyCard";
import { useState, useEffect } from "react";
import axios from "axios";
import { Study } from "@/types";
import "@/app/styles.css";
import LeftSideBar from "@/components/LeftSideBar/LeftSideBarMain";
import StudyCard from "@/components/Study/StudyCard";
import { useFetchUserStudies } from "@/hooks/useFetchStudies";

const UserDashboard = () => {
  const [studies, setStudies] = useState<Study[]>([]);
  const { data, isLoading, isError, error } = useFetchUserStudies();
  useEffect(() => {
    if (data) {
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
