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
    <>
      {messages.map((message) => {
        return (
          <div key={message.id}>
            {message.role === "user" ? (
              <div className="chat chat-end">
                <p className="rounded-xl text-xs p-4 bg-symbiont-chatMessageUser text-symbiont-900">
                  {message.content}
                </p>
              </div>
            ) : (
              <div className="chat chat-start">
                <p className="text-xs p-6 bg-symbiont-chatMessageAi rounded-xl">
                  <AiChatMessage message={message.content} />
                </p>
              </div>
            )}
            {/* renders markdown */}
          </div>
        );
      })}
    </>
  );
};

export default MessageList;
