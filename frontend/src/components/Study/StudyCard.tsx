// TODO The dashboard component should rerender when a study is deleted
import { Study } from "../../types";
import Link from "next/link";
import "./studyStyles.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { UserAuth } from "@/app/context/AuthContext";
import { useState, useEffect } from "react";

async function deleteStudy(studyId: string, userToken: string) {
  const url = `http://127.0.0.1:8000/delete-study?studyId=${studyId}`;
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${userToken}`,
  };
  try {
    await axios.delete(url, { headers });
  } catch (error) {
    console.error("Error deleting study:", error);
  }
}

const StudyCard = ({ study }: { study: Study }) => {
  const authContext = UserAuth();
  const [userToken, setUserToken] = useState<string>("");

  if (!authContext) {
    return null;
  }

  useEffect(() => {
    const getUserAuthToken = async () => {
      if (authContext?.user?.getIdToken) {
        const token = await authContext.user.getIdToken();
        setUserToken(token);
      }
    };
    getUserAuthToken();
  });

  const handleDelete = () => {
    if (study.id && userToken) {
      deleteStudy(study.id.toString(), userToken);
    }
  };
  return (
    <div className="container bg-symbiont-background w-60 m-4 h-60 rounded-xl p-0 border border-gray-500">
      <div className="cursor-pointer" onClick={handleDelete}>
        {" "}
        <FontAwesomeIcon icon={faTrash} />{" "}
      </div>
      <div className="card-title">
        <Link href={`studies/${study.id}`} className="">
          <h1 className="text-sm p-4">{study.name}</h1>
        </Link>
      </div>
      <div className="card-image p-4">
        <img className="h-20 w-20 object-cover rounded-xl" src={study.image} />
      </div>
      <div className="card-description p-4">
        <p className="text-xs">{study.description}</p>
      </div>
    </div>
  );
};

export default StudyCard;
