import mongoose, { Schema, Document, Model } from "mongoose";

export interface IContact extends Document {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  category: string;
  message: string;
  createdAt: Date;
  updatedAt: Date;
}

const ContactSchema: Schema<IContact> = new Schema(
  {
    name: {
      type: String,
      required: [true, "Nama lengkap wajib diisi"],
      minlength: [2, "Nama minimal 2 karakter"],
      maxlength: [100, "Nama maksimal 100 karakter"],
    },
    email: {
      type: String,
      required: [true, "Email wajib diisi"],
      match: [/^\S+@\S+\.\S+$/, "Email tidak valid"],
      maxlength: [100, "Email maksimal 100 karakter"],
    },
    phone: {
      type: String,
      required: false,
      match: [/^(\+62|0)[0-9]{9,12}$/, "Nomor telepon tidak valid (contoh: 08xxxxxxxxxx)"],
      maxlength: [15, "Nomor telepon maksimal 15 karakter"],
    },
    subject: {
      type: String,
      required: [true, "Subjek wajib diisi"],
      minlength: [3, "Subjek minimal 3 karakter"],
      maxlength: [100, "Subjek maksimal 100 karakter"],
    },
    category: {
      type: String,
      required: [true, "Kategori wajib diisi"],
      enum: {
        values: ["informasi", "pendaftaran", "saran", "kerjasama", "keluhan", "lainnya"],
        message: "Kategori tidak valid",
      },
    },
    message: {
      type: String,
      required: [true, "Pesan wajib diisi"],
      minlength: [10, "Pesan minimal 10 karakter"],
      maxlength: [1000, "Pesan maksimal 1000 karakter"],
    },
  },
  { timestamps: true }
);

// Ensure lean documents return string _id
// ContactSchema.set("toJSON", {
//   transform: (doc, ret) => {
//     ret._id = ret._id.toString();
//     return ret;
//   },
// });

const ContactModel: Model<IContact> = mongoose.models.Contact || mongoose.model<IContact>("Contact", ContactSchema);

export default ContactModel;