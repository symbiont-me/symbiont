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
import { useQuery } from "@tanstack/react-query";

const fetchUserStudies = async (userToken: string) => {
  const response = await axios.post(
    "http://127.0.0.1:8000/get-user-studies",
    {},
    {
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    }
  );
  return response.data;
};

// TODO use a custom hook to fetch the user studies and use it here and in the left sidebar
const UserDashboard = () => {
  const [studies, setStudies] = useState<Study[]>([]);
  const authContext = UserAuth();
  const userTokenPromise = authContext?.user?.getIdToken();

  const fetchStudiesQuery = useQuery({
    queryKey: ["get-studies", userTokenPromise],
    queryFn: () =>
      userTokenPromise
        ? userTokenPromise.then((token) => fetchUserStudies(token))
        : Promise.reject("No user token"),
    enabled: !!userTokenPromise, // This will ensure the query does not run until the token is available
  });

  useEffect(() => {
    if (fetchStudiesQuery.data) {
      setStudies(fetchStudiesQuery.data.studies);
    }
  }, [fetchStudiesQuery.data]);

  if (fetchStudiesQuery.isLoading) {
    return <div>Loading...</div>;
  }

  if (fetchStudiesQuery.isError) {
    return <div>Error: {fetchStudiesQuery.error.message}</div>;
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
