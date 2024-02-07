// TODO remove as context being uploaded in the upload-resource endpoint

import { NextResponse , NextRequest} from "next/server";
import { loadS3DataIntoPinecone } from "../../../lib/pinecone";
import { db } from "../../../lib/db";
import { chats } from "../../../lib/db/schema";
import { getS3Url } from "../../../lib/s3";
import { StudyResource, StudyResourceCategory } from "@/types";
import axios from "axios";


type CreateChatContextRequestBody = {
  studyId: number;
};

export async function POST(req: NextRequest, res: NextResponse) {
  const userId = "mock";
  if (!userId) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }

  const body: CreateChatContextRequestBody = await req.json();
  const { studyId } = body;
  // TODO get the studyId and call the get-resources endpoint
  // TODO add the resources one by one to pinecone
  // TODO should send to get-resources instead of get-pdfs because we want to add context from various resources including audio and video transcripts
  // NOTE get-pdfs is easier to test for now
  const getResources = async () => {
    try {
      const response = await axios.post('/api/get-pdfs', { studyId });
      return response.data;
    } catch (error) {
      console.error('Error fetching resources:', error);
      return null;
    }
  };

  const resources = await getResources();
  resources.forEach(async (resource: StudyResource) => {
    await loadS3DataIntoPinecone(resource.identifier);
  })


  console.log("Inserting into DB");
  // NOTE chat is already created when the study is created

  return NextResponse.json({ chat_id: "mock"}, { status: 200 });
}
