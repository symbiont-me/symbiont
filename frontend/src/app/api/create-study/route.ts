import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { studies } from "@/lib/db/schema";

export const POST = async (req: NextRequest, res: NextResponse) => {
  try {
    // Extract data from request body
    const { studyName, userId } = await req.json();
    console.log(studyName);

    // Create a new study in the database
    const studyId = await db
      .insert(studies)
      .values({
        name: studyName,
        userId: userId,
      })
      .returning({ insertedId: studies.id })
      .execute();

    console.log(studyId);
    return NextResponse.json({ message: "Study created successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "An error occurred while creating the study" },
      { status: 500 }
    );
  }
};
