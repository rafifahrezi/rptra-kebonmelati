import mongoose, { Schema, Document, Model } from "mongoose";

export interface IVideo extends Document {
  _id?: string;
  titleVidio: string;
  deskripsi?: string; // Made optional to match client
  date: string;
  youtubeUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

const VideoSchema: Schema<IVideo> = new Schema(
  {
    titleVidio: {
      type: String,
      required: [true, "Judul video wajib diisi"],
      minlength: [5, "Judul minimal 5 karakter"],
      maxlength: [100, "Judul maksimal 100 karakter"],
    },
    deskripsi: {
      type: String,
      required: false, // Changed to optional
      maxlength: [500, "Deskripsi maksimal 500 karakter"],
    },
    date: {
      type: String,
      required: [true, "Tanggal wajib diisi"],
      validate: {
        validator: (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value), // Validate YYYY-MM-DD
        message: "Format tanggal harus YYYY-MM-DD",
      },
    },
    youtubeUrl: {
      type: String,
      required: [true, "URL YouTube wajib diisi"],
      validate: {
        validator: (value: string) => {
          return /^https:\/\/www\.youtube\.com\/embed\/[a-zA-Z0-9_-]{11}$/.test(value);
        },
        message: "URL YouTube tidak valid, harus dalam format embed[](https://www.youtube.com/embed/VIDEO_ID)",
      },
    },
  },
  { timestamps: true }
);

// Ensure lean documents return string _id
VideoSchema.set("toJSON", {
  transform: (doc, ret) => {
    ret._id = ret._id.toString();
    return ret;
  },
});

const VideoModel: Model<IVideo> = mongoose.models.Video || mongoose.model<IVideo>("Video", VideoSchema);

export default VideoModel;