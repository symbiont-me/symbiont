// NOTE not using Drizzle types because backend will be separated in python
// need to update this to match the actual schema
export type StudyResource = {
  studyId: number | string;
  id?: string | number;
  name: string;
  url: string;
  identifier: string;
  category: StudyResourceCategory;
  summary?: string;
  createdAt?: Date;
  storage_ref?: string;
};

export enum StudyResourceCategory {
  PDF = "pdf",
  Audio = "audio",
  Video = "video",
  Webpage = "webpage",
}

type ChatMessage = {
  content: string;
  createdAt: Date;
  role: "user" | "bot";
};

export type Citation = {
  page: number;
  source: string;
  text: string;
};

// TODO this needs to be updated according to the actual schema
export type Study = {
  _id?: number | string;
  name: string;
  image: string | undefined;
  createdAt?: Date;
  userId?: string;
  description: string;
  text: string;
  resources: StudyResource[];
  chatMessages: ChatMessage[];
  chat?: ChatMessage[];
};

export type UserAuthDetails = {
  email: string;
  password: string;
};

export enum LLMModels {
  GPT_3_5_TURBO = "gpt-3.5-turbo",
  GPT_3_5_TURBO_16K = "gpt-3.5-turbo-16k",
  GPT_3_5_Turbo_0125 = "gpt-3.5-turbo-0125",
  GPT_3_5_Turbo_1106 = "gpt-3.5-turbo-1106",
  GPT_4_Turbo_Preview = "gpt-4-turbo-preview",
  GPT_4_1106_Preview = "gpt-4-1106-preview",
  GPT_4 = "gpt-4",
  GPT_4_32k = "gpt-4-32k",
  CLAUDE_3_OPUS_20240229 = "claude-3-opus-20240229",
  CLAUDE_3_SONNET_2024022 = "claude-3-sonnet-2024022",
  CLAUDE_3_HAIKU_20240307 = "claude-3-haiku-20240307",
  CLAUDE_2_1 = "claude-2.1",
  CLAUDE_2_0 = "claude-2.0",
  CLAUDE_INSTANT_1_2 = "claude-instant-1.2",
  GEMINI_PRO = "gemini-pro",
  GEMINI_1_PRO = "models/gemini-1.0-pro",
  GEMINI_1_PRO_001 = "models/gemini-1.0-pro-001",
  GEMINI_1_PRO_LATEST = "models/gemini-1.0-pro-latest",
  GEMINI_1_5_FLASH = "models/gemini-1.5-flash",
  GEMINI_1_5_FLASH_001 = "models/gemini-1.5-flash-001",
  GEMINI_1_5_FLASH_LATEST = "models/gemini-1.5-flash-latest",
  GEMINI_1_5_PRO = "models/gemini-1.5-pro",
  GEMINI_1_5_PRO_001 = "models/gemini-1.5-pro-001",
  GEMINI_1_5_PRO_LATEST = "models/gemini-1.5-pro-latest",
}

type LLMSettings = {
  model: LLMModels;
  apiKey: string;
  temperature: number;
};
