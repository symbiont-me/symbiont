"use client";
import { useChat, Message } from "ai/react";
import MessageList from "@/components/ChatComponent/MessageList";
import UserChatInput from "@/components/ChatComponent/UserChatInput";
import { useState, useEffect } from "react";
import { TextModels } from "@/const";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import ResourceSwitcher from "@/components/ResourceSwitcher";
import { StudyResource } from "@/app/types";

type ChatComponentProps = {
  chatId: number | undefined;
};

// TODO fix on load selectedResource is undefined even though it is set in the ResourceSwitcher
// TODO model selection and api key input should be on the Dashboard

function ChatComponent(chatId: ChatComponentProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["chat", chatId],

    queryFn: async () => {
      const response = await axios.post<Message[]>("/api/get-messages", {
        chatId,
      });
      return response.data;
    },
  });
  const [selectedModel, setSelectedModel] = useState<TextModels>(
    TextModels.GPT_3_5_TURBO,
  );

  // NOTE this is used to switch the context for the chat
  const [selectedResource, setSelectedResource] = useState<
    StudyResource | undefined
  >(undefined);
  console.log(selectedResource);
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: "/api/send-chat-message",
    body: {
      chatId,
      resourceIdentifier: selectedResource?.identifier || "",
    },
    initialMessages: data || [],
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
        <ResourceSwitcher selectedResource={setSelectedResource} />
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
}

export default ChatComponent;
