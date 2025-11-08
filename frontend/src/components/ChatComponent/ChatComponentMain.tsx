"use client";
import { useChat, Message } from "ai/react";
import MessageList from "@/components/ChatComponent/MessageList";
import UserChatInput from "@/components/ChatComponent/UserChatInput";
import { useState, useEffect } from "react";
import { StudyResource } from "@/types";
import { useStudyContext } from "@/app/context/StudyContext";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trash2, MessageSquare, FileText, AlertCircle, CheckCircle2 } from "lucide-react";
import Session from "supertokens-auth-react/recipe/session";

type ChatComponentProps = {
  studyId: string;
  selectedResources: StudyResource[];
};


// TODO model selection and api key input should be on the Dashboard
// TODO Fix isLoading state in the message list
const ChatComponent = ({ studyId, selectedResources }: ChatComponentProps) => {
  const currentStudyContext = useStudyContext();
  const [chatLoading, setChatLoading] = useState(true);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [userToken, setUserToken] = useState<string | undefined>(undefined);
  const [userQuery, setUserQuery] = useState("");
  const [previousMessage, setPreviousMessage] = useState("");
  useEffect(() => {
    async function fetchAccessToken() {
      const accessToken = await Session.getAccessToken();
      if (accessToken) {
        setUserToken(accessToken);
      }
    }
    fetchAccessToken();
  }, []);

  useEffect(() => {
    if (currentStudyContext?.study) {
      //@ts-ignore
      setChatMessages(currentStudyContext.study.chat);
    }
  }, [currentStudyContext?.study?.chat]);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    setMessages,
    error,
  } = useChat({
    api: `${process.env.NEXT_PUBLIC_BASE_URL}/chat`,
    body: {
      user_query: userQuery,
      previous_message: previousMessage,
      study_id: studyId,
      resource_identifier: selectedResources.length > 0 ? selectedResources[0].identifier : null,
      combined: selectedResources.length > 1,
    },
    credentials: "include",
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
    initialMessages: chatMessages || [],
  });

  useEffect(() => {
    const messageContainer = document.getElementById("message-container");
    if (messageContainer) {
      messageContainer.scrollTo(0, messageContainer.scrollHeight);
    }
    setUserQuery(input);
    setPreviousMessage(messages[messages.length - 1]?.content);
    // getUserAuthToken();
    setChatLoading(false);
  }, [messages, selectedResources, input]); // TODO include getUserAuthToken if there is an error

  function deleteChat() {
    if (!currentStudyContext?.study) {
      return;
    }
    currentStudyContext.deleteChatMessages(studyId);
    // NOTE: this retriggers the useChat hook which is essential, otherwise it keeps using the old state
    setMessages([]);
  }

  async function updateChat() {
    if (!currentStudyContext?.study) {
      return;
    }
    if (isLoading) return;
    try {
      const res = await currentStudyContext.fetchCurrentStudy(studyId);
      if (res) {
        setMessages(res.studies[0].chat);
      }
    } catch (error) {
      console.error("Error updating chat:", error);
    }
  }

  useEffect(() => {
    if (currentStudyContext?.study) {
      updateChat();
    }
  }, [isLoading]);


  const getResourceStatusInfo = () => {
    if (selectedResources.length === 0) {
      return {
        icon: <AlertCircle className="h-4 w-4 text-orange-500" />,
        text: "No resources selected",
        description: "Go to the Resources tab to select documents for your conversation"
      };
    }
    
    if (selectedResources.length === 1) {
      return {
        icon: <CheckCircle2 className="h-4 w-4 text-green-600" />,
        text: `Using: ${selectedResources[0].name}`,
        description: "Chatting with one document"
      };
    }
    
    return {
      icon: <FileText className="h-4 w-4 text-blue-600" />,
      text: `${selectedResources.length} resources selected`,
      description: "Using combined context from multiple documents"
    };
  };

  const statusInfo = getResourceStatusInfo();

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="flex-shrink-0 p-4 pb-3 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            <div>
              <h3 className="font-semibold text-lg text-gray-900">AI Assistant</h3>
              <div className="flex items-center space-x-2 mt-1">
                {statusInfo.icon}
                <span className="text-sm text-gray-600">{statusInfo.description}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className="text-xs bg-blue-100 text-blue-700 border-blue-200">
              {statusInfo.text}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={deleteChat}
              className="h-8 px-2 text-gray-500 hover:text-red-600 hover:bg-red-50"
              data-testid="clear-chat-button"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Clear
            </Button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        <div
          id="message-container"
          className="h-full overflow-y-auto px-4 py-3"
          data-testid="chat-container"
        >
          {chatLoading ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-3">
              <LoadingSpinner />
              <p className="text-sm text-gray-500">Loading conversation...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4 text-center">
              <MessageSquare className="h-12 w-12 text-gray-300" />
              <div className="space-y-2">
                <h4 className="text-lg font-medium text-gray-900">Start a conversation</h4>
                <p className="text-sm text-gray-500 max-w-sm">
                  {selectedResources.length === 0 
                    ? "Select resources from the Resources tab first, then ask questions about your documents."
                    : "Ask questions about your selected documents. I'll provide answers with relevant citations."
                  }
                </p>
              </div>
            </div>
          ) : (
            <MessageList messages={messages} isLoading={isLoading} />
          )}
        </div>
      </div>

      {/* Input Area - Fixed at bottom */}
      <div className="flex-shrink-0 p-4 border-t bg-gray-50/50 space-y-3">
        {error && (
          <Alert variant="destructive" data-testid="chat-error">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error?.message === "network error"
                ? "Network error: Please check your API key and connection"
                : error?.message}
            </AlertDescription>
          </Alert>
        )}
        
        {isLoading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">
                AI is thinking...
              </p>
              <p className="text-xs text-gray-500 italic">
                Generated responses may contain errors
              </p>
            </div>
            <Progress value={undefined} className="h-1 bg-blue-100" data-testid="chat-loading" />
          </div>
        )}
        
        <UserChatInput
          input={input}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          selectedResources={selectedResources}
        />
      </div>
    </div>
  );
};

export default ChatComponent;
