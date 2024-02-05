import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { resourceCategoryEnum, studies, studyResources } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export const POST = async (req: NextRequest, res: NextResponse) => {
  const { studyId } = await req.json();

  // TODO fix query to get only PDFs
  const _pdfs = await db
    .select()
    .from(studyResources)
    .where(eq(studyResources.studyId, studyId));
  return NextResponse.json(_pdfs);
};
