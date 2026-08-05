import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IVisit extends Document {
  visitorName: string;
  visitorEmail?: string;
  visitorPhone?: string;
  visitDate: string;  // ISO date string YYYY-MM-DD
  visitTime: string;  // HH:mm
  visitType: 'consultation' | 'therapy' | 'assessment' | 'follow-up' | 'emergency';
  purpose: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  notes?: string;
  therapistAssigned?: string;
  duration: number; // minutes
  createdAt: Date;
  updatedAt: Date;
}

const VisitSchema: Schema = new Schema<IVisit>(
  {
    visitorName: { type: String, required: true },
    visitorEmail: { type: String },
    visitorPhone: { type: String },
    visitDate: { type: String, required: true },
    visitTime: { type: String, required: true },
    visitType: {
      type: String,
      enum: ['consultation', 'therapy', 'assessment', 'follow-up', 'emergency'],
      required: true,
    },
    purpose: { type: String, required: true },
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled', 'no-show'],
      default: 'scheduled',
    },
    notes: { type: String },
    therapistAssigned: { type: String },
    duration: { type: Number, default: 60 },
  },
  { timestamps: true }
);

const AnalyticsModel: Model<IVisit> = mongoose.models.Analytics || mongoose.model<IVisit>('Analytics', VisitSchema);
export default AnalyticsModel;
