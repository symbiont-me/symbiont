import Markdown from "marked-react";

// TODO fix markdown rendeing, bullet points are not rendering as list. There doesn't seem to be any markdown rendered
const AiChatMessage = ({ message }: { message: string }) => {
  return (
    <>
      <Markdown gfm={true} breaks={true} value={message} />
    </>
  );
};

export default AiChatMessage;
