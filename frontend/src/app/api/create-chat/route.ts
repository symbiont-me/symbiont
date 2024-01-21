import { NextResponse } from "next/server";
import { loadS3DataIntoPinecone } from "../../../lib/pinecone";
import { auth } from "@clerk/nextjs";
import { db } from "../../../lib/db";
import { chats } from "../../../lib/db/schema";

export async function POST(req: Request, res: Response) {
  const { userId } = auth();

  if (!userId) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { fileKey, fileName } = body;
    console.log(fileName, fileKey);
    await loadS3DataIntoPinecone(fileKey);
    const chat_id = await db
      .insert(chats)
      .values({
        fileKey: fileKey,
        pdfName: fileName,
        pdfUrl: `https://chatpdf.s3.amazonaws.com/${fileKey}`,
        userId: userId,
      })
      .returning({ insertedId: chats.id })
      .execute();

    return NextResponse.json(
      { chat_id: chat_id[0].insertedId },
      { status: 200 }
    );
  } catch (e) {
    console.log(e);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
