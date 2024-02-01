// NOTE not using Drizzle types because backend will be separated in python
export type StudyResource = {
    studyId: number;
    studyResourceId?: number;
    studyResourceName: string;
    studyResourceUrl: string;
    studyResourceIdentifier: string;
    studyResourceCategory: StudyResourceCategory;
    createdAt?: Date;
}

export enum StudyResourceCategory {
    PDF = "pdf",
    Audio = "audio",
    Video = "video",
    Webpage = "webpage"
}
