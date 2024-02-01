import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { studyResources } from "@/lib/db/schema";

export async function POST(req: NextRequest, res: NextResponse) {
  const {
    studyId,
    resourceUrl,
    resourceCategory,
    resourceIdentifier,
    resourceName,
  } = await req.json();
  const resourceId = db
    .insert(studyResources)
    .values({
      name: resourceName,
      identifier: resourceIdentifier,
      category: resourceCategory,
      url: resourceUrl,
      studyId: studyId,
    })
    .returning({ insertedId: studyResources.id })
    .execute();
  // TODO update other db request to return status code 201
  return NextResponse.json({ resourceId }, { status: 201 });
}
