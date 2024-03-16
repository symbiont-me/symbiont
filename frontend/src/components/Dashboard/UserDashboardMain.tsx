"use client";
import NewStudyCard from "./NewStudyCard";
import { useState, useEffect } from "react";
import { Study } from "@/types";
import "@/app/styles.css";
import LeftSideBar from "@/components/LeftSideBar/LeftSideBarMain";
import StudyCard from "@/components/Study/StudyCard";
import { useStudyContext } from "@/app/context/StudyContext";
import { Box } from "@mui/system";
import { Container } from "@mui/material";
import Grid from "@mui/material/Grid";
import Item from "@mui/material/Grid";
import CircularProgress from "@mui/material/CircularProgress";

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
    <div className="">
      <LeftSideBar />
      <Grid container spacing={2} justifyContent="center" alignItems="center">
        <div className="flex flex-row mt-20">
          <NewStudyCard onNewStudyCreated={fetchStudies} />
          {studies.map((study) => (
            <Item className="m-2" key={study.id}>
              <StudyCard study={study} />
            </Item>
          ))}
        </div>
      </Grid>
    </div>
  );
};

export default UserDashboard;
