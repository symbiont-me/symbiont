import { Study } from "@/types";
import { faFloppyDisk } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Typography } from "@mui/material";
import Divider from "@mui/material/Divider";
import Image from "next/image";

// TODO replace time with actual time

type StudyInfoProps = {
  study: Study | undefined;
};

const StudyInfo = ({ study }: StudyInfoProps) => {
  const placeholder =
    "https://images.unsplash.com/photo-1455390582262-044cdead277a";

  return (
    <div className="w-full  mt-2 mb-2 p-2 pl-4 flex flex-row justify-between">
      <div className="flex flex-col items-start space-y-2">
        <Typography variant="h5">{study?.name}</Typography>
        <Typography variant="body2">{study?.description}</Typography>
        <div className="flex flex-row justify-center items-center">
          <Typography variant="caption" className="pr-2">
            Last Saved: 18:32
          </Typography>
        </div>
      </div>
      <div className="flex flex-col mr-8 items-center justify-center rounded-full">
        <Image
          height={40}
          width={40}
          alt={study?.name || "study image"}
          src={study?.image || placeholder}
        />
      </div>
    </div>
  );
};

export default StudyInfo;
