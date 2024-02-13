import { studies } from "@/lib/db/schema";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
export const POST = async (req: NextRequest, res: NextResponse) => {
  const { studyId } = await req.json();
  const study = await db.select().from(studies).where(eq(studies.id, studyId));
  return NextResponse.json({ study });
};
