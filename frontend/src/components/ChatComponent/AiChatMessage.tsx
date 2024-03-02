import Markdown from "marked-react";

const AiChatMessage = ({ message }: { message: string }) => {
  return (
    <>
      <Markdown gfm={true} breaks={true} value={message} />
    </>
  );
};

export default AiChatMessage;
