import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { studies, studyTexts, chats } from "@/lib/db/schema";

export const POST = async (req: NextRequest, res: NextResponse) => {
  try {
    // Extract data from request body
    const { studyName, userId, studyImage } = await req.json();
    console.log(studyName, userId, studyImage);
    // Create a new study in the database
    const studyId = await db
      .insert(studies)
      .values({
        name: studyName,
        userId: userId,
      })
      .returning({ insertedId: studies.id })
      .execute();

    // Create a new study text in the database
    const studyTextId = await db
      .insert(studyTexts)
      .values({
        content: "",
        studyId: studyId[0].insertedId,
      })
      .returning({ insertedId: studyTexts.id })
      .execute();

    // create a single chat for the study
    const chatId = await db
      .insert(chats)
      .values({
        studyId: studyId[0].insertedId,
      })
      .returning({ insertedId: chats.id })
      .execute();

    return NextResponse.json({ studyId: studyId[0].insertedId }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "An error occurred while creating the study" },
      { status: 500 },
    );
  }
};
