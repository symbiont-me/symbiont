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
const UserDashboard = () => {
  const studyContext = useStudyContext();
  const [studies, setStudies] = useState<Study[]>([]);

  useEffect(() => {
    if (studyContext && studyContext.allStudies) {
      setStudies(studyContext.allStudies);
    }
  }, [studyContext, studies]);

  const fetchStudies = () => {
    if (studyContext && studyContext.allStudies) {
      setStudies(studyContext.allStudies);
    }
  };
  return (
    <>
      <div>
        <Alert
          variant="outlined"
          severity="warning"
          sx={{
            width: "55%",
            margin: "auto",
            marginTop: "20px",
            marginBottom: "20px",
          }}
        >
          <ul>
            <li>This app is currently in development and test mode.</li>
            <li>
              Please don&apos;t upload sensitive data - expect bugs and
              unfinished features.
            </li>
            <li>Expect data to be deleted without warning.</li>
            <li>
              <strong>Note:</strong> Other than that feel free to use the app
              and give feedback.
            </li>
          </ul>
        </Alert>

        <UserGuideSwipe />
        <div className="ml-80 h-full flex flex-row">
          <div className="flex flex-wrap">
            <NewStudyCard onNewStudyCreated={fetchStudies} />

            {studies.map((study) => (
              <Item className="m-2" key={study.id}>
                <StudyCard study={study} />
              </Item>
            ))}
          </div>
        </div>
      </div>
      <LeftSideBar />
    </>
  );
};

export default UserDashboard;
