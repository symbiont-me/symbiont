"use client";
import NewStudyCard from "./NewStudyCard";
import { useState, useEffect } from "react";
import { Study } from "@/types";
import "@/app/styles.css";
import LeftSideBar from "@/components/LeftSideBar/LeftSideBarMain";
import StudyCard from "@/components/Study/StudyCard";
import { useStudyContext } from "@/app/context/StudyContext";
import Box from "@mui/material/Box";
import { Container } from "@mui/material";
import Grid from "@mui/material/Grid";
import Item from "@mui/material/Grid";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import UserGuideSwipe from "@/components/ui/UserGuideSwipe";
import "./styles.css";

const UserDashboard = () => {
  const studyContext = useStudyContext();
  const [studies, setStudies] = useState<Study[]>([]);

  useEffect(() => {
    if (studyContext && studyContext.allStudies) {
      setStudies(studyContext.allStudies);
    }
  }, [studyContext, studies]);

  function fetchStudies() {
    if (studyContext && studyContext.allStudies) {
      setStudies(studyContext.allStudies);
      return studyContext.allStudies;
    }
  }

  const alerts = [
    "This app is currently in development and test mode.",
    "Please don't upload sensitive data - expect bugs and unfinished features.",
    "Expect data to be deleted without warning.",
    "Note: Other than that feel free to use the app and give feedback.",
  ];

  return (
    <div className="dashboard-container overflow-hidden h-screen ">
      <div className="left-sidebar">
        <LeftSideBar />
      </div>
      <div className="dashboard  overflow-hidden flex flex-col justify-center items-center">
        <Alert
          variant="outlined"
          severity="warning"
          sx={{
            width: "55%",
            marginTop: "5px",
            marginBottom: "5px",
            padding: 2,
            paddingTop: 0,
            paddingBottom: 0,
          }}
        >
          <ul>
            {alerts.map((alert, index) => {
              return (
                <li key={index} className="text-xs">
                  {alert}
                </li>
              );
            })}
          </ul>
        </Alert>
        <div
          className="h-full flex flex-row mb-2"
          style={{ maxWidth: "1024px", minWidth: "1024px" }}
        >
          <div className="flex flex-row items-center overflow-x-scroll max-w-full">
            {studies.map((study) => (
              <Item className="m-2" key={study._id} sx={{ minWidth: "250px" }}>
                <StudyCard study={study} />
              </Item>
            ))}
          </div>
        </div>
        <NewStudyCard onNewStudyCreated={fetchStudies} />

        <UserGuideSwipe />
      </div>
    </div>
  );
};

export default UserDashboard;
