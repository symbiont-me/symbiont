// ? where is this component used?
import React from "react";
import { Study } from "@/types";
import Link from "next/link";
import Image from "next/image";

type StudyCardProps = Study;

// TODO replace img with Image

const StudyCard = ({ name, image, id }: StudyCardProps) => {
  console.log(id);
  return (
    <div className="project-card">
      <div className="card lg:card-side bg-base-100 shadow-xl">
        <figure>
          {/* TODO replace with Image */}
          <img src={image} alt={name} />
        </figure>
        <div className="card-body">
          <h2 className="card-title">{name}</h2>
          <div className="card-actions justify-end">
            <Link href={`studies/${id}`} className="btn btn-primary">
              Open
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyCard;
