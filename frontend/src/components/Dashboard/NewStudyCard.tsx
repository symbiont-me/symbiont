"use client";
import React from "react";
import axios from "axios";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { HttpStatus } from "@/const";
import { useState } from "react";

// TODO maybe separate the modal into a separate component

function NewStudyCard() {
  const router = useRouter();
  const [studyName, setStudyName] = useState("");

  const { userId } = useAuth();

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setStudyName(event.target.value);
  };

  const createStudyHandler = async () => {
    try {
      const response = await axios.post("/api/create-study", {
        studyName: studyName,
        userId: userId,
      });
      if (response.status === HttpStatus.CREATED) {
        const studyId = response.data.studyId;
        router.push(`/studies/${studyId}`);
      }
    } catch (error) {
      // TODO add a toast notification
      console.error("Failed to create study", error);
      throw error;
    }
  };

  return (
    <div>
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
        New Project
      </button>

      <dialog id="my_modal_2" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-6">Create New Study</h3>
          <input
            type="text"
            placeholder="Study Name"
            className="input input-bordered input-primary w-full max-w-xs mr-4"
            value={studyName}
            onChange={handleInputChange}
          />{" "}
          {/* TODO wrap into a submit form to allow creating with Enter */}
          <button className="btn btn-info" onClick={createStudyHandler}>
            Create Study
          </button>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </div>
  );
}

export default NewStudyCard;
