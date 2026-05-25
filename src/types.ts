export interface RecipientProfile {
  age: string;
  hobbies: string;
  budget: string;
  likes: string;
}

export interface GiftItem {
  id?: string;
  name: string;
  price: string;
  url?: string;
  explanation: string;
  whereToBuy: string;
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

export interface GroundingMetadata {
  webSearchQueries?: string[];
  groundingChunks?: GroundingChunk[];
}

export interface GiftDetectiveResponse {
  detectiveSummary: string;
  gifts: GiftItem[];
  caseDeductionDetail: string;
}

export interface APIPredictionResult {
  data: GiftDetectiveResponse;
  grounding: GroundingMetadata | null;
  fallback?: boolean;
}

export interface SavedCase {
  id: string;
  timestamp: string;
  profile: RecipientProfile;
  result: APIPredictionResult;
}
