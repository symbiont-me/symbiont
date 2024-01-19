import { NextResponse } from "next/server";
import { loadS3DataIntoPinecone } from "../../../lib/pinecone";
export async function POST(req: Request, res: Response) {
  try {
    const body = await req.json();
    const { fileKey, fileName } = body;
    const pages = await loadS3DataIntoPinecone(fileKey);
    return NextResponse.json({ pages })
  } catch (error) {
    console.log(error);
  }
}
