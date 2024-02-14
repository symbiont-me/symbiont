import { ViewSelected } from "@/const";
import StudyInfo from "./StudyInfo";
import { Study } from "@/types";
import { useState } from "react";
import "@/app/globals.css";
type NavigationProps = {
  setViewSelected: (view: ViewSelected) => void;
  study: Study;
};

const Navigation = ({ setViewSelected, study }: NavigationProps) => {
  const [selectedView, setSelectedView] = useState<ViewSelected | undefined>(
    ViewSelected.Writer
  );

  const handleViewSelection = (view: ViewSelected) => {
    setSelectedView(view);
    setViewSelected(view);
  };

  return (
    <>
      <StudyInfo study={study} />
      <nav className="flex justify-between items-center p-4 bg-symbiont-foreground rounded-2xl mb-2 mt-2">
        <div className="flex gap-4 ">
          {Object.values(ViewSelected).map((view) => (
            <button
              key={view}
              onClick={() => handleViewSelection(view)}
              className="capitalize text-xs h-full"
            >
              {selectedView === view ? (
                <div className="flex flex-col items-center justify-center">
                  <p> {view} </p>

                  <div className="w-full h-2 selected-gradient rounded-full"></div>
                </div>
              ) : (
                <div>{view}</div>
              )}
            </button>
          ))}
        </div>
      </nav>
    </>
  );
};
export default Navigation;
