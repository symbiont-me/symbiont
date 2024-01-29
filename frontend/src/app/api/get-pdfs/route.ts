import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { chats } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export const POST = async (req: NextRequest, res: NextResponse) => {
    const {studyId} = await req.json()

    const _pdfs = await db.select().from(chats).where(eq(chats.studyId, 1))

    return NextResponse.json(_pdfs)
}