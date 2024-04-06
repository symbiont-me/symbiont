"use client";
import { useChat, Message } from "ai/react";
import MessageList from "@/components/ChatComponent/MessageList";
import UserChatInput from "@/components/ChatComponent/UserChatInput";
import { useState, useEffect } from "react";
import { StudyResource } from "@/types";
import ResourceSwitcher from "@/components/ResourceSwitcher";
import "./chats.css";
import { UserAuth } from "@/app/context/AuthContext";
import { useStudyContext } from "@/app/context/StudyContext";
import Button from "@mui/material/Button";
import DeleteIcon from "@mui/icons-material/Delete";
import Checkbox from "@mui/material/Checkbox";
import CircularProgress from "@mui/material/CircularProgress";
import { Alert } from "@mui/material";
import LinearProgress from "@mui/material/LinearProgress";

const label = { inputProps: { "aria-label": "Combine Resources" } };

type ChatComponentProps = {
  studyId: string;
};

type Chat = {
  chatMessages: Message[];
};

// TODO model selection and api key input should be on the Dashboard
// TODO Fix isLoading state in the message list
const ChatComponent = ({ studyId }: ChatComponentProps) => {
  const authContext = UserAuth();
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

  async function getUserAuthToken() {
    if (authContext?.user?.getIdToken) {
      const token = await authContext.user.getIdToken();
      setUserToken(token);
    }
  }

  useEffect(() => {
    if (currentStudyContext?.study) {
      //@ts-ignore
      setChatMessages(currentStudyContext.study.chatMessages);
      console.log("chat messages", currentStudyContext.study.chatMessages);
    }
  }, [currentStudyContext?.study?.chatMessages]);

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
    getUserAuthToken();
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

  function handleCombineResources() {
    setCombineResources(!combineResources);
    console.log(combineResources);
  }

  return (
    <>
      <div className="p-2">
        <ResourceSwitcher
          studyId={studyId}
          onResourceChange={setSelectedResource}
        />
        <div className="flex flex-row justify-between items-center">
          <div className="flex flex-row items-center justify-center">
            <Checkbox
              {...label}
              onChange={handleCombineResources}
              sx={{ height: "10px" }}
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
              variant="contained"
              endIcon={<DeleteIcon />}
              size="small"
              style={{ minWidth: "auto", height: "24px" }}
            >
              <span className="text-2xs">Clear Chat</span>
            </Button>
          </div>
        </div>
      </div>

      <div
        id="message-container"
        className="flex h-screen flex-col overflow-y-auto"
      >
        {chatLoading ? (
          <div className="flex justify-cent  items-center">
            <CircularProgress />
          </div>
        ) : (
          <MessageList messages={messages} isLoading={isLoading} />
        )}
      </div>
      {/* TODO fix height of the input */}
      <div className="m-4">
        {error && <Alert severity="error">{error?.message}</Alert>}
        {isLoading && (
          <>
            <p className="mb-2 text-2xs">
              LLM generated responses can have mistakes.{" "}
              <span className="italic">Doveryai, No Proveryai</span>.
            </p>
            <LinearProgress color="secondary" className="mb-2" />
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
