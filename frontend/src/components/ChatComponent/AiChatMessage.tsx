import Markdown from "marked-react";
import { Typography } from "@mui/material";

const AiChatMessage = ({ message }: { message: string }) => {
  return (
    <>
      <p className="text-xs">
        <Markdown gfm={true} breaks={true} value={message} />
      </p>
    </>
  );
};

export default AiChatMessage;
