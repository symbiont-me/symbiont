import { Study } from "../../types";
import Link from "next/link";
import "./studyStyles.css";

const StudyCard = ({ study }: { study: Study }) => {
  return (
    <div className="container bg-symbiont-background w-60 m-4 h-60 rounded-xl p-0">
      <div className="card-title">
        <Link href={`studies/${study.id}`} className="">
          <h1 className="text-sm p-4">{study.name}</h1>
        </Link>
      </div>
      <div className="card-image p-4">
        <img
          className="h-20 w-20 object-cover rounded-xl"
          src="https://images.unsplash.com/photo-1707492805162-7375871503af?q=80&w=3087&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        />
      </div>
      <div className="card-description p-4">
        <p className="text-xs">Description</p>
      </div>
    </div>
  );
};

export default StudyCard;
