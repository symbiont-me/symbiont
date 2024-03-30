import { Message } from "ai/react";
import React, { useState } from "react";
import AiChatMessage from "@/components/ChatComponent/AiChatMessage";
import { Typography } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

import CircularProgress from "@mui/material/CircularProgress";
import CheckIcon from "@mui/icons-material/Check";

type MessageListProps = {
  messages: Message[];
  isLoading: boolean;
};

// TODO use cn function from utils to conditionally render classes
// TODO add loader if the stream is delayed. NOTE: using isLoading is not going to work as it waits for the entire response to be received
const MessageList = ({ messages, isLoading }: MessageListProps) => {
  const [copied, setCopied] = useState(false);
  if (!messages) return <></>;

  // TODO add tooltip to copy icon

  const copyMessage = (e: React.MouseEvent) => {
    // NOTE: ai-response is a dummy class to get the required element for copying the text
    const messageElement = (e.currentTarget as HTMLElement)
      .closest(".ai-response")
      ?.querySelector("p");
    const message = messageElement?.textContent || "";
    if (message) {
      navigator.clipboard.writeText(message);
    }
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
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
              <>
                <div className="m-2 w-1/2 self-start rounded bg-green-200 p-4 ml-auto">
                  <p className="text-xs">{message.content}</p>
                </div>
              </>
            ) : (
              <div className="ai-response m-2 self-end rounded bg-yellow-50 p-6 mr-auto w-3/4">
                <div
                  className="absolute top-2 right-16 p-2 mr-4 cursor-pointer flex justify-end mb-4"
                  onClick={copyMessage}
                >
                  {copied ? (
                    <span className="text-2xs text-slate-800 font-semibold italic">
                      copied! <CheckIcon sx={{ height: "10px" }} />
                    </span>
                  ) : (
                    <ContentCopyIcon sx={{ height: "14px" }} />
                  )}
                </div>

                {isLastMessage && !message.content ? (
                  <div className="flex justify-center items-center p-6 w-full">
                    <CircularProgress />
                  </div>
                ) : (
                  <div>
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
