// models/Event.ts
import mongoose, { Schema, Document } from "mongoose";

export type EventStatus = "upcoming" | "ongoing" | "finished";

export interface IEvent extends Document {
  title: string;
  description: string;
  category: string;
  date: string;
  location: string;
  status: EventStatus;
  images: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    category: { type: String, required: true },
    date: { type: String, required: true },
    location: { type: String, required: true },
    status: { type: String, enum: ["upcoming", "ongoing", "finished"], default: "upcoming" },
    images: { type: [String], default: [] },
  },
  { timestamps: true }
);

export default mongoose.models.Event || mongoose.model<IEvent>("Event", EventSchema);
