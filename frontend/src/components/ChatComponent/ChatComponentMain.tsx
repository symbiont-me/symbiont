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

type ChatComponentProps = {
  chatId: number | undefined;
};

// TODO model selection and api key input should be on the Dashboard
// TODO Fix isLoading state in the message list
const ChatComponent = ({ chatId }: ChatComponentProps) => {
  const path = usePathname();
  const studyId = path.split("/")[2];
  console.log("chatId", chatId);

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
    <div className="h-full p-2 overflow-hidden">
      <div className="h-20 flex flex-col justify-center pr-20 pl-20">
        <ResourceSwitcher
          studyId={studyId}
          onResourceChange={setSelectedResource}
        />
      </div>
      <div
        className="h-screen overflow-auto p-2 bg-slate-100"
        id="message-container"
      >
        <MessageList messages={messages} />
      </div>

      {/* Input */}
      <div className="h-20 flex flex-col justify-center pr-20 pl-20">
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
