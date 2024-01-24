import { NextRequest, NextResponse } from 'next/server';
import { Configuration, OpenAIApi, ChatCompletionRequestMessageRoleEnum } from "openai-edge";
import {Message, OpenAIStream, StreamingTextResponse} from "ai";
import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
export const runtime = "edge";
import { getContext } from "@/lib/context";

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(config);

// TODO create a list of available models
// TODO create a switcher for the models

type ChatRequest = {
  messages: Array<{ role: string; content: string }>;
  chatId: { chatId: number };
};

export async function POST(req: NextRequest, res: NextResponse) {
  try {
    const requestBody: ChatRequest = await req.json();
    const {chatId} = requestBody.chatId
    const messages = requestBody.messages; 

    // const chatId = parseInt(requestBody.chatId, 10);
    if (isNaN(chatId)) {
      return NextResponse.json({ error: "Invalid chatId" }, { status: 400 });
    }
    console.log(messages)
    // get user message
    const lastMessage = messages[messages.length - 1].content;
    
    // get fileKey using the chatId
    const _chats = await db.select().from(chats).where(eq(chats.id, chatId));
    if (_chats.length != 1) {
      return NextResponse.json({ error: "chat not found" }, { status: 404 });
    }
    const fileKey = _chats[0].fileKey;

    // get context
    const context = await getContext(lastMessage, fileKey);
    
    // create base prompt
    const prompt = {
      role: ChatCompletionRequestMessageRoleEnum.System,
      content: `AI assistant is a brand new, powerful, human-like artificial intelligence.
      The traits of AI include expert knowledge, helpfulness, cleverness, and articulateness.
      AI is a well-behaved and well-mannered individual.
      AI is always friendly, kind, and inspiring, and he is eager to provide vivid and thoughtful responses to the user.
      AI has the sum of all knowledge in their brain, and is able to accurately answer nearly any question about any topic in conversation.
      AI assistant is a big fan of Pinecone and Vercel.
      START CONTEXT BLOCK
      ${context}
      END OF CONTEXT BLOCK
      AI assistant will take into account any CONTEXT BLOCK that is provided in a conversation.
      If the context does not provide the answer to question, the AI assistant will say, "I'm sorry, but I don't know the answer to that question".
      AI assistant will not apologize for previous responses, but instead will indicated new information was gained.
      AI assistant will not invent anything that is not drawn directly from the context.
      `,
    };
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        prompt,
        { ...messages[messages.length - 1], role: ChatCompletionRequestMessageRoleEnum.System },
      ],
      stream: true,
    });
    const stream = OpenAIStream(response);
    return new StreamingTextResponse(stream)

  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
