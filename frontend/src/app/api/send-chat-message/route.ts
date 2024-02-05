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
    const { chatId } = requestBody.chatId;
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
    // create base prompt
    const prompt = {
      role: ChatCompletionRequestMessageRoleEnum.System,
      content: `AI assistant is a brand new, powerful, human-like artificial intelligence.
      The traits of AI include expert knowledge, helpfulness, cleverness, and articulateness.
      AI is a well-behaved and well-mannered individual.
      AI is always friendly, kind, and inspiring, and he is eager to provide vivid and thoughtful responses to the user.
      AI has the sum of all knowledge in their brain, and is able to accurately answer nearly any question about any topic in conversation.
      START DOCUMENT BLOCK
      ${context}
      END OF DOCUMENT BLOCK
      AI assistant will take into account any DOCUMENT BLOCK that is provided in a conversation.
      If the context does not provide the answer to question, the AI assistant will say, "I'm sorry, but I don't know the answer to that question".
      AI assistant will not apologize for previous responses, but instead will indicated new information was gained.
      AI assistant will not invent anything that is not drawn directly from the context.
      AI will return the response in valid Markdown format.
      `,
    };

    // TODO should use md syntax so that we can parse it to display it in the frontend
    const response = await openai.createChatCompletion({
      model: TextModels.GPT_3_5_TURBO,
      messages: [
        prompt,
        {
          ...messages[messages.length - 1],
          role: ChatCompletionRequestMessageRoleEnum.System,
        },
      ],
      stream: true,
    });
    const stream = OpenAIStream(response, {
      onStart: async () => {
        // save user message into db
        await db.insert(_messages).values({
          chatId,
          content: lastMessage,
          role: "user",
        });
      },
      onCompletion: async (completion) => {
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
