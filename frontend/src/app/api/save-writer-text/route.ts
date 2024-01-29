import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { texts } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

// TODO Add some basic versioning system to the API.

export const POST = async (req: NextRequest, res: NextResponse) => {
    const { studyId, userId, textContent, textId } = await req.json()
    // Note overwrites any existing text with the same studyId and userId
    const savedText = await db.update(texts).set({
        content: textContent
    }).where(eq(texts.id, textId)).returning({updatedId: texts.id}).execute()
    console.log("Text Updated: ", savedText)
    return NextResponse.json(savedText)
}
