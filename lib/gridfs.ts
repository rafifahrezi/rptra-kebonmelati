import mongoose from "mongoose";
import { ObjectId } from "mongodb";

export class GridFSService {
  private static getBucket() {
    if (!mongoose.connection.db) {
      throw new Error("Database connection not established. Ensure dbConnect() is called before using GridFS.");
    }
    return new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: "uploads", // Nama bucket GridFS
    });
  }

  static async uploadFile(buffer: Buffer, filename: string, contentType: string, metadata?: any): Promise<string> {
    const bucket = this.getBucket();
    const uploadStream = bucket.openUploadStream(filename, { contentType, metadata });
    uploadStream.end(buffer);
    return new Promise((resolve, reject) => {
      uploadStream.on("finish", () => resolve(uploadStream.id.toString()));
      uploadStream.on("error", reject);
    });
  }

  static async getFile(id: string) {
    const bucket = this.getBucket();
    const stream = bucket.openDownloadStream(new ObjectId(id));
    const file = await bucket.find({ _id: new ObjectId(id) }).next();
    return file ? { stream, file } : null;
  }

  static async deleteFile(id: string): Promise<boolean> {
    const bucket = this.getBucket();
    try {
      await bucket.delete(new ObjectId(id));
      return true;
    } catch {
      return false;
    }
  }
}
