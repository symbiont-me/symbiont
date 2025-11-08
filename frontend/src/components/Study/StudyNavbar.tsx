import { ViewSelected } from "@/const";
import StudyInfo from "./StudyInfo";
import { Study } from "@/types";
import { useState } from "react";
import "@/app/globals.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave, faShare } from "@fortawesome/free-solid-svg-icons";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
      <nav className="mb-2">
        <div className="flex gap-4">
          <Tabs
            value={selectedView}
            onValueChange={(value: string) => handleViewSelection(value as ViewSelected)}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-4 h-auto p-1">
              {Object.values(ViewSelected).map((view) => (
                <TabsTrigger
                  key={view}
                  value={view}
                  className="text-xs font-medium uppercase data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  {view}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
        {/* TODO add these function some place else */}
        {/* <div className="flex gap-4  mr-6">
          <div className="flex flex-row">
            <button className="text-xs">
              <FontAwesomeIcon icon={faSave} />
            </button>
          </div>
          <button className="text-xs">
            <FontAwesomeIcon icon={faShare} />
          </button>
        </div> */}
      </nav>
    </>
  );
};
export default Navigation;
