"use client";
import { useChat, Message } from "ai/react";
import MessageList from "@/components/ChatComponent/MessageList";
import UserChatInput from "@/components/ChatComponent/UserChatInput";
import { useState, useEffect } from "react";
import { TextModels } from "@/const";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { usePathname } from "next/navigation";
import { StudyResource } from "@/types";
import ResourceSwitcher from "@/components/ResourceSwitcher";
import "./chats.css";

type ChatComponentProps = {
  chatId: number | undefined;
};

// TODO model selection and api key input should be on the Dashboard
// TODO Fix isLoading state in the message list
const ChatComponent = ({ chatId }: ChatComponentProps) => {
  const path = usePathname();
  const studyId = path.split("/")[2];

  const getMessagesQuery = useQuery({
    queryKey: ["chat-messages", chatId],
    queryFn: async () => {
      const response = await axios.post<Message[]>("/api/get-messages", {
        chatId: chatId,
      });
      return response.data;
    },
  });

  // NOTE this is used to switch the context for the chat
  const [selectedResource, setSelectedResource] = useState<
    StudyResource | undefined
  >(undefined);

  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: "/api/send-chat-message",
    body: {
      chatId: chatId,
      resourceIdentifier: selectedResource?.identifier || "",
    },
    initialMessages: getMessagesQuery.data || [],
  });

  useEffect(() => {
    const messageContainer = document.getElementById("message-container");
    if (messageContainer) {
      messageContainer.scrollTo(0, messageContainer.scrollHeight);
    }
  }, [messages, selectedResource]);

  return (
    <div className="h-80">
      <div className="">
        <ResourceSwitcher
          studyId={studyId}
          onResourceChange={setSelectedResource}
        />
      </div>
      <div className="" id="message-container">
        <div className="overflow-auto p-4 w-full" style={{ height: "700px" }}>
          <MessageList messages={messages} />
        </div>
      </div>
      <div className="chat-input h-20 flex flex-col justify-center pr-20 pl-20">
        <UserChatInput
          input={input}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
        />
      </div>
    </div>
  );
};

export default ChatComponent;
