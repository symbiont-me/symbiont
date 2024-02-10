export enum TextModels {
  GPT_3_5_TURBO = "gpt-3.5-turbo",
  GPT_4 = "gpt-4",
}
// TODO move to types
export enum ViewSelected {
  Writer = "writer",
  PDFViewer = "PDF viewer",
  TestKnowledge = "test knowledge",
  SciencePapers = "sci papers",
  Evaluation = "evaluation",
  VideoViewer = "video viewer",
  AudioPlayer = "audio player",
  Summaries = "summaries",
  Resources = "resources",
}

// TODO use these wherever possible
export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
}
