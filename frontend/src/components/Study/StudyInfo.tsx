import { Study } from "@/types";
import { faFloppyDisk } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// TODO replace time with actual time
const StudyInfo = ({ study }: { study: Study }) => {
  const placeholder =
    "https://images.unsplash.com/photo-1455390582262-044cdead277a";

  return (
    <div className="w-full h-20 bg-symbiont-foreground mt-2 mb-2 p-2 pl-4  rounded-2xl flex flex-row justify-between">
      <div className="flex flex-col items-start space-y-2">
        <h1 className="text-sm font-bold">{study?.name}</h1>
        <p className="text-symbiont-textUnSelected text-xs ">
          {study?.description}
        </p>
        <div className="flex flex-row justify-center items-center">
          <p className="text-2xs pr-2"> Last Saved: 18:32</p>
        </div>
      </div>
      <div className="flex flex-col mr-8 items-center justify-center">
        <img
          className="h-10 w-10 bg-symbiont-chatMessageUser rounded-full"
          src={study?.image ? study.image : placeholder}
        />
      </div>
    </div>
  );
};

export default StudyInfo;
