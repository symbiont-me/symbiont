import { NextResponse } from "next/server";

export async function POST(req: Request, res: Response) {
  try {
    const body = await req.json();
    const { fileKey, fileName } = body;
  } catch (error) {
    console.log(error);
  }
}
