import Markdown from "marked-react";
import { Typography } from "@mui/material";

const AiChatMessage = ({ message }: { message: string }) => {
  return (
    <>
      <Typography
        className="text-xs"
        sx={{
          fontSize: "0.85rem",
          overflowWrap: "break-word",
          hyphens: "auto",
          lineHeight: "1.5", // Add line spacing here
        }}
      >
        <Markdown gfm={true} breaks={true} value={message} />
      </Typography>
    </>
  );
};

export default AiChatMessage;
