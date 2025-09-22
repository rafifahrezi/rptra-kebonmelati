import mongoose, { Schema, Document, Model } from "mongoose";

export interface IRequest extends Document {
  tanggalPelaksanaan: string;
  namaPeminjam: string;
  namaInstansi: string;
  alamat: string;
  noTelp: string;
  jumlahPeserta: number;
  waktuPenggunaan: string;
  penggunaanRuangan: boolean;
  tujuanPenggunaan: "indoor" | "outdoor" | "";
  status?: 'pending' | 'scheduled' | 'completed' | 'cancelled';

  createdAt: Date;
  updatedAt: Date;
}

const RequestSchema: Schema = new Schema(
  {
    tanggalPelaksanaan: { type: String, required: true },
    namaPeminjam: { type: String, required: true },
    namaInstansi: { type: String, required: true },
    alamat: { type: String, required: true },
    noTelp: { type: String, required: true },
    jumlahPeserta: { type: Number, required: true },
    waktuPenggunaan: { type: String, required: true },
    penggunaanRuangan: { type: Boolean, required: true },
    tujuanPenggunaan: { type: String, enum: ["indoor", "outdoor", ""], required: true },
    status: {
    type: String,
    enum: ['pending', 'scheduled', 'completed', 'cancelled'],
    default: 'pending'
  },
  },
  { timestamps: true }
);

const RequestModel: Model<IRequest> = mongoose.models.Request || mongoose.model("Request", RequestSchema);

export default RequestModel;
