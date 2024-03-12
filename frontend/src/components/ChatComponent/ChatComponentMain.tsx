"use client";
import { useChat, Message } from "ai/react";
import MessageList from "@/components/ChatComponent/MessageList";
import UserChatInput from "@/components/ChatComponent/UserChatInput";
import { useState, useEffect } from "react";
import { StudyResource } from "@/types";
import ResourceSwitcher from "@/components/ResourceSwitcher";
import "./chats.css";
import { UserAuth } from "@/app/context/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { useStudyContext } from "@/app/context/StudyContext";
import Button from "@mui/material/Button";
import DeleteIcon from "@mui/icons-material/Delete";
import Checkbox from "@mui/material/Checkbox";

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
      setChatMessages(currentStudyContext.study.chatMessages);
    }
  }, [currentStudyContext]);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    setMessages,
  } = useChat({
    api: "http://127.0.0.1:8000/chat",
    body: {
      user_query: userQuery,
      previous_message: previousMessage,
      study_id: studyId,
      resource_identifier: selectedResource?.identifier,
      combined: combineResources,
    },
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
  }, [messages, selectedResource, input]);

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
      <div className="p-4">
        <ResourceSwitcher
          studyId={studyId}
          onResourceChange={setSelectedResource}
        />

        <Checkbox {...label} onChange={handleCombineResources} />
        <label htmlFor="combineResources">Combine Resources</label>
      </div>
      <div
        className="flex flex-row justify-center items-center cursor-pointer p-2"
        onClick={deleteChat}
      >
        <Button variant="contained" endIcon={<DeleteIcon />}>
          Clear Chat
        </Button>
      </div>
      <div
        id="message-container"
        className=" h-80 flex-1 overflow-scroll p-4"
        style={{ height: "500px" }}
      >
        {chatLoading ? (
          <div className="flex justify-center items-center">
            <span className="loading loading-spinner loading-md"></span>
          </div>
        ) : (
          <MessageList messages={messages} isLoading={isLoading} />
        )}
      </div>
      {/* TODO fix height of the input */}
      <div>
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
