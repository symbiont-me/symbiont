import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { UserAuth } from "@/app/context/AuthContext";
import { usePathname } from "next/navigation";

type FileUploadData = {
  study_id: string;
  identifier: string;
  name: string;
  url: string;
  category: string;
};

const sendFileUpload = async (
  file: File,
  userToken: string,
  studyId: string
): Promise<FileUploadData> => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await axios.post(
    `http://127.0.0.1:8000/upload-resource/?studyId=${studyId}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${userToken}`,
      },
    }
  );
  return response.data.resource;
};

export const useFileUpload = () => {
  const authContext = UserAuth();
  const studyId = usePathname().split("/")[2];
  const userTokenPromise = authContext?.user?.getIdToken();

  const mutation = useMutation({
    mutationFn: (file: File) =>
      userTokenPromise
        ? userTokenPromise.then((token) => sendFileUpload(file, token, studyId))
        : Promise.reject(new Error("No user token")),
  });

  return mutation;
};
