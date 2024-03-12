import { Study } from "../../types";
import Link from "next/link";
import "./studyStyles.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { useStudyContext } from "@/app/context/StudyContext";

const StudyCard = ({ study }: { study: Study }) => {
  const studyContext = useStudyContext();

  const handleDelete = () => {
    if (studyContext && study.id) {
      studyContext.deleteStudy(study.id.toString());
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
