import mongoose, { Schema, type InferSchemaType } from "mongoose";

const GambaranUmumSchema = new Schema(
  {
    deskripsi: { type: String, required: true, trim: true },
    gambar: {
      type: String,
      default: "",
      match: [/^([a-f\d]{24})?$/i, "Gambar harus ID GridFS yang valid"],
    },
  },
  { timestamps: true, collection: "gambaran_umum" },
);

export type GambaranUmumDoc = InferSchemaType<typeof GambaranUmumSchema>;

export default mongoose.models.GambaranUmum ||
  mongoose.model("GambaranUmum", GambaranUmumSchema);
