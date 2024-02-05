import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { StudyResource } from "@/types";

type ResourceSwitcherProps = {
  studyId: string;
  onResourceChange: (resource: StudyResource) => void;
};

const ResourceSwitcher = ({ studyId, onResourceChange }: ResourceSwitcherProps) => {
  const [resources, setResources] = useState<StudyResource[]>([]);

  const resourcesQuery = useQuery({
    queryKey: ["resources", studyId],
    queryFn: () =>
      axios.post("/api/get-resources", { studyId }).then((res) => res.data),
  });

  useEffect(() => {
    if (resourcesQuery.data && resourcesQuery.data.length > 0) {
      setResources(resourcesQuery.data);
      onResourceChange(resourcesQuery.data[0]); // Set the first resource as the default
    }
  }, [resourcesQuery.data, onResourceChange]);

  const handleResourceChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const resourceIdentifier = event.target.value;
    const resource = resources.find((r) => r.identifier === resourceIdentifier);
    if (resource) {
      onResourceChange(resource);
    }
  };

  if (resourcesQuery.isPending) {
    return <div>Loading resources...</div>;
  }

  if (resourcesQuery.error) {
    return <div>Error loading resources: {resourcesQuery.error.toString()}</div>;
  }

  return (
    <div>
      <h2>Resource Switcher</h2>
      <select
        className="select select-bordered w-full max-w-xs"
        onChange={handleResourceChange}
      >
        {resources.map((resource) => (
          <option key={resource.identifier} value={resource.identifier}>
            {resource.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ResourceSwitcher;