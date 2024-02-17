"use client";
import ProjectCard from "./StudyCard";
import NewStudyCard from "./NewStudyCard";
import { useState, useEffect } from "react";
import axios from "axios";
import { Study } from "@/types";
import "@/app/styles.css";
import LeftSideBar from "@/components/LeftSideBar/LeftSideBarMain";
import StudyCard from "@/components/Study/StudyCard";
import { UserAuth } from "@/app/context/AuthContext";

// TODO use react query to fetch the projects
// TODO add left sidebar if included in the design

const UserDashboard = () => {
  const [projects, setProjects] = useState<Study[]>([]);
  const authContext = UserAuth();
  useEffect(() => {
    async function fetchStudies() {
      const userToken = await authContext?.user?.getIdToken();
      try {
        const response = await axios.post(
          "http://127.0.0.1:8000/get-user-studies",
          {},
          {
            headers: {
              Authorization: `Bearer ${userToken}`,
            },
          }
        );
        setProjects(response.data.studies);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    }
    fetchStudies();
  }, [authContext?.user?.getIdToken()]);

  return (
    <div className="layout">
      {/* Left Sidebar */}
      <div className="sidebar">
        {/* TODO create Sidebar component */}
        <LeftSideBar />
      </div>

      {/* Center Dashboard */}
      <div className="main-window flex flex-row">
        <>
          <NewStudyCard />
        </>

        <div className="w-full h-full flex flex-row">
          {projects.map((project) => (
            <StudyCard key={project.id} study={project} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
