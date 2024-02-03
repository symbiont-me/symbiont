"use client";
import { useChat, Message } from "ai/react";
import MessageList from "@/components/ChatComponent/MessageList";
import UserChatInput from "@/components/ChatComponent/UserChatInput";
import { useState, useEffect } from "react";
import ModelSelectDropdown from "@/components/ModelSelectDropdown";
import { TextModels } from "@/const";
import ApiKeyInput from "@/components/ApiKeyInput";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import ResourceSwitcher from "@/components/ResourceSwitcher";
import { StudyResource } from "@/app/types";
type ChatComponentProps = {
  chatId: number | undefined;
};

// TODO fix on load selectedResource is undefined even though it is set in the ResourceSwitcher
// TODO model selection and api key input should be on the Dashboard
const ChatComponent = (chatId: ChatComponentProps) => {
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
    TextModels.GPT_3_5_TURBO
  );

  // NOTE this is used to switch the context for the chat
  const [selectedResource, setSelectedResource] = useState<
    StudyResource | undefined
  >(undefined);
  const [apiKey, setApiKey] = useState<string>("");
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: "/api/send-chat-message",
    body: {
      chatId,
      // model: selectedModel,
      // apiKey: apiKey,
      resourceIdentifier: selectedResource?.identifier || "",
    },
    initialMessages: data || [],
  });

  useEffect(() => {
    const messageContainer = document.getElementById("message-container");
    if (messageContainer) {
      messageContainer.scrollTo(0, messageContainer.scrollHeight);
    }
  }, [messages]);

  return (
    <div className="max-h-screen overflow-hidden w-1/2" id="message-container">
      {/* header */}
      <div className="sticky top-0 inset-x-0 p-2 bg-white h-fit">
        <div className="flex flex-row items-center justify-between mx-4 my-2 space-x-4">
          {/* <ModelSelectDropdown setModel={setSelectedModel} /> */}
          {/* <ApiKeyInput setApiKey={setApiKey} /> */}
          <ResourceSwitcher selectedResource={setSelectedResource} />
        </div>
      </div>

      {/* message list */}
      <MessageList messages={messages} />

      {/* input */}
      <div className="sticky bottom-12 inset-x-0 px-2 py-4 ">
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
