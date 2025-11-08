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
            <TabsList className="inline-flex h-12 items-center justify-start rounded-lg bg-gray-50 p-1 text-muted-foreground border border-gray-200">
              {Object.values(ViewSelected).map((view) => (
                <TabsTrigger
                  key={view}
                  value={view}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm hover:bg-blue-50 hover:text-blue-700 text-gray-600"
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
