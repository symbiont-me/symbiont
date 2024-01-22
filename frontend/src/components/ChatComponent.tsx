"use client";

import {Input}  from "./ui/Input";
import {useState} from "react";
import {Button} from "./ui/Button";
import {Send} from "lucide-react";
import {useChat} from "ai/react"
import MessageList from "./MessageList";

type Props = {};

const ChatComponent = () => {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: "/api/chat",
  });


//  TODO add choose model dropdown
// TODO add option for adding own api key
  return (
    <div
      className="relative max-h-screen overflow-scroll"
      id="message-container"
    >
      {/* header */}
      <div className="sticky top-0 inset-x-0 p-2 bg-white h-fit">
        <h3 className="text-xl font-bold">Chat</h3>
      </div>

      {/* message list */}
      <MessageList messages={messages}  />

      <form
        onSubmit={handleSubmit}
        className="sticky bottom-0 inset-x-0 px-2 py-4 bg-white"
      >
        <div className="flex">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask any question..."
            className="w-full"
          />
          <Button className="bg-blue-600 ml-2">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatComponent;
