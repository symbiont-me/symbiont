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
    <div className="dashboard-container">
      {/* Left Sidebar */}
      <div className="left-sidebar">
        {/* TODO create Sidebar component */}
        <LeftSideBar />
      </div>

      {/* Navbar */}
      <div className="navbar">
        {/* TODO create Navbar component */}
        <div className="h-16 bg-symbiont-foreground rounded-b-2xl w-full m-2 mt-2"></div>
      </div>

      {/* Center Dashboard */}
      <div className="dashboard flex flex-row">
        <div>
          <NewStudyCard />
        </div>

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
