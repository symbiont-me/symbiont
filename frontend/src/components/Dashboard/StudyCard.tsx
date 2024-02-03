import React from "react";
import { Study } from "@/app/types";

type StudyCardProps = Study;

const StudyCard: React.FC<StudyCardProps> = ({ name, image }) => {
  return (
    <div className="project-card">
      <div className="card lg:card-side bg-base-100 shadow-xl">
        <figure>
          <img src={image} alt={name} />
        </figure>
        <div className="card-body">
          <h2 className="card-title">{name}</h2>
          <div className="card-actions justify-end">
            {/* TODO on click redirect the user to the project */}
            <button className="btn btn-primary">Open</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyCard;
