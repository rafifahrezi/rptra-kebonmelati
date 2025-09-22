import mongoose from "mongoose";

const VisitsSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    balita: {
      type: String,
      required: true,
      default: 0,
    },
    anak: {
      type: String,
      required: true,
      default: 0,
    },
    remaja: {
      type: String,
      required: true,
      default: 0,
    },
    dewasa: {
      type: String,
      required: true,
      default: 0,
    },
    lansia: {
      type: String,
      required: true,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Visits || mongoose.model("Visits", VisitsSchema);
