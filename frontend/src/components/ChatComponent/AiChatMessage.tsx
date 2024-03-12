import Markdown from "marked-react";
import { Typography } from "@mui/material";

const AiChatMessage = ({ message }: { message: string }) => {
  return (
    <>
      <Typography
        variant="body1"
        component="p"
        style={{ textAlign: "justify" }}
      >
        <Markdown gfm={true} breaks={true} value={message} />
      </Typography>
    </>
  );
};

export default AiChatMessage;
