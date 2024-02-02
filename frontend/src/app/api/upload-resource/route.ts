import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { StudyResource, StudyResourceCategory } from "@/app/types";
import { studyResources } from "@/lib/db/schema";

export async function POST(req: NextRequest, res: NextResponse) {
  const body: StudyResource = await req.json();
  const { studyId, name, url, identifier, category } = body;
  if (!Object.values(StudyResourceCategory).includes(category)) {
    return NextResponse.json({ error: "Invalid resource category" }, { status: 400 });
  }
  const resourceId = db
    .insert(studyResources)
    .values({
      name: name,
      identifier: identifier,
      category: category,
      url: url,
      studyId: studyId,
    })
    .returning({ insertedId: studyResources.id })
    .execute();
  // TODO update other db request to return status code 201
  return NextResponse.json({ resourceId }, { status: 201 });
}
