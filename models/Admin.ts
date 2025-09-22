import mongoose, { Schema, Document } from 'mongoose';

export interface IAdmin extends Document {
  username: string;
  email: string;
  password: string;
  role: 'superadmin' | 'admin';
  lastLogin: Date | null;
}

const adminSchema = new Schema<IAdmin>({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['superadmin', 'admin'], default: 'admin' },
  lastLogin: { type: Date, default: null },
});

const Admin = mongoose.models.Admin || mongoose.model<IAdmin>('Admin', adminSchema, 'Admins');

export default Admin;