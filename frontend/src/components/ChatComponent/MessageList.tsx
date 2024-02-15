import { cn } from "@/lib/utils";
import { Message } from "ai/react";
import { Loader2 } from "lucide-react";
import React from "react";
import AiChatMessage from "@/components/ChatComponent/AiChatMessage";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy } from "@fortawesome/free-solid-svg-icons";

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

  // TODO add tooltip to copy icon
  // TODO toast message on copy
  const copyMessage = (e: React.MouseEvent) => {
    const messageElement = (e.currentTarget as HTMLElement)
      .closest(".chat")
      ?.querySelector("p");
    const message = messageElement?.textContent || "";
    console.log(message);
    if (message) {
      navigator.clipboard.writeText(message);
    }
  };

  return (
    <>
      {messages.map((message) => {
        return (
          <div key={message.id} className="relative">
            {message.role === "user" ? (
              <div className="chat chat-end">
                <p className="rounded-xl text-xs p-4 bg-symbiont-chatMessageUser text-symbiont-background">
                  {message.content}
                </p>
              </div>
            ) : (
              <div className="chat chat-start">
                <div
                  className="absolute top-0 right-0 p-2 mr-4 cursor-pointer"
                  onClick={copyMessage}
                >
                  <FontAwesomeIcon icon={faCopy} />
                </div>
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
