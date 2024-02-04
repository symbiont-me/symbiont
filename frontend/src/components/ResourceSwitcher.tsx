import React from "react";
import { useEffect, useState } from "react";
import axios from "axios";
import { usePathname } from "next/navigation";
import { StudyResource } from "@/app/types";

type ResourceSwitcherProps = {
  selectedResource: (resource: StudyResource) => void;
};

function ResourceSwitcher({ selectedResource }: ResourceSwitcherProps) {
  const [resources, setResources] = useState<StudyResource[]>([]);
  const path = usePathname();
  const studyId = path.split("/")[2];

  const handleResourceChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const resourceIdentifier = event.target.value;
    // TODO there must be a better way to set the resource I am missing something obvious
    const resource = resources.find((r) => r.identifier === resourceIdentifier);
    if (resource) {
      selectedResource(resource);
    }
  };

  useEffect(() => {
    async function fetchResources() {
      try {
        const response = await axios.post("/api/get-resources", { studyId });
        setResources(response.data);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    }
    fetchResources();
    // TODO use react-query to fetch the list of resources
    // TODO on resource change switch the context for the chat
  }, [studyId]);

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
}

export default ResourceSwitcher;
