"use client";
import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { UserAuth } from "@/app/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { Study } from "@/types";

type StudyContextType = {
  study: Study | undefined;
  deleteChatMessages: (studyId: string) => void;
  uploadFileResource: (resourceType: string) => void;
  uploadYtResource: (studyId: string, link: string) => void;
};

export const StudyContext = createContext<StudyContextType | undefined>(
  undefined
);

// TODO update to filter studies by studyId on the backend
const fetchUserStudies = async (userToken: string) => {
  const url = "http://127.0.0.1:8000/get-user-studies";

  const headers = {
    Authorization: `Bearer ${userToken}`,
  };
  const response = await axios.get(url, { headers });
  return response.data;
};

export const StudyProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [study, setStudy] = useState<Study | undefined>(undefined);
  const studyId = usePathname().split("/")[2];
  const authContext = UserAuth();
  const userTokenPromise = authContext?.user?.getIdToken();
  const [userToken, setUserToken] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (userTokenPromise) {
      userTokenPromise.then((token) => {
        setUserToken(token);
      });
    }
  }, [userTokenPromise]);

  async function deleteChatMessages(studyId: string) {
    const url = `http://127.0.0.1:8000/delete-chat-messages?studyId=${studyId}`;

    const headers = {
      Authorization: `Bearer ${userToken}`,
    };
    const response = await axios.delete(url, { headers });
    if (response.status === 200 && study) {
      console.log("Chat Messages Deleted");
      setStudy({ ...study, chatMessages: [] });
      console.log("Refetching Studies...");
      fetchStudiesQuery.refetch();
    }
  }

  async function uploadYtResource(studyId: string, link: string) {
    const endpoint = `http://127.0.0.1:8000/process-youtube-video`;
    const body = { studyId: studyId, url: link };
    const headers = { Authorization: `Bearer ${userToken}` };
    const response = await axios.post(endpoint, body, { headers });
    if (response.status === 200) {
      console.log("YouTube Video Uploaded");
      fetchStudiesQuery.refetch();
    }
  }
  async function uploadFileResource(resourceType: string) {
    if (study && resourceType === "pdf") {
      setStudy({
        ...study,
        resources: [...(study.resources ?? []), { category: "pdf" }],
      });
    }
    if (study && resourceType === "web") {
      setStudy({
        ...study,
        resources: [...(study.resources ?? []), { category: "web" }],
      });
    }
    fetchStudiesQuery.refetch();
  }

  const fetchStudiesQuery = useQuery({
    queryKey: ["get-studies", userTokenPromise],
    queryFn: () =>
      userToken ? fetchUserStudies(userToken) : Promise.reject("No token"),
    enabled: !!userToken, // This will ensure the query does not run until the token is available
  });

  useEffect(() => {
    if (fetchStudiesQuery.data && studyId) {
      const currentStudy = fetchStudiesQuery.data.studies.filter(
        (study: Study) => {
          if (study.id === studyId) {
            return study;
          }
        }
      );
      console.log("Current Study", currentStudy);
      setStudy(currentStudy[0]);
    }
  }, [fetchStudiesQuery.data, studyId]);

  useEffect(() => {
    console.log("Study From Context", study);
  });

  if (fetchStudiesQuery.isLoading) {
    return <div>Loading...</div>;
  }

  if (fetchStudiesQuery.isError) {
    return <div>Error: {fetchStudiesQuery.error.message}</div>;
  }

  if (!authContext) {
    return <div>Loading...</div>;
  }
  // TODO if authContext is available but userId is not, display the landing page

  return (
    <StudyContext.Provider
      value={{
        study,
        deleteChatMessages,
        uploadFileResource,
        uploadYtResource,
      }}
    >
      {children}
    </StudyContext.Provider>
  );
};

export const CurrentStudy = () => {
  return useContext(StudyContext);
};
