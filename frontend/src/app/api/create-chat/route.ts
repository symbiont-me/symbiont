import { NextResponse } from "next/server";
import { loadS3DataIntoPinecone } from "../../../lib/pinecone";
import { auth } from "@clerk/nextjs";
import { db } from "../../../lib/db";
import { chats } from "../../../lib/db/schema";
import { getS3Url } from "../../../lib/s3";

export async function POST(req: Request, res: Response) {
  const { userId } = auth();

  if (!userId) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }

  const body = await req.json();
  const { fileKey, fileName } = body;
  console.log("Loading data into Pinecone");
  await loadS3DataIntoPinecone(fileKey);

  console.log("Inserting into DB");
  const chat_id = await db
    .insert(chats)
    .values({
      fileKey: fileKey,
      pdfName: fileName,
      pdfUrl: getS3Url(fileKey),
      userId: userId,
    })
    .returning({ insertedId: chats.id })
    .execute();


  return NextResponse.json({ chat_id: chat_id[0].insertedId }, { status: 200 });
}
