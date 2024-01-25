import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { messages } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export const POST = async (req: NextRequest, res: NextResponse) => {
    const {chatId} = await req.json()

    const _messages = await db.select().from(messages).where(eq(messages.chatId, chatId.chatId))

    return NextResponse.json(_messages)
}