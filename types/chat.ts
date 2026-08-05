export interface ChatRequest {
  message: string;
  sessionId: string;
}

export interface ChatResponse {
  success: boolean;
  answer?: string;
  error?: string;
}
