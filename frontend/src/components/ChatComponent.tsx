"use client";
import {useChat, Message} from "ai/react"
import MessageList from "./MessageList";
import UserChatInput from "./UserChatInput";
import {useState, useEffect} from "react";
import ModelSelectDropdown from "./ModelSelectDropdown";
import {TextModels} from '@/const';
import ApiKeyInput from "./ApiKeyInput";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";


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
  console.log(data)
  const [selectedModel, setSelectedModel] = useState<TextModels> (TextModels.GPT_3_5_TURBO)
  const [apiKey, setApiKey] = useState<string> ("")
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: "/api/chat",
    body: {
      chatId,
      model: selectedModel,
      apiKey: apiKey
    },
    initialMessages: data|| [],
  });


//  TODO add choose model dropdown
// TODO add option for adding own api key
// TODO allow user to add their own api key

useEffect(() => {
  const messageContainer = document.getElementById("message-container");
  if (messageContainer) {
    messageContainer.scrollTo(0, messageContainer.scrollHeight);
  }
}, [messages]); 


  return (
    <div
      className="relative max-h-screen overflow-scroll w-full " 
      id="message-container"
    >
      {/* header */}
      <div className="sticky top-0 inset-x-0 p-2 bg-white h-fit">
        <div className="flex flex-row items-center">
        
        <ModelSelectDropdown setModel = {setSelectedModel}/>
        <ApiKeyInput setApiKey = {setApiKey}/>
        </div>
      </div>

      {/* message list */}
      <MessageList messages={messages} />


      {/* input */}
      <div      className="sticky bottom-0 inset-x-0 px-2 py-4 bg-white">
        
      <UserChatInput input={input} handleInputChange={handleInputChange} handleSubmit={handleSubmit}/>
      </div>
    </div>
  );
};

export default ChatComponent;
