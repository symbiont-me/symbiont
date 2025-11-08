export type User = {
  // User Identifiers
  id: string; // Unique identifier for each user
  email?: string; // User's email address, optional
  phoneNumber?: string; // User's phone number, optional

  // Authentication Details
  timeJoined: Date; // Timestamp when the user account was created
  tenantIds?: string[]; // Identifiers for multi-tenancy support, optional
  thirdPartyLoginInfo?: any; // Details about any third-party authentication methods used, optional
  loginMethods: string[]; // Information about all the login methods associated with the user
  emailVerificationStatus: boolean; // Whether the user's email has been verified

  // Session Information
  accessToken: string; // Short-lived token for accessing protected resources
  refreshToken?: string; // Used to obtain new access tokens, optional

  // Custom Data
  metadata?: Record<string, any>; // Additional custom information that can be stored for each user, optional

  // Roles and Permissions
  defaultRole: string; // Primary role assigned to the user
  allowedRoles: string[]; // List of roles the user is permitted to have
};

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
  // OpenAI Models
  GPT_5_2025_08_07 = "gpt-5-2025-08-07",
  GPT_5_MINI_2025_08_07 = "gpt-5-mini-2025-08-07",
  GPT_5_NANO_2025_08_07 = "gpt-5-nano-2025-08-07",
  GPT_5_PRO_2025_10_06 = "gpt-5-pro-2025-10-06",
  GPT_4_1_2025_04_14 = "gpt-4.1-2025-04-14",
  GPT_4O_MINI_2024_07_18 = "gpt-4o-mini-2024-07-18",
  GPT_4O_2024_08_06 = "gpt-4o-2024-08-06",
  
  // Anthropic Models
  CLAUDE_SONNET_4_5_20250929 = "claude-sonnet-4-5-20250929",
  CLAUDE_HAIKU_4_5_20251001 = "claude-haiku-4-5-20251001",
  CLAUDE_OPUS_4_1_20250805 = "claude-opus-4-1-20250805",
  
  // Google Gemini Models
  GEMINI_2_5_PRO = "gemini-2.5-pro",
  GEMINI_2_5_FLASH = "gemini-2.5-flash",
  GEMINI_2_5_FLASH_LITE = "gemini-2.5-flash-lite",
  
  // Custom Models
  CUSTOM_OPEN_SOURCE = "custom/open-source",
}

type LLMSettings = {
  model: LLMModels;
  apiKey: string;
  temperature: number;
};
