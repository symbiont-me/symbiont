import Link from 'next/link'
import { Button } from '../ui/Button'
import { PlusCircle } from 'lucide-react'
import {DrizzleChat} from '@/lib/db/schema'

type Props = { 
    chats: DrizzleChat[];
    chatId: string;

}

const ChatSidebar =  ({chats, chatId}: Props) => {
    return (
        <div className="w-full h-screen p-4 text-gray-200 bg-gray-900">
        <Link href = "/">
            <Button>
                <PlusCircle className='mr-2 w-4 h-4'/>
                Create a new chat
            </Button>
        </Link>
        <div>
            {chats.map((chat) => {
                return (
                    <Link href={`/chat/${chat.id}`} key={chat.id} className={`block p-2 my-2 rounded-xl ${chat.id === parseInt(chatId) ? 'bg-gray-700' : ''}`}>
                            {chat.pdfName}
                    </Link>
                )
            }
            )}
        </div>


        </div>
    )
}

export default ChatSidebar