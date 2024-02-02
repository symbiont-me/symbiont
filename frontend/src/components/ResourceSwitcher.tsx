import React from "react";
import { useEffect, useState } from "react";
import axios from "axios";
import { usePathname } from "next/navigation";
import { StudyResource } from "@/app/types";

type ResourceSwitcherProps = {
  selectedResource: (resourceUrl: string) => void;
};

const ResourceSwitcher: React.FC<ResourceSwitcherProps> = ({
  selectedResource,
}) => {
    // TODO add the updated study resource type
  const [resources, setResources] = useState([]);
  const path = usePathname();
  const studyId = path.split("/")[2];

  const handleResourceChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const resourceUrl = event.target.value;
    selectedResource(resourceUrl);
  };

  useEffect(() => {
    async function fetchResources() {
      try {
        const response = await axios.post("/api/get-resources", { studyId });
        console.log("response", response.data);
        setResources(response.data);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    }
    fetchResources();
    // TODO use react-query to fetch the list of resources
    // TODO on resource change switch the context for the chat
  }, []);

  return (
    <div>
        <h2>Resource Switcher</h2>
        <select
          className="select select-bordered w-full max-w-xs"
          onChange={handleResourceChange}
        >
          {resources.map((resource) => (
            <option
              key={resource.id}
              value={resource.name}
            >
              {resource.name}
            </option>
          ))}
        </select>
      </div>
  );
};

export default ResourceSwitcher;