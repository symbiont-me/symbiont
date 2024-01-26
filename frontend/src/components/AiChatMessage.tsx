
import Markdown from 'marked-react';

export default function AiChatMessage({ message }: { message: string }) {
    const bulletList = '- something\n- something else\n- something else else\n\n';
    return (
      <div>
       <Markdown gfm = {true} breaks = {true} value= {message}/>
        </div>
    );
  }