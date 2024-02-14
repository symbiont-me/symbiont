import { ViewSelected } from "@/const";
import StudyInfo from "./StudyInfo";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { Study } from "@/types";
type NavigationProps = {
  setViewSelected: (view: ViewSelected) => void;
  study: Study;
};

const Navigation = ({ setViewSelected, study }: NavigationProps) => {
  return (
    <>
      <StudyInfo study={study} />
      <nav className="flex justify-between items-center p-4 bg-symbiont-foreground rounded-2xl mb-2 mt-2">
        <div className="flex gap-4">
          {Object.values(ViewSelected).map((view) => (
            <button key={view} onClick={() => setViewSelected(view)}>
              <p className="capitalize text-xs text-symbiont-textUnSelected">
                {view}
              </p>
            </button>
          ))}
        </div>
      </nav>
    </>
  );
};

export default Navigation;
