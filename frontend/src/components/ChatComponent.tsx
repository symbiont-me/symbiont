"use client";
import {useChat} from "ai/react"
import MessageList from "./MessageList";
import UserChatInput from "./UserChatInput";
import {useEffect} from "react";

type Props = {
  chatId: number;
};

const ChatComponent = (chatId: Props) => {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: "/api/chat",
    body: {
      chatId,
    }
  });


//  TODO add choose model dropdown
// TODO add option for adding own api key
// TODO allow user to add their own api key

useEffect(() => {
  const messageContainer = document.getElementById("message-container");
  if (messageContainer) {
    messageContainer.scrollTo(0, messageContainer.scrollHeight);
  }
}, [messages]); // Dependency array includes messages to trigger scroll when they change


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


      {/* input */}
      <UserChatInput input={input} handleInputChange={handleInputChange} handleSubmit={handleSubmit}/>
    </div>
  );
};

export default ChatComponent;
