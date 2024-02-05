import { cn } from "@/lib/utils";
import { Message } from "ai/react";
import { Loader2 } from "lucide-react";
import React from "react";
import AiChatMessage from "@/components/ChatComponent/AiChatMessage";

type MessageListProps = {
  isLoading: boolean;
  messages: Message[];
};

// TODO use cn function from utils to conditionally render classes
const MessageList = ({ messages, isLoading }: MessageListProps) => {
  if (isLoading) {
    return <span className="loading loading-ring loading-lg"></span>;
  }
  if (!messages) return <></>;

  return (
    <div className="flex flex-col gap-2 px-4  h-screen">
      {messages.map((message) => {
        return (
          <div key={message.id}>
            {message.role === "user" ? (
              <div className="chat chat-end">
                <div className="chat-bubble chat-bubble-primary text-sm p-6">
                  {message.content}
                </div>
              </div>
            ) : (
              <div className="chat chat-start">
                <div className="chat-bubble text-sm p-6">
                  <AiChatMessage message={message.content} />
                </div>
              </div>
            )}
            {/* renders markdown */}
          </div>
        );
      })}
    </div>
  );
};

export default MessageList;
