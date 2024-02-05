import Markdown from "marked-react";

// TODO fix markdown rendeing, bullet points are not rendering as list. There doesn't seem to be any markdown rendered
function AiChatMessage({ message }: { message: string }) {
  return (
    <div>
      <Markdown gfm={true} breaks={true} value={message} />
    </div>
  );
}

export default AiChatMessage;
