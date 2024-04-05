import Markdown from "marked-react";
import { Typography } from "@mui/material";

const AiChatMessage = ({ message }: { message: string }) => {
  return (
    <>
      <div className="break-words leading-6 text-sm">
        <Markdown gfm={true} breaks={true} value={message} />
      </div>
    </>
  );
};

export default AiChatMessage;
