import mongoose, { Schema, Document } from 'mongoose';
import { IKnowledge } from '../types/knowledge';

export interface KnowledgeDocument extends IKnowledge, Document {
  _id: string;
}

const KnowledgeSchema = new Schema<KnowledgeDocument>({
  title: { type: String, required: true },
  category: { type: String, required: true },
  content: { type: String, required: true },
  embedding: { type: [Number] },
  sourceId: { type: String, index: true },
  createdAt: { type: Date, default: Date.now },
}, {
  collection: 'knowledge_base' // Explicitly set to avoid confusion with mongoose pluralization
});

export const KnowledgeModel = mongoose.models.Knowledge || mongoose.model<KnowledgeDocument>('Knowledge', KnowledgeSchema, 'knowledge_base');
