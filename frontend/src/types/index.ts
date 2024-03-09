// NOTE not using Drizzle types because backend will be separated in python
// need to update this to match the actual schema
export type StudyResource = {
  studyId: number | string;
  id?: string | number;
  name: string;
  url: string;
  identifier: string;
  category: StudyResourceCategory;
  createdAt?: Date;
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

export type Study = {
  id?: number | string;
  name: string;
  image: string | undefined;
  createdAt?: Date;
  userId?: string;
  description: string;
  resources: StudyResource[];
  chatMessages: ChatMessage[];
};

export type UserAuthDetails = {
  email: string;
  password: string;
};
