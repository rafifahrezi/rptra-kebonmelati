import mongoose, { Schema, type InferSchemaType } from "mongoose";

const TugasFungsiSchema = new Schema(
  {
    descTugas: { type: String, required: true, trim: true },
    descFungsi: { type: String, required: true, trim: true },
  },
  { timestamps: true, collection: "tugas_fungsi" },
);

export type TugasFungsiDoc = InferSchemaType<typeof TugasFungsiSchema>;

export default mongoose.models.TugasFungsi ||
  mongoose.model("TugasFungsi", TugasFungsiSchema);
