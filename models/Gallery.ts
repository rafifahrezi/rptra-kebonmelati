import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IGalleries extends Document {
  title: string;
  description?: string;
  date: Date;
  category?: string;
  status: 'draft' | 'published' | string;
  images: string[]; 
  createdAt: Date;
  updatedAt: Date;
}

const GalleriesSchema = new Schema<IGalleries>({
  title: { type: String, required: true },
  description: { type: String },
  date: { type: Date, required: true },
  category: { type: String, required: true, trim: true },
  status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
      trim: true,
    },
  images: { type: [String], default: [] },  // field images adalah array string dengan default array kosong
}, {
  timestamps: true,
});

const Gallery: Model<IGalleries> =
  mongoose.models.Gallery || mongoose.model('Gallery', GalleriesSchema);
export default Gallery;

