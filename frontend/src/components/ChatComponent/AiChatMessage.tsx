// https://github.com/mckaywrigley/chatbot-ui
import React, { ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Typography } from "@mui/material";
import { MessageCodeBlock } from "./MessageCodeBlock"; // Adjust the import path as necessary

const AiChatMessage = React.memo(({ message }: { message: string }) => {
  AiChatMessage.displayName = "AiChatMessage";
  // Define custom renderers for react-markdown
  const renderers = {
    h2: ({ node, children }: { node: ReactNode; children: ReactNode }) => (
      <h2 className="mt-4 mb-4">{children}</h2>
    ),

    p: ({ node, children }: { node: ReactNode; children: ReactNode }) => (
      <p className="mb-2 mt-2">{children}</p>
    ),

    img: ({ node, ...props }: { node: ReactNode }) => (
      <img {...props} style={{ maxWidth: "67%" }} />
    ),
    // Custom renderer for code blocks
    code: ({
      node,
      inline,
      className,
      children,
      ...props
    }: {
      node: ReactNode;
      inline: boolean;
      className: string;
      children: ReactNode;
    }) => {
      if (inline) {
        return (
          <code className={className} {...props}>
            {children}
          </code>
        );
      }
      const match = /language-(\w+)/.exec(className || "");
      // if there's a match, render the code block with syntax highlighting
      return match ? (
        <MessageCodeBlock
          language={match[1]}
          value={String(children).replace(/\n$/, "")}
          {...props}
        />
      ) : (
        <code
          className={`${className} bg-slate-100 text-red-500 rounded pr-1 pl-1 font-semibold`}
          style={{ whiteSpace: "pre-wrap" }}
          {...props}
        >
          {children}
        </code>
      );
    },
  };

  return (
    <ReactMarkdown
      className="break-words leading-6 text-sm"
      remarkPlugins={[remarkGfm]}
      components={renderers as any}
    >
      {message}
    </ReactMarkdown>
  );
});

export default AiChatMessage;
