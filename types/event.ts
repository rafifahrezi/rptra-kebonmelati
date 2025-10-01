export type EventStatus = "upcoming" | "ongoing" | "completed";

export interface EventItem {
  _id: string; // Gunakan string, bukan number (ObjectId → string)
  title: string;
  description: string;
  date: string; // ISO string (YYYY-MM-DD)
  time?: string; // Opsional
  location: string;
  category: string;
  participants: number;
  maxParticipants: number;
  images: string[]; // Array ID file dari GridFS
  status: EventStatus;
}