import mongoose, { Schema, Document } from 'mongoose';

export interface IOperasional extends Document {
  _id: string; // Fixed ID 'current'
  status: boolean;
  updatedAt: Date;
  updatedBy: string;
}

const operasionalSchema = new Schema<IOperasional>({
  _id: { type: String, required: true, default: 'current' },
  status: { type: Boolean, required: true, default: true },
  updatedAt: { type: Date, required: true, default: Date.now },
  updatedBy: { type: String, required: true },
}, {
  collection: 'operationals', // Explicit collection name
});

const Operasional = mongoose.models.Operasional || mongoose.model<IOperasional>('Operasional', operasionalSchema, 'operationals');

export default Operasional;