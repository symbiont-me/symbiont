import { NextRequest, NextResponse } from "next/server";
import {
  Configuration,
  OpenAIApi,
  ChatCompletionRequestMessageRoleEnum,
} from "openai-edge";

// TODO use Message where it is needed
import { Message, OpenAIStream, StreamingTextResponse } from "ai";
import { db } from "@/lib/db";
import { chats, messages as _messages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getContext } from "@/lib/context";
import { TextModels } from "@/const";

export const runtime = "edge";

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(config);

// TODO use where it is needed
type ChatRequest = {
  messages: Array<{ role: string; content: string }>;
  chatId: { chatId: number };
};

export async function POST(req: NextRequest) {
  try {
    const requestBody = await req.json();
    const chatId = requestBody.chatId;
    const messages = requestBody.messages;
    const resourceIdentifier = requestBody.resourceIdentifier;
    if (isNaN(chatId)) {
      return NextResponse.json({ error: "Invalid chatId" }, { status: 400 });
    }

    const lastMessage = messages[messages.length - 1].content;

    // get fileKey using the chatId
    const _chats = await db.select().from(chats).where(eq(chats.id, chatId));
    if (_chats.length != 1) {
      return NextResponse.json({ error: "chat not found" }, { status: 404 });
    }

    const fileKey = resourceIdentifier;
    // get context from pinecone
    const context = await getContext(lastMessage, fileKey);
    console.log("context", context);
    // create base prompt
    const prompt = {
      role: ChatCompletionRequestMessageRoleEnum.System,
      content: `
      The traits of AI include expert knowledge, helpfulness, cleverness, and articulateness.
      AI has the sum of all knowledge in their brain, and is able to accurately answer nearly any question about any topic in conversation.
      AI assistant will take into account any DOCUMENT BLOCK that is provided in a conversation.
      START DOCUMENT BLOCK
      ${context}
      END OF DOCUMENT BLOCK
      If the context does not provide the answer to question or the context is empty, the AI assistant will say, "I'm sorry, but I don't know the answer to that question".
      AI assistant will not invent anything that is not drawn directly from the context.
      AI will keep answers short and to the point.
      AI will return the response in valid Markdown format.
      `,
    };

    const response = await openai.createChatCompletion({
      model: TextModels.GPT_3_5_TURBO,
      messages: [
        prompt,
        {
          content: lastMessage,
          role: ChatCompletionRequestMessageRoleEnum.User,
        },
      ],
      stream: true,
    });
    const stream = OpenAIStream(response, {
      onStart: async () => {
        console.log("stream started", lastMessage);
        // save user message into db
        await db.insert(_messages).values({
          chatId,
          content: lastMessage,
          role: "user",
        });
      },
      onCompletion: async (completion) => {
        console.log("stream completed", completion);
        // save ai message into db
        await db.insert(_messages).values({
          chatId,
          content: completion,
          role: "admin",
        });
      },
    });
    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
