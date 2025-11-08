import { useState, useEffect } from "react";
import { StudyResource } from "@/types";
import { truncateFileName } from "@/lib/utils";
import { useStudyContext } from "@/app/context/StudyContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import AddResourcesModal from "./AddResourcesModal";

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
    <div className="space-y-6">
      {/* Header with Add Resources Button */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Study Resources
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-3">
            <p className="text-sm text-gray-600">
              Manage and select resources for your AI conversations. Add PDFs, documents, web pages, or text content to enhance your study.
            </p>
            <AddResourcesModal />
          </div>
        </CardContent>
      </Card>

      {/* Resource Selection */}
      {resources.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Select Resources for Chat</CardTitle>
              <div className="flex items-center space-x-2">
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
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {resources.map((resource, index) => (
                <Card key={resource.identifier || index} className="cursor-pointer hover:bg-gray-50 transition-colors">
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
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {resources.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No resources yet</h3>
            <p className="text-sm text-gray-500 mb-4">
              Get started by adding your first resource. You can upload PDFs, add web pages, or create text documents.
            </p>
            <AddResourcesModal />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ResourcesList;