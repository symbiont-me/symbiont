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

// Import shared models configuration
export { LLMModels } from '../utils/shared-models';

type LLMSettings = {
  model: LLMModels;
  apiKey: string;
  temperature: number;
};
