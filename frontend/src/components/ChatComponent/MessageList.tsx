import { Message } from "ai/react";
import React, { useState } from "react";
import AiChatMessage from "@/components/ChatComponent/AiChatMessage";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import { useCopyToClipboard } from "@/app/hooks/useCopyToClipboard";
import { Citation } from "@/types";
import CitationModal from "@/components/ChatComponent/CitationModal";
import Divider from "@mui/material/Divider";

interface ChatMessage extends Message {
  citations?: Citation[];
}

type MessageListProps = {
  messages: ChatMessage[];
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
  const { isCopied, copyToClipboard } = useCopyToClipboard({ timeout: 1000 });
  const [copyMessageId, setCopyMessageId] = useState<number | null>(null);

  if (!messages) return <></>;

  if (!Array.isArray(messages)) return null;

  function onCopy(content: string, messageID: number) {
    if (isCopied) return;
    copyToClipboard(content);
    setCopyMessageId(messageID);
  }

  return (
    <>
      {messages.map((message, index) => {
        return (
          <div key={index} className="relative">
            {message.role === "user" ? (
              <>
                <div
                  className="user-message w-2/3 self-start rounded bg-teal-200 ml-auto p-4"
                  style={{ maxWidth: "80%" }}
                >
                  <div
                    className="absolute top-1 right-2 cursor-pointer"
                    onClick={() => onCopy(message.content, index)}
                  >
                    {isCopied && copyMessageId === index ? (
                      <span className="text-2xs text-slate-800 font-semibold italic">
                        copied! <CheckIcon sx={{ height: "10px" }} />
                      </span>
                    ) : (
                      <ContentCopyIcon sx={{ height: "14px" }} />
                    )}
                  </div>
                  <p className="text-sm">{message.content}</p>
                </div>
              </>
            ) : (
              <div
                className="ai-response m-2 self-end rounded bg-amber-100 mr-auto w-3/4 p-6 max-w-screen-sm	"
                onClick={handleTextSelect}
              >
                <div
                  className="absolute cursor-pointer top-3 left-4"
                  onClick={() => onCopy(message.content, index)}
                >
                  {isCopied && copyMessageId === index ? (
                    <span className="text-2xs text-slate-800 font-semibold italic">
                      copied! <CheckIcon sx={{ height: "10px" }} />
                    </span>
                  ) : (
                    <ContentCopyIcon sx={{ height: "14px" }} />
                  )}
                </div>

                {message.content && (
                  <>
                    <div className="max-w-screen-sm	">
                      <AiChatMessage message={message.content} />
                    </div>
                    {
                      <div className="min-h-20">
                        <Divider />
                        <p className="text-sm font-semibold mb-2 mt-4">
                          Citations
                        </p>
                        <div className="flex flex-row">
                          {message.citations &&
                            message.citations.map((citation, index) => (
                              <p
                                className="text-xs text-blue-800 font-semibold mr-2 cursor-pointer"
                                key={message.id}
                              >
                                <CitationModal
                                  index={index}
                                  citation={citation}
                                />{" "}
                              </p>
                            ))}
                        </div>
                      </div>
                    }
                  </>
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
