"use client";
import React from "react";


// TODO update the style of New Project Button
// TODO take the name of the project as input 
// TODO create a new project in the backend
// TODO update the list of projects in the dashboard
// TODO add new project to the database
// TODO redirect to the new project page

const NewProjectCard: React.FC = () => {
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
          <input type="text" placeholder="Study Name" className="input input-bordered input-primary w-full max-w-xs mr-4" />
          <button className="btn btn-info">Create Study</button>

        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </div>
  );
};

export default NewProjectCard;
