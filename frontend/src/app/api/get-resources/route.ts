import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { studyResources } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { studyId } = body;
  const resources = await db
    .select()
    .from(studyResources)
    .where(eq(studyResources.studyId, studyId));

  return NextResponse.json(resources);
}
