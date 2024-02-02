import { NextRequest, NextResponse } from 'next/server';
import {chats} from "@/lib/db/schema";
import {db} from "@/lib/db";
import {eq} from "drizzle-orm";
export async function POST(req: NextRequest, res: NextResponse) {
    const requestBody = await req.json();
    const _chat = await db.select().from(chats).where(eq(chats.studyId, requestBody.studyId));
    return NextResponse.json({ chat_id: _chat[0].id }, { status: 200 });
}