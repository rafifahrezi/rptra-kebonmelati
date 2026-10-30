import mongoose, { Schema, type InferSchemaType } from "mongoose";

const PegawaiSchema = new Schema(
  {
    nama: { type: String, required: true, trim: true },
    jabatan: { type: String, required: true, trim: true },
    foto: {
      type: String,
      default: "",
      match: [/^([a-f\d]{24})?$/i, "Foto harus ID GridFS yang valid"],
    },
    urutan: { type: Number, default: 0, index: true }, // urutan tampil, kecil = atas
  },
  { timestamps: true, collection: "pegawai" },
);

export type PegawaiDoc = InferSchemaType<typeof PegawaiSchema>;

export default mongoose.models.Pegawai ||
  mongoose.model("Pegawai", PegawaiSchema);
