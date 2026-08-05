import mongoose, { Schema, Document } from 'mongoose';
import { IConversation } from '../types/conversation';

export interface ConversationDocument extends IConversation, Document {
  _id: string;
}

const ConversationSchema = new Schema<ConversationDocument>({
  sessionId: { type: String, required: true, index: true },
  role: { type: String, enum: ['user', 'model'], required: true },
  message: { type: String, required: true },
  link: { type: String },
  linkText: { type: String },
  timestamp: { type: Date, default: Date.now },
});

// Index for quickly retrieving the last N messages for a session
ConversationSchema.index({ sessionId: 1, timestamp: -1 });

export const ConversationModel = mongoose.models.Conversation || mongoose.model<ConversationDocument>('Conversation', ConversationSchema);
