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

type ChatComponentProps = {
  chatId: number | undefined;
  studyId: string;
};

type Chat = {
  chatMessages: Message[];
};

// TODO model selection and api key input should be on the Dashboard
// TODO Fix isLoading state in the message list
const ChatComponent = ({ chatId, studyId }: ChatComponentProps) => {
  const getMessagesQuery = useQuery({
    queryKey: ["chat-messages", chatId],
    queryFn: async () => {
      // TODO add return type
      const response = await axios.post<Chat>(
        `http://127.0.0.1:8000/get-chat-messages?studyId=${studyId}`
        // {
        //   chatId: chatId,
        // }
      );
      return response.data.chatMessages;
    },
  });

  // NOTE this is used to switch the context for the chat
  const [selectedResource, setSelectedResource] = useState<
    StudyResource | undefined
  >(undefined);
  const [userQuery, setUserQuery] = useState("");
  const [previousMessage, setPreviousMessage] = useState("");

  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: "http://127.0.0.1:8000/chat",
    body: {
      user_query: userQuery,
      previous_message: previousMessage,
      study_id: studyId,
      resource_identifier: selectedResource?.identifier,
    },
    initialMessages: getMessagesQuery.data || [],
  });

  useEffect(() => {
    const messageContainer = document.getElementById("message-container");
    if (messageContainer) {
      messageContainer.scrollTo(0, messageContainer.scrollHeight);
    }
    setUserQuery(input);

    console.log("User Input", userQuery);

    setPreviousMessage(messages[messages.length - 1].content);
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
        className=" h-80 flex-1 overflow-scroll p-4"
        style={{ height: "500px" }}
      >
        <MessageList messages={messages} />
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
