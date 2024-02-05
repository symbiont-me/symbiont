// NOTE not using Drizzle types because backend will be separated in python
// need to update this to match the actual schema
export type StudyResource = {
  studyId: number;
  id?: number;
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

export type Study = {
  id?: number;
  name: string;
  image: string | undefined;
  createdAt?: Date;
  userId?: string;
};
