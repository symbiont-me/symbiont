"use client";
import React, { useEffect } from "react";

import { useRouter } from "next/navigation";
import { HttpStatus } from "@/const";
import { useState } from "react";

import { useStudyContext } from "@/app/context/StudyContext";
// TODO maybe separate the modal into a separate component

const NewStudyCard = () => {
  const router = useRouter();
  const studyContext = useStudyContext();
  const [studyName, setStudyName] = useState("");
  const [image, setImage] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    console.log("studyContext", studyContext);
  }, [studyContext]);

  async function handleCreateStudy() {
    if (!studyContext) {
      return;
    }
    studyContext.createStudy(studyName, description, image);
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
          <button className="btn btn-info" onClick={() => handleCreateStudy()}>
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
