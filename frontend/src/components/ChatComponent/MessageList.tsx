import { cn } from "@/lib/utils";
import { Message } from "ai/react";
import React, { useState } from "react";
import AiChatMessage from "@/components/ChatComponent/AiChatMessage";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy } from "@fortawesome/free-solid-svg-icons";
import { Typography } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import Alert from "@mui/material/Alert";

type MessageListProps = {
  isLoading: boolean;
  messages: Message[];
};

// TODO use cn function from utils to conditionally render classes
// TODO add loader if the stream is delayed. NOTE: using isLoading is not going to work as it waits for the entire response to be received
const MessageList = ({ messages, isLoading }: MessageListProps) => {
  if (!messages) return <></>;

  // TODO add tooltip to copy icon
  // TODO toast message on copy
  const copyMessage = (e: React.MouseEvent) => {
    const messageElement = (e.currentTarget as HTMLElement)
      .closest(".chat")
      ?.querySelector("p");
    const message = messageElement?.textContent || "";
    <Alert severity="success">This is a success Alert.</Alert>;
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
                <div className=" p-4 bg-symbiont-chatMessageUser text-symbiont-background">
                  <Typography variant="body1" component="p">
                    {message.content}
                  </Typography>
                </div>
              </div>
            ) : (
              <div className="chat chat-start">
                <div
                  className="absolute top-0 right-0 p-2 mr-4 cursor-pointer"
                  onClick={copyMessage}
                >
                  <ContentCopyIcon />
                </div>

                {isLastMessage && isLoading ? (
                  <div className="flex justify-center items-center p-6">
                    <span className="loading loading-spinner loading-xs"></span>
                  </div>
                ) : (
                  <div className="p-10 bg-blue-100">
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
