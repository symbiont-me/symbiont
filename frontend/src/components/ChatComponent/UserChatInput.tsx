import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useStudyContext } from "@/app/context/StudyContext";
import { useEffect, useState } from "react";
import { StudyResource } from "@/types";
import { Send, AlertTriangle, FileText } from "lucide-react";

type UserChatInputProps = {
  input: string;
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  selectedResources: StudyResource[];
};
const UserChatInput = ({
  input,
  handleInputChange,
  handleSubmit,
  selectedResources,
}: UserChatInputProps) => {
  const studyContext = useStudyContext();
  const [noResourceAlert, setNoResourceAlert] = useState(false);

  useEffect(() => {
    if (selectedResources.length === 0) {
      setNoResourceAlert(true);
      return;
    }
    setNoResourceAlert(false);
  }, [selectedResources]);

  function validateInput(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (input.trim() === "") {
      return;
    }

    if (selectedResources.length === 0) {
      setNoResourceAlert(true);
      return;
    }

    handleSubmit(event);
  }

  const isDisabled = selectedResources.length === 0 || input.trim() === "";

  return (
    <div className="space-y-3">
      {noResourceAlert && (
        <Alert data-testid="no-resources-alert">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Please select resources from the Resources tab before starting a conversation.
          </AlertDescription>
        </Alert>
      )}
      
      {selectedResources.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedResources.slice(0, 3).map((resource, index) => (
            <Badge key={resource.identifier || index} className="text-xs bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200">
              <FileText className="h-3 w-3 mr-1" />
              {resource.name.length > 20 ? `${resource.name.slice(0, 20)}...` : resource.name}
            </Badge>
          ))}
          {selectedResources.length > 3 && (
            <Badge className="text-xs bg-gray-100 text-gray-600 border-gray-200">
              +{selectedResources.length - 3} more
            </Badge>
          )}
        </div>
      )}

      <form onSubmit={validateInput} className="space-y-3">
        <div className="relative">
          <Textarea
            value={input}
            onChange={handleInputChange}
            placeholder={
              selectedResources.length === 0 
                ? "Select resources first to start chatting..." 
                : "Ask questions about your documents..."
            }
            className="min-h-[80px] pr-12 resize-none"
            disabled={selectedResources.length === 0}
            data-testid="chat-input-field"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                validateInput(e as any);
              }
            }}
          />
          <Button
            type="submit"
            size="sm"
            className="absolute bottom-2 right-2 h-8 w-8 p-0 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300"
            disabled={isDisabled}
            data-testid="chat-send-button"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        
        {selectedResources.length > 0 && (
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Press Enter to send, Shift+Enter for new line</span>
            <span className="text-blue-600">
              {selectedResources.length === 1 
                ? "Single document mode" 
                : `Combined mode (${selectedResources.length} docs)`
              }
            </span>
          </div>
        )}
      </form>
    </div>
  );
};

export default UserChatInput;
