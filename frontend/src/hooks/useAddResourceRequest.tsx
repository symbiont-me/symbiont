import {
  useMutation,
  QueryClient,
  useQueryClient,
} from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import { useStudyContext } from "@/app/context/StudyContext";

type FileUploadResourceBody = {
  file: File;
  studyId: string;
  fileType: string;
};

type WebResourceBody = {
  studyId: string;
  urls: string[];
};

type TextResourceBody = {
  studyId: string;
  name: string;
  content: string;
};

type YTResourceBody = WebResourceBody;

export type Headers = {
  Authorization: string;
  [key: string]: string;
};

type MutationArgs = {
  endpoint: string;
  body: WebResourceBody | YTResourceBody | TextResourceBody | FormData;
  headers: Headers;
  resourceType?: string;
};

type ResourceStatus = {
  error: Error | null;
  success: boolean;
};

const useAddResourceRequest = () => {
  const [resourceType, setResourceType] = useState<string | null>(null);
  const [resourceStatus, setResourceStatus] = useState<ResourceStatus>({
    error: null,
    success: false,
  });
  const queryClient: QueryClient = useQueryClient();

  const currentStudyContext = useStudyContext();

  return {
    resourceType,
    resourceStatus,
    mutation: useMutation({
      mutationFn: ({ endpoint, body, headers }: MutationArgs) =>
        axios.post(endpoint, body, { headers }),
      onMutate: async (variables) => {
        setResourceType(variables.resourceType || null);
      },
      onError: (error: Error) => {
        console.error(error);
        setResourceStatus({ error: error, success: false });
      },
      onSuccess: (data) => {
        setResourceStatus({ error: null, success: true });
        if (data.data.resources && Array.isArray(data.data.resources)) {
          console.log("Added resource:", data.data.resources[0]);
          // update the state in the context
          currentStudyContext?.updateResourcesInStudy(data.data.resources);
        } else {
          console.error("Unexpected response format:", data.data);
        }
        // we refetch the study data in case there was a change
        queryClient.invalidateQueries({ queryKey: ["get-study"] });
      },
    }),
  };
};

export default useAddResourceRequest;
