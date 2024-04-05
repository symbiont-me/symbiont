"use client";
import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { UserAuth } from "@/app/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { Study } from "@/types";
import CircularProgress from "@mui/material/CircularProgress";

// TODO remove if response.status === 200 statements from try-catch blocks

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
  uploadFileResource: (file: File, studyId: string) => void;
  uploadYtResource: (studyId: string, link: string) => void;
  uploadWebResource: (studyId: string, urls: string[]) => void;
  uploadTextResource: (studyId: string, name: string, content: string) => void;
  deleteResource: (resourceIdentifier: string) => void;
};

const jokes = [
  "Will glass coffins be a success? Remains to be seen.",
  "The man who invented knock-knock jokes should get a no bell prize.",
  "The problem isn’t that obesity runs in your family. It’s that no one runs in your family.",
  "If I got 50 cents for every failed math exam, I’d have $6.30 now.",
  "I went to buy some camo pants but couldn’t find any.",
  "When life gives you melons, you might be dyslexic.",
  "What's the difference between ignorance and apathy? I don’t know and I don’t care.",
  "I hate Russian dolls, they're so full of themselves.",
  "Don't you hate it when someone answers their own questions? I do.",
  "How do you make holy water? You boil the hell out of it.",
  "Most people are shocked when they find out how bad I am as an electrician.",
  "I spent a lot of time, money, and effort childproofing my house… But the kids still get in.",
  "Geology rocks, but geography’s where it’s at.",
  "The problem with kleptomaniacs is that they always take things literally.",
  "The man who survived both mustard gas and pepper spray is a seasoned veteran now.",
  "Maybe if we start telling people their brain is an app, they’ll want to use it.",
  "I was wondering why the frisbee kept getting bigger and bigger, but then it hit me.",
  "Is your bottom jealous of the amount of crap that comes out of your mouth?",
  "The rotation of Earth really makes my day.",
  "What’s the difference between an outlaw and an in-law? Outlaws are wanted.",
  "So what if I don't know what 'Armageddon' means? It's not the end of the world.",
  "My wife told me to stop impersonating a flamingo. I had to put my foot down.",
  "A blind man walked into a bar… And a table… And a chair…",
  "The last thing I want to do is hurt you; but it’s still on the list.",
  "The future, the present, and the past walk into a bar. Things got a little tense.",
  "I have a few jokes about unemployed people, but none of them work.",
  "People who take care of chickens are literally chicken tenders.",
  "Just got fired from my job as a set designer. I left without making a scene.",
  "Despite the high cost of living, it remains popular.",
  "'You’ll never be as lazy as whoever named the fireplace.'",
  "I used to think I was indecisive. But now I’m not so sure.",
  "I always take life with a grain of salt. And a slice of lemon. And a shot of tequila.",
  "Two fish are in a tank. One says, ‘How do you drive this thing?’",
  "Communist jokes aren’t funny unless everyone gets them.",
  "I can’t believe I got fired from the calendar factory. All I did was take a day off.",
  "I've just written a song about tortillas; actually, it’s more of a rap.",
  "A perfectionist walked into a bar... Apparently, the bar wasn’t set high enough.",
  "'The four most beautiful words in our common language: I told you so.'",
];

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
  const [currentJoke, setCurrentJoke] = useState(jokes[0]);

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

  async function fetchCurrentStudy(studyId: string) {
    const endpoint = `${BASE_URL}/get-current-study?studyId=${studyId}`;
    const headers = {
      Authorization: `Bearer ${userToken}`,
    };
    const response = await axios.get(endpoint, { headers });

    return response.data;
  }
  const fetchCurrentStudyQuery = useQuery({
    queryKey: ["get-study", userTokenPromise, studyId],
    queryFn: () =>
      userToken && studyId
        ? fetchCurrentStudy(studyId)
        : Promise.reject("No token or studyId"),
    enabled: !!userToken && !!studyId,
  });

  useEffect(() => {
    setIsStudyLoading(true);
    if (fetchStudiesQuery.data) {
      console.log("Setting all studies...", fetchStudiesQuery.data.studies);
      setAllStudies(fetchStudiesQuery.data.studies);
    }
    if (fetchCurrentStudyQuery.data) {
      console.log(
        "Setting current study...",
        fetchCurrentStudyQuery.data.studies
      );
      setStudy(fetchCurrentStudyQuery.data.studies[0]); // @note all study routes return an array
      setIsStudyLoading(false);
    }
  }, [fetchStudiesQuery.data, fetchCurrentStudyQuery.data, studyId]);

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
      await axios.post(endpoint, body, { headers });
      console.log("Study Created");
      fetchStudiesQuery.refetch();
      console.log("Refetching Studies...");
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
      await axios.post(endpoint, body, { headers });
      console.log("Text Updated");
      console.log("Refetching Updated Study...");
      fetchCurrentStudyQuery.refetch();
    } catch (error) {
      console.error("Error updating text:", error);
    }
  }

  async function deleteChatMessages(studyId: string) {
    const url = `${BASE_URL}/delete-chat-messages?studyId=${studyId}`;
    const headers = {
      Authorization: `Bearer ${userToken}`,
    };

    try {
      await axios.delete(url, { headers });
      console.log("Chat Messages Deleted. Updating State...");
      if (study) {
        setStudy({ ...study, chatMessages: [] });
      }

      console.log("Refetching Updated Study...");
      fetchCurrentStudyQuery.refetch();
    } catch (error) {
      console.error("Error deleting chat messages:", error);
    }
  }

  // TODO copy this error modelling in the other functions
  async function uploadYtResource(studyId: string, link: string) {
    setIsStudyLoading(true);
    const endpoint = `${BASE_URL}/process-youtube-video`;
    const body = { studyId: studyId, url: link };
    const headers = { Authorization: `Bearer ${userToken}` };
    try {
      const response = await axios.post(endpoint, body, { headers });
      console.log("YouTube Video Uploaded");
      console.log("Updating Study Resources in State...");
      if (study) {
        setStudy({
          ...study,
          resources: [...(study.resources || []), ...response.data.resources],
        });
      }
      console.log("Refetching Updated Study...");
      fetchCurrentStudyQuery.refetch();
      setIsSuccess(true);
    } catch (error) {
      console.error("Error uploading YouTube video:", error);
      setStudyError(error as Error);
    } finally {
      setIsStudyLoading(false);
    }
  }

  async function uploadWebResource(studyId: string, urls: string[]) {
    setIsStudyLoading(true);
    const endpoint = `${BASE_URL}/add-webpage-resource`;
    const body = { studyId: studyId, urls: urls };
    const headers = {
      Authorization: `Bearer ${userToken}`,
    };
    try {
      const response = await axios.post(endpoint, body, { headers });
      console.log("Web Resource Uploaded");
      console.log("Updating Study Resources in State...");
      if (study) {
        setStudy({
          ...study,
          resources: [...(study.resources || []), ...response.data.resources],
        });
      }
      console.log("Refetching Updated Study...");
      fetchCurrentStudyQuery.refetch();
      setIsSuccess(true);
    } catch (error) {
      console.error("Error uploading web resource:", error);
      setStudyError(error as Error);
    } finally {
      setIsStudyLoading(false);
    }
  }

  async function uploadTextResource(
    studyId: string,
    name: string,
    content: string
  ) {
    setIsStudyLoading(true);
    const endpoint = `${BASE_URL}/add-plain-text-resource`;
    const body = { studyId: studyId, name: name, content: content };
    const headers = {
      Authorization: `Bearer ${userToken}`,
    };

    try {
      const response = await axios.post(endpoint, body, { headers });

      console.log("Updating Study Resources in State...");
      if (study) {
        setStudy({
          ...study,
          resources: [...(study.resources || []), ...response.data.resources],
        });
      }
      console.log("Refetching Updated Study...");
      fetchCurrentStudyQuery.refetch();
      setIsSuccess(true);
    } catch (error) {
      console.error("Error uploading text resource:", error);
      setStudyError(error as Error);
      setIsError(true);
    } finally {
      setIsStudyLoading(false);
    }
  }

  type FileUploadData = {
    study_id: string;
    identifier: string;
    name: string;
    url: string;
    category: string;
  };

  async function uploadFileResource(file: File, studyId: string) {
    setIsStudyLoading(true);
    const endpoint = `${process.env.NEXT_PUBLIC_BASE_URL}/upload-resource?studyId=${studyId}`;
    const formData = new FormData();
    formData.append("file", file);
    const body = formData;
    const headers = {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${userToken}`,
    };

    try {
      const response = await axios.post(endpoint, body, { headers });
      console.log("Updating Study Resources in State...");
      if (study) {
        setStudy({
          ...study,
          resources: [...(study.resources ?? []), response.data.resource],
        });
      }
      console.log("Refetching Updated Study...");
      fetchCurrentStudyQuery.refetch();
      setIsSuccess(true);
      return response.data.resource;
    } catch (error) {
      setStudyError(error as Error);
      throw error;
    } finally {
      setIsStudyLoading(false);
    }
  }

  async function deleteResource(resourceIdentifier: string) {
    console.log("Updating Study Resources in State...");
    // @note keep this line here, so that it updates the UI immediately
    // if there are any issues with the backend, the UI will still be updated again from the backend
    if (study) {
      setStudy({
        ...study,
        resources: study.resources?.filter(
          (resource) => resource.identifier !== resourceIdentifier
        ),
      });
    }
    console.log("Resource Deleted");
    const endpoint = `${BASE_URL}/delete-resource`;
    const body = { identifier: resourceIdentifier };
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${userToken}`,
    };

    try {
      await axios.post(endpoint, body, { headers });

      console.log("Refetching Updated Study...");
      fetchCurrentStudyQuery.refetch();
      setIsSuccess(true);
    } catch (error) {
      console.error("Error deleting resource:", error);
      setStudyError(error as Error);
      setIsError(true);
    }
  }

  // TODO REMOVE THIS BLOCK WHEN DEPLOYING TO PRODUCTION OR MOVING TO GOOGLE CLOUD
  const [timer, setTimer] = useState(90);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prevTimer) => prevTimer - 1);
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (timer === 0) {
      setTimer(90);
    }
  }, [timer]);
  useEffect(() => {
    const jokeInterval = setInterval(() => {
      setCurrentJoke((prevJoke) => {
        let newIndex = jokes.indexOf(prevJoke) + 1;
        return jokes[newIndex % jokes.length];
      });
    }, 8000);

    return () => clearInterval(jokeInterval);
  }, []);

  // NOTE Note this part, just update the loader
  if (!authContext) {
    return <div>Loading...</div>;
  }

  // TODO REPLACE THIS BLOCK WHEN DEPLOYING TO PRODUCTION OR MOVING TO GOOGLE CLOUD
  if (fetchStudiesQuery.isLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center overflow-hidden">
        <h1 className="mb-2">It takes time to load Dev Server</h1>
        <CircularProgress color="secondary" />

        <p className="mb-10 mt-2">Meanwhile...</p>
        <div className="mb-10">{currentJoke}</div>
        <h1>{timer}</h1>
      </div>
    );
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
        uploadTextResource,
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
