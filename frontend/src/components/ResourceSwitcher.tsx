// TODO move this to Study folder

import { useState, useEffect } from "react";
import { StudyResource } from "@/types";
import { truncateFileName } from "@/lib/utils";
import { CurrentStudy } from "@/app/context/StudyContext";

type ResourceSwitcherProps = {
  studyId: string;
  onResourceChange: (resource: StudyResource) => void;
};

// TODO give option to "Search All"
const ResourceSwitcher = ({
  studyId,
  onResourceChange,
}: ResourceSwitcherProps) => {
  const [resources, setResources] = useState<StudyResource[]>([]);
  const studyContext = CurrentStudy();

  if (!studyContext) {
    return null;
  }

  useEffect(() => {
    if (studyContext?.study) {
      setResources(studyContext.study[0].resources);
    }
  }, [studyContext]);

  const handleResourceChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const resourceIdentifier = event.target.value;
    const resource = resources?.find(
      (r) => r.identifier === resourceIdentifier
    );
    if (resource) {
      onResourceChange(resource);
    }
  };

  return (
    <div>
      <h2 className="text-xs mb-4 text-center font-bold">Context Switcher</h2>
      <select
        className="select select-bordered w-full max-w-xs"
        onChange={handleResourceChange}
      >
        {resources &&
          Array.isArray(resources) &&
          resources.map((resource) => (
            <option key={resource.identifier} value={resource.identifier}>
              {truncateFileName(resource.name)}
            </option>
          ))}
      </select>
    </div>
  );
};

export default ResourceSwitcher;
