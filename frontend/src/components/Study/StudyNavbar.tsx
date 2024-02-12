import { ViewSelected } from "@/const";
import StudyInfo from "./StudyInfo";

type NavigationProps = {
  studyId: string;
  setViewSelected: (view: ViewSelected) => void;
};

const Navigation = ({ setViewSelected, studyId }: NavigationProps) => {
  return (
    <>
      <StudyInfo studyId={studyId} />
      <nav className="flex justify-between items-center p-4 bg-symbiont-900 rounded-2xl mb-2 mt-2">
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
