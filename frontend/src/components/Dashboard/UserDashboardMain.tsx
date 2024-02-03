"use client";
import LeftSidebar from "../LeftSidebar";
import ProjectCard from "./StudyCard";
import NewStudyCard from "./NewStudyCard";
import { useState, useEffect } from "react";
import axios from "axios";
import { Study } from "@/app/types";

// TODO use react query to fetch the projects
type UserDashboardProps = {
  userId: string;
};

export default function UserDashboard({ userId }: UserDashboardProps) {
  const [projects, setProjects] = useState<Study[]>([]);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const response = await axios.post("/api/get-studies", { userId });
        setProjects(response.data);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    }

    fetchProjects();
  }, []);

  return (
    <div className="m-10">
      {/* Left Sidebar */}
      {/* Center Dashboard */}
      <div className="">
        <div className="grid grid-cols-4 gap-4">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              name={project.name}
              image={project.image}
            />
          ))}

          <div className="border p-4">
            <NewStudyCard />
          </div>
        </div>
      </div>
    </div>
  );
}
