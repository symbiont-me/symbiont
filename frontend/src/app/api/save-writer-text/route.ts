import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { studyTexts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// TODO Add some basic versioning system to the API.
// TODO maybe we need to create the text entry on study creation
export const POST = async (req: NextRequest, res: NextResponse) => {
  const { studyId, userId, studyTextContent, studyTextId } = await req.json();

  // Note overwrites any existing text with the same studyId
  // ? do we need the uderId check as well
  const savedText = await db
    .update(studyTexts)
    .set({
      content: studyTextContent,
    })
    .where(eq(studyTexts.studyId, studyId))
    .execute();

  return NextResponse.json(savedText);
};
