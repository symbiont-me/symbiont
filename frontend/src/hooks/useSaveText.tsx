import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { UserAuth } from "@/app/context/AuthContext";

const saveText = async (userToken: string, studyId: string, text: string) => {
  const response = await axios.post(
    `http://127.0.0.1:8000/update-text`,
    { studyId: studyId, text: text },
    {
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    }
  );

  return response.data;
};

export const useSaveText = (studyId: string, text: string) => {
  const authContext = UserAuth();
  const userTokenPromise = authContext?.user?.getIdToken();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["update-text", userTokenPromise],
    queryFn: () =>
      userTokenPromise
        ? userTokenPromise.then((token) => saveText(token, studyId, text))
        : Promise.reject(new Error("No user token")),
    enabled: !!userTokenPromise,
  });

  return { data, isLoading, isError, error };
};
