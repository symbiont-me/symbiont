import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { studies } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const POST = async (req: NextRequest, res: NextResponse) => {
  const { userId } = await req.json();

  const _studies = await db
    .select()
    .from(studies)
    .where(eq(studies.userId, userId));
  return NextResponse.json(_studies);
};
