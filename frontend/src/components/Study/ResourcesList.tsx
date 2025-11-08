import { useState, useEffect } from "react";
import { StudyResource } from "@/types";
import { truncateFileName } from "@/lib/utils";
import { useStudyContext } from "@/app/context/StudyContext";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

type ResourcesListProps = {
  studyId: string;
  onResourceSelectionChange: (selectedResources: StudyResource[]) => void;
  selectedResources: StudyResource[];
};

const ResourcesList = ({ 
  studyId, 
  onResourceSelectionChange, 
  selectedResources 
}: ResourcesListProps) => {
  const [resources, setResources] = useState<StudyResource[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const studyContext = useStudyContext();

  useEffect(() => {
    if (studyContext?.study) {
      setResources(studyContext.study.resources);
    }
  }, [studyContext?.study?.resources]);

  useEffect(() => {
    const allSelected = resources.length > 0 && selectedResources.length === resources.length;
    setSelectAll(allSelected);
  }, [selectedResources, resources]);

  if (!studyContext) {
    return null;
  }

  const handleResourceToggle = (resource: StudyResource) => {
    const isSelected = selectedResources.some(r => r.identifier === resource.identifier);
    let newSelection: StudyResource[];

    if (isSelected) {
      newSelection = selectedResources.filter(r => r.identifier !== resource.identifier);
    } else {
      newSelection = [...selectedResources, resource];
    }

    onResourceSelectionChange(newSelection);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      onResourceSelectionChange([]);
    } else {
      onResourceSelectionChange([...resources]);
    }
  };

  const isResourceSelected = (resource: StudyResource) => {
    return selectedResources.some(r => r.identifier === resource.identifier);
  };

  return (
    <div className="space-y-4">
      {resources.length > 0 && (
        <div className="flex items-center space-x-2 pb-4 border-b">
          <Checkbox
            id="select-all"
            checked={selectAll}
            onCheckedChange={handleSelectAll}
          />
          <label 
            htmlFor="select-all" 
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Select All ({selectedResources.length}/{resources.length})
          </label>
        </div>
      )}
      
      <div className="space-y-2">
        {resources.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-sm text-muted-foreground">
                No resources added to this study yet. 
                Use the "add resources" tab to add PDFs, web pages, or text content.
              </p>
            </CardContent>
          </Card>
        ) : (
          resources.map((resource, index) => (
            <Card key={resource.identifier || index} className="cursor-pointer hover:bg-gray-50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id={`resource-${index}`}
                    checked={isResourceSelected(resource)}
                    onCheckedChange={() => handleResourceToggle(resource)}
                  />
                  <div className="flex-1 min-w-0">
                    <label 
                      htmlFor={`resource-${index}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {truncateFileName(resource.name)}
                    </label>
                    <p className="text-xs text-muted-foreground mt-1">
                      {resource.type || 'Unknown type'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ResourcesList;