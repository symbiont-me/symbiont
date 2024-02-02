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
type Props = {
  chatId: number;
};

const ChatComponent = (chatId: Props) => {
  const { data, isLoading } = useQuery({
    queryKey: ["chat", chatId],
    queryFn: async () => {
      const response = await axios.post<Message[]>("/api/get-messages", {
        chatId,
      });
      return response.data;
    },
  });
  console.log(data);
  const [selectedModel, setSelectedModel] = useState<TextModels>(
    TextModels.GPT_3_5_TURBO
  );
  const [selectedResource, setSelectedResource] = useState<string>("");
  const [apiKey, setApiKey] = useState<string>("");
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: "/api/chat",
    body: {
      chatId,
      model: selectedModel,
      apiKey: apiKey,

    },
    initialMessages: data || [],
  });

  console.log(selectedResource);

  //  TODO add choose model dropdown
  // TODO add option for adding own api key
  // TODO allow user to add their own api key

  useEffect(() => {
    const messageContainer = document.getElementById("message-container");
    if (messageContainer) {
      messageContainer.scrollTo(0, messageContainer.scrollHeight);
    }
      // Function to switch the context for the chat when selectedResource changes
      const switchChatContext = async () => {
        try {
          // TODO update context in the chat and pinecone
          const response = await axios.post('/api/switch-context', { chatId, resourceUrl: selectedResource });
          console.log('Chat context switched', response.data);
        } catch (error) {
          console.error('Error switching chat context:', error);
        }
      };

      if (selectedResource) {
        switchChatContext();
      }
    
  }, [messages, selectedResource]);

  return (
    <div className="max-h-screen overflow-hidden w-1/2" id="message-container">
      {/* header */}
      <div className="sticky top-0 inset-x-0 p-2 bg-white h-fit">
        <div className="flex flex-row items-center justify-between mx-4 my-2 space-x-4">
          {/* <ModelSelectDropdown setModel={setSelectedModel} /> */}
          {/* <ApiKeyInput setApiKey={setApiKey} /> */}
          <ResourceSwitcher selectedResource={setSelectedResource}/>
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
