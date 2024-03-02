import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { UserAuth } from "@/app/context/AuthContext";

const fetchWriterText = async (userToken: string, studyId: string) => {
  const response = await axios.get(
    `http://127.0.0.1:8000/get-text?study_id=${studyId}`,
    {
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    }
  );
  return response.data;
};

export const useFetchWriterText = (studyId: string) => {
  const authContext = UserAuth();
  const userTokenPromise = authContext?.user?.getIdToken();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["get-text", userTokenPromise],
    queryFn: () =>
      userTokenPromise
        ? userTokenPromise.then((token) => fetchWriterText(token, studyId))
        : Promise.reject(new Error("No user token")),
    enabled: !!userTokenPromise,
  });

  return { data, isLoading, isError, error };
};
