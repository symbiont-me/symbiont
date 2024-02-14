"use client";
import ProjectCard from "./StudyCard";
import NewStudyCard from "./NewStudyCard";
import { useState, useEffect } from "react";
import axios from "axios";
import { Study } from "@/types";
import "@/app/styles.css";
import LeftSideBar from "@/components/LeftSideBar/LeftSideBarMain";
import StudyCard from "@/components/Study/StudyCard";
// TODO use react query to fetch the projects
// TODO add left sidebar if included in the design
type UserDashboardProps = {
  userId: string;
};

const UserDashboard = ({ userId }: UserDashboardProps) => {
  const [projects, setProjects] = useState<Study[]>([]);

  useEffect(() => {
    async function fetchStudies() {
      try {
        const response = await axios.post("/api/get-studies", { userId });
        setProjects(response.data);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    }
    fetchStudies();
  }, [userId]);

  return (
    <div className="main-container">
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
