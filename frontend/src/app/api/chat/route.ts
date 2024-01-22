import { Configuration, OpenAIApi } from "openai-edge";
import {OpenAIStream, StreamingTextResponse} from "ai";

export const runtime = "edge";

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(config);

export async function POST(req: Request, res: Response) {
  try {
    const { messages } = await req.json();
    const response = await openai.createChatCompletion({
      model: "gpt-4",
      messages,
      stream: true,
    });
    const stream = OpenAIStream(response);
    return new StreamingTextResponse(stream)

  } catch (error) {
    console.log(error);
  }
}
