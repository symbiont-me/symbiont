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
  isSuccess: boolean;
  isError: boolean;
  studyError: Error | undefined;
  createStudy: (studyName: string, description: string, image: string) => void;
  deleteStudy: (studyId: string) => void;
  deleteChatMessages: (studyId: string) => void;
  updateWriterContent: (text: string) => void;
  uploadFileResource: (resourceType: string) => void;
  uploadYtResource: (studyId: string, link: string) => void;
  uploadWebResource: (studyId: string, urls: string[]) => void;
  deleteResource: (resourceIdentifier: string) => void;
};

export const StudyContext = createContext<StudyContextType | undefined>(
  undefined
);

export const StudyProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const [allStudies, setAllStudies] = useState<Study[]>([]);
  // TODO update name to currentStudy
  const [study, setStudy] = useState<Study | undefined>(undefined);
  const studyId = usePathname().split("/")[2];
  const authContext = UserAuth();
  const userTokenPromise = authContext?.user?.getIdToken();
  const [userToken, setUserToken] = useState<string | undefined>(undefined);
  const [isStudyLoading, setIsStudyLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [studyError, setStudyError] = useState<Error | undefined>(undefined);

  // TODO if authContext is available but userId is not, display the landing page

  useEffect(() => {
    if (userTokenPromise) {
      userTokenPromise.then((token) => {
        setUserToken(token);
      });
    }
  }, [userTokenPromise]);

  // TODO update to filter studies by studyId on the backend
  const fetchUserStudies = async (userToken: string) => {
    const url = `${BASE_URL}/get-user-studies`;
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
    const endpoint = `${BASE_URL}/create-study`;
    const body = { name: studyName, description: description, image: image };
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${userToken}`,
    };

    try {
      const response = await axios.post(endpoint, body, { headers });
      if (response.status === 200) {
        console.log("Study Created");
        fetchStudiesQuery.refetch();
        console.log("Refetching Studies...");
      }
    } catch (error) {
      console.error("Error creating study:", error);
    }
  };

  async function deleteStudy(studyId: string) {
    const endpoint = `${BASE_URL}/delete-study?studyId=${studyId}`;
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
    const endpoint = `${BASE_URL}/update-text`;
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
    const url = `${BASE_URL}/delete-chat-messages?studyId=${studyId}`;

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

  // TODO copy this error modelling in the other functions
  async function uploadYtResource(studyId: string, link: string) {
    const endpoint = `${BASE_URL}/process-youtube-video`;
    const body = { studyId: studyId, url: link };
    const headers = { Authorization: `Bearer ${userToken}` };
    setIsStudyLoading(true);
    try {
      const response = await axios.post(endpoint, body, { headers });
      if (response.status === 200) {
        console.log("YouTube Video Uploaded");
        fetchStudiesQuery.refetch();
        setIsSuccess(true);
      }
    } catch (error) {
      console.error("Error uploading YouTube video:", error);
      setStudyError(error as Error);
    } finally {
      setIsStudyLoading(false);
    }
  }

  async function uploadWebResource(studyId: string, urls: string[]) {
    const endpoint = `${BASE_URL}/add-webpage-resource`;
    const body = { studyId: studyId, urls: urls };
    const headers = {
      Authorization: `Bearer ${userToken}`,
    };
    try {
      setIsStudyLoading(true);
      const response = await axios.post(endpoint, body, { headers });
      if (response.status === 200) {
        console.log("Web Resource Uploaded");
        fetchStudiesQuery.refetch();
        setIsStudyLoading(false);
      }
    } catch (error) {
      console.error("Error uploading web resource:", error);
    } finally {
      setIsStudyLoading(false);
    }
  }

  async function uploadFileResource(resourceType: string) {
    if (study && resourceType === "pdf") {
      setStudy({
        ...study,
        // TODO fix the type of resources
        // @ts-ignore
        resources: [...(study.resources ?? []), { category: "pdf" }],
      });
    }
    if (study && resourceType === "web") {
      setStudy({
        ...study,
        // @ts-ignore
        resources: [...(study.resources ?? []), { category: "web" }],
      });
    }
    fetchStudiesQuery.refetch();
  }

  function deleteResource(resourceIdentifier: string) {
    const endpoint = `${BASE_URL}?identifier=${resourceIdentifier}`;
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

  if (!authContext) {
    return <div>Loading...</div>;
  }
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
        isSuccess,
        isError,
        studyError,
        createStudy,
        deleteStudy,
        updateWriterContent,
        deleteChatMessages,
        uploadFileResource,
        uploadYtResource,
        uploadWebResource,
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
