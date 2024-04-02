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

// TODO use this function to display a menu that can then be added to chat input and call handle submit
// Example:  Copy | Translate | Reword | Explain
const handleTextSelect = (event: React.MouseEvent) => {
  const selection = window.getSelection();
  if (selection && selection.toString().length > 0) {
    console.log(selection.toString());
  }
};

// TODO use cn function from utils to conditionally render classes
// TODO add loader if the stream is delayed. NOTE: using isLoading is not going to work as it waits for the entire response to be received
const MessageList = ({ messages, isLoading }: MessageListProps) => {
  const [aiMessageCopied, setAiMessageCopied] = useState(false);
  const [userMessageCopied, setUserMessageCopied] = useState(false);
  if (!messages) return <></>;

  /**
   * Copies the text content of a message element to the clipboard.
   *
   * @param e - The mouse event that triggered the copy action.
   * @param role - The role of the message ("ai" or "user").
   */
  const copyMessage = (e: React.MouseEvent, role: "ai" | "user") => {
    const messageClass = role === "ai" ? ".ai-response" : ".user-message";
    const setCopied = role === "ai" ? setAiMessageCopied : setUserMessageCopied;

    const messageElement = (e.currentTarget as HTMLElement)
      .closest(messageClass)
      ?.querySelector("p");
    if (messageElement) {
      const range = document.createRange();
      range.selectNodeContents(messageElement);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);

      try {
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => {
          setCopied(false);
        }, 2000);
      } catch (err) {
        console.error("Unable to copy formatting", err);
      }

      selection?.removeAllRanges();
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
              <>
                <div className="user-message m-2 w-1/2 self-start rounded bg-green-200 p-2 ml-auto pb-4 pl-4 pr-4">
                  <div
                    className="relative cursor-pointer flex justify-end "
                    onClick={(e) => copyMessage(e, "user")}
                  >
                    {userMessageCopied ? (
                      <span className="text-2xs text-slate-800 font-semibold italic">
                        copied! <CheckIcon sx={{ height: "10px" }} />
                      </span>
                    ) : (
                      <ContentCopyIcon sx={{ height: "14px" }} />
                    )}
                  </div>
                  <p className="text-xs">{message.content}</p>
                </div>
              </>
            ) : (
              <div
                className="ai-response m-2 self-end rounded bg-yellow-50 p-6 mr-auto w-3/4"
                onClick={handleTextSelect}
              >
                <div
                  className="relative cursor-pointer flex justify-end "
                  onClick={(e) => copyMessage(e, "ai")}
                >
                  {aiMessageCopied ? (
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
