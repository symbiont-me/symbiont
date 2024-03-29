import { ViewSelected } from "@/const";
import StudyInfo from "./StudyInfo";
import { Study } from "@/types";
import { useState } from "react";
import "@/app/globals.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave, faShare } from "@fortawesome/free-solid-svg-icons";
import { Box, Tab, Tabs } from "@mui/material";

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
      <nav className="flex justify-between items-center p-4  mb-2 mt-2">
        <div className="flex gap-4 ">
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={selectedView} // Use the state to control the selected tab
              onChange={(event, newValue) => handleViewSelection(newValue)} // Update the state when a new tab is selected
              aria-label="basic tabs example"
              variant="scrollable" // Optional: makes the tabs scrollable if they overflow their container
              scrollButtons="auto" // Optional: adds scroll buttons if the tabs overflow their container
            >
              {Object.values(ViewSelected).map((view) => (
                <Tab
                  key={view}
                  value={view} // Set the value of each tab to its corresponding view
                  label={view} // Use the label prop to set the tab's text
                  className={`  ${
                    selectedView === view ? "selected-tab-class" : ""
                  }`} // Apply conditional styling
                  sx={{
                    minWidth: "auto",
                    height: "20px",
                    fontSize: 10,
                    textTransform: "uppercase",
                    padding: "0 10px",
                  }}
                />
              ))}
            </Tabs>
          </Box>
        </div>
        <div className="flex gap-4  mr-6">
          <div className="flex flex-row">
            <button className="text-xs">
              <FontAwesomeIcon icon={faSave} />
            </button>
          </div>
          <button className="text-xs">
            <FontAwesomeIcon icon={faShare} />
          </button>
        </div>
      </nav>
    </>
  );
};
export default Navigation;
