"use client";
import { useChat, Message } from "ai/react";
import MessageList from "@/components/ChatComponent/MessageList";
import UserChatInput from "@/components/ChatComponent/UserChatInput";
import { useState, useEffect } from "react";
import { TextModels } from "@/const";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { StudyResource } from "@/types";
import ResourceSwitcher from "@/components/ResourceSwitcher";
import "./chats.css";
import { UserAuth } from "@/app/context/AuthContext";
import { useFetchChatMessages } from "@/hooks/useFetchChatMessages";

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
  const {
    data,
    isLoading: chatLoading,
    isError,
    error,
  } = useFetchChatMessages(studyId);
  const [userToken, setUserToken] = useState<string | undefined>(undefined);

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

  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({
      api: "http://127.0.0.1:8000/chat",
      body: {
        user_query: userQuery,
        previous_message: previousMessage,
        study_id: studyId,
        resource_identifier: selectedResource?.identifier,
      },
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
      initialMessages: data?.chatMessages || [],
    });

  useEffect(() => {
    const messageContainer = document.getElementById("message-container");
    if (messageContainer) {
      messageContainer.scrollTo(0, messageContainer.scrollHeight);
    }
    setUserQuery(input);
    setPreviousMessage(messages[messages.length - 1]?.content);
    getUserAuthToken();
  }, [messages, selectedResource, input]);

  return (
    <>
      <div className="p-4">
        <ResourceSwitcher
          studyId={studyId}
          onResourceChange={setSelectedResource}
        />
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
      <div className=" h-20 flex flex-col justify-center items-center ">
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
