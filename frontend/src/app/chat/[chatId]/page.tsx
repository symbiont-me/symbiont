import { auth } from "@clerk/nextjs"
import { redirect } from "next/navigation";
import { db } from "../../../lib/db"
import { chats } from "../../../lib/db/schema"
import { eq } from "drizzle-orm"
import ChatSidebar from "../../../components/ChatSideBar";
import PDFViewer from "../../../components/PdfViewer";
import Chat from "../../../components/ChatComponent";

type Props = {
  params: {
    chatId: string;
  };
}

const ChatPage = async ({ params: { chatId } }: Props) => {
  const { userId } = auth();
  if (!userId) {
    return redirect("/sign-in");
  }
  // get chats from db using the userId
  // TODO fix missing eq
  const _chats = await db.select().from(chats).where(eq(chats.userId, userId));
  if (!_chats) {
    return redirect("/");
  }

   if (!_chats.find((chat) => chat.id === parseInt(chatId))) {
    return redirect("/")
  };

// get current chat from db using the chatId
const currentChat = _chats.find((chat) => chat.id === parseInt(chatId));
console.log(currentChat?.pdfUrl);

  return (
    <div className="flex max-h-screen overflow-scroll">
      {/* chat sidebar */}
      <div className="flex-[1] max-w-xs">
        <ChatSidebar chats={_chats} chatId= {chatId}/>

      </div>
      {/* pdf viewer */}
      <div className="flex-[5] max-h-screen p-4 overflow-scroll">
        <PDFViewer pdfUrl={currentChat?.pdfUrl || ""}/>
      </div>
      {/* chat */}
      <div className="flex-[3] max-w-xs border-slate-200">
        <Chat chatId={parseInt(chatId)}/>

      </div>
    </div>
  )
}

export default ChatPage;
