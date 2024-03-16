import { useState, useEffect } from "react";
import { StudyResource } from "@/types";
import { truncateFileName } from "@/lib/utils";
import { useStudyContext } from "@/app/context/StudyContext";

import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";

type ResourceSwitcherProps = {
  studyId: string;
  onResourceChange: (resource: StudyResource) => void;
};

const ResourceSwitcher = ({
  studyId,
  onResourceChange,
}: ResourceSwitcherProps) => {
  const [resources, setResources] = useState<StudyResource[]>([]);
  const [selectedResource, setSelectedResource] =
    useState<StudyResource | null>(null);
  const studyContext = useStudyContext();

  if (!studyContext) {
    return null;
  }

  useEffect(() => {
    if (studyContext?.study) {
      setResources(studyContext.study.resources);
      // set the first resource as selected by default if needed
      if (studyContext.study.resources && !selectedResource) {
        const firstResource = studyContext.study.resources[0];
        setSelectedResource(firstResource);
        onResourceChange(firstResource);
      }
    }
  }, [studyContext]);

  const handleResourceChange = (event: SelectChangeEvent<string>) => {
    const resourceIdentifier = event.target.value;
    const resource = resources.find((r) => r.identifier === resourceIdentifier);
    if (resource) {
      setSelectedResource(resource);
      onResourceChange(resource);
    }
  };

  return (
    <div>
      <Box sx={{ minWidth: 120 }}>
        <FormControl fullWidth>
          <InputLabel id="demo-simple-select-label">Resource</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={selectedResource?.identifier || ""}
            label="Resource"
            onChange={handleResourceChange}
          >
            {resources &&
              resources.map((resource) => (
                <MenuItem key={resource.identifier} value={resource.identifier}>
                  {truncateFileName(resource.name)}
                </MenuItem>
              ))}
          </Select>
        </FormControl>
      </Box>
    </div>
  );
};

export default ResourceSwitcher;
