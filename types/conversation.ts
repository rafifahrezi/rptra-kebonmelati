export interface IConversation {
  _id?: string;
  sessionId: string;
  role: 'user' | 'model';
  message: string;
  timestamp?: Date;
  link?: string;
  linkText?: string;
}
