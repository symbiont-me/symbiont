import React from "react";

interface ProjectCardProps {
  title: string;
  description: string;
    img: string;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ title, description, img }) => {
  return (
    <div className="project-card">
      <div className="card lg:card-side bg-base-100 shadow-xl">
        <figure>
          <img
            src={img}
            alt={title}
          />
        </figure>
        <div className="card-body">
          <h2 className="card-title">{title}</h2>
          <p>{description}</p>
          <div className="card-actions justify-end">
            {/* TODO on click redirect the user to the project */}
            <button className="btn btn-primary">Open</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
