// models/News.ts
import mongoose, { Document, Model, Schema } from 'mongoose';

export interface INews extends Document {
  title: string;
  subtitle?: string;
  content: string;
  category?: string;
  author?: string;
  featured: boolean;
  published: boolean;
  tags: string[];
  images: string[]; // ubah field image menjadi images sebagai array string
  createdAt: Date;
  updatedAt: Date;
}

const NewsSchema = new Schema<INews>({
  title: { type: String, required: true },
  subtitle: { type: String },
  content: { type: String, required: true },
  category: { type: String },
  author: { type: String },
  featured: { type: Boolean, default: false },
  published: { type: Boolean, default: true },
  tags: { type: [String], default: [] },
  images: { type: [String], default: [] },  // field images adalah array string dengan default array kosong
}, {
  timestamps: true,
});

// Cek model yang sudah didefinisikan agar tidak didefinisikan ulang (pengalaman dev)
const News: Model<INews> = mongoose.models.News || mongoose.model('News', NewsSchema);
export default News;
