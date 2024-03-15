"use client";
import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { UserAuth } from "@/app/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { Study } from "@/types";

type StudyContextType = {
  allStudies: Study[];
  study: Study | undefined;
  isStudyLoading: boolean;
  createStudy: (studyName: string, description: string, image: string) => void;
  deleteStudy: (studyId: string) => void;
  deleteChatMessages: (studyId: string) => void;
  updateWriterContent: (text: string) => void;
  uploadFileResource: (resourceType: string) => void;
  uploadYtResource: (studyId: string, link: string) => void;
  deleteResource: (resourceIdentifier: string) => void;
};

export const StudyContext = createContext<StudyContextType | undefined>(
  undefined
);

export const StudyProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [allStudies, setAllStudies] = useState<Study[]>([]);
  // TODO update name to currentStudy
  const [study, setStudy] = useState<Study | undefined>(undefined);
  const studyId = usePathname().split("/")[2];
  const authContext = UserAuth();
  const userTokenPromise = authContext?.user?.getIdToken();
  const [userToken, setUserToken] = useState<string | undefined>(undefined);
  const [isStudyLoading, setIsStudyLoading] = useState(true);

  if (!authContext) {
    return <div>Loading...</div>;
  }
  // TODO if authContext is available but userId is not, display the landing page

  useEffect(() => {
    if (userTokenPromise) {
      userTokenPromise.then((token) => {
        setUserToken(token);
      });
    }
  }, [userTokenPromise]);

  useEffect(() => {
    if (authContext) console.log("User Token", authContext.user);
  }, [authContext]);

  // TODO update to filter studies by studyId on the backend
  const fetchUserStudies = async (userToken: string) => {
    const url = "http://127.0.0.1:8000/get-user-studies";

    const headers = {
      Authorization: `Bearer ${userToken}`,
    };
    const response = await axios.get(url, { headers });
    return response.data;
  };

  // Set studies
  const fetchStudiesQuery = useQuery({
    queryKey: ["get-studies", userTokenPromise],
    queryFn: () =>
      userToken ? fetchUserStudies(userToken) : Promise.reject("No token"),
    enabled: !!userToken, // This will ensure the query does not run until the token is available
  });

  useEffect(() => {
    setIsStudyLoading(true);
    if (fetchStudiesQuery.data) {
      setAllStudies(fetchStudiesQuery.data.studies);
      const currentStudy = fetchStudiesQuery.data.studies.filter(
        (study: Study) => {
          if (studyId && study.id === studyId) {
            return study;
          }
        }
      );
      console.log("Current Study", currentStudy);
      setStudy(currentStudy[0]);
      setIsStudyLoading(false);
    }
  }, [fetchStudiesQuery.data, studyId]);

  const createStudy = async (
    studyName: string,
    description: string,
    image: string
  ) => {
    const endpoint = `http://127.0.0.1:8000/create-study`;
    const body = { name: studyName, description: description, image: image };
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${userToken}`,
    };

    try {
      const response = await axios.post(endpoint, body, { headers });
      if (response.status === 201) {
        console.log("Study Created");
        fetchStudiesQuery.refetch();
      }
    } catch (error) {
      console.error("Error creating study:", error);
    }
  };

  async function deleteStudy(studyId: string) {
    const endpoint = `http://127.0.0.1:8000/delete-study?studyId=${studyId}`;
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${userToken}`,
    };
    try {
      await axios.delete(endpoint, { headers });
      fetchStudiesQuery.refetch();
    } catch (error) {
      console.error("Error deleting study:", error);
    }
  }

  async function updateWriterContent(text: string) {
    const endpoint = "http://127.0.0.1:8000/update-text";
    const body = { studyId: studyId, text: text };
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${userToken}`,
    };

    try {
      const response = await axios.post(endpoint, body, { headers });
      if (response.status === 200) {
        console.log("Text Updated");
        // TODO refetch only the study that was updated
        fetchStudiesQuery.refetch();
      }
    } catch (error) {
      console.error("Error updating text:", error);
    }
  }

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
        // TODO fix the type of resources
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

  function deleteResource(resourceIdentifier: string) {
    const endpoint = `http://127.0.0.1:8000?identifier=${resourceIdentifier}`;
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${userToken}`,
    };
    try {
      axios.post(endpoint, { headers });
      fetchStudiesQuery.refetch();
    } catch (error) {
      console.error("Error deleting resource:", error);
    }
  }

  useEffect(() => {
    console.log("Study From Context", study);
  });

  if (fetchStudiesQuery.isLoading) {
    return <div>Loading...</div>;
  }

  if (fetchStudiesQuery.isError) {
    return <div>Error: {fetchStudiesQuery.error.message}</div>;
  }

  return (
    <StudyContext.Provider
      value={{
        allStudies,
        study,
        isStudyLoading,
        createStudy,
        deleteStudy,
        updateWriterContent,
        deleteChatMessages,
        uploadFileResource,
        uploadYtResource,
        deleteResource,
      }}
    >
      {children}
    </StudyContext.Provider>
  );
};

// TODO update name to StudyContext
export const useStudyContext = () => {
  return useContext(StudyContext);
};
