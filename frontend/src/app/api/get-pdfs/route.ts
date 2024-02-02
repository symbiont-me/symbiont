import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { studies, studyResources } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export const POST = async (req: NextRequest, res: NextResponse) => {
    const {studyId} = await req.json()

    const _pdfs = await db.select().from(studyResources).where(eq(studyId, studyId) && eq(studyResources.category, 'pdf'))

    return NextResponse.json(_pdfs)
}