import { NextRequest, NextResponse } from "next/server";
import { chats } from "@/lib/db/schema";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";

type GetChatRequestBody = {
  studyId: number;
  userId: string;
};

export async function POST(req: NextRequest, res: NextResponse) {
  const { studyId, userId }: GetChatRequestBody = await req.json();

  // TODO important security check:  if the user is a member of the study

  const _chat = await db.select().from(chats).where(eq(chats.studyId, studyId));
  return NextResponse.json({ chat_id: _chat[0].id }, { status: 200 });
}
