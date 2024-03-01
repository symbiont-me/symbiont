// TODO move this to Study folder

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { StudyResource } from "@/types";
import { truncateFileName } from "@/lib/utils";

type ResourceSwitcherProps = {
  studyId: string;
  onResourceChange: (resource: StudyResource) => void;
};

// TODO give option to "Search All"
const ResourceSwitcher = ({
  studyId,
  onResourceChange,
}: ResourceSwitcherProps) => {
  const [resources, setResources] = useState<StudyResource[] | undefined>([]);
  const resourcesQuery = useQuery({
    queryKey: ["resources"],
    queryFn: () =>
      axios
        .post(`http://127.0.0.1:8000/get-resources/?studyId=${studyId}`)
        .then((res) => res.data),
  });

  useEffect(() => {
    if (resourcesQuery.data) {
      setResources(resourcesQuery.data.resources);
      onResourceChange(resourcesQuery.data.resources[0]); // Set the first resource as the default
    }
  }, [resourcesQuery.data, onResourceChange]);

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

  if (resourcesQuery.isPending) {
    return <div>Loading resources...</div>;
  }

  if (resourcesQuery.error) {
    return (
      <div>Error loading resources: {resourcesQuery.error.toString()}</div>
    );
  }

  return (
    <div>
      <h2 className="text-xs mb-4 text-center font-bold">Context Switcher</h2>
      <select
        className="select select-bordered w-full max-w-xs"
        onChange={handleResourceChange}
      >
        {resources &&
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
