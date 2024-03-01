import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { UserAuth } from "@/app/context/AuthContext";

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

export const useFetchUserStudies = () => {
  const authContext = UserAuth();
  const userTokenPromise = authContext?.user?.getIdToken();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["get-studies", userTokenPromise],
    queryFn: () =>
      userTokenPromise
        ? userTokenPromise.then((token) => fetchUserStudies(token))
        : Promise.reject(new Error("No user token")),
    enabled: !!userTokenPromise,
  });

  return { data, isLoading, isError, error };
};
