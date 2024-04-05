import Markdown from "marked-react";
import { Typography } from "@mui/material";

const AiChatMessage = ({ message }: { message: string }) => {
  return (
    <>
      <div className="break-words leading-6 text-sm">
        {/* @note removing the p tag will make the copy break. If you can fix both, great, otherwise leave it be */}
        {/* there is a minor warning about p descendant of p */}
        <p>
          <Markdown gfm={true} breaks={true} value={message} />
        </p>
      </div>
    </>
  );
};

export default AiChatMessage;
