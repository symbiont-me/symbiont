"use client";
import React from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { HttpStatus } from "@/const";
import { useState } from "react";
import { UserAuth } from "@/app/context/AuthContext";
// TODO maybe separate the modal into a separate component

const createStudy = async (
  studyName: string,
  description: string,
  image: string,
  userToken: string
) => {
  const response = await axios.post(
    `http://127.0.0.1:8000/create-study`,
    {
      name: studyName,
      description: description,
      image: image,
    },

    {
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    }
  );
  return response;
};

const NewStudyCard = () => {
  const router = useRouter();

  const [studyName, setStudyName] = useState("");
  const [image, setImage] = useState("");
  const [description, setDescription] = useState("");
  const authContext = UserAuth();
  const [userToken, setUserToken] = useState<string | undefined>(undefined);

  React.useEffect(() => {
    const getUserAuthToken = async () => {
      if (authContext?.user?.getIdToken) {
        const token = await authContext.user.getIdToken();
        setUserToken(token);
      }
    };
    getUserAuthToken();
  }, [authContext]);

  function handleCreateStudy(studyName: string, userToken: string | undefined) {
    if (!userToken) {
      return;
    }
    createStudy(studyName, description, image, userToken)
      .then((response) => {
        if (response.status === HttpStatus.CREATED) {
          const studyId = response.data.studyId;
          router.push(`/studies/${studyId}`);
        }
      })
      .catch((error) => {
        // TODO add a toast notification
        console.error("Failed to create study", error);
        throw error;
      });
  }

  if (!authContext) {
    return null;
  }

  const userId = authContext?.user?.uid;
  // TODO remove this check
  if (typeof userId === "undefined") {
    return null;
  }

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    if (name === "studyName") {
      setStudyName(value);
    } else if (name === "image") {
      setImage(value);
    } else if (name === "description") {
      setDescription(value);
    }
  }

  return (
    <div className="  h-60 w-64 mt-4 rounded-xl flex flex-col items-center justify-center border border-gray-500">
      {/* Open the modal using document.getElementById('ID').showModal() method */}
      <button
        className="btn"
        onClick={() => {
          const modal = document.getElementById("my_modal_2");
          if (modal !== null) {
            (modal as HTMLDialogElement).showModal();
          }
        }}
      >
        +
      </button>
      <p className="p-4">Create New Study</p>

      <dialog id="my_modal_2" className="modal">
        <div className="modal-box flex flex-col items-center justify-center">
          <h3 className="font-bold text-lg mb-6">Create New Study</h3>
          <input
            type="text"
            placeholder="Name"
            className="input input-bordered input-primary w-full max-w-xs mr-4 mb-4"
            value={studyName}
            name="studyName"
            onChange={handleInputChange}
          />
          <input
            type="text"
            placeholder="Image URL"
            className="input input-bordered input-primary w-full max-w-xs mr-4 mb-4"
            value={image}
            onChange={handleInputChange}
            name="image"
          />
          <input
            type="text"
            placeholder="Description"
            className="input input-bordered input-primary w-full max-w-xs mr-4 mb-4"
            value={description}
            onChange={handleInputChange}
            name="description"
          />
          <button
            className="btn btn-info"
            onClick={() => handleCreateStudy(studyName, userToken)}
          >
            Create Study
          </button>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </div>
  );
};

export default NewStudyCard;
