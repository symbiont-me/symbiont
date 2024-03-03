import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { UserAuth } from "@/app/context/AuthContext";

const fetchSummaries = async (userToken: string, studyId: string) => {
  const response = await axios.get(
    `http://127.0.0.1:8000/get-summaries?studyId=${studyId}`,

    {
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    }
  );
  return response.data;
};

export const useFetchSummaries = (studyId: string) => {
  const authContext = UserAuth();
  const userTokenPromise = authContext?.user?.getIdToken();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["get-summaries", userTokenPromise],
    queryFn: () =>
      userTokenPromise
        ? userTokenPromise.then((token) => fetchSummaries(token, studyId))
        : Promise.reject(new Error("No user token")),
    enabled: !!userTokenPromise,
  });

  return { data, isLoading, isError, error };
};
