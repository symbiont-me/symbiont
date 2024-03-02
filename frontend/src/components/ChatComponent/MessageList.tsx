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

  if (!Array.isArray(messages)) return null;

  return (
    <>
      {messages.map((message, index) => {
        // we want to display a loader on the upcoming message if the response is delayed
        const isLastMessage = index === messages.length - 1;
        return (
          <div key={index} className="relative">
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

                {isLastMessage && isLoading ? (
                  <div className="flex justify-center items-center p-6">
                    <span className="loading loading-spinner loading-xs"></span>
                  </div>
                ) : (
                  <div className="text-xs p-6 bg-symbiont-chatMessageAi rounded-xl">
                    <AiChatMessage message={message.content} />
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
};

export default MessageList;
