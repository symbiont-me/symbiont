"use client";
import { useChat, Message } from "ai/react";
import MessageList from "@/components/ChatComponent/MessageList";
import UserChatInput from "@/components/ChatComponent/UserChatInput";
import { useState, useEffect } from "react";
import { StudyResource } from "@/types";
import ResourceSwitcher from "@/components/ResourceSwitcher";
import "./chats.css";
import { useStudyContext } from "@/app/context/StudyContext";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Trash2 } from "lucide-react";
import Session from "supertokens-auth-react/recipe/session";

type ChatComponentProps = {
  studyId: string;
};


// TODO model selection and api key input should be on the Dashboard
// TODO Fix isLoading state in the message list
const ChatComponent = ({ studyId }: ChatComponentProps) => {
  const currentStudyContext = useStudyContext();
  const [chatLoading, setChatLoading] = useState(true);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [userToken, setUserToken] = useState<string | undefined>(undefined);
  const [combineResources, setCombineResources] = useState(false);
  // NOTE this is used to switch the context for the chat
  const [selectedResource, setSelectedResource] = useState<
    StudyResource | undefined
  >(undefined);
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
      resource_identifier: selectedResource?.identifier,
      combined: combineResources,
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
  }, [messages, selectedResource, input]); // TODO include getUserAuthToken if there is an error

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

  function handleCombineResources(checked: boolean) {
    setCombineResources(checked);
    console.log(checked);
  }

  return (
    <>
      <div className="p-2">
        <ResourceSwitcher
          studyId={studyId}
          onResourceChange={setSelectedResource}
        />
        <div className="flex flex-row justify-between items-center">
          <div className="flex flex-row items-center justify-center gap-2">
            <Checkbox
              checked={combineResources}
              onCheckedChange={handleCombineResources}
              data-testid="combine-resources-checkbox"
            />
            <label htmlFor="combineResources" className="text-xs">
              Combine Resources
            </label>
          </div>
          <div
            className="flex flex-row justify-center items-center cursor-pointer p-2"
            onClick={deleteChat}
          >
            <Button
              variant="destructive"
              size="sm"
              className="h-6 min-w-fit"
              data-testid="clear-chat-button"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              <span className="text-xs">Clear Chat</span>
            </Button>
          </div>
        </div>
      </div>

      <div
        id="message-container"
        className="flex h-screen flex-col overflow-y-auto"
        data-testid="chat-container"
      >
        {chatLoading ? (
          <div className="flex justify-center items-center">
            <LoadingSpinner />
          </div>
        ) : (
          <MessageList messages={messages} isLoading={isLoading} />
        )}
      </div>
      {/* TODO fix height of the input */}
      <div className="m-4">
        {error && (
          <Alert variant="destructive" data-testid="chat-error">
            <AlertDescription>
              {error?.message === "network error"
                ? "Error: Check your Api Key"
                : error?.message}
            </AlertDescription>
          </Alert>
        )}
        {isLoading && (
          <>
            <p className="mb-2 text-xs text-muted-foreground">
              LLM generated responses can have mistakes.{" "}
              <span className="italic">Doveryai, No Proveryai</span>.
            </p>
            <Progress value={undefined} className="mb-2" data-testid="chat-loading" />
          </>
        )}
        <UserChatInput
          input={input}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
        />
      </div>
    </>
  );
};

export default ChatComponent;
